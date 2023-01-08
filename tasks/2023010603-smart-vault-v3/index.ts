import { getSigner } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { registerImplementation } from '../../src/utils'
import { SmartVaultDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as SmartVaultDeployment
  const args = [input.wrappedNativeToken, input.Registry]

  if (!from) from = await getSigner(input.from)
  const smartVault = await task.deployAndVerify(input.contractName, args, from, force)
  await registerImplementation(task, smartVault)
}
