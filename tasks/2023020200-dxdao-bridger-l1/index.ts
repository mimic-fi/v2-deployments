import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import { deployCreate3 } from '../../src/create3'
import { deploySmartVault } from '../../src/smartVault'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { DxDaoBridgerDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as DxDaoBridgerDeployment
  const { params, namespace, version, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libs: { Deployer } }
  const create3Params = { ...txParams, namespace, version }
  const smartVaultDeployer = await deployCreate3(task, 'L1SmartVaultDeployer', [], {
    ...create3Params,
    instanceName: 'SmartVaultDeployer',
  })

  const actionParams = [smartVaultDeployer.address, Registry]
  const bridger = await deployCreate3(task, 'L1HopBridger', actionParams, create3Params)
  const withdrawer = await deployCreate3(task, 'Withdrawer', actionParams, create3Params)

  params.l1HopBridgerActionParams.impl = bridger.address
  params.withdrawerActionParams.impl = withdrawer.address
  params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.${version}`])
  await deploySmartVault(task, smartVaultDeployer, params, txParams)
}
