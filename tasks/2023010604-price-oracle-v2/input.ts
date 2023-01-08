import Task from '../../src/task'
import { MimicDeployment } from '../../src/types'

export type PriceOracleDeployment = MimicDeployment & {
  pivot: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')

export default {
  namespace: 'mimic-v2',
  contractName: 'PriceOracle',
  version: 'v2',
  stateless: true,
  from: '0x55fb751f3022D56888fb3249002C1004579753C7',
  admin: '0x82109Cc00922A515D5FA14eE05a6880c6FAB5E19',
  Registry,
  Create3Factory,

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
