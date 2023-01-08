import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { deployTaskWithCreate3, registerImplementation } from '../../src/utils'
import { BridgeConnectorDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BridgeConnectorDeployment
  const args = [input.wrappedNativeToken, input.Registry]

  const bridgeConnector = await deployTaskWithCreate3(task, args, from, force)
  await registerImplementation(task, bridgeConnector)
}
