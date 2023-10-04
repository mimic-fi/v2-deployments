import { TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const BridgeConnector = new Task('2023100300-bridge-connector-v8')

export default {
  owner: TESTING_EOA,
  BridgeConnector,
  mainnet: {
    SmartVault: new Task('2023042700-public-swapper-fee-collector-l1'),
    PermissionsManager: new Task('2023042700-public-swapper-fee-collector-l1'),
  },
  polygon: {
    SmartVault: new Task('2023042701-public-swapper-fee-collector-l2'),
    PermissionsManager: new Task('2023042701-public-swapper-fee-collector-l2'),
  },
  arbitrum: {
    SmartVault: new Task('2023042701-public-swapper-fee-collector-l2'),
    PermissionsManager: new Task('2023042701-public-swapper-fee-collector-l2'),
  },
  optimism: {
    SmartVault: new Task('2023042701-public-swapper-fee-collector-l2'),
    PermissionsManager: new Task('2023042701-public-swapper-fee-collector-l2'),
  },
  gnosis: {
    SmartVault: new Task('2023042701-public-swapper-fee-collector-l2'),
    PermissionsManager: new Task('2023042701-public-swapper-fee-collector-l2'),
  },
  bsc: {
    SmartVault: new Task('2023042702-public-swapper-fee-collector-l2-no-bridge'),
    PermissionsManager: new Task('2023042702-public-swapper-fee-collector-l2-no-bridge'),
  },
  avalanche: {
    SmartVault: new Task('2023042702-public-swapper-fee-collector-l2-no-bridge'),
    PermissionsManager: new Task('2023042702-public-swapper-fee-collector-l2-no-bridge'),
  },
}

export type PublicSwapperFeeCollectorBridgeConnectorUpdate = {
  owner: string
  SmartVault: string
  BridgeConnector: string
  PermissionsManager: string
}
