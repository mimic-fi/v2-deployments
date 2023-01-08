import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { BigNumber, Contract } from 'ethers'
import { CompilerOutputBytecode } from 'hardhat/types'

import Task from './task'

export const NETWORKS = ['hardhat', 'goerli', 'mumbai', 'mainnet', 'polygon', 'optimism', 'arbitrum', 'gnosis']

export type Network = typeof NETWORKS[number]

export type TaskRunOptions = {
  force?: boolean
  from?: SignerWithAddress
}

export type TaskOutput = {
  task: Task
  key: string
}

export type NAry<T> = T | Array<T>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Param = boolean | string | number | BigNumber | any

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

export type DeploymentMetadata = {
  namespace: string
  contractName: string
  version: string
  from: string
  Create3Factory: string
}

export type MimicDeployment = DeploymentMetadata & {
  admin: string
  stateless: boolean
  Registry: string
}
