import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { MimicFeeCollectorAxelarBridgerDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as MimicFeeCollectorAxelarBridgerDeployment
  const { namespace, version } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, from, version, force }

  const axelarBridgerArgs = [input.axelarBridgerConfig, input.PermissionsManager, input.Registry]
  const axelarBridger = await deployCreate3(task, 'AxelarBridger', axelarBridgerArgs, { ...create3Params })

  const owner = await getSigner(input.owner)
  const manager = await task.inputDeployedInstance('PermissionsManager')
  const smartVault = await task.inputDeployedInstance('SmartVault')
  await executePermissionChanges(
    manager,
    [
      {
        target: smartVault,
        changes: [
          { grant: true, permission: { who: axelarBridger, what: 'wrap' } },
          { grant: true, permission: { who: axelarBridger, what: 'bridge' } },
        ],
      },
      {
        target: axelarBridger,
        changes: [{ grant: true, permission: { who: input.managers, what: 'call' } }],
      },
    ],
    owner
  )
}
