import { bn, fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mumbai'
import * as hop from '../../constants/hop/mumbai'
import { BOT, FEE_COLLECTOR_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mumbai'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const owner = '0xfA750bC41D438f8426E1951AE3529dd360eAE835' // Personal account
const managers: string[] = []
const relayers = [BOT]

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  version: 'v2',
  accounts: {
    owner,
    managers,
    relayers,
    feeCollector: FEE_COLLECTOR_EOA,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector: FEE_COLLECTOR_EOA,
      strategies: [],
      priceFeedParams: [{ base: tokens.WMATIC, quote: tokens.USDC, feed: chainlink.MATIC_USD }],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: fp(0.002), cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    l2HopSwapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxSlippage: fp(0.002), // 0.2 %
      hopAmmParams: [
        { token: tokens.USDC, amm: hop.USDC_AMM },
        { token: tokens.WETH, amm: hop.WETH_AMM },
      ],
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(100e9),
        totalCostLimit: 0,
        payingGasToken: tokens.USDC,
        permissiveModeAdmin: FEE_COLLECTOR_EOA,
        setPermissiveMode: false,
      },
    },
    l2HopBridgerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.002), // 0.2 %
      maxBonderFeePct: fp(0.03), // 3 %
      destinationChainId: 5, // ethereum goerli
      hopAmmParams: [
        { token: tokens.USDC, amm: hop.USDC_AMM },
        { token: tokens.WETH, amm: hop.WETH_AMM },
      ],
      tokenThresholdActionParams: {
        amount: toUSDC(0.5),
        token: tokens.USDC,
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(100e9),
        totalCostLimit: 0,
        payingGasToken: tokens.USDC,
        permissiveModeAdmin: FEE_COLLECTOR_EOA,
        setPermissiveMode: false,
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
        amount: toUSDC(10),
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(100e9),
        totalCostLimit: 0,
        payingGasToken: tokens.USDC,
        permissiveModeAdmin: FEE_COLLECTOR_EOA,
        setPermissiveMode: false,
      },
    },
  },
}
