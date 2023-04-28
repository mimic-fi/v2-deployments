import { getSigner } from '@mimic-fi/v2-helpers'

import { deployAndRegisterImplementation } from '../../src/registry'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { SwapConnectorDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as SwapConnectorDeployment
  const { namespace, version } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, version, from, force }

  await deployAndRegisterImplementation(
    task,
    'SwapConnector',
    [
      input.uniswapV2Router,
      input.uniswapV3Router,
      input.balancerV2Vault,
      input.paraswapV5Augustus,
      input.oneInchV5Router,
      input.Registry,
    ],
    create3Params
  )
}
