import { Libraries } from '@mimic-fi/v2-helpers'
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
