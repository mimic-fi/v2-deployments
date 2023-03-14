import { MONTH, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/arbitrum'
import Task from '../../src/task'

const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

/* eslint-disable no-secrets/no-secrets */

const owner = '0x7dA82E75BE36Ab9625B1dd40A5aE5181b43473f3' // Paraswap multisig

export default {
  params: {
    owner,
    smartVault: ParaswapFeeRedistributor.key('SmartVault'),
    recipient: owner,
    timeLock: MONTH,
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    relayer: BOT,
    gasPriceLimit: 10e9,
    txCostLimit: 0,
  },
}
