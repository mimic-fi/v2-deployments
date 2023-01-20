import { fp, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/avalanche'
import { USD } from '../../constants/chainlink/denominations'
import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/avalanche'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const managers = [
  '0xFd4393f728824615ee9132D3A399C67416c0b5e1', // Personal account 1
  '0xa93680F09e9d5cb395aE4cEd72b6a0f66D5F5159', // Personal account 2
  '0xB03B9E9456752EE303c355C64Ed6EDAd20372B4c', // Personal account 3
]

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  version: 'v1',
  accounts: {
    owner: OWNER_EOA,
    bot: BOT,
    managers,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: OWNER_EOA,
      salt: undefined,
      factory: SmartVaultsFactory,
      feeCollector: ZERO_ADDRESS,
      strategies: [],
      priceFeedParams: [
        { base: tokens.WAVAX, quote: USD, feed: chainlink.AVAX_USD },
        { base: tokens.WETH, quote: USD, feed: chainlink.ETH_USD },
        { base: tokens.DAI, quote: USD, feed: chainlink.DAI_USD },
        { base: tokens.USDC, quote: USD, feed: chainlink.USDC_USD },
        { base: tokens.USDT, quote: USD, feed: chainlink.USDT_USD },
      ],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: ZERO_ADDRESS,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    funderActionParams: {
      impl: undefined,
      admin: OWNER_EOA,
      managers,
      tokenIn: tokens.USDC,
      minBalance: fp(0.2), // 0.2 AVAX
      maxBalance: fp(2), // 2 AVAX
      maxSlippage: fp(0.001), // 0.1 %
      withdrawalActionParams: {
        recipient: BOT,
      },
    },
    holderActionParams: {
      impl: undefined,
      admin: OWNER_EOA,
      managers,
      tokenOut: tokens.USDC,
      maxSlippage: fp(0.002), // 0.2 %
      tokenThresholdActionParams: {
        amount: toUSDC(50),
        token: tokens.USDC,
      },
    },
  },
}
