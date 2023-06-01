import { BigNumberish, Libraries } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { BigNumber, Contract } from 'ethers'
import { CompilerOutputBytecode } from 'hardhat/types'

import Task from './task'

export const NETWORKS = [
  'hardhat',
  'goerli',
  'mumbai',
  'mainnet',
  'polygon',
  'optimism',
  'arbitrum',
  'gnosis',
  'avalanche',
  'bsc',
  'fantom',
]

export type Network = typeof NETWORKS[number]

export type TaskRunOptions = {
  force?: boolean
  from?: SignerWithAddress
}

export type TaskOutput = {
  task: Task
  key: string
}

export type TxParams = {
  from: SignerWithAddress
  libs?: Libraries
  force?: boolean
}

export type NAry<T> = T | Array<T>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Param = boolean | string | number | BigNumber | any

export type Account = string | Contract | SignerWithAddress

export type Input = {
  [key: string]: NAry<Param>
}

export type RawInputByNetwork = {
  [key: string]: RawInputKeyValue
}

export type RawInputKeyValue = {
  [key: string]: NAry<Param> | Output | Task
}

export type Output = {
  [key: string]: string
}

export type RawOutput = {
  [key: string]: string | Contract
}

export type Artifact = {
  abi: unknown[]
  evm: {
    bytecode: CompilerOutputBytecode
    deployedBytecode: CompilerOutputBytecode
    methodIdentifiers: {
      [methodSignature: string]: string
    }
  }
}

export type ActionConfig = {
  baseConfig: {
    owner: string
    smartVault: string
    groupId: BigNumberish
  }
  oracleConfig: {
    signers: string[]
  }
  relayConfig: {
    gasPriceLimit: BigNumberish
    priorityFeeLimit: BigNumberish
    txCostLimit: BigNumberish
    gasToken: string
    permissiveMode: boolean
    relayers: string[]
  }
  timeLockConfig: {
    delay: BigNumberish
    nextExecutionTimestamp: BigNumberish
  }
  tokenIndexConfig: {
    tokens: string[]
    sources: string[]
    acceptanceType: BigNumberish
  }
  tokenThresholdConfig: {
    customThresholds: { token: string; min: BigNumberish; max: BigNumberish }[]
    defaultThreshold: {
      token: string
      min: BigNumberish
      max: BigNumberish
    }
  }
}

export type WithdrawerConfig = {
  recipient: string
  actionConfig: ActionConfig
}

export type ParaswapV5SwapperConfig = {
  quoteSigner: string
  swapperConfig: SwapperConfig
}

export type OneInchV5SwapperConfig = SwapperConfig

export type SwapperConfig = {
  tokenOut: string
  maxSlippage: BigNumberish
  customTokensOut: { token: string; tokenOut: string }[]
  customMaxSlippages: { token: string; maxSlippage: BigNumberish }[]
  actionConfig: ActionConfig
}

export type HopBridgerConfig = {
  relayer: string
  maxFeePct: BigNumberish
  maxSlippage: BigNumberish
  maxDeadline: BigNumberish
  customMaxFeePcts: { token: string; maxFeePct: BigNumberish }[]
  customMaxSlippages: { token: string; maxSlippage: BigNumberish }[]
  tokenHopEntrypoints: { token: string; entrypoint: string }[]
  bridgerConfig: BridgerConfig
}

export type BridgerConfig = {
  destinationChain: BigNumberish
  customDestinationChains: { token: string; destinationChain: BigNumberish }[]
  actionConfig: ActionConfig
}
