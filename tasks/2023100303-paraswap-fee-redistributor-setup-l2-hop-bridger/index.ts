import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { ParaswapFeeRedistributorSetupL2HopBridger } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as ParaswapFeeRedistributorSetupL2HopBridger
  const { namespace, version, relayer, owner, Registry } = input
  if (!from) from = await getSigner(input.from)

  const smartVault = await task.inputDeployedInstance('SmartVault')
  const manager = await task.inputDeployedInstance('PermissionsManager')

  const l2HopBridger = await deployCreate3(
    task,
    'L2HopBridger',
    [
      {
        admin: manager.address,
        registry: Registry,
        smartVault: smartVault.address,
        maxDeadline: input.l2HopBridger.maxDeadline,
        maxSlippage: input.l2HopBridger.maxSlippage,
        maxBonderFeePct: input.l2HopBridger.maxBonderFeePct,
        destinationChainId: input.l2HopBridger.destinationChainId,
        hopAmmParams: input.l2HopBridger.hopAmmParams,
        thresholdToken: input.l2HopBridger.thresholdToken,
        thresholdAmount: input.l2HopBridger.thresholdAmount,
        gasPriceLimit: input.l2HopBridger.gasPriceLimit,
        relayer,
      },
    ],
    { namespace, from, version, force }
  )

  await executePermissionChanges(
    manager,
    [
      {
        target: l2HopBridger,
        changes: [
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: smartVault,
        changes: [
          { grant: true, permission: { who: l2HopBridger, what: 'bridge' } },
          { grant: true, permission: { who: l2HopBridger, what: 'withdraw' } },
        ],
      },
    ],
    await getSigner(owner)
  )
}
