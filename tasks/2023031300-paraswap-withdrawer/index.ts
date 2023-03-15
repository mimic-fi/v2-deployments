import { getSigner } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import logger from '../../src/logger'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { ParaswapFeeRedistributorWithdrawerDeployment } from './input'

const CONTRACT_NAME = 'Withdrawer'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as ParaswapFeeRedistributorWithdrawerDeployment
  if (!from) from = await getSigner(input.from)

  const { params, namespace, version, admin, Registry } = input
  const args = [
    params.smartVault,
    params.recipient,
    params.timeLock,
    params.thresholdToken,
    params.thresholdAmount,
    params.relayer,
    params.gasPriceLimit,
    params.txCostLimit,
    admin,
    Registry,
  ]

  let address: string
  const output = task.output({ ensure: false })
  if (force || !output[CONTRACT_NAME]) {
    logger.info(`Deploying ${CONTRACT_NAME} ${version}...`)
    const creationCode = await task.getCreationCode(CONTRACT_NAME, args)
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${CONTRACT_NAME}.${version}`])
    const factory = await task.inputDeployedInstance('Create3Factory')
    const tx = await factory.connect(from).create(salt, creationCode)
    await tx.wait()

    address = await factory.addressOf(salt)
    logger.success(`Deployed ${CONTRACT_NAME} ${version} at ${address}`)
    task.save({ [CONTRACT_NAME]: address })
  } else {
    address = output[CONTRACT_NAME]
    logger.warn(`${CONTRACT_NAME} ${version} already deployed at ${address}`)
  }

  await task.verify(CONTRACT_NAME, address, args)

  // Authorize owner on withdrawer action
  const signer = await getSigner(admin)
  const withdrawer = await task.instanceAt(CONTRACT_NAME, address)
  await authorize(withdrawer, signer, params.owner, 'authorize')
  await authorize(withdrawer, signer, params.owner, 'unauthorize')
  await authorize(withdrawer, signer, params.owner, 'setRelayer')
  await authorize(withdrawer, signer, params.owner, 'setLimits')
  await authorize(withdrawer, signer, params.owner, 'setTimeLock')
  await authorize(withdrawer, signer, params.owner, 'setThreshold')
  await authorize(withdrawer, signer, params.owner, 'setRecipient')
  await authorize(withdrawer, signer, params.owner, 'call')

  // Authorize relayer to call action
  await authorize(withdrawer, signer, params.relayer, 'call')

  // Authorize withdrawer on smart vault
  const smartVault = await task.instanceAt('SmartVault', params.smartVault)
  await authorize(smartVault, signer, withdrawer.address, 'withdraw')
}

async function authorize(withdrawer: Contract, admin: SignerWithAddress, who: string, role: string): Promise<void> {
  const what = withdrawer.interface.getSighash(role)
  if (await withdrawer.isAuthorized(who, what)) {
    logger.warn(`${who} already has permission to "${role}"`)
  } else {
    logger.info(`Authorizing ${who} to "${role}"`)
    await withdrawer.connect(admin).authorize(who, what)
    logger.success(`${who} authorized successfully to "${role}"`)
  }
}
