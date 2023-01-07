import { getSigner, ZERO_BYTES32 } from '@mimic-fi/v2-helpers'

import logger from '../../src/logger'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { SmartVaultDeployment } from './input'

const VERSION = 'v2'
const STATELESS = false
const CONTRACT_NAME = 'SmartVault'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as SmartVaultDeployment
  const args = [input.wrappedNativeToken, input.Registry]

  if (!from) from = await getSigner(input.from)
  const instance = await task.deployAndVerify(CONTRACT_NAME, args, from, force)

  logger.info(`Checking ${CONTRACT_NAME} ${VERSION}...`)
  const registry = await task.inputDeployedInstance('Registry')
  const implementationData = await registry.implementationData(instance.address)

  if (implementationData.namespace == ZERO_BYTES32) {
    logger.info(`Registering ${CONTRACT_NAME} ${VERSION}...`)
    const admin = await getSigner(input.admin)
    await registry.connect(admin).register(await instance.NAMESPACE(), instance.address, STATELESS)
    logger.success(`Registered ${CONTRACT_NAME} ${VERSION}`)
  } else {
    logger.warn(`${CONTRACT_NAME} ${VERSION} already registered`)
  }
}
