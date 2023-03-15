import { MONTH, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/optimism'
import Task from '../../src/task'

const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

/* eslint-disable no-secrets/no-secrets */

const owner = '0xf93A7F819F83DBfDbC307d4D4f0FE5a208C50318' // Paraswap multisig

export default {
  params: {
    owner,
    smartVault: ParaswapFeeRedistributor.key('SmartVault'),
    recipient: owner,
    timeLock: MONTH,
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    relayer: BOT,
    gasPriceLimit: 0.5e9,
    txCostLimit: 0,
  },
}
