import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import { DeploymentMetadata } from '../../src/types'

export type DeployerDeployment = DeploymentMetadata

const Create3Factory = new Task('2023010600-create3-factory-v2')

export default {
  namespace: 'mimic-v2',
  contractName: 'Deployer',
  from: DEPLOYER_2,
  Create3Factory,

  mainnet: {
    version: 'v2',
  },
  polygon: {
    version: 'v2',
  },
  optimism: {
    version: 'v2',
  },
  arbitrum: {
    version: 'v2',
  },
  gnosis: {
    version: 'v2',
  },
  avalanche: {
    version: 'v2',
  },
  bsc: {
    version: 'v2',
  },
  fantom: {
    version: 'v2',
  },
  goerli: {
    version: 'v4',
  },
  mumbai: {
    version: 'v4',
  },
}
