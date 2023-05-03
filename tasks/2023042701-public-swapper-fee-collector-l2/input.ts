import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'
import arbitrum from './input.arbitrum'
import gnosis from './input.gnosis'
import optimism from './input.optimism'
import polygon from './input.polygon'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023032100-deployer-v4')
const Registry = new Task('2023010602-registry-v2')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const PublicSwapper = new Task('2023032700-public-swapper')

export default {
  namespace: 'mimic-v2.public-swapper-fee-collector',
  version: 'v1',
  from: DEPLOYER_2,
  owner: TESTING_EOA,
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
  PublicSwapper: PublicSwapper.key('SmartVault'),
  optimism,
  arbitrum,
  polygon,
  gnosis,
}

export type PublicSwapperFeeCollectorL2Deployment = {
  namespace: string
  version: string
  from: string
  owner: string
  Registry: string
  Deployer: string
  Create3Factory: string
  SmartVaultsFactory: string
  PublicSwapper: string
  accounts: {
    owner: string
    managers: string[]
    relayers: string[]
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
    paraswapSwapperActionParams: {
      impl: string
      admin: string
      managers: string[]
      tokenOut: string
      swapSigner: string
      deniedTokens: string[]
      defaultMaxSlippage: BigNumberish
      customSlippageTokens: string[]
      customSlippageValues: BigNumberish[]
      tokenThresholdActionParams: {
        token: string
        amount: BigNumberish
      }
      relayedActionParams: {
        relayers: string[]
        gasPriceLimit: BigNumberish
        txCostLimit: BigNumberish
      }
    }
    l2HopBridgerActionParams: {
      impl: string
      admin: string
      managers: string[]
      maxDeadline: BigNumberish
      maxSlippage: BigNumberish
      maxBonderFeePct: BigNumberish
      destinationChainId: BigNumberish
      hopAmmParams: { token: string; amm: string }[]
      tokenThresholdActionParams: {
        token: string
        amount: BigNumberish
      }
      relayedActionParams: {
        relayers: string[]
        txCostLimit: BigNumberish
        gasPriceLimit: BigNumberish
      }
    }
  }
}
