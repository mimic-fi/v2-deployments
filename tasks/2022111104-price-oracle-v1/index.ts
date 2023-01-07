import { getSigner, ZERO_BYTES32 } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { PriceOracleDeployment } from './input'

const VERSION = 'v1'
const STATELESS = true
const CONTRACT_NAME = 'PriceOracle'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const output = task.output({ ensure: false })
  const input = task.input() as PriceOracleDeployment
  const args = [input.pivot, input.Registry]

  let address
  if (force || !output[CONTRACT_NAME]) {
    const factory = await task.inputDeployedInstance('Create3Factory')
    const creationCode = task.getCreationCode(CONTRACT_NAME, args)
    const salt = ethers.utils.solidityKeccak256(['string'], [input.namespace])

    if (!from) from = await getSigner(input.from)
    const tx = await factory.connect(from).create3(salt, creationCode)
    await tx.wait()

    address = await factory.addressOf(salt)
    logger.success(`Deployed ${CONTRACT_NAME} ${VERSION} at ${address}`)
    task.save({ [CONTRACT_NAME]: address })
  } else {
    address = output[CONTRACT_NAME]
    logger.warn(`${CONTRACT_NAME} ${VERSION} already deployed at ${address}`)
  }

  logger.info(`Checking ${CONTRACT_NAME} ${VERSION}...`)
  const registry = await task.inputDeployedInstance('Registry')
  const implementationData = await registry.implementationData(address)

  if (implementationData.namespace == ZERO_BYTES32) {
    logger.info(`Registering ${CONTRACT_NAME} ${VERSION}...`)
    const admin = await getSigner(input.admin)
    const instance = await task.instanceAt(CONTRACT_NAME, address)
    await registry.connect(admin).register(await instance.NAMESPACE(), instance.address, STATELESS)
    logger.success(`Registered ${CONTRACT_NAME} ${VERSION}`)
  } else {
    logger.warn(`${CONTRACT_NAME} ${VERSION} already registered`)
  }

  await task.verify(CONTRACT_NAME, address, args)
}
