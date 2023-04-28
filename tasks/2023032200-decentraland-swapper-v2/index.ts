import { getSigner } from '@mimic-fi/v2-helpers'

import { deployCreate3 } from '../../src/create3'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { DecentralandSwapperV2Deployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as DecentralandSwapperV2Deployment
  const { params, namespace, version, Registry } = input

  if (!from) from = await getSigner(input.from)
  const create3Params = { namespace, version, from, force }

  await deployCreate3(
    task,
    'DEXSwapperV2',
    [
      {
        smartVault: params.smartVault,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        maxSlippage: params.maxSlippage,
        swapLimitToken: params.swapLimitToken,
        swapLimitAmount: params.swapLimitAmount,
        swapLimitPeriod: params.swapLimitPeriod,
        thresholdToken: params.thresholdToken,
        thresholdAmount: params.thresholdAmount,
        relayer: params.relayer,
        gasPriceLimit: params.gasPriceLimit,
        totalCostLimit: params.totalCostLimit,
        payingGasToken: params.payingGasToken,
        admin: params.admin,
        registry: Registry,
      },
    ],
    create3Params
  )
}
