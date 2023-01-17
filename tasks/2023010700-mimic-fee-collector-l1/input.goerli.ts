import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/goerli'
import * as hop from '../../constants/hop/goerli'
import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/goerli'
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
    bot: BOT,
    owner: BOT,
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
      priceFeedParams: [{ base: tokens.WETH, quote: tokens.USDC, feed: chainlink.ETH_USD }],
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
    l1HopBridgerActionParams: {
      impl: undefined,
      admin: BOT,
      managers,
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.002), // 0.2 %
      hopRelayerParams: [], // no relayer fees
      allowedChainIds: [80001], // mumbai
      hopBridgeParams: [
        { token: tokens.USDC, bridge: hop.USDC_BRIDGE },
        { token: tokens.WETH, bridge: hop.ETH_BRIDGE },
      ],
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(5),
      },
    },
  },
}
