import { getSigner } from '@mimic-fi/v2-helpers'

import logger from '../../src/logger'
import { deployAndRegisterImplementation } from '../../src/registry'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { BridgeConnectorDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BridgeConnectorDeployment
  const { namespace, version, wrappedNativeToken, axelarGateway, connext, wormhole, Registry } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, version, from, force }
  const args = [wrappedNativeToken, axelarGateway, connext, wormhole, Registry]
  await deployAndRegisterImplementation(task, 'BridgeConnector', args, create3Params)

  logger.info(`Checking Bridge Connector v6...`)
  const registry = await task.inputDeployedInstance('Registry')
  const bridgeConnectorV6Data = await registry.implementationData(input.BridgeConnectorV6)
  if (!bridgeConnectorV6Data.deprecated) {
    logger.info(`Deprecating Bridge Connector v6...`)
    const admin = await getSigner(input.admin)
    await registry.connect(admin).deprecate(input.BridgeConnectorV6)
  } else {
    logger.warn(`Bridge Connector v6 already deprecated`)
  }
}
