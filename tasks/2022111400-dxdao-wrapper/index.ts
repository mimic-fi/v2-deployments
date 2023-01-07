import { assertIndirectEvent, getSigner, Libraries } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { Param, TaskRunOptions } from '../../src/types'
import { DxDaoWrapperDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as DxDaoWrapperDeployment
  const { params, namespace, Deployer, Registry } = input

  const factory = await task.inputDeployedInstance('Create3Factory')
  if (!from) from = await getSigner(input.from)

  const smartVaultDeployer = await create3IfNecessary(task, factory, from, namespace, 'SmartVaultDeployer', [], force, {
    Deployer,
  })

  const wrapper = await create3IfNecessary(
    task,
    factory,
    from,
    namespace,
    'Wrapper',
    [smartVaultDeployer.address, Registry],
    force
  )

  const output = task.output({ ensure: false })
  if (force || !output['SmartVault']) {
    params.wrapperActionParams.impl = wrapper.address

    logger.info(`Deploying SmartVault...`)
    const tx = await smartVaultDeployer.connect(from).deploy(params)
    const registry = await task.inputDeployedInstance('Registry')
    const implementation = params.smartVaultParams.impl
    const event = await assertIndirectEvent(tx, registry.interface, 'Cloned', { implementation })
    logger.success(`New SmartVault instance at ${event.args.instance}`)
    task.save({ SmartVault: event.args.instance })
  }
}

async function create3IfNecessary(
  task: Task,
  factory: Contract,
  from: SignerWithAddress,
  namespace: string,
  name: string,
  args: Array<Param> = [],
  force?: boolean,
  libs?: Libraries
): Promise<Contract> {
  let address
  const output = task.output({ ensure: false })

  if (force || !output[name]) {
    const creationCode = await task.getCreationCode(name, args, libs)
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${name}`])
    const tx = await factory.connect(from).create3(salt, creationCode)
    await tx.wait()
    address = await factory.addressOf(salt)
    logger.success(`Deployed ${name} at ${address}`)
    task.save({ [name]: address })
  } else {
    address = output[name]
    logger.warn(`${name} already deployed at ${address}`)
  }

  await task.verify(name, address, args)
  return task.instanceAt(name, address)
}
