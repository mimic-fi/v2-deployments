import { assertIndirectEvent, getSigner, Libraries } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { Param, TaskRunOptions } from '../../src/types'
import { DecentralandManaSwapperDeployment } from './input'

const VERSION = 'v1'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as DecentralandManaSwapperDeployment
  const { params, namespace, Deployer, Registry } = input

  const factory = await task.inputDeployedInstance('Create3Factory')
  if (!from) from = await getSigner(input.from)

  const smartVaultDeployer = await create3IfNecessary(task, factory, from, namespace, 'SmartVaultDeployer', [], force, {
    Deployer,
  })

  const dexSwapper = await create3IfNecessary(
    task,
    factory,
    from,
    namespace,
    'DEXSwapper',
    [smartVaultDeployer.address, Registry],
    force
  )

  const otcSwapper = await create3IfNecessary(
    task,
    factory,
    from,
    namespace,
    'OTCSwapper',
    [smartVaultDeployer.address, Registry],
    force
  )

  const withdrawer = await create3IfNecessary(
    task,
    factory,
    from,
    namespace,
    'Withdrawer',
    [smartVaultDeployer.address, Registry],
    force
  )

  const output = task.output({ ensure: false })
  if (force || !output['SmartVault']) {
    params.dexSwapperActionParams.impl = dexSwapper.address
    params.otcSwapperActionParams.impl = otcSwapper.address
    params.withdrawerActionParams.impl = withdrawer.address

    logger.info(`Deploying SmartVault ${VERSION}...`)
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
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${name}.${VERSION}`])
    const tx = await factory.connect(from).create3(salt, creationCode)
    await tx.wait()
    address = await factory.addressOf(salt)
    logger.success(`Deployed ${name} ${VERSION} at ${address}`)
    task.save({ [name]: address })
  } else {
    address = output[name]
    logger.warn(`${name} ${VERSION} already deployed at ${address}`)
  }

  await task.verify(name, address, args)
  return task.instanceAt(name, address)
}
