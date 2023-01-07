import { getSigner } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { Create3FactoryDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as Create3FactoryDeployment
  if (!from) from = await getSigner(input.from)
  await task.deployAndVerify('Create3Factory', [], from, force)
}
