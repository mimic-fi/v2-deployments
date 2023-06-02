import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import * as tokens from '../../constants/tokens'
import { MimicDeployment } from '../../src/registry'
import Task from '../../src/task'

export type BridgeConnectorDeployment = MimicDeployment & {
  BridgeConnectorV2: string
  wrappedNativeToken: string
  axelarGateway: string
  connext: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const BridgeConnectorV2 = new Task('2023051800-bridge-connector-v2')

export default {
  namespace: 'mimic-v2',
  version: 'v3',
  stateless: true,
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Registry,
  Create3Factory,
  BridgeConnectorV2,

  mainnet: {
    wrappedNativeToken: tokens.mainnet.WETH,
    axelarGateway: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
    connext: '0x8898B472C54c31894e3B9bb83cEA802a5d0e63C6',
  },
  polygon: {
    wrappedNativeToken: tokens.polygon.WMATIC,
    axelarGateway: '0x6f015F16De9fC8791b234eF68D486d2bF203FBA8',
    connext: '0x11984dc4465481512eb5b777E44061C158CF2259',
  },
  optimism: {
    wrappedNativeToken: tokens.optimism.WETH,
    axelarGateway: ZERO_ADDRESS,
    connext: '0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA',
  },
  arbitrum: {
    wrappedNativeToken: tokens.arbitrum.WETH,
    axelarGateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    connext: '0xEE9deC2712cCE65174B561151701Bf54b99C24C8',
  },
  gnosis: {
    wrappedNativeToken: tokens.gnosis.WXDAI,
    axelarGateway: ZERO_ADDRESS,
    connext: '0x5bB83e95f63217CDa6aE3D181BA580Ef377D2109',
  },
  bsc: {
    wrappedNativeToken: tokens.bsc.WBNB,
    axelarGateway: '0x304acf330bbE08d1e512eefaa92F6a57871fD895',
    connext: '0xCd401c10afa37d641d2F594852DA94C700e4F2CE',
  },
  avalanche: {
    wrappedNativeToken: tokens.avalanche.WAVAX,
    axelarGateway: '0x5029C0EFf6C34351a0CEc334542cDb22c7928f78',
    connext: ZERO_ADDRESS,
  },
  fantom: {
    wrappedNativeToken: tokens.fantom.WFTM,
    axelarGateway: '0x304acf330bbE08d1e512eefaa92F6a57871fD895',
    connext: ZERO_ADDRESS,
  },
}
