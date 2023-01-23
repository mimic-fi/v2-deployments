import { fp, MONTH, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { USD } from '../../constants/chainlink/denominations'
import * as chainlink from '../../constants/chainlink/polygon'
import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/polygon'
import Task from '../../src/task'

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const MimicFeeCollector = new Task('2023010701-mimic-fee-collector-l2')

/* eslint-disable no-secrets/no-secrets */

const owner = '0xabf832105d7d19e5dec28d014d5a12579dfa1097' // Paraswap multisig
const feeClaimer = '0x8b5cF413214CA9348F047D1aF402Db1b4E96c060'
const swapSigner = '0x213ec49E59E6D219Db083C2833746b5dFCad646c'
const managers: string[] = []
const relayers = [BOT]

export default {
  accounts: {
    owner,
    managers,
    relayers,
    mimicAdmin: OWNER_EOA,
    feeCollector: MimicFeeCollector.key('SmartVault'),
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      salt: undefined,
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector: MimicFeeCollector.key('SmartVault'),
      strategies: [],
      priceFeedParams: [
        { base: tokens.USDC, quote: USD, feed: chainlink.USDC_USD },
        { base: tokens.WMATIC, quote: USD, feed: chainlink.MATIC_USD },
      ],
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
      maxSlippage: fp(0.03), // 3%
      swapSigner,
      tokenSwapIgnores: [tokens.PSP],
      feeClaimerParams: {
        feeClaimer,
        tokenThresholdActionParams: {
          token: tokens.USDC,
          amount: toUSDC(200),
        },
        relayedActionParams: {
          relayers,
          gasPriceLimit: 200e9,
          totalCostLimit: 0,
          payingGasToken: tokens.WMATIC,
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
          token: tokens.USDC,
          amount: toUSDC(200),
        },
        relayedActionParams: {
          relayers,
          gasPriceLimit: 200e9,
          totalCostLimit: 0,
          payingGasToken: tokens.WMATIC,
          permissiveModeAdmin: OWNER_EOA,
          isPermissiveModeActive: false,
        },
      },
    },
    swapFeeSetterActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      feeParams: [
        { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
        { pct: fp(0.005), cap: toUSDC(5000), token: tokens.USDC, period: MONTH }, // 0.5%
        { pct: fp(0.01), cap: toUSDC(5000), token: tokens.USDC, period: MONTH }, // 1%
        { pct: fp(0.015), cap: toUSDC(5000), token: tokens.USDC, period: MONTH }, // 1.5%
        { pct: fp(0.02), cap: toUSDC(5000), token: tokens.USDC, period: MONTH }, // 2%
      ],
      timeLockedActionParams: {
        period: 3 * MONTH,
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: 200e9,
        totalCostLimit: 0,
        payingGasToken: tokens.WMATIC,
        permissiveModeAdmin: OWNER_EOA,
        isPermissiveModeActive: true,
      },
    },
  },
}
