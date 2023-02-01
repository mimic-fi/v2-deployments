import { DAY, fp, MONTH, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { USD } from '../../constants/chainlink/denominations'
import * as chainlink from '../../constants/chainlink/polygon'
import { BOT, TESTING_EOA } from '../../constants/mimic'
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

const owner = '0xE26590aD9fAe88f357350FD8d0b0D184E98c5D33' // Paraswap multisig (testing)
const relayers = [BOT]
const managers: string[] = []
const mimicAdmin = TESTING_EOA
const feeCollector = MimicFeeCollector.key('SmartVault')

const feeClaimer = '0x22e43eCDcddE93Ed88E006F10EbfbeA6010E87dE' // Testing claimer
const swapSigner = '0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA'

export default {
  accounts: {
    owner,
    managers,
    relayers,
    mimicAdmin,
    feeCollector,
  },
  params: {
    mimic: mimicAdmin,
    registry: Registry,
    smartVaultParams: {
      salt: undefined,
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector,
      feeCollectorAdmin: mimicAdmin,
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
          amount: toUSDC(20),
        },
        relayedActionParams: {
          relayers,
          txCostLimit: 0,
          gasPriceLimit: 200e9,
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
          amount: toUSDC(20),
        },
        relayedActionParams: {
          relayers,
          txCostLimit: 0,
          gasPriceLimit: 200e9,
        },
      },
    },
    swapFeeSetterActionParams: {
      impl: undefined,
      admin: owner,
      managers: [mimicAdmin],
      feeParams: [
        { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
        { pct: fp(0.005), cap: toUSDC(35), token: tokens.USDC, period: MONTH }, // 0.5%
        { pct: fp(0.01), cap: toUSDC(60), token: tokens.USDC, period: MONTH }, // 1%
        { pct: fp(0.015), cap: toUSDC(70), token: tokens.USDC, period: MONTH }, // 1.5%
        { pct: fp(0.02), cap: toUSDC(90), token: tokens.USDC, period: MONTH }, // 2%
      ],
      timeLockedActionParams: {
        period: DAY,
      },
    },
  },
}
