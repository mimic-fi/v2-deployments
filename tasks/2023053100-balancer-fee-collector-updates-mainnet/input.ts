import { DAY, fp, NATIVE_TOKEN_ADDRESS, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
import Task from '../../src/task'
import { ActionConfig, OneInchV5SwapperConfig, ParaswapV5SwapperConfig, WithdrawerConfig } from '../../src/types'

const Registry = new Task('2023010602-registry-v2')
const Create3Factory = new Task('2023010600-create3-factory-v2')
const SmartVault = new Task('2023032101-balancer-fee-collector-l1')
const PermissionsManager = new Task('2023032101-balancer-fee-collector-l1')

/* eslint-disable no-secrets/no-secrets */

const OWNER = '0xc38c5f97B34E175FFd35407fc91a937300E33860'
const RECIPIENT = '0x7c68c42De679ffB0f16216154C996C354cF1161B'
const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
const PROTOCOL_FEE_COLLECTOR = '0xce88686553686DA562CE7Cea497CE749DA109f9F'
const PROTOCOL_FEE_WITHDRAWER = '0x5ef4c5352882b10893b70DbcaA0C000965bd23c5'
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
  gasPriceLimit: 100e9,
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
    min: toUSDC(5000),
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
  Claimer: new Task('2023042600-balancer-fee-collector-l1-updates'),
  BPTSwapper: new Task('2023051200-balancer-fee-collector-bpt-swapper-update'),
  OneInchSwapper: new Task('2023032101-balancer-fee-collector-l1'),
  ParaswapSwapper: new Task('2023032101-balancer-fee-collector-l1'),
  Withdrawer: new Task('2023032101-balancer-fee-collector-l1'),
  claimer: {
    protocolFeeWithdrawer: PROTOCOL_FEE_WITHDRAWER,
    actionConfig: {
      baseConfig: defaultBaseConfig,
      relayConfig: defaultRelayConfig,
      oracleConfig: defaultOracleConfig,
      timeLockConfig: defaultTimeLockConfig,
      tokenIndexConfig: {
        tokens: [],
        sources: [PROTOCOL_FEE_COLLECTOR],
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
    customTokensOut: [{ token: tokens.AURA_BAL, tokenOut: tokens.BAL }],
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
      customTokensOut: [{ token: tokens.AURA_BAL, tokenOut: tokens.BAL }],
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

export type BalancerFeeCollectorUpdatesMainnet = {
  from: string
  owner: string
  mimic: string
  Registry: string
  Create3Factory: string
  SmartVault: string
  PermissionsManager: string
  Claimer: string
  BPTSwapper: string
  OneInchSwapper: string
  ParaswapSwapper: string
  Withdrawer: string
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
