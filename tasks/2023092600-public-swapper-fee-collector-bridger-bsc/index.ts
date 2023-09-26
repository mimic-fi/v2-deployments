import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import logger from '../../src/logger'
import { executePermissionChanges } from '../../src/manager'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { PublicSwapperFeeCollectorBridgerBnbInstall } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as PublicSwapperFeeCollectorBridgerBnbInstall
  const { namespace, version, relayer, owner, Registry } = input
  if (!from) from = await getSigner(input.from)

  const smartVault = await task.inputDeployedInstance('SmartVault')
  const manager = await task.inputDeployedInstance('PermissionsManager')

  const connextBridger = await deployCreate3(
    task,
    'ConnextBridger',
    [
      {
        admin: manager.address,
        registry: Registry,
        smartVault: smartVault.address,
        destinationChainId: input.connextBridger.destinationChainId,
        maxRelayerFeePct: input.connextBridger.maxRelayerFeePct,
        allowedTokens: input.connextBridger.allowedTokens,
        thresholdToken: input.connextBridger.thresholdToken,
        thresholdAmount: input.connextBridger.thresholdAmount,
        gasPriceLimit: input.connextBridger.gasPriceLimit,
        relayer,
      },
    ],
    { namespace, from, version, force }
  )

  const signer = await getSigner(owner)
  await executePermissionChanges(
    manager,
    [
      {
        target: connextBridger,
        changes: [
          { grant: true, permission: { who: owner, what: 'call' } },
          { grant: true, permission: { who: relayer, what: 'call' } },
        ],
      },
      {
        target: smartVault,
        changes: [
          { grant: true, permission: { who: owner, what: 'setBridgeConnector' } },
          { grant: true, permission: { who: connextBridger, what: 'bridge' } },
          { grant: true, permission: { who: connextBridger, what: 'withdraw' } },
        ],
      },
    ],
    signer
  )

  if ((await smartVault.bridgeConnector()) != input.BridgeConnector) {
    logger.info('Setting new bridge connector...')
    await smartVault.connect(signer).setBridgeConnector(input.BridgeConnector)
    logger.success(`Bridge connector set`)
  } else {
    logger.warn(`Bridge connector already set`)
  }
}
