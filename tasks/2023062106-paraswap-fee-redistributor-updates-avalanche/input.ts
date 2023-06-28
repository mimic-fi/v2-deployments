import { BigNumberish, fp, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/avalanche'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')
const ParaswapFeeRedistributorWithdrawer = new Task('2023031300-paraswap-withdrawer')

/* eslint-disable no-secrets/no-secrets */

export default {
  namespace: 'mimic-v2.paraswap-fee-redistributor',
  version: 'v1',
  from: DEPLOYER_2,
  owner: '0xAFFdeC0FE0B5BBfd725642D87D14c465d25F8dE8',
  mimic: TESTING_EOA,
  relayer: BOT,
  Create3Factory,
  Registry,
  SmartVault: ParaswapFeeRedistributor,
  NativeClaimer: ParaswapFeeRedistributor,
  ERC20Claimer: ParaswapFeeRedistributor,
  SwapFeeSetter: ParaswapFeeRedistributor,
  Withdrawer: ParaswapFeeRedistributorWithdrawer,
  erc20Claimer: {
    tokenOut: tokens.USDC,
  },
  wormholeBridger: {
    destinationChainId: 1,
    allowedTokens: [tokens.USDC],
    maxRelayerFeePct: fp(0.07), // 7%
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    gasPriceLimit: 50e9,
  },
}

export type ParaswapFeeRedistributorUpdatesAvalanche = {
  namespace: string
  version: string
  from: string
  owner: string
  mimic: string
  relayer: string
  Registry: string
  Create3Factory: string
  SmartVault: string
  NativeClaimer: string
  ERC20Claimer: string
  SwapFeeSetter: string
  Withdrawer: string
  erc20Claimer: {
    tokenOut: string
  }
  wormholeBridger: {
    destinationChainId: number
    allowedTokens: string[]
    maxRelayerFeePct: BigNumberish
    thresholdToken: string
    thresholdAmount: BigNumberish
    gasPriceLimit: BigNumberish
  }
}
