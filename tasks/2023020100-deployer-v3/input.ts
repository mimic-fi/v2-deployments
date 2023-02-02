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
    version: 'v3',
  },
  polygon: {
    version: 'v3',
  },
  optimism: {
    version: 'v3',
  },
  arbitrum: {
    version: 'v3',
  },
  gnosis: {
    version: 'v3',
  },
  avalanche: {
    version: 'v3',
  },
  bsc: {
    version: 'v3',
  },
  fantom: {
    version: 'v3',
  },
  goerli: {
    version: 'v3.1',
  },
  mumbai: {
    version: 'v3.1',
  },
}
