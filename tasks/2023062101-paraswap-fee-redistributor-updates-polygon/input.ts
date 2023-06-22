import { BigNumberish, fp, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/polygon'
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
  owner: '0xabf832105d7d19e5dec28d014d5a12579dfa1097',
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
    tokenOut: tokens.WETH,
  },
  metamaskClaimer: {
    safe: '0x0C84cd406B8a4E07dF9a1B15ef348023a1DCD075',
    distributor: '0x146912B44EC7eC2E48A6dAc9b7a32f99fb22Cae1',
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    gasToken: tokens.WETH,
    gasPriceLimit: 200e9,
  },
  connextBridger: {
    destinationChainId: 1,
    allowedTokens: [tokens.WETH],
    maxRelayerFeePct: fp(0.05), // 5%
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    gasPriceLimit: 200e9,
  },
}

export type ParaswapFeeRedistributorUpdatesPolygon = {
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
  metamaskClaimer: {
    safe: string
    distributor: string
    thresholdToken: string
    thresholdAmount: BigNumberish
    gasToken: string
    gasPriceLimit: BigNumberish
  }
  connextBridger: {
    maxRelayerFeePct: BigNumberish
    allowedTokens: string[]
    destinationChainId: number
    thresholdToken: string
    thresholdAmount: BigNumberish
    gasPriceLimit: BigNumberish
  }
}
