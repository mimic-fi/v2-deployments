import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import * as tokens from '../../constants/tokens'
import Task from '../../src/task'
import { MimicDeployment } from '../../src/types'

export type BridgeConnectorDeployment = MimicDeployment & {
  wrappedNativeToken: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')

export default {
  namespace: 'mimic-v2',
  contractName: 'BridgeConnector',
  version: 'v1',
  stateless: true,
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Registry,
  Create3Factory,

  mainnet: {
    wrappedNativeToken: tokens.mainnet.WETH,
  },
  goerli: {
    wrappedNativeToken: tokens.goerli.WETH,
  },
  mumbai: {
    wrappedNativeToken: tokens.mumbai.WMATIC,
  },
}
