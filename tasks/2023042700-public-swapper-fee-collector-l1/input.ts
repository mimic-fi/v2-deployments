import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import mainnet from './input.mainnet'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023032100-deployer-v4')
const Registry = new Task('2023010602-registry-v2')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  namespace: 'mimic-v2.public-swapper-fee-collector',
  version: 'v1',
  from: DEPLOYER_2,
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
  mainnet,
}

export type PublicSwapperFeeCollectorL1Deployment = {
  namespace: string
  version: string
  from: string
  Registry: string
  Deployer: string
  Create3Factory: string
  SmartVaultsFactory: string
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
    withdrawerActionParams: {
      impl: string
      admin: string
      managers: string[]
      withdrawalActionParams: {
        recipient: string
      }
      timeLockedActionParams: {
        period: BigNumberish
      }
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
  }
}
