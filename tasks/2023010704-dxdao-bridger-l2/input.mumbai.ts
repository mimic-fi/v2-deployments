import { bn, fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0x6D4dd09982853F08d9966aC3cA4Eb5885F16f2b2'
const WETH = '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
const WMATIC = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'
const FEED_MOCK_ORACLE_MATIC_USD = '0x1ECC4534D0296F7C35971534B3Ea2b6D5DDc2E26' // custom price feed mock

const HOP_USDC_AMM = '0xa81D244A1814468C734E5b4101F7b9c0c577a8fC'
const HOP_WETH_AMM = '0x0e0E3d2C5c292161999474247956EF542caBF8dd'

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
      priceFeedParams: [{ base: WMATIC, quote: USDC, feed: FEED_MOCK_ORACLE_MATIC_USD }],
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
        { token: USDC, amm: HOP_USDC_AMM },
        { token: WETH, amm: HOP_WETH_AMM },
      ],
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(100e9),
        totalCostLimit: 0,
        payingGasToken: USDC,
        permissiveModeAdmin: feeCollector,
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
        { token: USDC, amm: HOP_USDC_AMM },
        { token: WETH, amm: HOP_WETH_AMM },
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
