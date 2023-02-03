import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import gnosis from './input.gnosis'
import mumbai from './input.mumbai'
import optimism from './input.optimism'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023020100-deployer-v3')
const Registry = new Task('2023010602-registry-v2')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  namespace: 'mimic-v2.dxdao-bridger',
  from: DEPLOYER_2,
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
  mumbai,
  gnosis,
  optimism,
}

export type DxDaoBridgerDeployment = {
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
    mimicAdmin: string
    feeCollector: string
  }
  params: {
    registry: string
    smartVaultParams: {
      impl: string
      admin: string
      salt: string
      factory: string
      feeCollector: string
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
    l2HopSwapperActionParams: {
      impl: string
      admin: string
      managers: string[]
      maxSlippage: BigNumberish
      hopAmmParams: { token: string; amm: string }[]
      relayedActionParams: {
        relayers: string[]
        txCostLimit: BigNumberish
        gasPriceLimit: BigNumberish
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
    withdrawerActionParams: {
      impl: string
      admin: string
      managers: string[]
      withdrawalActionParams: {
        recipient: string
      }
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
