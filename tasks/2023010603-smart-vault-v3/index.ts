import { getSigner } from '@mimic-fi/v2-helpers'

import { deployAndRegisterImplementation } from '../../src/registry'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { SmartVaultDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as SmartVaultDeployment
  const { namespace, version } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, version, from, force }

  await deployAndRegisterImplementation(task, 'SmartVault', [input.wrappedNativeToken, input.Registry], create3Params)
}
