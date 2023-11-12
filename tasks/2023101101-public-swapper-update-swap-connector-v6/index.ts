import { getSigner } from '@mimic-fi/v2-helpers'

import logger from '../../src/logger'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { PublicSwapperUpdateSwapConnector } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as PublicSwapperUpdateSwapConnector
  const { SwapConnector } = input

  const smartVault = await task.inputDeployedInstance('SmartVault')

  if (force || (await smartVault.swapConnector()) != SwapConnector) {
    logger.info(`Setting new swap connector...`)
    if (!from) from = await getSigner(input.owner)
    await smartVault.connect(from).setSwapConnector(SwapConnector)
    logger.success(`Swap connector set`)
  } else {
    logger.warn(`Swap connector already set`)
  }
}
