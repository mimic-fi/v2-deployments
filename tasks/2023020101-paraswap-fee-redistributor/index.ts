import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import { deployCreate3, deployManyCreate3 } from '../../src/create3'
import { deploySmartVault } from '../../src/smartVault'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { ParaswapFeeRedistributorDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as ParaswapFeeRedistributorDeployment
  const { params, namespace, version, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libs: { Deployer } }
  const create3Params = { ...txParams, namespace, version }
  const smartVaultDeployer = await deployCreate3(task, 'SmartVaultDeployer', [], create3Params)

  const actions = await deployManyCreate3(
    task,
    ['ERC20Claimer', 'NativeClaimer', 'SwapFeeSetter'],
    [smartVaultDeployer.address, Registry],
    create3Params
  )

  params.erc20ClaimerActionParams.impl = actions['ERC20Claimer'].address
  params.nativeClaimerActionParams.impl = actions['NativeClaimer'].address
  params.swapFeeSetterActionParams.impl = actions['SwapFeeSetter'].address
  params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.${version}`])
  await deploySmartVault(task, smartVaultDeployer, params, txParams)
}
