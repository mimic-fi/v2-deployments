import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { deployTaskWithCreate3 } from '../../src/utils'
import { RegistryDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as RegistryDeployment
  const args = [input.admin]
  await deployTaskWithCreate3(task, args, from, force)
}
