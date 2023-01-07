import { BigNumberish } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'
import mainnet from './input.mainnet'

export type DecentralandManaSwapperDeployment = {
  namespace: string
  from: string
  Registry: string
  Deployer: string
  Create3Factory: string
  accounts: {
    owner: string
    relayers: string[]
    managers: string[]
    feeCollector: string
  }
  params: {
    registry: string
    smartVaultParams: {
      impl: string
      admin: string
      feeCollector: string
      strategies: string[]
      priceFeedParams: { base: string; quote: string; feed: string }[]
      priceOracle: string
      swapConnector: string
      swapFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      withdrawFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      performanceFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
    }
    dexSwapperActionParams: {
      impl: string
      admin: string
      managers: string[]
      tokenIn: string
      tokenOut: string
      maxSlippage: BigNumberish
      tokenThresholdActionParams: {
        token: string
        amount: BigNumberish
      }
      relayedActionParams: {
        relayers: string[]
        gasPriceLimit: BigNumberish
        totalCostLimit: BigNumberish
        payingGasToken: string
      }
    }
    otcSwapperActionParams: {
      impl: string
      admin: string
      managers: string[]
      tokenIn: string
      tokenOut: string
      maxSlippage: BigNumberish
      tokenThresholdActionParams: {
        token: string
        amount: BigNumberish
      }
      relayedActionParams: {
        relayers: string[]
        gasPriceLimit: BigNumberish
        totalCostLimit: BigNumberish
        payingGasToken: string
      }
    }
    withdrawerActionParams: {
      impl: string
      admin: string
      managers: string[]
      token: string
      withdrawalActionParams: {
        recipient: string
      }
      tokenThresholdActionParams: {
        token: string
        amount: BigNumberish
      }
      relayedActionParams: {
        relayers: string[]
        gasPriceLimit: BigNumberish
        totalCostLimit: BigNumberish
        payingGasToken: string
      }
    }
  }
}

const Create3Factory = new Task('2022111100-create3-factory-v1')
const Deployer = new Task('2022111101-deployer-v1')
const Registry = new Task('2022111102-registry-v1')

export default {
  namespace: 'mimic-v2.decentraland-mana-swapper',
  from: '0x43eedc7ff3fcae6af5a8f75ff8ed75c2c9e67b68',
  Create3Factory,
  Deployer,
  Registry,
  mainnet,
}
