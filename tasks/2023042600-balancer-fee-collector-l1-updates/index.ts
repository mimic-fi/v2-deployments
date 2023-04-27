import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { BalancerFeeCollectorL1Updates } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BalancerFeeCollectorL1Updates
  const { namespace, version, relayer, BalancerVault, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libraries: { Deployer } }
  const create3Params = { ...txParams, namespace, version }

  const owner = await getSigner(input.owner)
  const manager = await task.inputDeployedInstance('PermissionsManager')
  const smartVault = await task.inputDeployedInstance('SmartVault')
  const oldClaimer = await task.inputDeployedInstance('Claimer')

  const newClaimer = await deployCreate3(task, 'Claimer', [manager.address, Registry], create3Params)
  const bptSwapper = await deployCreate3(task, 'BPTSwapper', [BalancerVault, manager.address, Registry], create3Params)

  await executePermissionChanges(
    manager,
    [
      {
        target: oldClaimer, // clean up old claimer permissions
        changes: [
          { grant: false, permission: { who: owner, what: 'call' } },
          { grant: false, permission: { who: owner, what: 'setSmartVault' } },
          { grant: false, permission: { who: owner, what: 'setLimits' } },
          { grant: false, permission: { who: owner, what: 'setRelayer' } },
          { grant: false, permission: { who: owner, what: 'setThreshold' } },
          { grant: false, permission: { who: owner, what: 'setOracleSigner' } },
          { grant: false, permission: { who: owner, what: 'setProtocolFeeWithdrawer' } },
          { grant: false, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: smartVault, // remove old claimer permissions on smart vault
        changes: [
          { grant: false, permission: { who: oldClaimer, what: 'call' } },
          { grant: false, permission: { who: oldClaimer, what: 'withdraw' } },
        ],
      },
      {
        target: newClaimer, // set up new claimer permissions
        changes: [
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: owner, what: 'setSmartVault' } },
          { grant: true, permission: { who: owner, what: 'setLimits' } },
          { grant: true, permission: { who: owner, what: 'setRelayer' } },
          { grant: true, permission: { who: owner, what: 'setThreshold' } },
          { grant: true, permission: { who: owner, what: 'setOracleSigner' } },
          { grant: true, permission: { who: owner, what: 'setProtocolFeeWithdrawer' } },
          { grant: true, permission: { who: owner, what: 'setPermissiveRelayedMode' } },
          { grant: true, permission: { who: owner, what: 'setPayingGasToken' } },
          { grant: true, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: smartVault, // grant new claimer permissions on smart vault
        changes: [
          { grant: true, permission: { who: newClaimer, what: 'call' } },
          { grant: true, permission: { who: newClaimer, what: 'withdraw' } },
        ],
      },
      {
        target: bptSwapper, // set up new claimer permissions
        changes: [
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: owner, what: 'setSmartVault' } },
          { grant: true, permission: { who: owner, what: 'setLimits' } },
          { grant: true, permission: { who: owner, what: 'setRelayer' } },
          { grant: true, permission: { who: owner, what: 'setThreshold' } },
          { grant: true, permission: { who: owner, what: 'setOracleSigner' } },
          { grant: true, permission: { who: owner, what: 'setPermissiveRelayedMode' } },
          { grant: true, permission: { who: owner, what: 'setPayingGasToken' } },
          { grant: true, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: smartVault, // grant BPT swapper permissions on smart vault
        changes: [
          { grant: true, permission: { who: bptSwapper, what: 'call' } },
          { grant: true, permission: { who: bptSwapper, what: 'withdraw' } },
        ],
      },
    ],
    owner
  )

  // Set smart vault
  await newClaimer.connect(owner).setSmartVault(smartVault.address)
  await bptSwapper.connect(owner).setSmartVault(smartVault.address)

  // Set protocol fee withdrawer
  const protocolFeeWithdrawer = await oldClaimer.protocolFeeWithdrawer()
  await newClaimer.connect(owner).setProtocolFeeWithdrawer(protocolFeeWithdrawer)

  // Set oracle signer
  await newClaimer.connect(owner).setOracleSigner(relayer, true)
  await bptSwapper.connect(owner).setOracleSigner(relayer, true)

  // Set transaction limits
  const txCostLimit = await oldClaimer.txCostLimit()
  const gasPriceLimit = await oldClaimer.gasPriceLimit()
  await newClaimer.connect(owner).setLimits(gasPriceLimit, txCostLimit)
  await bptSwapper.connect(owner).setLimits(gasPriceLimit, txCostLimit)

  // Allow relayer
  await newClaimer.connect(owner).setRelayer(relayer, true)
  await bptSwapper.connect(owner).setRelayer(relayer, true)

  // Set thresholds
  const thresholdToken = await oldClaimer.thresholdToken()
  const thresholdAmount = await oldClaimer.thresholdAmount()
  await newClaimer.connect(owner).setThreshold(thresholdToken, thresholdAmount)
  await bptSwapper.connect(owner).setThreshold(thresholdToken, thresholdAmount)

  // Set paying gas token
  await newClaimer.connect(owner).setPayingGasToken(thresholdToken)
  await bptSwapper.connect(owner).setPayingGasToken(thresholdToken)

  // Set permissive relayed mode
  await newClaimer.connect(owner).setPermissiveRelayedMode(true)
  await bptSwapper.connect(owner).setPermissiveRelayedMode(true)
}
