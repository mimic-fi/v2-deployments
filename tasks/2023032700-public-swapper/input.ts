import { BigNumberish, fp, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2, FEE_COLLECTOR_EOA, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023032100-deployer-v4')
const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

const mimic = TESTING_EOA
const feeCollector = FEE_COLLECTOR_EOA

export default {
  namespace: 'mimic-v2.public-swapper',
  version: 'v1',
  from: DEPLOYER_2,
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
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

export type PublicSwapperDeployment = {
  namespace: string
  version: string
  from: string
  Registry: string
  Deployer: string
  Create3Factory: string
  SmartVaultsFactory: string
  accounts: {
    mimic: string
    feeCollector: string
  }
  params: {
    owners: string[]
    manager: string
    registry: string
    smartVaultParams: {
      impl: string
      admin: string
      salt: string
      factory: string
      feeCollector: string
      feeCollectorAdmin: string
      strategies: string[]
      priceFeedParams: { base: string; quote: string; feed: string }[]
      priceOracle: string
      swapConnector: string
      bridgeConnector: string
      swapFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      bridgeFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      withdrawFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      performanceFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
    }
    swapperActionParams: {
      impl: string
      admin: string
      sources: number[]
    }
  }
}
