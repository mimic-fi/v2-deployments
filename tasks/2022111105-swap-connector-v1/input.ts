import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'

export type SwapConnectorDeployment = {
  namespace: string
  from: string
  admin: string
  uniswapV3Router: string
  uniswapV2Router: string
  balancerV2Vault: string
  paraswapV5Augustus: string
  Create3Factory: string
  Registry: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2022111100-create3-factory-v1')
const Registry = new Task('2022111102-registry-v1')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-swap-connector/artifacts/contracts/SwapConnector.sol/SwapConnector',
  from: '0x43eedc7ff3fcae6af5a8f75ff8ed75c2c9e67b68',
  admin: '0x82109Cc00922A515D5FA14eE05a6880c6FAB5E19',
  Create3Factory,
  Registry,

  mainnet: {
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
  },
  goerli: {
    uniswapV3Router: ZERO_ADDRESS,
    uniswapV2Router: ZERO_ADDRESS,
    balancerV2Vault: ZERO_ADDRESS,
    paraswapV5Augustus: ZERO_ADDRESS,
  },
}
