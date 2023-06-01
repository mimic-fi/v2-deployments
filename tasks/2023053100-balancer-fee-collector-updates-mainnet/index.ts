import { getSigner } from '@mimic-fi/v2-helpers'

import { BOT } from '../../constants/mimic'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { BalancerFeeCollectorUpdatesMainnet } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BalancerFeeCollectorUpdatesMainnet
  const { claimer, bptSwapper, oneInchSwapper, paraswapSwapper, withdrawer } = input

  const manager = await task.inputDeployedInstance('PermissionsManager')
  const smartVault = await task.inputDeployedInstance('SmartVault')

  const oldClaimer = await task.inputDeployedInstance('Claimer')
  const oldBptSwapper = await task.inputDeployedInstance('BPTSwapper')
  const oldOneInchSwapper = await task.inputDeployedInstance('OneInchSwapper')
  const oldParaswapSwapper = await task.inputDeployedInstance('ParaswapSwapper')
  const oldWithdrawer = await task.inputDeployedInstance('Withdrawer')

  if (!from) from = await getSigner(input.from)
  const newClaimer = await task.deployAndVerify('Claimer', [claimer], from, force)
  const newBptSwapper = await task.deployAndVerify('BPTSwapper', [bptSwapper], from, force)
  const newOneInchSwapper = await task.deployAndVerify('OneInchV5Swapper', [oneInchSwapper], from, force)
  const newParaswapSwapper = await task.deployAndVerify('ParaswapV5Swapper', [paraswapSwapper], from, force)
  const newWithdrawer = await task.deployAndVerify('Withdrawer', [withdrawer], from, force)

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
          { grant: false, permission: { who: oldWithdrawer, what: 'withdraw' } },
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
        target: oldWithdrawer,
        changes: [
          { grant: false, permission: { who: input.owner, what: 'call' } },
          { grant: false, permission: { who: input.owner, what: 'setSmartVault' } },
          { grant: false, permission: { who: input.owner, what: 'setRecipient' } },
          { grant: false, permission: { who: input.owner, what: 'setTimeLock' } },
          { grant: false, permission: { who: input.owner, what: 'setLimits' } },
          { grant: false, permission: { who: input.owner, what: 'setRelayer' } },
          { grant: false, permission: { who: input.owner, what: 'setThreshold' } },
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
        target: newWithdrawer,
        changes: [
          { grant: true, permission: { who: input.owner, what: 'call' } },
          { grant: true, permission: { who: withdrawer.actionConfig.relayConfig.relayers, what: 'call' } },
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
          { grant: true, permission: { who: newWithdrawer, what: 'withdraw' } },
        ],
      },
    ],
    await getSigner(input.mimic)
  )
}
