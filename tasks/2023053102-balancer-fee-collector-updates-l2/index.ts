import { getSigner } from '@mimic-fi/v2-helpers'

import { BOT } from '../../constants/mimic'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { BalancerFeeCollectorUpdatesL2 } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BalancerFeeCollectorUpdatesL2
  const { claimer, bptSwapper, oneInchSwapper, paraswapSwapper, hopBridger } = input

  const manager = await task.inputDeployedInstance('PermissionsManager')
  const smartVault = await task.inputDeployedInstance('SmartVault')
  const oldClaimer = await task.inputDeployedInstance('Claimer')
  const oldBptSwapper = await task.inputDeployedInstance('BPTSwapper')
  const oldOneInchSwapper = await task.inputDeployedInstance('OneInchSwapper')
  const oldParaswapSwapper = await task.inputDeployedInstance('ParaswapSwapper')
  const oldHopBridger = await task.inputDeployedInstance('L2HopBridger')

  if (!from) from = await getSigner(input.from)
  const newClaimer = await task.deployAndVerify('Claimer', [claimer], from, force)
  const newBptSwapper = await task.deployAndVerify('BPTSwapper', [bptSwapper], from, force)
  const newOneInchSwapper = await task.deployAndVerify('OneInchV5Swapper', [oneInchSwapper], from, force)
  const newParaswapSwapper = await task.deployAndVerify('ParaswapV5Swapper', [paraswapSwapper], from, force)
  const newHopBridger = await task.deployAndVerify('HopBridger', [hopBridger], from, force)

  await executePermissionChanges(
    manager,
    [
      {
        target: smartVault,
        changes: [
          { grant: false, permission: { who: oldClaimer, what: 'call' } },
          { grant: false, permission: { who: oldClaimer, what: 'withdraw' } },
          { grant: false, permission: { who: oldBptSwapper, what: 'call' } },
          { grant: false, permission: { who: oldBptSwapper, what: 'withdraw' } },
          { grant: false, permission: { who: oldOneInchSwapper, what: 'swap' } },
          { grant: false, permission: { who: oldOneInchSwapper, what: 'withdraw' } },
          { grant: false, permission: { who: oldParaswapSwapper, what: 'swap' } },
          { grant: false, permission: { who: oldParaswapSwapper, what: 'withdraw' } },
          { grant: false, permission: { who: oldHopBridger, what: 'bridge' } },
          { grant: false, permission: { who: oldHopBridger, what: 'withdraw' } },
        ],
      },
      {
        target: oldClaimer,
        changes: [
          { grant: false, permission: { who: input.owner, what: 'call' } },
          { grant: false, permission: { who: input.owner, what: 'setSmartVault' } },
          { grant: false, permission: { who: input.owner, what: 'setLimits' } },
          { grant: false, permission: { who: input.owner, what: 'setRelayer' } },
          { grant: false, permission: { who: input.owner, what: 'setThreshold' } },
          { grant: false, permission: { who: input.owner, what: 'setOracleSigner' } },
          { grant: false, permission: { who: input.owner, what: 'setProtocolFeeWithdrawer' } },
          { grant: false, permission: { who: input.owner, what: 'setPermissiveRelayedMode' } },
          { grant: false, permission: { who: input.owner, what: 'setPayingGasToken' } },
          { grant: false, permission: { who: BOT, what: 'call' } },
        ],
      },
      {
        target: oldBptSwapper,
        changes: [
          { grant: false, permission: { who: input.owner, what: 'call' } },
          { grant: false, permission: { who: input.owner, what: 'setSmartVault' } },
          { grant: false, permission: { who: input.owner, what: 'setLimits' } },
          { grant: false, permission: { who: input.owner, what: 'setRelayer' } },
          { grant: false, permission: { who: input.owner, what: 'setThreshold' } },
          { grant: false, permission: { who: input.owner, what: 'setOracleSigner' } },
          { grant: false, permission: { who: input.owner, what: 'setPermissiveRelayedMode' } },
          { grant: false, permission: { who: input.owner, what: 'setPayingGasToken' } },
          { grant: false, permission: { who: BOT, what: 'call' } },
        ],
      },
      {
        target: oldOneInchSwapper,
        changes: [
          { grant: false, permission: { who: input.owner, what: 'call' } },
          { grant: false, permission: { who: input.owner, what: 'setSmartVault' } },
          { grant: false, permission: { who: input.owner, what: 'setDefaultMaxSlippage' } },
          { grant: false, permission: { who: input.owner, what: 'setDeniedTokens' } },
          { grant: false, permission: { who: input.owner, what: 'setLimits' } },
          { grant: false, permission: { who: input.owner, what: 'setRelayer' } },
          { grant: false, permission: { who: input.owner, what: 'setThreshold' } },
          { grant: false, permission: { who: input.owner, what: 'setSwapSigner' } },
          { grant: false, permission: { who: input.owner, what: 'setTokenMaxSlippage' } },
          { grant: false, permission: { who: input.owner, what: 'setTokenOut' } },
          { grant: false, permission: { who: BOT, what: 'call' } },
        ],
      },
      {
        target: oldParaswapSwapper,
        changes: [
          { grant: false, permission: { who: input.owner, what: 'call' } },
          { grant: false, permission: { who: input.owner, what: 'setSmartVault' } },
          { grant: false, permission: { who: input.owner, what: 'setDefaultMaxSlippage' } },
          { grant: false, permission: { who: input.owner, what: 'setDeniedTokens' } },
          { grant: false, permission: { who: input.owner, what: 'setLimits' } },
          { grant: false, permission: { who: input.owner, what: 'setRelayer' } },
          { grant: false, permission: { who: input.owner, what: 'setThreshold' } },
          { grant: false, permission: { who: input.owner, what: 'setSwapSigner' } },
          { grant: false, permission: { who: input.owner, what: 'setTokenMaxSlippage' } },
          { grant: false, permission: { who: input.owner, what: 'setTokenOut' } },
          { grant: false, permission: { who: BOT, what: 'call' } },
        ],
      },
      {
        target: oldHopBridger,
        changes: [
          { grant: false, permission: { who: input.owner, what: 'call' } },
          { grant: false, permission: { who: input.owner, what: 'setSmartVault' } },
          { grant: false, permission: { who: input.owner, what: 'setDestinationChainId' } },
          { grant: false, permission: { who: input.owner, what: 'setMaxBonderFeePct' } },
          { grant: false, permission: { who: input.owner, what: 'setLimits' } },
          { grant: false, permission: { who: input.owner, what: 'setRelayer' } },
          { grant: false, permission: { who: input.owner, what: 'setThreshold' } },
          { grant: false, permission: { who: input.owner, what: 'setMaxSlippage' } },
          { grant: false, permission: { who: input.owner, what: 'setMaxDeadline' } },
          { grant: false, permission: { who: input.owner, what: 'setTokenAmm' } },
          { grant: false, permission: { who: BOT, what: 'call' } },
        ],
      },
      {
        target: newClaimer,
        changes: [
          { grant: true, permission: { who: input.owner, what: 'call' } },
          { grant: true, permission: { who: claimer.actionConfig.relayConfig.relayers, what: 'call' } },
        ],
      },
      {
        target: newBptSwapper,
        changes: [
          { grant: true, permission: { who: input.owner, what: 'call' } },
          { grant: true, permission: { who: bptSwapper.actionConfig.relayConfig.relayers, what: 'call' } },
        ],
      },
      {
        target: newOneInchSwapper,
        changes: [
          { grant: true, permission: { who: input.owner, what: 'call' } },
          { grant: true, permission: { who: oneInchSwapper.actionConfig.relayConfig.relayers, what: 'call' } },
        ],
      },
      {
        target: newParaswapSwapper,
        changes: [
          { grant: true, permission: { who: input.owner, what: 'call' } },
          {
            grant: true,
            permission: { who: paraswapSwapper.swapperConfig.actionConfig.relayConfig.relayers, what: 'call' },
          },
        ],
      },
      {
        target: newHopBridger,
        changes: [
          { grant: true, permission: { who: input.owner, what: 'call' } },
          {
            grant: true,
            permission: { who: hopBridger.bridgerConfig.actionConfig.relayConfig.relayers, what: 'call' },
          },
        ],
      },
      {
        target: smartVault,
        changes: [
          { grant: true, permission: { who: newClaimer, what: 'call' } },
          { grant: true, permission: { who: newClaimer, what: 'withdraw' } },
          { grant: true, permission: { who: newBptSwapper, what: 'call' } },
          { grant: true, permission: { who: newBptSwapper, what: 'withdraw' } },
          { grant: true, permission: { who: newOneInchSwapper, what: 'swap' } },
          { grant: true, permission: { who: newOneInchSwapper, what: 'withdraw' } },
          { grant: true, permission: { who: newParaswapSwapper, what: 'swap' } },
          { grant: true, permission: { who: newParaswapSwapper, what: 'withdraw' } },
          { grant: true, permission: { who: newHopBridger, what: 'bridge' } },
          { grant: true, permission: { who: newHopBridger, what: 'withdraw' } },
        ],
      },
      {
        target: manager,
        changes: [{ grant: true, permission: { who: input.owner, what: 'execute' } }],
      },
    ],
    await getSigner(input.mimic)
  )
}
