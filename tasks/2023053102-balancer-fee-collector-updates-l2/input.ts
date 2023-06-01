import { DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'
import { ActionConfig, HopBridgerConfig, OneInchV5SwapperConfig, ParaswapV5SwapperConfig } from '../../src/types'
import arbitrum from './input.arbitrum'
import gnosis from './input.gnosis'
import polygon from './input.polygon'

const Registry = new Task('2023010602-registry-v2')
const Create3Factory = new Task('2023010600-create3-factory-v2')
const SmartVault = new Task('2023050301-balancer-fee-collector-l2-v2')
const PermissionsManager = new Task('2023050301-balancer-fee-collector-l2-v2')
const Claimer = new Task('2023050301-balancer-fee-collector-l2-v2')
const BPTSwapper = new Task('2023051200-balancer-fee-collector-bpt-swapper-update')
const OneInchSwapper = new Task('2023050301-balancer-fee-collector-l2-v2')
const ParaswapSwapper = new Task('2023050301-balancer-fee-collector-l2-v2')
const L2HopBridger = new Task('2023050301-balancer-fee-collector-l2-v2')

export default {
  from: DEPLOYER_2,
  mimic: TESTING_EOA,
  Registry,
  Create3Factory,
  SmartVault,
  PermissionsManager,
  Claimer,
  BPTSwapper,
  OneInchSwapper,
  ParaswapSwapper,
  L2HopBridger,
  arbitrum,
  polygon,
  gnosis,
}

export type BalancerFeeCollectorUpdatesL2 = {
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
  hopBridger: HopBridgerConfig
}
