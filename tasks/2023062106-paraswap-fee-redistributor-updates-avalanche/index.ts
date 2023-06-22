import { getSigner } from '@mimic-fi/v2-helpers'

import { grantAdminPermissions } from '../../src/authorizer'
import { deployCreate3 } from '../../src/create3'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { ParaswapFeeRedistributorUpdatesAvalanche } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as ParaswapFeeRedistributorUpdatesAvalanche
  const { namespace, version, relayer, owner, mimic, Registry } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, from, version, force }

  const manager = await deployCreate3(task, 'PermissionsManager', [mimic], create3Params)

  const signer = await getSigner(mimic)
  const erc20ClaimerV1 = await grantAdminPermissions(task, 'ERC20Claimer', manager, signer)
  const nativeClaimer = await grantAdminPermissions(task, 'NativeClaimer', manager, signer)
  const withdrawer = await grantAdminPermissions(task, 'Withdrawer', manager, signer)
  const smartVault = await grantAdminPermissions(task, 'SmartVault', manager, signer)

  const erc20ClaimerV2 = await deployCreate3(
    task,
    'ERC20Claimer2',
    [
      {
        admin: manager.address,
        registry: Registry,
        smartVault: smartVault.address,
        tokenOut: input.erc20Claimer.tokenOut,
        feeClaimer: await erc20ClaimerV1.feeClaimer(),
        swapSigner: await erc20ClaimerV1.swapSigner(),
        maxSlippage: await erc20ClaimerV1.maxSlippage(),
        ignoreTokens: await erc20ClaimerV1.getIgnoredTokenSwaps(),
        thresholdToken: await erc20ClaimerV1.thresholdToken(),
        thresholdAmount: await erc20ClaimerV1.thresholdAmount(),
        gasPriceLimit: await erc20ClaimerV1.gasPriceLimit(),
        relayer,
      },
    ],
    { ...create3Params }
  )

  const wormholeBridger = await deployCreate3(
    task,
    'WormholeBridger',
    [
      {
        admin: manager.address,
        registry: Registry,
        smartVault: smartVault.address,
        destinationChainId: input.wormholeBridger.destinationChainId,
        allowedTokens: input.wormholeBridger.allowedTokens,
        maxRelayerFeePct: input.wormholeBridger.maxRelayerFeePct,
        thresholdToken: input.wormholeBridger.thresholdToken,
        thresholdAmount: input.wormholeBridger.thresholdAmount,
        gasPriceLimit: input.wormholeBridger.gasPriceLimit,
        relayer,
      },
    ],
    { ...create3Params }
  )

  await executePermissionChanges(
    manager,
    [
      {
        target: manager,
        changes: [{ grant: true, permission: { who: owner, what: 'execute' } }],
      },
      {
        target: erc20ClaimerV2,
        changes: [
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: wormholeBridger,
        changes: [
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: erc20ClaimerV1,
        changes: [
          { grant: false, permission: { who: owner, what: 'call' } },
          { grant: false, permission: { who: owner, what: 'authorize' } },
          { grant: false, permission: { who: owner, what: 'unauthorize' } },
          { grant: false, permission: { who: mimic, what: 'call' } },
          { grant: false, permission: { who: mimic, what: 'authorize' } },
          { grant: false, permission: { who: mimic, what: 'unauthorize' } },
          { grant: false, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: nativeClaimer,
        changes: [
          { grant: false, permission: { who: owner, what: 'authorize' } },
          { grant: false, permission: { who: owner, what: 'unauthorize' } },
          { grant: false, permission: { who: mimic, what: 'authorize' } },
          { grant: false, permission: { who: mimic, what: 'unauthorize' } },
        ],
      },
      {
        target: withdrawer,
        changes: [
          { grant: false, permission: { who: owner, what: 'authorize' } },
          { grant: false, permission: { who: owner, what: 'unauthorize' } },
          { grant: false, permission: { who: mimic, what: 'authorize' } },
          { grant: false, permission: { who: mimic, what: 'unauthorize' } },
        ],
      },
      {
        target: smartVault,
        changes: [
          { grant: true, permission: { who: erc20ClaimerV2, what: 'call' } },
          { grant: true, permission: { who: erc20ClaimerV2, what: 'swap' } },
          { grant: true, permission: { who: erc20ClaimerV2, what: 'withdraw' } },
          { grant: true, permission: { who: wormholeBridger, what: 'bridge' } },
          { grant: true, permission: { who: wormholeBridger, what: 'withdraw' } },
          { grant: false, permission: { who: erc20ClaimerV1, what: 'call' } },
          { grant: false, permission: { who: erc20ClaimerV1, what: 'swap' } },
          { grant: false, permission: { who: erc20ClaimerV1, what: 'withdraw' } },
          { grant: false, permission: { who: owner, what: 'authorize' } },
          { grant: false, permission: { who: owner, what: 'unauthorize' } },
          { grant: false, permission: { who: mimic, what: 'authorize' } },
          { grant: false, permission: { who: mimic, what: 'unauthorize' } },
        ],
      },
    ],
    signer
  )
}
