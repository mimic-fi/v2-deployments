import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract, ContractTransaction } from 'ethers'

import logger from './logger'
import { Account, NAry } from './types'

export type PermissionChangeRequest = {
  target: Contract
  changes: { grant: boolean; permission: { who: NAry<Account>; what: string } }[]
}

export async function executePermissionChanges(
  manager: Contract,
  requests: PermissionChangeRequest[],
  from: SignerWithAddress
): Promise<ContractTransaction> {
  logger.info(`Executing ${requests.length} permission changes requests on manager ${manager.address}...`)
  const parsedRequests = requests.map((request: PermissionChangeRequest) => {
    const target = request.target.address
    const changes = request.changes.reduce(
      (all: { grant: boolean; permission: { who: string; what: string } }[], { grant, permission }) => {
        const what = request.target.interface.getSighash(permission.what)
        if (Array.isArray(permission.who)) {
          return all.concat(permission.who.map((w: Account) => ({ grant, permission: { what, who: toAddress(w) } })))
        } else {
          return all.concat({ grant, permission: { what, who: toAddress(permission.who) } })
        }
      },
      []
    )

    return { target, changes }
  })

  const tx = await manager.connect(from).execute(parsedRequests)
  await tx.wait()
  logger.success(`Executed permission changes requests on manager ${manager.address} successfully`)
  return tx
}

function toAddress(account: Account): string {
  return typeof account == 'string' ? account : account.address
}
