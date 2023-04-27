import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import { deployCreate3 } from '../../src/create3'
import { deploySmartVault } from '../../src/smartVault'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { BalancerFeeCollectorL1Deployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BalancerFeeCollectorL1Deployment
  const { params, namespace, version, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libs: { Deployer } }
  const create3Params = { ...txParams, namespace, version }

  const smartVaultDeployer = await deployCreate3(task, 'L1SmartVaultDeployer', [from.address], {
    ...create3Params,
    instanceName: 'SmartVaultDeployer',
  })

  const manager = await deployCreate3(task, 'PermissionsManager', [smartVaultDeployer.address], create3Params)
  const claimer = await deployCreate3(task, 'Claimer', [manager.address, Registry], create3Params)
  const oneInchSwapper = await deployCreate3(task, 'OneInchSwapper', [manager.address, Registry], create3Params)
  const paraswapSwapper = await deployCreate3(task, 'ParaswapSwapper', [manager.address, Registry], create3Params)
  const withdrawer = await deployCreate3(task, 'Withdrawer', [manager.address, Registry], create3Params)

  params.manager = manager.address
  params.claimerActionParams.impl = claimer.address
  params.oneInchSwapperActionParams.impl = oneInchSwapper.address
  params.paraswapSwapperActionParams.impl = paraswapSwapper.address
  params.withdrawerActionParams.impl = withdrawer.address
  params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.${version}`])
  await deploySmartVault(task, smartVaultDeployer, params, txParams)
}
