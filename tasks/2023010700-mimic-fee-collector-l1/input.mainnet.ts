import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mainnet'
import * as hop from '../../constants/hop/mainnet'
import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
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
  accounts: {
    bot: BOT,
    owner: OWNER_EOA,
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
        { base: tokens.DAI, quote: tokens.WETH, feed: chainlink.DAI_ETH },
        { base: tokens.USDT, quote: tokens.WETH, feed: chainlink.USDT_ETH },
        { base: tokens.USDC, quote: tokens.WETH, feed: chainlink.USDC_ETH },
      ],
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
      admin: OWNER_EOA,
      managers: [BOT, ...managers],
      tokenIn: tokens.USDC,
      minBalance: fp(0.3), // 0.3 ETH
      maxBalance: fp(2), // 2 ETH
      maxSlippage: fp(0.001), // 0.1 %
      withdrawalActionParams: {
        recipient: BOT,
      },
    },
    holderActionParams: {
      impl: undefined,
      admin: OWNER_EOA,
      managers: [BOT, ...managers],
      tokenOut: tokens.USDC,
      maxSlippage: fp(0.002), // 0.2 %
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(200),
      },
    },
    l1HopBridgerActionParams: {
      impl: undefined,
      admin: OWNER_EOA,
      managers,
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.002), // 0.2 %
      hopRelayerParams: [], // no relayer fees
      allowedChainIds: [137, 100, 10, 42161], // polygon, gnosis, optimism, arbitrum
      hopBridgeParams: [
        { token: tokens.WETH, bridge: hop.ETH_BRIDGE },
        { token: tokens.USDC, bridge: hop.USDC_BRIDGE },
        { token: tokens.USDT, bridge: hop.USDT_BRIDGE },
        { token: tokens.DAI, bridge: hop.DAI_BRIDGE },
      ],
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(50),
      },
    },
  },
}
