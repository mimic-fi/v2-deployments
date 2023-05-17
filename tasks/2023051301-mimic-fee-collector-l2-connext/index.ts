import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { MimicFeeCollectorConnextBridgerDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as MimicFeeCollectorConnextBridgerDeployment
  const { namespace, version } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, from, version, force }

  const connextBridgerArgs = [input.connextBridgerConfig, input.PermissionsManager, input.Registry]
  const connextBridger = await deployCreate3(task, 'ConnextBridger', connextBridgerArgs, { ...create3Params })

  const owner = await getSigner(input.owner)
  const manager = await task.inputDeployedInstance('PermissionsManager')
  const smartVault = await task.inputDeployedInstance('SmartVault')

  await executePermissionChanges(
    manager,
    [
      {
        target: smartVault,
        changes: [
          { grant: true, permission: { who: connextBridger, what: 'wrap' } },
          { grant: true, permission: { who: connextBridger, what: 'bridge' } },
        ],
      },
      {
        target: connextBridger,
        changes: [{ grant: true, permission: { who: input.managers, what: 'call' } }],
      },
    ],
    owner
  )
}
