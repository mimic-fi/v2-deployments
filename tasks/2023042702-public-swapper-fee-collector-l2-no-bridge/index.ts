import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import { deployCreate3 } from '../../src/create3'
import logger from '../../src/logger'
import { deploySmartVault } from '../../src/smartVault'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { PublicSwapperFeeCollectorL2NoBridgeDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as PublicSwapperFeeCollectorL2NoBridgeDeployment
  const { params, namespace, version, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libs: { Deployer } }
  const create3Params = { ...txParams, namespace, version }

  // eslint-disable-next-line no-secrets/no-secrets
  const smartVaultDeployer = await deployCreate3(task, 'L2NoBridgingSmartVaultDeployer', [from.address], {
    ...create3Params,
    instanceName: 'SmartVaultDeployer',
  })

  const manager = await deployCreate3(task, 'PermissionsManager', [smartVaultDeployer.address], create3Params)
  const swapper = await deployCreate3(task, 'ParaswapSwapper', [manager.address, Registry], create3Params)

  params.manager = manager.address
  params.paraswapSwapperActionParams.impl = swapper.address
  params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.${version}`])
  const smartVault = await deploySmartVault(task, smartVaultDeployer, params, txParams)

  const owner = await getSigner(input.owner)
  const publicSwapper = await task.instanceAt('SmartVault', input.PublicSwapper)

  if (await (publicSwapper.feeCollector()) != smartVault.address) {
    logger.info(`Setting public swapper fee collector to SV address...`)
    await publicSwapper.connect(owner).setFeeCollector(smartVault.address)
    logger.success(`Public swapper fee collector set`)
  } else {
    logger.warn(`Public swapper fee collector already set`)
  }
}
