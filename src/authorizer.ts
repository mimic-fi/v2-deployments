import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'

import logger from './logger'
import Task from './task'

export async function grantAdminPermissions(
  task: Task,
  instanceName: string,
  target: Contract,
  from: SignerWithAddress
): Promise<Contract> {
  logger.warn(`Granting ${instanceName}'s admin permissions to ${target.address}...`)
  const authorizer = await task.inputDeployedInstance(instanceName)
  await authorize(authorizer, target.address, 'authorize', from)
  await authorize(authorizer, target.address, 'unauthorize', from)
  return authorizer
}

export async function authorize(
  authorizer: Contract,
  who: string,
  role: string,
  from: SignerWithAddress
): Promise<void> {
  const what = authorizer.interface.getSighash(role)
  if (await authorizer.isAuthorized(who, what)) {
    logger.warn(`${who} already has permission to "${role}"`)
  } else {
    logger.info(`Authorizing ${who} to "${role}"`)
    await authorizer.connect(from).authorize(who, what)
    logger.success(`${who} authorized successfully to "${role}"`)
  }
}
