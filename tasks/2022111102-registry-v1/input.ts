import Task from '../../src/task'

export type RegistryDeployment = {
  namespace: string
  from: string
  admin: string
  Create3Factory: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2022111100-create3-factory-v1')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-registry/artifacts/contracts/registry/Registry.sol/Registry',
  from: '0x43eedc7ff3fcae6af5a8f75ff8ed75c2c9e67b68',
  admin: '0x82109Cc00922A515D5FA14eE05a6880c6FAB5E19',
  Create3Factory,
}
