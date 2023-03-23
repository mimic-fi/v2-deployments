import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { USD } from '../../constants/chainlink/denominations'
import * as chainlink from '../../constants/chainlink/optimism'
import * as hop from '../../constants/hop/optimism'
import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/optimism'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const MimicFeeCollector = new Task('2023010701-mimic-fee-collector-l2')

const owner = '0x0000000000000000000000000000000000000001' // TODO: Balancer multisig
const mimic = OWNER_EOA
const managers: string[] = [] // no managers
const relayers = [BOT]
const feeCollector = MimicFeeCollector.key('SmartVault')

const paraswapSigner = '0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA'
const protocolFeeWithdrawer = '0x0000000000000000000000000000000000000002'

export default {
  accounts: {
    owner,
    mimic,
    managers,
    relayers,
    feeCollector,
  },
  params: {
    owners: [owner, mimic],
    registry: Registry,
    smartVaultParams: {
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector,
      feeCollectorAdmin: mimic,
      strategies: [],
      priceFeedParams: [
        { base: tokens.WETH, quote: USD, feed: chainlink.ETH_USD },
        { base: tokens.USDC, quote: USD, feed: chainlink.USDC_USD },
        { base: tokens.DAI, quote: USD, feed: chainlink.DAI_USD },
      ],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: fp(0.001), cap: 0, token: ZERO_ADDRESS, period: 0 }, // 0.1 %
      bridgeFee: { pct: fp(0.002), cap: 0, token: ZERO_ADDRESS, period: 0 }, // 0.2 %
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    claimerActionParams: {
      admin: owner,
      managers,
      oracleSigner: BOT,
      protocolFeeWithdrawer,
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(1),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: 0.5e9,
      },
    },
    oneInchSwapperActionParams: {
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
        amount: toUSDC(5),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: 0.5e9,
      },
    },
    paraswapSwapperActionParams: {
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
        amount: toUSDC(5),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: 0.5e9,
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
        { token: tokens.WETH, amm: hop.ETH_AMM },
        { token: tokens.USDC, amm: hop.USDC_AMM },
        { token: tokens.DAI, amm: hop.DAI_AMM },
      ],
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(5),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: 0.5e9,
      },
    },
  },
}
