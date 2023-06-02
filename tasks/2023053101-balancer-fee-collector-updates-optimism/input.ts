import { DAY, fp, NATIVE_TOKEN_ADDRESS, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/optimism'
import Task from '../../src/task'
import { ActionConfig, OneInchV5SwapperConfig, ParaswapV5SwapperConfig, WithdrawerConfig } from '../../src/types'

const Registry = new Task('2023010602-registry-v2')
const Create3Factory = new Task('2023010600-create3-factory-v2')
const SmartVault = new Task('2023032102-balancer-fee-collector-l2')
const PermissionsManager = new Task('2023032102-balancer-fee-collector-l2')

/* eslint-disable no-secrets/no-secrets */

const OWNER = '0x09Df1626110803C7b3b07085Ef1E053494155089'
const RECIPIENT = '0x2a185C8A3C63d7bFe63aD5d950244FFe9d0a4b60'
const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
const PROTOCOL_FEE_WITHDRAWER = '0xc128a9954e6c874ea3d62ce62b468ba073093f25'
const PARASWAP_QUOTE_SIGNER = '0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA'

const defaultBaseConfig = {
  owner: PermissionsManager.key('PermissionsManager'),
  smartVault: SmartVault.key('SmartVault'),
  groupId: 0,
}

const defaultOracleConfig = {
  signers: [BOT],
}

const defaultRelayConfig = {
  gasPriceLimit: 0.5e9,
  priorityFeeLimit: 0,
  txCostLimit: 0,
  gasToken: tokens.USDC,
  permissiveMode: true,
  relayers: [BOT],
}

const defaultTimeLockConfig = {
  delay: 0,
  nextExecutionTimestamp: 0,
}

const defaultTokenIndexConfig = {
  tokens: [], // no tokens denied
  sources: [], // smart vault
  acceptanceType: 0, // deny list
}

const defaultTokenThresholdConfig = {
  customThresholds: [],
  defaultThreshold: {
    token: tokens.USDC,
    min: toUSDC(100),
    max: 0,
  },
}

export default {
  from: DEPLOYER_2,
  owner: OWNER,
  mimic: TESTING_EOA,
  Registry,
  Create3Factory,
  SmartVault,
  PermissionsManager,
  Claimer: new Task('2023042601-balancer-fee-collector-l2-updates'),
  BPTSwapper: new Task('2023051200-balancer-fee-collector-bpt-swapper-update'),
  OneInchSwapper: new Task('2023032102-balancer-fee-collector-l2'),
  ParaswapSwapper: new Task('2023032102-balancer-fee-collector-l2'),
  L2HopBridger: new Task('2023032102-balancer-fee-collector-l2'),
  claimer: {
    protocolFeeWithdrawer: PROTOCOL_FEE_WITHDRAWER,
    actionConfig: {
      baseConfig: defaultBaseConfig,
      relayConfig: defaultRelayConfig,
      oracleConfig: defaultOracleConfig,
      timeLockConfig: defaultTimeLockConfig,
      tokenIndexConfig: {
        tokens: [],
        sources: [PROTOCOL_FEE_WITHDRAWER],
        acceptanceType: 0,
      },
      tokenThresholdConfig: defaultTokenThresholdConfig,
    },
  },
  bptSwapper: {
    balancerVault: BALANCER_VAULT,
    actionConfig: {
      baseConfig: defaultBaseConfig,
      relayConfig: defaultRelayConfig,
      oracleConfig: defaultOracleConfig,
      timeLockConfig: defaultTimeLockConfig,
      tokenIndexConfig: defaultTokenIndexConfig,
      tokenThresholdConfig: defaultTokenThresholdConfig,
    },
  },
  oneInchSwapper: {
    tokenOut: tokens.USDC,
    maxSlippage: fp(0.002), // 0.2 %
    customTokensOut: [],
    customMaxSlippages: [],
    actionConfig: {
      baseConfig: {
        owner: PermissionsManager.key('PermissionsManager'),
        smartVault: SmartVault.key('SmartVault'),
        groupId: 1,
      },
      relayConfig: defaultRelayConfig,
      oracleConfig: defaultOracleConfig,
      timeLockConfig: defaultTimeLockConfig,
      tokenIndexConfig: {
        tokens: [NATIVE_TOKEN_ADDRESS, tokens.USDC, tokens.BAL],
        sources: [], // smart vault
        acceptanceType: 0, // deny list
      },
      tokenThresholdConfig: defaultTokenThresholdConfig,
    },
  },
  paraswapSwapper: {
    quoteSigner: PARASWAP_QUOTE_SIGNER,
    swapperConfig: {
      tokenOut: tokens.USDC,
      maxSlippage: fp(0.002), // 0.2%
      customTokensOut: [],
      customMaxSlippages: [],
      actionConfig: {
        baseConfig: {
          owner: PermissionsManager.key('PermissionsManager'),
          smartVault: SmartVault.key('SmartVault'),
          groupId: 1,
        },
        relayConfig: defaultRelayConfig,
        oracleConfig: defaultOracleConfig,
        timeLockConfig: defaultTimeLockConfig,
        tokenIndexConfig: {
          tokens: [NATIVE_TOKEN_ADDRESS, tokens.USDC, tokens.BAL],
          sources: [], // smart vault
          acceptanceType: 0, // deny list
        },
        tokenThresholdConfig: defaultTokenThresholdConfig,
      },
    },
  },
  withdrawer: {
    recipient: RECIPIENT,
    actionConfig: {
      baseConfig: defaultBaseConfig,
      oracleConfig: defaultOracleConfig,
      relayConfig: {
        gasPriceLimit: 0,
        priorityFeeLimit: 0,
        txCostLimit: 0,
        gasToken: tokens.USDC,
        permissiveMode: true,
        relayers: [BOT],
      },
      timeLockConfig: {
        delay: 14 * DAY,
        nextExecutionTimestamp: 1686304800,
      },
      tokenIndexConfig: {
        tokens: [tokens.USDC, tokens.BAL],
        sources: [], // smart vault
        acceptanceType: 1, // allow list
      },
      tokenThresholdConfig: {
        customThresholds: [],
        defaultThreshold: {
          token: tokens.USDC,
          min: 0,
          max: 0,
        },
      },
    },
  },
}

export type BalancerFeeCollectorUpdatesOptimism = {
  from: string
  owner: string
  mimic: string
  Registry: string
  Create3Factory: string
  PermissionsManager: string
  SmartVault: string
  Claimer: string
  BPTSwapper: string
  OneInchSwapper: string
  ParaswapSwapper: string
  L2HopBridger: string
  claimer: {
    protocolFeeWithdrawer: string
    actionConfig: ActionConfig
  }
  bptSwapper: {
    balancerVault: string
    actionConfig: ActionConfig
  }
  oneInchSwapper: OneInchV5SwapperConfig
  paraswapSwapper: ParaswapV5SwapperConfig
  withdrawer: WithdrawerConfig
}
