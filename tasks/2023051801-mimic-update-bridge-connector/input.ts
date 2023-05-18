import { OWNER_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const BridgeConnector = new Task('2023051800-bridge-connector-v2')
const MimicFeeCollector = new Task('2023010702-mimic-fee-collector-l2-no-bridge')

export default {
  owner: OWNER_EOA,
  SmartVault: MimicFeeCollector,
  BridgeConnector,
}

export type MimicFeeCollectorUpdateBridgeConnector = {
  owner: string
  SmartVault: string
  BridgeConnector: string
}
