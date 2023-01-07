import Task from '../../src/task'

export type DeployerDeployment = {
  namespace: string
  from: string
  Create3Factory: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2022111100-create3-factory-v1')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-smart-vaults-base/artifacts/contracts/Deployer.sol/Deployer',
  from: '0x43eedc7ff3fcae6af5a8f75ff8ed75c2c9e67b68',
  Create3Factory,
}
