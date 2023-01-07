import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { DXDaoWrapperReceiverDeployment } from './input'

const CONTRACT_NAME = 'Receiver'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const output = task.output({ ensure: false })
  const input = task.input() as DXDaoWrapperReceiverDeployment
  const args = [input.SmartVault]

  let address
  if (force || !output[CONTRACT_NAME]) {
    const factory = await task.inputDeployedInstance('Create3Factory')
    const creationCode = task.getCreationCode(CONTRACT_NAME, args)
    const salt = ethers.utils.solidityKeccak256(['string'], [`${input.namespace}.${CONTRACT_NAME}`])

    if (!from) from = await getSigner(input.from)
    const tx = await factory.connect(from).create3(salt, creationCode)
    await tx.wait()

    address = await factory.addressOf(salt)
    logger.success(`Deployed ${CONTRACT_NAME} at ${address}`)
    task.save({ [CONTRACT_NAME]: address })
  } else {
    address = output[CONTRACT_NAME]
    logger.warn(`${CONTRACT_NAME} already deployed at ${address}`)
  }

  await task.verify(CONTRACT_NAME, address, args)
}
