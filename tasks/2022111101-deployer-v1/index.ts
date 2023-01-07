import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { DeployerDeployment } from './input'

const VERSION = `v1`
const CONTRACT_NAME = 'Deployer'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const output = task.output({ ensure: false })
  const input = task.input() as DeployerDeployment

  let address
  if (force || !output[CONTRACT_NAME]) {
    const factory = await task.inputDeployedInstance('Create3Factory')
    const creationCode = task.getCreationCode(CONTRACT_NAME)
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

  await task.verify(CONTRACT_NAME, address, [])
}
