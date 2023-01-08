import Task from '../../src/task'
import { DeploymentMetadata } from '../../src/types'

export type DeployerDeployment = DeploymentMetadata

const Create3Factory = new Task('2023010600-create3-factory-v2')

export default {
  namespace: 'mimic-v2',
  contractName: 'Deployer',
  from: '0x55fb751f3022D56888fb3249002C1004579753C7',
  Create3Factory,

  mainnet: {
    version: 'v2',
  },
  goerli: {
    version: 'v4',
  },
  mumbai: {
    version: 'v4',
  },
}
