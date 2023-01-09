import { bn, fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0x98339D8C260052B7ad81c28c16C0b98420f2B46a'
const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const CHAINLINK_ORACLE_ETH_USD = '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e'

const HOP_ETH_BRIDGE = '0xC8A4FB931e8D77df8497790381CA7d228E68a41b'
const HOP_USDC_BRIDGE = '0x7D269D3E0d61A05a0bA976b7DBF8805bF844AF3F'

const owner = '0xfA750bC41D438f8426E1951AE3529dd360eAE835' // Personal account
const managers: string[] = []
const relayers = ['0xB3AfB6DB38a8E72905165c1fBB96772e63560790'] // Mimic bot
const feeCollector = '0x27751A0Fe3bd6EBfeB04B359D97B0cf199f20D22'

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  accounts: {
    owner,
    managers,
    relayers,
    feeCollector,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector,
      strategies: [],
      priceFeedParams: [{ base: WETH, quote: USDC, feed: CHAINLINK_ORACLE_ETH_USD }],
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
        { token: USDC, bridge: HOP_USDC_BRIDGE },
        { token: WETH, bridge: HOP_ETH_BRIDGE },
      ],
      tokenThresholdActionParams: {
        amount: toUSDC(0.5),
        token: USDC,
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(100e9),
        totalCostLimit: 0,
        payingGasToken: USDC,
        permissiveModeAdmin: feeCollector,
        setPermissiveMode: false,
      },
    },
  },
}
