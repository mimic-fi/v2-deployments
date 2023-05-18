import { getSigner } from '@mimic-fi/v2-helpers'

import logger from '../../src/logger'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { MimicFeeCollectorUpdateBridgeConnector } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as MimicFeeCollectorUpdateBridgeConnector
  const { BridgeConnector } = input

  const smartVault = await task.inputDeployedInstance('SmartVault')

  if (force || (await smartVault.bridgeConnector()) != BridgeConnector) {
    logger.info(`Setting new bridge connector...`)
    if (!from) from = await getSigner(input.owner)
    await smartVault.connect(from).setBridgeConnector(BridgeConnector)
    logger.success(`Bridge connector set`)
  } else {
    logger.warn(`Bridge connector already set`)
  }
}
