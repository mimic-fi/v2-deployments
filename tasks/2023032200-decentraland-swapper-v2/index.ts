import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { DecentralandSwapperV2Deployment } from './input'

const CONTRACT_NAME = 'DEXSwapperV2'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as DecentralandSwapperV2Deployment
  if (!from) from = await getSigner(input.from)

  const { params, namespace, version, Registry } = input
  const args = [
    {
      smartVault: params.smartVault,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      maxSlippage: params.maxSlippage,
      swapLimitToken: params.swapLimitToken,
      swapLimitAmount: params.swapLimitAmount,
      swapLimitPeriod: params.swapLimitPeriod,
      thresholdToken: params.thresholdToken,
      thresholdAmount: params.thresholdAmount,
      relayer: params.relayer,
      gasPriceLimit: params.gasPriceLimit,
      totalCostLimit: params.totalCostLimit,
      payingGasToken: params.payingGasToken,
      admin: params.admin,
      registry: Registry,
    },
  ]

  let address: string
  const output = task.output({ ensure: false })
  if (force || !output[CONTRACT_NAME]) {
    logger.info(`Deploying ${CONTRACT_NAME}.${version}...`)
    const creationCode = await task.getCreationCode(CONTRACT_NAME, args)
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${CONTRACT_NAME}.${version}`])
    const factory = await task.inputDeployedInstance('Create3Factory')
    const tx = await factory.connect(from).create(salt, creationCode)
    await tx.wait()

    address = await factory.addressOf(salt)
    logger.success(`Deployed ${CONTRACT_NAME} ${version} at ${address}`)
    task.save({ [CONTRACT_NAME]: address })
  } else {
    address = output[CONTRACT_NAME]
    logger.warn(`${CONTRACT_NAME} ${version} already deployed at ${address}`)
  }

  await task.verify(CONTRACT_NAME, address, args)

  logger.success('Owner must authorize to swap and withdraw from smart vault')
}
