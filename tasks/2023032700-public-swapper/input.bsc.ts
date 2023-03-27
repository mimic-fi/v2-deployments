import { fp, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { FEE_COLLECTOR_EOA, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

const mimic = TESTING_EOA
const feeCollector = FEE_COLLECTOR_EOA

export default {
  accounts: {
    mimic,
    feeCollector,
  },
  params: {
    owners: [mimic],
    registry: Registry,
    smartVaultParams: {
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: mimic,
      feeCollector,
      feeCollectorAdmin: mimic,
      strategies: [],
      priceFeedParams: [],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: ZERO_ADDRESS,
      swapFee: { pct: fp(0.007), cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    swapperActionParams: {
      impl: undefined,
      admin: mimic,
      sources: [3, 4], // paraswap and 1inch
    },
  },
}