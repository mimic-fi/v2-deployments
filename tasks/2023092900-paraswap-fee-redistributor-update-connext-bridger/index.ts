import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { ParaswapFeeRedistributorConnextBridgerUpdate } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as ParaswapFeeRedistributorConnextBridgerUpdate
  const { namespace, version, relayer, owner, mimic, Registry } = input

  const smartVault = await task.inputDeployedInstance('SmartVault')
  const manager = await task.inputDeployedInstance('PermissionsManager')
  const oldConnextBridger = await task.inputDeployedInstance('ConnextBridger')

  if (!from) from = await getSigner(input.from)
  const newConnextBridger = await deployCreate3(
    task,
    'ConnextBridger',
    [
      {
        admin: manager.address,
        registry: Registry,
        smartVault: smartVault.address,
        destinationChainId: await oldConnextBridger.destinationChainId(),
        maxSlippage: input.maxSlippage,
        maxRelayerFeePct: await oldConnextBridger.maxRelayerFeePct(),
        allowedTokens: await oldConnextBridger.getAllowedTokens(),
        thresholdToken: await oldConnextBridger.thresholdToken(),
        thresholdAmount: await oldConnextBridger.thresholdAmount(),
        gasPriceLimit: await oldConnextBridger.gasPriceLimit(),
        relayer,
      },
    ],
    { namespace, from, version, force }
  )

  await executePermissionChanges(
    manager,
    [
      {
        target: oldConnextBridger,
        changes: [
          { grant: false, permission: { who: owner, what: 'call' } },
          { grant: false, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: newConnextBridger,
        changes: [
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: smartVault,
        changes: [
          { grant: false, permission: { who: oldConnextBridger, what: 'bridge' } },
          { grant: false, permission: { who: oldConnextBridger, what: 'withdraw' } },
          { grant: true, permission: { who: newConnextBridger, what: 'bridge' } },
          { grant: true, permission: { who: newConnextBridger, what: 'withdraw' } },
        ],
      },
    ],
    await getSigner(mimic)
  )
}
