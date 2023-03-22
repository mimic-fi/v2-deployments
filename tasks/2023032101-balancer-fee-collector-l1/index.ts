import { assertIndirectEvent, getSigner, Libraries } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { Param, TaskRunOptions } from '../../src/types'
import { BalancerFeeCollectorL1Deployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BalancerFeeCollectorL1Deployment
  const { params, namespace, version, Deployer, Registry } = input
  if (!namespace) throw Error('Missing namespace')
  if (!version) throw Error('Missing version')
  if (!from) from = await getSigner(input.from)

  const smartVaultDeployer = await create3IfNecessary(
    task,
    'L1SmartVaultDeployer',
    [from.address],
    from,
    force,
    {
      Deployer,
    },
    'SmartVaultDeployer'
  )

  const manager = await create3IfNecessary(task, 'PermissionsManager', [smartVaultDeployer.address], from, force)
  const claimer = await create3IfNecessary(task, 'Claimer', [manager.address, Registry], from, force)
  const oneInchSwapper = await create3IfNecessary(task, 'OneInchSwapper', [manager.address, Registry], from, force)
  const paraswapSwapper = await create3IfNecessary(task, 'ParaswapSwapper', [manager.address, Registry], from, force)
  const withdrawer = await create3IfNecessary(task, 'Withdrawer', [manager.address, Registry], from, force)

  const output = task.output({ ensure: false })
  if (force || !output['SmartVault']) {
    params.manager = manager.address
    params.claimerActionParams.impl = claimer.address
    params.oneInchSwapperActionParams.impl = oneInchSwapper.address
    params.paraswapSwapperActionParams.impl = paraswapSwapper.address
    params.withdrawerActionParams.impl = withdrawer.address
    params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.${version}`])

    logger.info(`Deploying SmartVault ${version}...`)
    const tx = await smartVaultDeployer.connect(from).deploy(params)
    const factory = await task.inputDeployedInstance('SmartVaultsFactory')
    const implementation = params.smartVaultParams.impl
    const event = await assertIndirectEvent(tx, factory.interface, 'Created', { implementation })
    logger.success(`New SmartVault instance at ${event.args.instance}`)
    task.save({ SmartVault: event.args.instance })
  }
}

async function create3IfNecessary(
  task: Task,
  contractName: string,
  args: Array<Param> = [],
  from: SignerWithAddress,
  force?: boolean,
  libs?: Libraries,
  name: string = contractName
): Promise<Contract> {
  let address
  const input = task.input() as BalancerFeeCollectorL1Deployment
  const output = task.output({ ensure: false })
  const { namespace, version } = input

  if (force || !output[contractName]) {
    logger.info(`Deploying ${contractName} ${version}...`)
    const creationCode = await task.getCreationCode(contractName, args, libs)
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${name}.${version}`])
    const factory = await task.inputDeployedInstance('Create3Factory')
    const tx = await factory.connect(from).create(salt, creationCode)
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
