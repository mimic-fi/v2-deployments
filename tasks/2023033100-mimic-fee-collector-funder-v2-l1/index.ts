import { getSigner } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { Param, TaskRunOptions } from '../../src/types'
import { PublicSwapperDeployment } from '../2023032700-public-swapper/input'
import { MimicFeeCollectorFunderV2Deployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as MimicFeeCollectorFunderV2Deployment
  const { namespace, relayer, managers, Registry } = input

  if (!namespace) throw Error('Missing namespace')
  if (!from) from = await getSigner(input.from)

  const owner = await getSigner(input.owner)
  const manager = await create3IfNecessary(task, 'PermissionsManager', [owner.address], from, 'v1', force)

  const funderV1 = await authorizeManager(task, 'Funder', owner, manager)
  const holder = await authorizeManager(task, 'Holder', owner, manager)
  const bridger = await authorizeManager(task, 'L1HopBridger', owner, manager)
  const smartVault = await authorizeManager(task, 'SmartVault', owner, manager)

  const args = [
    smartVault.address,
    await funderV1.tokenIn(),
    await funderV1.minBalance(),
    await funderV1.maxBalance(),
    await funderV1.maxSlippage(),
    await funderV1.recipient(),
    owner.address,
    manager.address,
    Registry,
  ]
  const relayerFunder = await create3IfNecessary(task, 'FunderV2', args, from, 'v1', force, 'RelayerFunder')

  const deployerArgs = [
    smartVault.address,
    await funderV1.tokenIn(),
    await funderV1.minBalance(),
    await funderV1.maxBalance(),
    await funderV1.maxSlippage(),
    input.from,
    owner.address,
    manager.address,
    Registry,
  ]
  const deployerFunder = await create3IfNecessary(task, 'FunderV2', deployerArgs, from, 'v1', force, 'DeployerFunder')

  const grantManagersToFunderV2 = managers.map((who) => {
    return { grant: true, permission: { who, what: relayerFunder.interface.getSighash('call') } }
  })

  const revokeManagersFromFunderV1 = managers.map((who) => {
    return { grant: false, permission: { who, what: funderV1.interface.getSighash('call') } }
  })

  await manager.connect(owner).execute([
    {
      target: relayerFunder.address,
      changes: grantManagersToFunderV2.concat([
        { grant: true, permission: { who: relayer, what: relayerFunder.interface.getSighash('call') } },
        { grant: true, permission: { who: owner.address, what: relayerFunder.interface.getSighash('call') } },
      ]),
    },
    {
      target: deployerFunder.address,
      changes: grantManagersToFunderV2.concat([
        { grant: true, permission: { who: relayer, what: deployerFunder.interface.getSighash('call') } },
        { grant: true, permission: { who: owner.address, what: deployerFunder.interface.getSighash('call') } },
      ]),
    },
    {
      target: funderV1.address,
      changes: revokeManagersFromFunderV1.concat([
        { grant: false, permission: { who: relayer, what: funderV1.interface.getSighash('call') } },
        { grant: false, permission: { who: owner.address, what: funderV1.interface.getSighash('call') } },
        { grant: false, permission: { who: owner.address, what: funderV1.interface.getSighash('authorize') } },
        { grant: false, permission: { who: owner.address, what: funderV1.interface.getSighash('unauthorize') } },
      ]),
    },
    {
      target: holder.address,
      changes: [
        { grant: false, permission: { who: owner.address, what: holder.interface.getSighash('authorize') } },
        { grant: false, permission: { who: owner.address, what: holder.interface.getSighash('unauthorize') } },
      ],
    },
    {
      target: bridger.address,
      changes: [
        { grant: false, permission: { who: owner.address, what: bridger.interface.getSighash('authorize') } },
        { grant: false, permission: { who: owner.address, what: bridger.interface.getSighash('unauthorize') } },
      ],
    },
    {
      target: smartVault.address,
      changes: [
        { grant: true, permission: { who: relayerFunder.address, what: smartVault.interface.getSighash('swap') } },
        { grant: true, permission: { who: relayerFunder.address, what: smartVault.interface.getSighash('unwrap') } },
        { grant: true, permission: { who: relayerFunder.address, what: smartVault.interface.getSighash('withdraw') } },
        { grant: true, permission: { who: deployerFunder.address, what: smartVault.interface.getSighash('swap') } },
        { grant: true, permission: { who: deployerFunder.address, what: smartVault.interface.getSighash('unwrap') } },
        { grant: true, permission: { who: deployerFunder.address, what: smartVault.interface.getSighash('withdraw') } },
        { grant: false, permission: { who: funderV1.address, what: smartVault.interface.getSighash('swap') } },
        { grant: false, permission: { who: funderV1.address, what: smartVault.interface.getSighash('unwrap') } },
        { grant: false, permission: { who: funderV1.address, what: smartVault.interface.getSighash('withdraw') } },
        { grant: false, permission: { who: owner.address, what: smartVault.interface.getSighash('authorize') } },
        { grant: false, permission: { who: owner.address, what: smartVault.interface.getSighash('unauthorize') } },
      ],
    },
  ])
}

async function authorizeManager(
  task: Task,
  name: string,
  owner: SignerWithAddress,
  manager: Contract
): Promise<Contract> {
  logger.warn(`Migrating ${name}'s admin permissions to permissions manager...`)
  const authorizer = await task.inputDeployedInstance(name)
  await authorize(authorizer, owner, manager.address, 'authorize')
  await authorize(authorizer, owner, manager.address, 'unauthorize')
  return authorizer
}

async function authorize(authorizer: Contract, owner: SignerWithAddress, who: string, role: string): Promise<void> {
  const what = authorizer.interface.getSighash(role)
  if (await authorizer.isAuthorized(who, what)) {
    logger.warn(`${who} already has permission to "${role}"`)
  } else {
    logger.info(`Authorizing ${who} to "${role}"`)
    await authorizer.connect(owner).authorize(who, what)
    logger.success(`${who} authorized successfully to "${role}"`)
  }
}

async function create3IfNecessary(
  task: Task,
  contractName: string,
  args: Array<Param> = [],
  from: SignerWithAddress,
  version: string,
  force?: boolean,
  name: string = contractName
): Promise<Contract> {
  let address
  const input = task.input() as PublicSwapperDeployment
  const output = task.output({ ensure: false })
  const { namespace } = input

  if (force || !output[name]) {
    logger.info(`Deploying ${name} (${contractName}) ${version}...`)
    const creationCode = await task.getCreationCode(contractName, args)
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${name}.${version}`])
    const factory = await task.inputDeployedInstance('Create3Factory')
    const tx = await factory.connect(from).create(salt, creationCode)
    await tx.wait()
    address = await factory.addressOf(salt)
    logger.success(`Deployed ${name} (${contractName}) ${version} at ${address}`)
    task.save({ [name]: address })
  } else {
    address = output[name]
    logger.warn(`${name} ${version} already deployed at ${address}`)
  }

  await task.verify(contractName, address, args)
  return task.instanceAt(contractName, address)
}
