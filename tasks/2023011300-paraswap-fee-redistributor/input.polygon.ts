import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/arbitrum'
import Task from '../../src/task'

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const MimicFeeCollector = new Task('2023010700-mimic-fee-collector-l1')

/* eslint-disable no-secrets/no-secrets */

const owner = '0xE26590aD9fAe88f357350FD8d0b0D184E98c5D33' // Testing
const feeClaimer = '0x22e43ecdcdde93ed88e006f10ebfbea6010e87de' // Testing
// const owner = '0xabf832105d7d19e5dec28d014d5a12579dfa1097' // Paraswap multisig
// const feeClaimer = '0x8b5cF413214CA9348F047D1aF402Db1b4E96c060'
const swapSigner = ''
const managers: string[] = []
const relayers = [BOT]

export default {
  accounts: {
    owner,
    managers,
    relayers,
    feeClaimer,
    swapSigner,
    mimicAdmin: OWNER_EOA,
    feeCollector: MimicFeeCollector,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      salt: undefined,
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector: MimicFeeCollector,
      strategies: [],
      priceFeedParams: [], // TODO
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    erc20ClaimerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxSlippage: 0, // TODO
      swapSigner: owner,
      tokenSwapIgnores: [], // TODO
      feeClaimerParams: {
        feeClaimer,
        tokenThresholdActionParams: {
          token: '', // TODO
          amount: 0, // TODO
        },
        relayedActionParams: {
          relayers,
          gasPriceLimit: 100e9,
          totalCostLimit: 0,
          payingGasToken: tokens.WETH,
          permissiveModeAdmin: OWNER_EOA,
          isPermissiveModeActive: false,
        },
      },
    },
    nativeClaimerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      feeClaimerParams: {
        feeClaimer,
        tokenThresholdActionParams: {
          token: '', // TODO
          amount: 0, // TODO
        },
        relayedActionParams: {
          relayers,
          gasPriceLimit: 100e9,
          totalCostLimit: 0,
          payingGasToken: tokens.WETH,
          permissiveModeAdmin: OWNER_EOA,
          isPermissiveModeActive: false,
        },
      },
    },
    swapFeeSetterActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      feeParams: [], // TODO
      timeLockedActionParams: {
        period: 0, // TODO
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: 100e9,
        totalCostLimit: 0,
        payingGasToken: tokens.WETH,
        permissiveModeAdmin: OWNER_EOA,
        isPermissiveModeActive: false,
      },
    },
  },
}
