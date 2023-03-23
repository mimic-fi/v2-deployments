import { bn, fp, MONTH, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mainnet'
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

const owner = '0x0000000000000000000000000000000000000001' // TODO: Balancer multisig
const mimic = OWNER_EOA
const managers: string[] = [] // no managers
const relayers = [BOT]
const feeCollector = MimicFeeCollector.key('SmartVault')

const paraswapSigner = '0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA'
const protocolFeeWithdrawer = '0x0000000000000000000000000000000000000001'

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
        gasPriceLimit: bn(50e9),
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
        amount: toUSDC(10),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(50e9),
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
        amount: toUSDC(10),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(50e9),
      },
    },
    withdrawerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      withdrawalActionParams: {
        recipient: owner,
      },
      timeLockedActionParams: {
        period: MONTH,
      },
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(10),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: bn(50e9),
      },
    },
  },
}
