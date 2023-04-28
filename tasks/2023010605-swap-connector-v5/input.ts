import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import { MimicDeployment } from '../../src/registry'
import Task from '../../src/task'

export type SwapConnectorDeployment = MimicDeployment & {
  uniswapV3Router: string
  uniswapV2Router: string
  balancerV2Vault: string
  paraswapV5Augustus: string
  oneInchV5Router: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')

export default {
  namespace: 'mimic-v2',
  version: 'v5',
  stateless: true,
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Registry,
  Create3Factory,

  mainnet: {
    uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
    oneInchV5Router: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  polygon: {
    uniswapV2Router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // QuickSwap
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
    oneInchV5Router: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  optimism: {
    uniswapV2Router: '0x0000000000000000000000000000000000000000',
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
    oneInchV5Router: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  arbitrum: {
    uniswapV2Router: '0x0000000000000000000000000000000000000000',
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
    oneInchV5Router: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  gnosis: {
    uniswapV2Router: '0x0000000000000000000000000000000000000000',
    uniswapV3Router: '0x0000000000000000000000000000000000000000',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: '0x0000000000000000000000000000000000000000',
    oneInchV5Router: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  avalanche: {
    uniswapV2Router: '0x0000000000000000000000000000000000000000',
    uniswapV3Router: '0x0000000000000000000000000000000000000000',
    balancerV2Vault: '0x0000000000000000000000000000000000000000',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
    oneInchV5Router: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  bsc: {
    uniswapV2Router: '0x0000000000000000000000000000000000000000',
    uniswapV3Router: '0x0000000000000000000000000000000000000000',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
    oneInchV5Router: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  fantom: {
    uniswapV2Router: '0x0000000000000000000000000000000000000000',
    uniswapV3Router: '0x0000000000000000000000000000000000000000',
    balancerV2Vault: '0x0000000000000000000000000000000000000000',
    paraswapV5Augustus: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
    oneInchV5Router: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  goerli: {
    uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    balancerV2Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    paraswapV5Augustus: ZERO_ADDRESS,
    oneInchV5Router: ZERO_ADDRESS,
  },
  mumbai: {
    uniswapV2Router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // QuickSwap
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    balancerV2Vault: ZERO_ADDRESS,
    paraswapV5Augustus: ZERO_ADDRESS,
    oneInchV5Router: ZERO_ADDRESS,
  },
}
