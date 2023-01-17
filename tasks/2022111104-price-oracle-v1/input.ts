import { ADMIN_EOA, DEPLOYER_1 } from '../../constants/mimic'
import * as tokens from '../../constants/tokens'
import Task from '../../src/task'

export type PriceOracleDeployment = {
  namespace: string
  from: string
  admin: string
  pivot: string
  Create3Factory: string
  Registry: string
}

const Create3Factory = new Task('2022111100-create3-factory-v1')
const Registry = new Task('2022111102-registry-v1')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-price-oracle/artifacts/contracts/oracle/PriceOracle.sol/PriceOracle',
  from: DEPLOYER_1,
  admin: ADMIN_EOA,
  Create3Factory,
  Registry,

  mainnet: {
    pivot: tokens.mainnet.WETH,
  },
  goerli: {
    pivot: tokens.goerli.WETH,
  },
  mumbai: {
    pivot: tokens.mumbai.WETH,
  },
}
