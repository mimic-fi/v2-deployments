import { fp, MONTH, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/bsc'
import { USD } from '../../constants/chainlink/denominations'
import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/bsc'
import Task from '../../src/task'

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const MimicFeeCollector = new Task('2023010702-mimic-fee-collector-l2-no-bridge')

/* eslint-disable no-secrets/no-secrets */

const owner = '0x8c1a1d0b6286f35d47a676ab78482f1cf3d749dc' // Paraswap multisig
const feeClaimer = '0x2DF17455B96Dde3618FD6B1C3a9AA06D6aB89347'
const swapSigner = '0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA'
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
    mimic: OWNER_EOA,
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
        { base: tokens.WBNB, quote: USD, feed: chainlink.BNB_USD },
      ],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: ZERO_ADDRESS,
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
          gasPriceLimit: 10e9,
          totalCostLimit: 0,
          payingGasToken: tokens.WBNB,
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
          gasPriceLimit: 10e9,
          totalCostLimit: 0,
          payingGasToken: tokens.WBNB,
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
        gasPriceLimit: 10e9,
        totalCostLimit: 0,
        payingGasToken: tokens.WBNB,
        permissiveModeAdmin: OWNER_EOA,
        isPermissiveModeActive: true,
      },
    },
  },
}
