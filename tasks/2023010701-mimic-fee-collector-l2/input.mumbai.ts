import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mumbai'
import * as hop from '../../constants/hop/mumbai'
import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mumbai'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const managers = ['0xfA750bC41D438f8426E1951AE3529dd360eAE835'] // Personal account

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  accounts: {
    owner: BOT,
    bot: BOT,
    managers,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: BOT,
      salt: undefined,
      factory: SmartVaultsFactory,
      feeCollector: ZERO_ADDRESS,
      strategies: [],
      priceFeedParams: [{ base: tokens.WMATIC, quote: tokens.USDC, feed: chainlink.MATIC_USD }],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: fp(0), cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    funderActionParams: {
      impl: undefined,
      admin: BOT,
      managers,
      minBalance: fp(0.3),
      maxBalance: fp(2),
      maxSlippage: fp(0.001),
      withdrawalActionParams: {
        recipient: BOT,
      },
    },
    holderActionParams: {
      impl: undefined,
      admin: BOT,
      managers,
      maxSlippage: fp(0.002),
      tokenOut: tokens.USDC,
      tokenThresholdActionParams: {
        amount: toUSDC(5),
        token: tokens.USDC,
      },
    },
    l2HopSwapperActionParams: {
      impl: undefined,
      admin: BOT,
      managers,
      maxSlippage: fp(0.002), // 0.2 %
      hopAmmParams: [
        { token: tokens.USDC, amm: hop.USDC_AMM },
        { token: tokens.WETH, amm: hop.WETH_AMM },
      ],
    },
    l2HopBridgerActionParams: {
      impl: undefined,
      admin: BOT,
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
