import { TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const SwapConnector = new Task('2023101100-swap-connector-v6')
const SmartVault = new Task('2023032700-public-swapper')

export default {
  owner: TESTING_EOA,
  SmartVault,
  SwapConnector,
}

export type PublicSwapperUpdateSwapConnector = {
  owner: string
  SmartVault: string
  SwapConnector: string
}
