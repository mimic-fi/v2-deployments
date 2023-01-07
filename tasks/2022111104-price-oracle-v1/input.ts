import Task from '../../src/task'

export type PriceOracleDeployment = {
  namespace: string
  from: string
  admin: string
  pivot: string
  Create3Factory: string
  Registry: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2022111100-create3-factory-v1')
const Registry = new Task('2022111102-registry-v1')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-price-oracle/artifacts/contracts/oracle/PriceOracle.sol/PriceOracle',
  from: '0x43eedc7ff3fcae6af5a8f75ff8ed75c2c9e67b68',
  admin: '0x82109Cc00922A515D5FA14eE05a6880c6FAB5E19',
  Create3Factory,
  Registry,

  mainnet: {
    pivot: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  },
  goerli: {
    pivot: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', // WETH
  },
  mumbai: {
    pivot: '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa', // WETH
  },
}
