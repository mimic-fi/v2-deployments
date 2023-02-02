import { bn, fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/goerli'
import * as hop from '../../constants/hop/goerli'
import { BOT, FEE_COLLECTOR_EOA, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/goerli'
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
    mimicAdmin: OWNER_EOA,
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
      priceFeedParams: [{ base: tokens.WETH, quote: tokens.USDC, feed: chainlink.ETH_USD }],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: fp(0.002), cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    l1HopBridgerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.002), // 0.2 %
      hopRelayerParams: [], // no relayer fees
      destinationChainId: 80001, // mumbai
      hopBridgeParams: [
        { token: tokens.USDC, bridge: hop.USDC_BRIDGE },
        { token: tokens.WETH, bridge: hop.ETH_BRIDGE },
      ],
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(0.5),
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
