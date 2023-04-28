import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { RegistryDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as RegistryDeployment
  const { namespace, version } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, version, from, force }

  await deployCreate3(task, 'Registry', [input.admin], create3Params)
}
