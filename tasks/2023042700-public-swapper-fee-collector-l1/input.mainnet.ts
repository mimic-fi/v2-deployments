import { bn, fp, MONTH, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mainnet'
import { BOT, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

const owner = TESTING_EOA // TODO: Update to multisig for clients' SV owners
const managers: string[] = [] // no managers
const relayers = [BOT]
const recipient = TESTING_EOA // TODO: Update to cashback multisig
const feeCollector = TESTING_EOA // TODO: Update to treasury multisig

const paraswapSigner = '0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA'

export default {
  accounts: {
    owner,
    managers,
    relayers,
    feeCollector,
  },
  params: {
    owners: [owner],
    registry: Registry,
    smartVaultParams: {
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector,
      feeCollectorAdmin: owner,
      strategies: [],
      priceFeedParams: [{ base: tokens.USDC, quote: tokens.WETH, feed: chainlink.USDC_ETH }],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: fp(0.001), cap: 0, token: ZERO_ADDRESS, period: 0 }, // 0.1%
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    paraswapSwapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      tokenOut: tokens.USDC,
      swapSigner: paraswapSigner,
      deniedTokens: [], // none
      defaultMaxSlippage: fp(0.002), // 0.2 %
      customSlippageTokens: [], // none
      customSlippageValues: [], // none
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(5000),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(100e9),
      },
    },
    withdrawerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      withdrawalActionParams: {
        recipient: recipient,
      },
      timeLockedActionParams: {
        period: MONTH,
      },
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(1000),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(100e9),
      },
    },
  },
}
