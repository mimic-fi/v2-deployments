import { BigNumberish, fp, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/bsc'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const BridgeConnector = new Task('2023070402-bridge-connector-v7')
const FeeCollector = new Task('2023042702-public-swapper-fee-collector-l2-no-bridge')

/* eslint-disable no-secrets/no-secrets */

export default {
  namespace: 'mimic-v2.public-swapper-fee-collector',
  version: 'v1',
  from: DEPLOYER_2,
  owner: TESTING_EOA,
  relayer: BOT,
  Create3Factory,
  Registry,
  BridgeConnector,
  SmartVault: FeeCollector,
  PermissionsManager: FeeCollector,
  connextBridger: {
    destinationChainId: 1,
    allowedTokens: [tokens.USDC],
    maxRelayerFeePct: fp(0.05), // 5%
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(1000),
    gasPriceLimit: 10e9,
  },
}

export type PublicSwapperFeeCollectorBridgerBnbInstall = {
  namespace: string
  version: string
  from: string
  owner: string
  relayer: string
  Registry: string
  Create3Factory: string
  BridgeConnector: string
  SmartVault: string
  PermissionsManager: string
  connextBridger: {
    maxRelayerFeePct: BigNumberish
    allowedTokens: string[]
    destinationChainId: number
    thresholdToken: string
    thresholdAmount: BigNumberish
    gasPriceLimit: BigNumberish
  }
}
