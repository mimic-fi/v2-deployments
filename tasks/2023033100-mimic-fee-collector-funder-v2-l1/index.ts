import { getSigner } from '@mimic-fi/v2-helpers'

import { grantAdminPermissions } from '../../src/authorizer'
import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { MimicFeeCollectorFunderV2Deployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as MimicFeeCollectorFunderV2Deployment
  const { namespace, version, relayer, managers, Registry } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, from, version, force }

  const owner = await getSigner(input.owner)
  const manager = await deployCreate3(task, 'PermissionsManager', [owner.address], create3Params)
  const funderV1 = await grantAdminPermissions(task, 'Funder', manager, owner)
  const holder = await grantAdminPermissions(task, 'Holder', manager, owner)
  const bridger = await grantAdminPermissions(task, 'L1HopBridger', manager, owner)
  const smartVault = await grantAdminPermissions(task, 'SmartVault', manager, owner)

  const relayerFunder = await deployCreate3(
    task,
    'FunderV2',
    [
      smartVault.address,
      await funderV1.tokenIn(),
      await funderV1.minBalance(),
      await funderV1.maxBalance(),
      await funderV1.maxSlippage(),
      await funderV1.recipient(),
      owner.address,
      manager.address,
      Registry,
    ],
    {
      ...create3Params,
      instanceName: 'RelayerFunder',
    }
  )

  const deployerFunder = await deployCreate3(
    task,
    'FunderV2',
    [
      smartVault.address,
      await funderV1.tokenIn(),
      await funderV1.minBalance(),
      await funderV1.maxBalance(),
      await funderV1.maxSlippage(),
      input.from,
      owner.address,
      manager.address,
      Registry,
    ],
    { ...create3Params, instanceName: 'DeployerFunder' }
  )

  await executePermissionChanges(
    manager,
    [
      {
        target: relayerFunder,
        changes: [
          { grant: true, permission: { who: relayer, what: 'call' } },
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: managers, what: 'call' } },
        ],
      },
      {
        target: deployerFunder,
        changes: [
          { grant: true, permission: { who: relayer, what: 'call' } },
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: managers, what: 'call' } },
        ],
      },
      {
        target: funderV1,
        changes: [
          { grant: false, permission: { who: relayer, what: 'call' } },
          { grant: false, permission: { who: owner, what: 'call' } },
          { grant: false, permission: { who: managers, what: 'call' } },
          { grant: false, permission: { who: owner, what: 'authorize' } },
          { grant: false, permission: { who: owner, what: 'unauthorize' } },
        ],
      },
      {
        target: holder,
        changes: [
          { grant: false, permission: { who: owner, what: 'authorize' } },
          { grant: false, permission: { who: owner, what: 'unauthorize' } },
        ],
      },
      {
        target: bridger,
        changes: [
          { grant: false, permission: { who: owner, what: 'authorize' } },
          { grant: false, permission: { who: owner, what: 'unauthorize' } },
        ],
      },
      {
        target: smartVault,
        changes: [
          { grant: true, permission: { who: relayerFunder, what: 'swap' } },
          { grant: true, permission: { who: relayerFunder, what: 'unwrap' } },
          { grant: true, permission: { who: relayerFunder, what: 'withdraw' } },
          { grant: true, permission: { who: deployerFunder, what: 'swap' } },
          { grant: true, permission: { who: deployerFunder, what: 'unwrap' } },
          { grant: true, permission: { who: deployerFunder, what: 'withdraw' } },
          { grant: false, permission: { who: funderV1, what: 'swap' } },
          { grant: false, permission: { who: funderV1, what: 'unwrap' } },
          { grant: false, permission: { who: funderV1, what: 'withdraw' } },
          { grant: false, permission: { who: owner, what: 'authorize' } },
          { grant: false, permission: { who: owner, what: 'unauthorize' } },
        ],
      },
    ],
    owner
  )
}
