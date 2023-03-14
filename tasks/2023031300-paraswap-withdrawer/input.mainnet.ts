import { MONTH, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
import Task from '../../src/task'

const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

/* eslint-disable no-secrets/no-secrets */

const owner = '0x619BBf92Fd6bA59893327676B2685A3762a49a33' // Paraswap multisig

export default {
  params: {
    owner,
    smartVault: ParaswapFeeRedistributor.key('SmartVault'),
    recipient: owner,
    timeLock: MONTH,
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    relayer: BOT,
    gasPriceLimit: 30e9,
    txCostLimit: 0,
  },
}
