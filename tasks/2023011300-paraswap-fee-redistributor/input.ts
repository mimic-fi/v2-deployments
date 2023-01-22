import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import arbitrum from './input.arbitrum'
import avalanche from './input.avalanche'
import bsc from './input.bsc'
import fantom from './input.fantom'
import mainnet from './input.mainnet'
import optimism from './input.optimism'
import polygon from './input.polygon'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023010601-deployer-v2')
const Registry = new Task('2023010602-registry-v2')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  namespace: 'mimic-v2.paraswap-fee-redistributor',
  version: 'v1-beta',
  from: DEPLOYER_2,
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
  arbitrum,
  avalanche,
  bsc,
  fantom,
  mainnet,
  optimism,
  polygon,
}

export type ParaswapFeeRedistributorDeployment = {
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
      salt: string
      factory: string
      impl: string
      admin: string
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
    erc20ClaimerActionParams: {
      impl: string
      admin: string
      managers: string[]
      maxSlippage: BigNumberish
      swapSigner: string
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
          permissiveModeAdmin: string
          isPermissiveModeActive: boolean
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
          permissiveModeAdmin: string
          isPermissiveModeActive: boolean
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
        permissiveModeAdmin: string
        isPermissiveModeActive: boolean
      }
      timeLockedActionParams: {
        period: BigNumberish
      }
    }
  }
}
