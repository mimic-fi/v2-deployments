import { getSigner } from '@mimic-fi/v2-helpers'
import { ethers } from 'hardhat'

import { deployCreate3 } from '../../src/create3'
import { deploySmartVault } from '../../src/smartVault'
import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'
import { DxDaoWrapperDeployment } from './input'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as DxDaoWrapperDeployment
  const { params, namespace, version, Deployer, Registry } = input

  if (!from) from = await getSigner(input.from)
  const txParams = { from, force, libs: { Deployer } }
  const create3Params = { ...txParams, namespace, version }

  const smartVaultDeployer = await deployCreate3(task, 'SmartVaultDeployer', [], create3Params)
  const wrapper = await deployCreate3(task, 'Wrapper', [smartVaultDeployer.address, Registry], create3Params)

  params.wrapperActionParams.impl = wrapper.address
  params.smartVaultParams.salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SmartVault.${version}`])
  await deploySmartVault(task, smartVaultDeployer, params, txParams)
}
