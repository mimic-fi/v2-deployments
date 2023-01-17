import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { ADMIN_EOA, DEPLOYER_1 } from '../../constants/mimic'
import Task from '../../src/task'

export type SwapConnectorDeployment = {
  namespace: string
  from: string
  admin: string
  uniswapV2Router: string
  uniswapV3Router: string
  balancerV2Vault: string
  paraswapV5Augustus: string
  Create3Factory: string
  Registry: string
  SwapConnector: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2022111100-create3-factory-v1')
const Registry = new Task('2022111102-registry-v1')
const SwapConnector = new Task('2022111500-swap-connector-v2')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-swap-connector/artifacts/contracts/SwapConnector.sol/SwapConnector.v3',
  from: DEPLOYER_1,
  admin: ADMIN_EOA,
  Create3Factory,
  Registry,
  SwapConnector,
  mainnet: {
    uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
  },
  goerli: {
    uniswapV2Router: ZERO_ADDRESS,
    uniswapV3Router: ZERO_ADDRESS,
    balancerV2Vault: ZERO_ADDRESS,
    paraswapV5Augustus: ZERO_ADDRESS,
  },
}
