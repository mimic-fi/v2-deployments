import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { deployTaskWithCreate3, registerImplementation } from '../../src/utils'
import { PriceOracleDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as PriceOracleDeployment
  const args = [input.pivot, input.Registry]
  const priceOracle = await deployTaskWithCreate3(task, args, from, force)
  await registerImplementation(task, priceOracle)
}
