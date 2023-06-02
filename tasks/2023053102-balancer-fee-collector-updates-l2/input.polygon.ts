import { DAY, fp, HOUR, NATIVE_TOKEN_ADDRESS, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import * as hop from '../../constants/hop/polygon'
import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/polygon'
import Task from '../../src/task'

const SmartVault = new Task('2023050301-balancer-fee-collector-l2-v2')
const PermissionsManager = new Task('2023050301-balancer-fee-collector-l2-v2')

/* eslint-disable no-secrets/no-secrets */

const OWNER = '0xc38c5f97B34E175FFd35407fc91a937300E33860'
const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
const PROTOCOL_FEE_WITHDRAWER = '0xEF44D6786b2b4d544b7850Fe67CE6381626Bf2D6'
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
  gasPriceLimit: 200e9,
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
  owner: OWNER,
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
        tokens: [NATIVE_TOKEN_ADDRESS, tokens.USDC],
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
          tokens: [NATIVE_TOKEN_ADDRESS, tokens.USDC],
          sources: [], // smart vault
          acceptanceType: 0, // deny list
        },
        tokenThresholdConfig: defaultTokenThresholdConfig,
      },
    },
  },
  hopBridger: {
    relayer: ZERO_ADDRESS,
    maxFeePct: fp(0.02), // 2 %
    maxSlippage: fp(0.002), // 0.2 %
    maxDeadline: HOUR,
    customMaxFeePcts: [],
    customMaxSlippages: [],
    tokenHopEntrypoints: [{ token: tokens.USDC, entrypoint: hop.USDC_AMM }],
    bridgerConfig: {
      destinationChain: 1, // mainnet
      customDestinationChains: [],
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
          nextExecutionTimestamp: 1686276000,
        },
        tokenIndexConfig: {
          tokens: [tokens.USDC],
          sources: [], // smart vault
          acceptanceType: 1, // allow list
        },
        tokenThresholdConfig: defaultTokenThresholdConfig,
      },
    },
  },
}
