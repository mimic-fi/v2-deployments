import { getSigner, ZERO_BYTES32 } from '@mimic-fi/v2-helpers'
import { Contract } from 'ethers'

import { Create3DeploymentParams, deployCreate3 } from './create3'
import logger from './logger'
import Task from './task'
import { Param } from './types'

export type MimicDeployment = {
  namespace: string
  version: string
  from: string
  admin: string
  stateless: boolean
  Registry: string
  Create3Factory: string
}

export async function deployAndRegisterImplementation(
  task: Task,
  contractName: string,
  args: Array<Param>,
  params: Create3DeploymentParams
): Promise<Contract> {
  const instance = await deployCreate3(task, contractName, args, params)
  await registerImplementation(task, instance, contractName)
  return instance
}

export async function registerImplementation(
  task: Task,
  implementation: Contract,
  contractName: string
): Promise<void> {
  const input = task.input() as MimicDeployment
  const { version, admin, stateless } = input

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
