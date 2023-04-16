import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')

export default {
  namespace: 'mimic-v2',
  from: DEPLOYER_2,
  Create3Factory,
  version: 'v3',

  goerli: {
    version: 'v3.1',
  },
  mumbai: {
    version: 'v3.1',
  },
}

export type DeployerV3Deployment = {
  namespace: string
  version: string
  from: string
  Create3Factory: string
}
