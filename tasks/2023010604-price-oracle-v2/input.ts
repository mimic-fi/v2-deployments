import { USD } from '../../constants/chainlink/denominations'
import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import * as tokens from '../../constants/tokens'
import { MimicDeployment } from '../../src/registry'
import Task from '../../src/task'

export type PriceOracleDeployment = MimicDeployment & {
  pivot: string
}

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')

export default {
  namespace: 'mimic-v2',
  version: 'v2',
  stateless: true,
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Registry,
  Create3Factory,

  mainnet: {
    pivot: tokens.mainnet.WETH,
  },
  polygon: {
    pivot: USD,
  },
  optimism: {
    pivot: USD,
  },
  arbitrum: {
    pivot: USD,
  },
  gnosis: {
    pivot: USD,
  },
  avalanche: {
    pivot: USD,
  },
  bsc: {
    pivot: USD,
  },
  fantom: {
    pivot: USD,
  },
  goerli: {
    pivot: tokens.goerli.WETH,
  },
  mumbai: {
    pivot: tokens.mumbai.WETH,
  },
}
