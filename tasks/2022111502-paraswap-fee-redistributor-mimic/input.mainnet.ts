import { bn, fp, HOUR, toUSDC, YEAR, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mainnet'
import { BOT, FEE_COLLECTOR_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const mimic = '0x495dD9E4784C207Ec9f4f426F204C73916d5b7A9' // Mimic EOA
const owner = '0x82109Cc00922A515D5FA14eE05a6880c6FAB5E19' // Paraswap multisig
const managers: string[] = []
const relayers = [BOT]
const feeCollector = FEE_COLLECTOR_EOA

const swapSigner = '0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA' // Paraswap server signer
const feeClaimer = '0xeF13101C5bbD737cFb2bF00Bbd38c626AD6952F7' // Paraswap fee claimer contract

const Registry = new Task('2022111102-registry-v1')
const SmartVault = new Task('2022111103-smart-vault-v1')
const PriceOracle = new Task('2022111104-price-oracle-v1')
const SwapConnector = new Task('2022111501-swap-connector-v3')

export default {
  accounts: {
    owner,
    mimic,
    relayers,
    managers,
    feeCollector,
    swapSigner,
  },
  params: {
    mimic,
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: mimic,
      feeCollector,
      strategies: [],
      priceFeedParams: [{ base: tokens.USDC, quote: tokens.WETH, feed: chainlink.USDC_ETH }],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    withdrawerActionParams: {
      impl: undefined,
      admin: mimic,
      managers,
      withdrawalActionParams: {
        recipient: mimic,
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: tokens.WETH,
      },
      timeLockedActionParams: {
        period: HOUR,
      },
    },
    erc20ClaimerActionParams: {
      impl: undefined,
      admin: mimic,
      managers,
      swapSigner,
      maxSlippage: fp(0.03),
      tokenSwapIgnores: [tokens.PSP],
      feeClaimerParams: {
        feeClaimer,
        tokenThresholdActionParams: {
          token: tokens.USDC,
          amount: toUSDC(100),
        },
        relayedActionParams: {
          relayers,
          gasPriceLimit: bn(50e9),
          totalCostLimit: 0,
          payingGasToken: tokens.WETH,
        },
      },
    },
    nativeClaimerActionParams: {
      impl: undefined,
      admin: mimic,
      managers,
      feeClaimerParams: {
        feeClaimer,
        tokenThresholdActionParams: {
          token: tokens.USDC,
          amount: toUSDC(100),
        },
        relayedActionParams: {
          relayers,
          gasPriceLimit: bn(50e9),
          totalCostLimit: 0,
          payingGasToken: tokens.WETH,
        },
      },
    },
    swapFeeSetterActionParams: {
      impl: undefined,
      admin: mimic,
      managers,
      feeParams: [
        { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
        { pct: fp(0.05), cap: toUSDC(5000), token: tokens.USDC, period: YEAR },
        { pct: fp(0.1), cap: toUSDC(5000), token: tokens.USDC, period: YEAR },
        { pct: fp(0.2), cap: toUSDC(5000), token: tokens.USDC, period: YEAR },
      ],
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: tokens.WETH,
      },
      timeLockedActionParams: {
        period: 2 * HOUR,
      },
    },
  },
}
