import { bn, fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mainnet'
import * as hop from '../../constants/hop/mainnet'
import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const MimicFeeCollector = new Task('2023010700-mimic-fee-collector-l1')

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
        { base: tokens.DAI, quote: tokens.WETH, feed: chainlink.DAI_ETH },
        { base: tokens.USDC, quote: tokens.WETH, feed: chainlink.USDC_ETH },
      ],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: fp(0.005), cap: 0, token: ZERO_ADDRESS, period: 0 }, // 0.5%
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    l1HopBridgerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.003), // 0.3 %
      hopRelayerParams: [], // no relayer fees
      destinationChainId: 100, // gnosis
      hopBridgeParams: [
        { token: tokens.WETH, bridge: hop.ETH_BRIDGE },
        { token: tokens.DAI, bridge: hop.DAI_BRIDGE },
        { token: tokens.USDC, bridge: hop.USDC_BRIDGE },
      ],
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(500),
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
        recipient: owner,
      },
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(500),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(100e9),
      },
    },
  },
}
