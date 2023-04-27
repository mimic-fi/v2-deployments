import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import { deployCreate3, deployManyCreate3 } from '../../src/create3'
import { deploySmartVault } from '../../src/smartVault'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { MimicFeeCollectorDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as MimicFeeCollectorDeployment
  const { params, namespace, version, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libs: { Deployer } }
  const create3Params = { ...txParams, namespace, version }
  const smartVaultDeployer = await deployCreate3(task, 'L1SmartVaultDeployer', [], {
    ...create3Params,
    instanceName: 'SmartVaultDeployer',
  })

  const actions = await deployManyCreate3(
    task,
    ['Funder', 'Holder', 'L1HopBridger'],
    [smartVaultDeployer.address, Registry],
    create3Params
  )

  params.funderActionParams.impl = actions['Funder'].address
  params.holderActionParams.impl = actions['Holder'].address
  params.l1HopBridgerActionParams.impl = actions['L1HopBridger'].address
  params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.${version}`])
  await deploySmartVault(task, smartVaultDeployer, params, txParams)
}
