import { bn, fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { USD } from '../../constants/chainlink/denominations'
import * as chainlink from '../../constants/chainlink/gnosis'
import * as hop from '../../constants/hop/gnosis'
import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/gnosis'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const MimicFeeCollector = new Task('2023010701-mimic-fee-collector-l2')

const owner = '0x519b70055af55A007110B4Ff99b0eA33071c720a' // DXdao
const managers: string[] = [] // no managers
const relayers = [BOT]
const mimicAdmin = OWNER_EOA
const feeCollector = MimicFeeCollector.key('SmartVault')

export default {
  version: 'v1',
  accounts: {
    owner,
    managers,
    relayers,
    mimicAdmin,
    feeCollector,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector,
      feeCollectorAdmin: mimicAdmin,
      strategies: [],
      priceFeedParams: [
        { base: tokens.WETH, quote: USD, feed: chainlink.ETH_USD },
        { base: tokens.WXDAI, quote: USD, feed: chainlink.DAI_USD },
        { base: tokens.USDC, quote: USD, feed: chainlink.USDC_USD },
      ],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: fp(0.005), cap: 0, token: ZERO_ADDRESS, period: 0 }, // 0.5 %
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    l2HopSwapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxSlippage: fp(0.002), // 0.2 %
      hopAmmParams: [
        { token: tokens.WXDAI, amm: hop.DAI_AMM },
        { token: tokens.USDC, amm: hop.USDC_AMM },
        { token: tokens.WETH, amm: hop.WETH_AMM },
      ],
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(40e9),
      },
    },
    l2HopBridgerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.003), // 0.3 %
      maxBonderFeePct: fp(0.03), // 3 %
      destinationChainId: 1, // mainnet
      hopAmmParams: [
        { token: tokens.WETH, amm: hop.WETH_AMM },
        { token: tokens.WXDAI, amm: hop.DAI_AMM },
        { token: tokens.USDC, amm: hop.USDC_AMM },
      ],
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(500),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(40e9),
      },
    },
    withdrawerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      withdrawalActionParams: {
        recipient: owner,
      },
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(500),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(40e9),
      },
    },
  },
}
