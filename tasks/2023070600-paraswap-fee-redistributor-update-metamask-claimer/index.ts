import { getSigner, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { ParaswapFeeRedistributorMetamaskClaimerUpdate } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as ParaswapFeeRedistributorMetamaskClaimerUpdate
  const { namespace, version, relayer, owner, mimic, Registry } = input

  const smartVault = await task.inputDeployedInstance('SmartVault')
  const manager = await task.inputDeployedInstance('PermissionsManager')
  const oldMetamaskClaimer = await task.inputDeployedInstance('MetamaskClaimer')

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, from, version, force }
  const newMetamaskClaimer = await deployCreate3(
    task,
    'MetamaskClaimer',
    [
      {
        admin: manager.address,
        registry: Registry,
        smartVault: smartVault.address,
        safe: await oldMetamaskClaimer.safe(),
        metamaskFeeDistributor: await oldMetamaskClaimer.metamaskFeeDistributor(),
        thresholdToken: ZERO_ADDRESS,
        thresholdAmount: 0,
        gasPriceLimit: await oldMetamaskClaimer.gasPriceLimit(),
        gasToken: await oldMetamaskClaimer.gasToken(),
        relayer,
      },
    ],
    { ...create3Params }
  )

  await executePermissionChanges(
    manager,
    [
      {
        target: oldMetamaskClaimer,
        changes: [
          { grant: false, permission: { who: owner, what: 'call' } },
          { grant: false, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: newMetamaskClaimer,
        changes: [
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: smartVault,
        changes: [
          { grant: false, permission: { who: oldMetamaskClaimer, what: 'call' } },
          { grant: false, permission: { who: oldMetamaskClaimer, what: 'withdraw' } },
          { grant: true, permission: { who: newMetamaskClaimer, what: 'call' } },
          { grant: true, permission: { who: newMetamaskClaimer, what: 'withdraw' } },
        ],
      },
    ],
    await getSigner(mimic)
  )
}
