import { TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const BridgeConnector = new Task('2023100300-bridge-connector-v8')
const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

export default {
  owner: TESTING_EOA,
  SmartVault: ParaswapFeeRedistributor,
  BridgeConnector,
  mainnet: {
    PermissionsManager: new Task('2023062100-paraswap-fee-redistributor-updates-mainnet'),
  },
  polygon: {
    PermissionsManager: new Task('2023062101-paraswap-fee-redistributor-updates-polygon'),
  },
  arbitrum: {
    PermissionsManager: new Task('2023062102-paraswap-fee-redistributor-updates-arbitrum'),
  },
  optimism: {
    PermissionsManager: new Task('2023062103-paraswap-fee-redistributor-updates-optimism'),
  },
  bsc: {
    PermissionsManager: new Task('2023062104-paraswap-fee-redistributor-updates-bsc'),
  },
  avalanche: {
    PermissionsManager: new Task('2023062106-paraswap-fee-redistributor-updates-avalanche'),
  },
}

export type ParaswapFeeRedistributorUpdateBridgeConnector = {
  owner: string
  SmartVault: string
  BridgeConnector: string
}
