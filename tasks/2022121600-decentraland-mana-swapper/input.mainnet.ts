import { bn, fp, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const MANA = '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const CHAINLINK_ORACLE_DAI_ETH = '0x773616E4d11A78F511299002da57A0a94577F1f4'
const CHAINLINK_ORACLE_MANA_ETH = '0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9'

const owner = '0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1' // DCL multisig
const managers: string[] = [] // Managers
const relayers = ['0xB3AfB6DB38a8E72905165c1fBB96772e63560790'] // Mimic bot
const feeCollector = '0x27751A0Fe3bd6EBfeB04B359D97B0cf199f20D22' // Mimic fee collector

const Registry = new Task('2022111102-registry-v1')
const SmartVault = new Task('2022112301-smart-vault-v2')
const PriceOracle = new Task('2022111104-price-oracle-v1')
const SwapConnector = new Task('2022112300-swap-connector-v4')

export default {
  accounts: {
    owner,
    relayers,
    managers,
    feeCollector,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: owner,
      feeCollector,
      strategies: [],
      priceFeedParams: [
        { base: DAI, quote: WETH, feed: CHAINLINK_ORACLE_DAI_ETH },
        { base: MANA, quote: WETH, feed: CHAINLINK_ORACLE_MANA_ETH },
      ],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      swapFee: { pct: fp(0.01), cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    dexSwapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      tokenIn: MANA,
      tokenOut: DAI,
      maxSlippage: fp(0.005), // 0.5 %
      tokenThresholdActionParams: {
        token: MANA,
        amount: fp(100),
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: DAI,
      },
    },
    otcSwapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      tokenIn: DAI,
      tokenOut: MANA,
      maxSlippage: fp(0.005), // 0.5 %
      tokenThresholdActionParams: {
        token: MANA,
        amount: fp(100),
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: DAI,
      },
    },
    withdrawerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      token: DAI,
      withdrawalActionParams: {
        recipient: owner,
      },
      tokenThresholdActionParams: {
        token: DAI,
        amount: fp(50),
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: DAI,
      },
    },
  },
}
