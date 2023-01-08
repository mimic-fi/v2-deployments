import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { deployTaskWithCreate3, registerImplementation } from '../../src/utils'
import { SmartVaultsFactoryDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as SmartVaultsFactoryDeployment
  const args = [input.Registry]
  const factory = await deployTaskWithCreate3(task, args, from, force)
  await registerImplementation(task, factory)
}
