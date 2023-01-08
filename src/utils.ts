import { getSigner, Libraries, ZERO_BYTES32 } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import logger from './logger'
import Task from './task'
import { DeploymentMetadata, MimicDeployment, Param } from './types'

export async function deployTaskWithCreate3(
  task: Task,
  args: Array<Param> = [],
  from?: SignerWithAddress,
  force?: boolean,
  libs?: Libraries
): Promise<Contract> {
  const output = task.output({ ensure: false })
  const input = task.input() as DeploymentMetadata
  const { namespace, contractName, version, from: defaultSender } = input

  let address
  if (force || !output[contractName]) {
    const factory = await task.inputDeployedInstance('Create3Factory')
    const creationCode = await task.getCreationCode(contractName, args, libs)
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${contractName}.${version}`])

    if (!from) from = await getSigner(defaultSender)
    const create3Method = factory['create'] ? 'create' : 'create3'
    const tx = await factory.connect(from)[create3Method](salt, creationCode)
    await tx.wait()

    address = await factory.addressOf(salt)
    logger.success(`Deployed ${contractName} ${version} at ${address}`)
    task.save({ [contractName]: address })
  } else {
    address = output[contractName]
    logger.warn(`${contractName} ${version} already deployed at ${address}`)
  }

  await task.verify(contractName, address, args)
  return task.instanceAt(contractName, address)
}

export async function registerImplementation(task: Task, implementation: Contract): Promise<void> {
  const input = task.input() as MimicDeployment
  const { contractName, version, admin, stateless } = input

  logger.info(`Checking ${contractName} ${version}...`)
  const registry = await task.inputDeployedInstance('Registry')
  const implementationData = await registry.implementationData(implementation.address)
  const instance = await task.instanceAt(contractName, implementation.address)

  if (implementationData.namespace == ZERO_BYTES32) {
    logger.info(`Registering ${contractName} ${version}...`)
    const adminSigner = await getSigner(admin)
    await registry.connect(adminSigner).register(await instance.NAMESPACE(), instance.address, stateless)
    logger.success(`Registered ${contractName} ${version}`)
  } else {
    logger.warn(`${contractName} ${version} already registered`)
  }
}
