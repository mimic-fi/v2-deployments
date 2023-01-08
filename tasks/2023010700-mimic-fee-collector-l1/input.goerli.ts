import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const CHAINLINK_ORACLE_ETH_USD = '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e'

const HOP_ETH_BRIDGE = '0xb8901acB165ed027E32754E0FFe830802919727f'
const HOP_USDC_BRIDGE = '0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a'

const bot = '0xB3AfB6DB38a8E72905165c1fBB96772e63560790' // Mimic bot
const owner = '0xB3AfB6DB38a8E72905165c1fBB96772e63560790' // Mimic bot
const managers = ['0xfA750bC41D438f8426E1951AE3529dd360eAE835'] // Personal account

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  accounts: {
    bot,
    owner,
    managers,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: owner,
      salt: undefined,
      factory: SmartVaultsFactory,
      feeCollector: ZERO_ADDRESS,
      strategies: [],
      priceFeedParams: [{ base: WETH, quote: USDC, feed: CHAINLINK_ORACLE_ETH_USD }],
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
      admin: owner,
      managers,
      minBalance: fp(0.3),
      maxBalance: fp(2),
      maxSlippage: fp(0.001),
      withdrawalActionParams: {
        recipient: bot,
      },
    },
    holderActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxSlippage: fp(0.002),
      tokenOut: USDC,
      tokenThresholdActionParams: {
        amount: toUSDC(5),
        token: USDC,
      },
    },
    l1HopBridgerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.002), // 0.2 %
      hopRelayerParams: [], // no relayer fees
      allowedChainIds: [80001], // mumbai
      hopBridgeParams: [
        { token: USDC, bridge: HOP_USDC_BRIDGE },
        { token: WETH, bridge: HOP_ETH_BRIDGE },
      ],
      tokenThresholdActionParams: {
        token: USDC,
        amount: toUSDC(5),
      },
    },
  },
}
