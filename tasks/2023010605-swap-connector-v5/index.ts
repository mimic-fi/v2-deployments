import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { deployTaskWithCreate3, registerImplementation } from '../../src/utils'
import { SwapConnectorDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as SwapConnectorDeployment
  const args = [
    input.uniswapV2Router,
    input.uniswapV3Router,
    input.balancerV2Vault,
    input.paraswapV5Augustus,
    input.oneInchV5Router,
    input.Registry,
  ]

  const swapConnector = await deployTaskWithCreate3(task, args, from, force)
  await registerImplementation(task, swapConnector)
}
