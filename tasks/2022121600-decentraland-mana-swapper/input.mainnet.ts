import { bn, fp, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mainnet'
import { BOT, FEE_COLLECTOR_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const owner = '0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1' // DCL multisig
const managers: string[] = [] // Managers
const relayers = [BOT]

const Registry = new Task('2022111102-registry-v1')
const SmartVault = new Task('2022112301-smart-vault-v2')
const PriceOracle = new Task('2022111104-price-oracle-v1')
const SwapConnector = new Task('2022112300-swap-connector-v4')

export default {
  accounts: {
    owner,
    relayers,
    managers,
    feeCollector: FEE_COLLECTOR_EOA,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: owner,
      feeCollector: FEE_COLLECTOR_EOA,
      strategies: [],
      priceFeedParams: [
        { base: tokens.DAI, quote: tokens.WETH, feed: chainlink.DAI_ETH },
        { base: tokens.MANA, quote: tokens.WETH, feed: chainlink.MANA_ETH },
      ],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      swapFee: { pct: fp(0.01), cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    dexSwapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      tokenIn: tokens.MANA,
      tokenOut: tokens.DAI,
      maxSlippage: fp(0.005), // 0.5 %
      tokenThresholdActionParams: {
        token: tokens.MANA,
        amount: fp(100),
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: tokens.DAI,
      },
    },
    otcSwapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      tokenIn: tokens.DAI,
      tokenOut: tokens.MANA,
      maxSlippage: fp(0.005), // 0.5 %
      tokenThresholdActionParams: {
        token: tokens.MANA,
        amount: fp(100),
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: tokens.DAI,
      },
    },
    withdrawerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      token: tokens.DAI,
      withdrawalActionParams: {
        recipient: owner,
      },
      tokenThresholdActionParams: {
        token: tokens.DAI,
        amount: fp(50),
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: tokens.DAI,
      },
    },
  },
}
