import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import logger from './logger'
import Task from './task'
import { Param, TxParams } from './types'

export type Create3DeploymentParams = TxParams & {
  namespace: string
  version: string
  instanceName?: string
}

export async function deployManyCreate3(
  task: Task,
  contractNames: string[],
  args: Array<Param>,
  params: Create3DeploymentParams
): Promise<{ [key: string]: Contract }> {
  const instances: { [key: string]: Contract } = {}
  for (const contractName of contractNames) {
    instances[contractName] = await deployCreate3(task, contractName, args, params)
  }
  return instances
}

export async function deployCreate3(
  task: Task,
  contractName: string,
  args: Array<Param>,
  params: Create3DeploymentParams
): Promise<Contract> {
  let address: string
  const output = task.output({ ensure: false })

  const force = params.force || false
  const instanceName = params.instanceName || contractName

  const { namespace, version, from } = params
  if (!namespace || namespace == '') throw Error('Missing namespace')
  if (!version || version == '') throw Error('Missing version')
  if (!contractName || contractName == '') throw Error('Missing contract name')

  if (force || !output[instanceName]) {
    logger.info(`Deploying ${instanceName} (${contractName}) ${version}...`)
    const creationCode = await task.getCreationCode(contractName, args)
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${instanceName}.${version}`])
    const factory = await task.inputDeployedInstance('Create3Factory')
    const tx = await factory.connect(from).create(salt, creationCode)
    await tx.wait()
    address = await factory.addressOf(salt)
    logger.success(`Deployed ${instanceName} (${contractName}) ${version} at ${address}`)
    task.save({ [instanceName]: address })
  } else {
    address = output[instanceName]
    logger.warn(`${instanceName} (${contractName}) ${version} already deployed at ${address}`)
  }

  await task.verify(contractName, address, args)
  return task.instanceAt(contractName, address)
}
