import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import { deployCreate3 } from '../../src/create3'
import { deploySmartVault } from '../../src/smartVault'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { PublicSwapperFeeCollectorL2Deployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as PublicSwapperFeeCollectorL2Deployment
  const { params, namespace, version, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libs: { Deployer } }
  const create3Params = { ...txParams, namespace, version }

  const smartVaultDeployer = await deployCreate3(task, 'L2SmartVaultDeployer', [from.address], {
    ...create3Params,
    instanceName: 'SmartVaultDeployer',
  })

  const manager = await deployCreate3(task, 'PermissionsManager', [smartVaultDeployer.address], create3Params)
  const swapper = await deployCreate3(task, 'ParaswapSwapper', [manager.address, Registry], create3Params)
  const bridger = await deployCreate3(task, 'L2HopBridger', [manager.address, Registry], create3Params)

  params.manager = manager.address
  params.paraswapSwapperActionParams.impl = swapper.address
  params.l2HopBridgerActionParams.impl = bridger.address
  params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.${version}`])
  await deploySmartVault(task, smartVaultDeployer, params, txParams)
}