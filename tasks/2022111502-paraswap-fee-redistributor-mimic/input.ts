import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_1 } from '../../constants/mimic'
import Task from '../../src/task'
import mainnet from './input.mainnet'

const Create3Factory = new Task('2022111100-create3-factory-v1')
const Deployer = new Task('2022111101-deployer-v1')
const Registry = new Task('2022111102-registry-v1')

export type ParaswapFeeRedistributorDeployment = {
  namespace: string
  from: string
  Create3Factory: string
  Deployer: string
  Registry: string
  accounts: {
    mimic: string
    owner: string
    relayers: string[]
    managers: string[]
    feeCollector: string
    swapSigner: string
  }
  params: {
    mimic: string
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
    withdrawerActionParams: {
      impl: string
      admin: string
      managers: string[]
      withdrawalActionParams: {
        recipient: string
      }
      relayedActionParams: {
        relayers: string[]
        gasPriceLimit: BigNumberish
        totalCostLimit: BigNumberish
        payingGasToken: string
      }
      timeLockedActionParams: {
        period: BigNumberish
      }
    }
    erc20ClaimerActionParams: {
      impl: string
      admin: string
      managers: string[]
      swapSigner: string
      maxSlippage: BigNumberish
      tokenSwapIgnores: string[]
      feeClaimerParams: {
        feeClaimer: string
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
    nativeClaimerActionParams: {
      impl: string
      admin: string
      managers: string[]
      feeClaimerParams: {
        feeClaimer: string
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
    swapFeeSetterActionParams: {
      impl: string
      admin: string
      managers: string[]
      feeParams: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }[]
      relayedActionParams: {
        relayers: string[]
        gasPriceLimit: BigNumberish
        totalCostLimit: BigNumberish
        payingGasToken: string
      }
      timeLockedActionParams: {
        period: BigNumberish
      }
    }
  }
}

export default {
  from: DEPLOYER_1,
  namespace: 'mimic-v2.paraswap-sv1',
  Create3Factory,
  Deployer,
  Registry,
  mainnet,
}
