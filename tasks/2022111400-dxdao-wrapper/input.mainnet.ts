import { bn, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const CHAINLINK_ORACLE_USDC_ETH = '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'

const mimic = '0xB3AfB6DB38a8E72905165c1fBB96772e63560790' // Mimic fee collector
const owner = '0x519b70055af55A007110B4Ff99b0eA33071c720a' // DXdao
const managers = ['0x8E900Cf9BD655e34bb610f0Ef365D8d476fD7337', '0x91628ddc3A6ff9B48A2f34fC315D243eB07a9501'] // DXdao EOAs
const relayers = ['0xB3AfB6DB38a8E72905165c1fBB96772e63560790'] // Mimic bot
const feeCollector = '0x27751A0Fe3bd6EBfeB04B359D97B0cf199f20D22' // Mimic fee collector

const Registry = new Task('2022111102-registry-v1')
const SmartVault = new Task('2022111103-smart-vault-v1')
const PriceOracle = new Task('2022111104-price-oracle-v1')

export default {
  accounts: {
    mimic,
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
      priceFeedParams: [{ base: USDC, quote: WETH, feed: CHAINLINK_ORACLE_USDC_ETH }],
      priceOracle: PriceOracle,
      swapConnector: ZERO_ADDRESS,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    wrapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      relayedActionParams: {
        relayers,
        gasPriceLimit: bn(50e9),
        totalCostLimit: 0,
        payingGasToken: WETH,
      },
      tokenThresholdActionParams: {
        amount: toUSDC(200),
        token: USDC,
      },
      withdrawalActionParams: {
        recipient: owner,
      },
    },
  },
}
