import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { deployTaskWithCreate3 } from '../../src/utils'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  await deployTaskWithCreate3(task, [], from, force)
}
