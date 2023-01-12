import { DEPLOYER_1 } from '../../constants/mimic'
import Task from '../../src/task'

export type DeployerDeployment = {
  namespace: string
  from: string
  Create3Factory: string
}

const Create3Factory = new Task('2022111100-create3-factory-v1')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-smart-vaults-base/artifacts/contracts/Deployer.sol/Deployer',
  from: DEPLOYER_1,
  Create3Factory,
}
