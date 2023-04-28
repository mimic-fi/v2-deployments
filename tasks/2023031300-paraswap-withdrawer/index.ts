import { getSigner } from '@mimic-fi/v2-helpers'

import { authorize } from '../../src/authorizer'
import { deployCreate3 } from '../../src/create3'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { ParaswapFeeRedistributorWithdrawerDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as ParaswapFeeRedistributorWithdrawerDeployment
  const { params, namespace, version, admin, Registry } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, version, from, force }

  const withdrawer = await deployCreate3(
    task,
    'Withdrawer',
    [
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
    ],
    create3Params
  )

  // Authorize owner on withdrawer action
  const signer = await getSigner(admin)
  await authorize(withdrawer, params.owner, 'authorize', signer)
  await authorize(withdrawer, params.owner, 'unauthorize', signer)
  await authorize(withdrawer, params.owner, 'setRelayer', signer)
  await authorize(withdrawer, params.owner, 'setLimits', signer)
  await authorize(withdrawer, params.owner, 'setTimeLock', signer)
  await authorize(withdrawer, params.owner, 'setThreshold', signer)
  await authorize(withdrawer, params.owner, 'setRecipient', signer)
  await authorize(withdrawer, params.owner, 'call', signer)

  // Authorize relayer to call action
  await authorize(withdrawer, params.relayer, 'call', signer)

  // Authorize withdrawer on smart vault
  const smartVault = await task.instanceAt('SmartVault', params.smartVault)
  await authorize(smartVault, withdrawer.address, 'withdraw', signer)
}
