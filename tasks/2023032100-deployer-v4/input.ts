import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import { DeploymentMetadata } from '../../src/types'

export type DeployerDeployment = DeploymentMetadata

const Create3Factory = new Task('2023010600-create3-factory-v2')

export default {
  namespace: 'mimic-v2',
  contractName: 'Deployer',
  version: 'v4',
  from: DEPLOYER_2,
  Create3Factory,
}
