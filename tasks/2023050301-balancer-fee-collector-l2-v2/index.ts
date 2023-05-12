import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import { deployCreate3 } from '../../src/create3'
import { deploySmartVault } from '../../src/smartVault'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { BalancerFeeCollectorL2DeploymentV2 } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BalancerFeeCollectorL2DeploymentV2
  const { params, namespace, Deployer, Registry, BalancerVault } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libs: { Deployer } }
  const v1CreateParams = { ...txParams, namespace, version: 'v1-beta' }
  const v2CreateParams = { ...txParams, namespace, version: 'v2' }

  const smartVaultDeployer = await deployCreate3(task, 'L2SmartVaultDeployer', [from.address], {
    ...v1CreateParams,
    instanceName: 'SmartVaultDeployer',
  })

  const manager = await deployCreate3(task, 'PermissionsManager', [smartVaultDeployer.address], v1CreateParams)
  const claimer = await deployCreate3(task, 'Claimer', [manager.address, Registry], v2CreateParams)
  const bptSwapper = await deployCreate3(task, 'BPTSwapper', [BalancerVault, manager.address, Registry], v2CreateParams)
  const oneInchSwapper = await deployCreate3(task, 'OneInchSwapper', [manager.address, Registry], v1CreateParams)
  const paraswapSwapper = await deployCreate3(task, 'ParaswapSwapper', [manager.address, Registry], v1CreateParams)
  const bridger = await deployCreate3(task, 'L2HopBridger', [manager.address, Registry], v1CreateParams)

  params.manager = manager.address
  params.claimerActionParams.impl = claimer.address
  params.bptSwapperActionParams.impl = bptSwapper.address
  params.oneInchSwapperActionParams.impl = oneInchSwapper.address
  params.paraswapSwapperActionParams.impl = paraswapSwapper.address
  params.l2HopBridgerActionParams.impl = bridger.address
  params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.v1-beta`])
  await deploySmartVault(task, smartVaultDeployer, params, txParams)
}
