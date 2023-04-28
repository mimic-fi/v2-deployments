import { getSigner } from '@mimic-fi/v2-helpers'

import { deployAndRegisterImplementation } from '../../src/registry'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { PriceOracleDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as PriceOracleDeployment
  const { namespace, version } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, version, from, force }

  await deployAndRegisterImplementation(task, 'PriceOracle', [input.pivot, input.Registry], create3Params)
}
