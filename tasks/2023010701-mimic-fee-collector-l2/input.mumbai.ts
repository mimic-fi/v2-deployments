import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mumbai'
import * as hop from '../../constants/hop/mumbai'
import { BOT, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mumbai'
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
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  version: 'v3',
  accounts: {
    owner: TESTING_EOA,
    bot: BOT,
    managers,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: TESTING_EOA,
      salt: undefined,
      factory: SmartVaultsFactory,
      feeCollector: ZERO_ADDRESS,
      strategies: [],
      priceFeedParams: [{ base: tokens.WMATIC, quote: tokens.USDC, feed: chainlink.MATIC_USD }],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    funderActionParams: {
      impl: undefined,
      admin: TESTING_EOA,
      managers,
      tokenIn: tokens.USDC,
      minBalance: fp(0.3),
      maxBalance: fp(2),
      maxSlippage: fp(0.001),
      withdrawalActionParams: {
        recipient: BOT,
      },
    },
    holderActionParams: {
      impl: undefined,
      admin: TESTING_EOA,
      managers,
      tokenOut: tokens.USDC,
      maxSlippage: fp(0.002),
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(5),
      },
    },
    l2HopSwapperActionParams: {
      impl: undefined,
      admin: TESTING_EOA,
      managers,
      maxSlippage: fp(0.002), // 0.2 %
      hopAmmParams: [
        { token: tokens.USDC, amm: hop.USDC_AMM },
        { token: tokens.WETH, amm: hop.WETH_AMM },
      ],
    },
    l2HopBridgerActionParams: {
      impl: undefined,
      admin: TESTING_EOA,
      managers,
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.002), // 0.2 %
      maxBonderFeePct: fp(0.03), // 3 %
      allowedChainIds: [5], // goerli
      hopAmmParams: [
        { token: tokens.USDC, amm: hop.USDC_AMM },
        { token: tokens.WETH, amm: hop.WETH_AMM },
      ],
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(5),
      },
    },
  },
}
