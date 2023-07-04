import { TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const BridgeConnector = new Task('2023070402-bridge-connector-v7')
const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

export default {
  owner: TESTING_EOA,
  SmartVault: ParaswapFeeRedistributor,
  BridgeConnector,
  mainnet: {
    PermissionsManager: new Task('2023062100-paraswap-fee-redistributor-updates-mainnet'),
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
