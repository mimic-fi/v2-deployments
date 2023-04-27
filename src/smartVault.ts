import { assertIndirectEvent } from '@mimic-fi/v2-helpers'
import { Contract } from 'ethers'

import logger from './logger'
import Task from './task'
import { TxParams } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export async function deploySmartVault(task: Task, deployer: Contract, args: any, params: TxParams): Promise<Contract> {
  const output = task.output({ ensure: false })
  const force = params.force || false

  if (force || !output['SmartVault']) {
    logger.info(`Deploying SmartVault...`)
    const tx = await deployer.connect(params.from).deploy(args)
    const factory = await task.inputDeployedInstance('SmartVaultsFactory')
    const event = await assertIndirectEvent(tx, factory.interface, 'Created')
    logger.success(`New SmartVault instance at ${event.args.instance}`)
    task.save({ SmartVault: event.args.instance })
    return task.instanceAt('SmartVault', event.args.instance)
  } else {
    return task.deployedInstance('SmartVault')
  }
}
