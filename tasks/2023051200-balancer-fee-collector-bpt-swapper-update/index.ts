import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { BalancerFeeCollectorBptSwapperUpdate } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as BalancerFeeCollectorBptSwapperUpdate
  const { namespace, version, relayer, BalancerVault, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libraries: { Deployer } }
  const createParam = { ...txParams, namespace, version }

  const owner = await getSigner(input.owner)
  const manager = await task.inputDeployedInstance('PermissionsManager')
  const smartVault = await task.inputDeployedInstance('SmartVault')

  const oldBptSwapper = await task.inputDeployedInstance('BPTSwapper')
  const newBptSwapper = await deployCreate3(task, 'BPTSwapper', [BalancerVault, manager.address, Registry], createParam)

  await executePermissionChanges(
    manager,
    [
      {
        target: oldBptSwapper, // revoke old bpt swapper permissions
        changes: [
          { grant: false, permission: { who: owner, what: 'call' } },
          { grant: false, permission: { who: owner, what: 'setSmartVault' } },
          { grant: false, permission: { who: owner, what: 'setLimits' } },
          { grant: false, permission: { who: owner, what: 'setRelayer' } },
          { grant: false, permission: { who: owner, what: 'setThreshold' } },
          { grant: false, permission: { who: owner, what: 'setOracleSigner' } },
          { grant: false, permission: { who: owner, what: 'setPermissiveRelayedMode' } },
          { grant: false, permission: { who: owner, what: 'setPayingGasToken' } },
          { grant: false, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: smartVault, // revoke old BPT swapper permissions on smart vault
        changes: [
          { grant: false, permission: { who: oldBptSwapper, what: 'call' } },
          { grant: false, permission: { who: oldBptSwapper, what: 'withdraw' } },
        ],
      },
      {
        target: newBptSwapper, // set up new bpt swapper permissions
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
          { grant: true, permission: { who: newBptSwapper, what: 'call' } },
          { grant: true, permission: { who: newBptSwapper, what: 'withdraw' } },
        ],
      },
    ],
    owner
  )

  // Set smart vault
  await newBptSwapper.connect(owner).setSmartVault(smartVault.address)

  // Set oracle signer and relayer
  await newBptSwapper.connect(owner).setRelayer(relayer, true)
  await newBptSwapper.connect(owner).setOracleSigner(relayer, true)

  // Set transaction limits
  const txCostLimit = await oldBptSwapper.txCostLimit()
  const gasPriceLimit = await oldBptSwapper.gasPriceLimit()
  await newBptSwapper.connect(owner).setLimits(gasPriceLimit, txCostLimit)

  // Set thresholds
  const thresholdToken = await oldBptSwapper.thresholdToken()
  const thresholdAmount = await oldBptSwapper.thresholdAmount()
  await newBptSwapper.connect(owner).setThreshold(thresholdToken, thresholdAmount)

  // Set paying gas token and permissive mode
  await newBptSwapper.connect(owner).setPayingGasToken(thresholdToken)
  await newBptSwapper.connect(owner).setPermissiveRelayedMode(true)
}
