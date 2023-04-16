import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import * as tokens from '../../constants/tokens'
import { MimicDeployment } from '../../src/registry'
import Task from '../../src/task'

export type SmartVaultDeployment = MimicDeployment & {
  wrappedNativeToken: string
}

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')

export default {
  namespace: 'mimic-v2',
  version: 'v3',
  stateless: false,
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Registry,
  Create3Factory,

  mainnet: {
    wrappedNativeToken: tokens.mainnet.WETH,
  },
  polygon: {
    wrappedNativeToken: tokens.polygon.WMATIC,
  },
  optimism: {
    wrappedNativeToken: tokens.optimism.WETH,
  },
  arbitrum: {
    wrappedNativeToken: tokens.arbitrum.WETH,
  },
  gnosis: {
    wrappedNativeToken: tokens.gnosis.WXDAI,
  },
  avalanche: {
    wrappedNativeToken: tokens.avalanche.WAVAX,
  },
  bsc: {
    wrappedNativeToken: tokens.bsc.WBNB,
  },
  fantom: {
    wrappedNativeToken: tokens.fantom.WFTM,
  },
  goerli: {
    wrappedNativeToken: tokens.goerli.WETH,
  },
  mumbai: {
    wrappedNativeToken: tokens.mumbai.WMATIC,
  },
}
