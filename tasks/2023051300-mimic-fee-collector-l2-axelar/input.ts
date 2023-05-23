import { toUSDC } from '@mimic-fi/v2-helpers'
import { BigNumber } from 'ethers'

import { DEPLOYER_2, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/avalanche'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const MimicFeeCollector = new Task('2023010702-mimic-fee-collector-l2-no-bridge')
const PermissionsManager = new Task('2023033102-mimic-fee-collector-funder-v2-l2-no-bridge')

/* eslint-disable no-secrets/no-secrets */

const managers = [
  '0xFd4393f728824615ee9132D3A399C67416c0b5e1', // Personal account 1
  '0xa93680F09e9d5cb395aE4cEd72b6a0f66D5F5159', // Personal account 2
  '0xB03B9E9456752EE303c355C64Ed6EDAd20372B4c', // Personal account 3
]

export default {
  namespace: 'mimic-v2.mimic-fee-collector',
  version: 'v1',
  from: DEPLOYER_2,
  owner: OWNER_EOA,
  managers,
  Create3Factory,
  Registry,
  SmartVault: MimicFeeCollector,
  PermissionsManager: PermissionsManager,
  axelarBridgerConfig: {
    smartVault: MimicFeeCollector.key('SmartVault'),
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(10),
    allowedTokens: [tokens.USDC],
    allowedChainIds: [1],
  },
}

export type MimicFeeCollectorAxelarBridgerDeployment = {
  namespace: string
  version: string
  from: string
  owner: string
  managers: string[]
  Create3Factory: string
  Registry: string
  SmartVault: string
  PermissionsManager: string
  axelarBridgerConfig: {
    smartVault: string
    thresholdToken: string
    thresholdAmount: BigNumber
    allowedTokens: string[]
    allowedChainIds: number[]
  }
}
