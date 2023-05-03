import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')

export default {
  namespace: 'mimic-v2',
  version: 'v5',
  from: DEPLOYER_2,
  Create3Factory,
}

export type DeployerV5Deployment = {
  namespace: string
  version: string
  from: string
  Create3Factory: string
}
