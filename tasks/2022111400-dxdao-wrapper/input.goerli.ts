import { bn, fp, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

const owner = '0x519b70055af55A007110B4Ff99b0eA33071c720a' // DXdao
const managers: string[] = []
const relayers = ['0xB3AfB6DB38a8E72905165c1fBB96772e63560790'] // Mimic bot
const feeCollector = '0x27751A0Fe3bd6EBfeB04B359D97B0cf199f20D22' // Mimic EOA

const Registry = new Task('2022111102-registry-v1')
const SmartVault = new Task('2022111103-smart-vault-v1')
const PriceOracle = new Task('2022111104-price-oracle-v1')

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
      priceFeedParams: [],
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
        gasPriceLimit: bn(100e9),
        totalCostLimit: 0,
        payingGasToken: WETH,
      },
      tokenThresholdActionParams: {
        amount: fp(0.5),
        token: WETH,
      },
      withdrawalActionParams: {
        recipient: owner,
      },
    },
  },
}
