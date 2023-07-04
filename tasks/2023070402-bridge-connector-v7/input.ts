import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import * as tokens from '../../constants/tokens'
import { MimicDeployment } from '../../src/registry'
import Task from '../../src/task'

export type BridgeConnectorDeployment = MimicDeployment & {
  BridgeConnectorV6: string
  wrappedNativeToken: string
  axelarGateway: string
  connext: string
  wormhole: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const BridgeConnectorV6 = new Task('2023070400-bridge-connector-v6')

export default {
  namespace: 'mimic-v2',
  version: 'v7',
  stateless: true,
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Registry,
  Create3Factory,
  BridgeConnectorV6,

  mainnet: {
    wrappedNativeToken: tokens.mainnet.WETH,
    axelarGateway: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
    connext: '0x8898B472C54c31894e3B9bb83cEA802a5d0e63C6',
    wormhole: '0x4cb69FaE7e7Af841e44E1A1c30Af640739378bb2',
  },
  avalanche: {
    wrappedNativeToken: tokens.avalanche.WAVAX,
    axelarGateway: '0x5029C0EFf6C34351a0CEc334542cDb22c7928f78',
    connext: ZERO_ADDRESS,
    wormhole: '0x4cb69FaE7e7Af841e44E1A1c30Af640739378bb2',
  },
}
