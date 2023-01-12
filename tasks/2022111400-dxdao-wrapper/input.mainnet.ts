import { bn, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as chainlink from '../../constants/chainlink/mainnet'
import { BOT, FEE_COLLECTOR_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const owner = '0x519b70055af55A007110B4Ff99b0eA33071c720a' // DXdao
const managers = ['0x8E900Cf9BD655e34bb610f0Ef365D8d476fD7337', '0x91628ddc3A6ff9B48A2f34fC315D243eB07a9501'] // DXdao EOAs
const relayers = [BOT]

const Registry = new Task('2022111102-registry-v1')
const SmartVault = new Task('2022111103-smart-vault-v1')
const PriceOracle = new Task('2022111104-price-oracle-v1')

export default {
  accounts: {
    owner,
    relayers,
    managers,
    feeCollector: FEE_COLLECTOR_EOA,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: owner,
      feeCollector: FEE_COLLECTOR_EOA,
      strategies: [],
      priceFeedParams: [{ base: tokens.USDC, quote: tokens.WETH, feed: chainlink.USDC_ETH }],
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
        payingGasToken: tokens.WETH,
      },
      tokenThresholdActionParams: {
        amount: toUSDC(200),
        token: tokens.USDC,
      },
      withdrawalActionParams: {
        recipient: owner,
      },
    },
  },
}
