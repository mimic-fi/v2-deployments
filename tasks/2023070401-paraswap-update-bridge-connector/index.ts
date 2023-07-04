import { getSigner } from '@mimic-fi/v2-helpers'

import logger from '../../src/logger'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { ParaswapFeeRedistributorUpdateBridgeConnector } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as ParaswapFeeRedistributorUpdateBridgeConnector
  const { BridgeConnector } = input

  const smartVault = await task.inputDeployedInstance('SmartVault')
  const manager = await task.inputDeployedInstance('PermissionsManager')

  if (force || (await smartVault.bridgeConnector()) != BridgeConnector) {
    logger.info(`Setting new bridge connector...`)
    if (!from) from = await getSigner(input.owner)

    await executePermissionChanges(
      manager,
      [
        {
          target: smartVault,
          changes: [{ grant: true, permission: { who: input.owner, what: 'setBridgeConnector' } }],
        },
      ],
      from
    )

    await smartVault.connect(from).setBridgeConnector(BridgeConnector)
    logger.success(`Bridge connector set`)
  } else {
    logger.warn(`Bridge connector already set`)
  }
}
