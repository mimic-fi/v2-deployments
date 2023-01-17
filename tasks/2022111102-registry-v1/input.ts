import { ADMIN_EOA, DEPLOYER_1 } from '../../constants/mimic'
import Task from '../../src/task'

export type RegistryDeployment = {
  namespace: string
  from: string
  admin: string
  Create3Factory: string
}

const Create3Factory = new Task('2022111100-create3-factory-v1')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-registry/artifacts/contracts/registry/Registry.sol/Registry',
  from: DEPLOYER_1,
  admin: ADMIN_EOA,
  Create3Factory,
}
