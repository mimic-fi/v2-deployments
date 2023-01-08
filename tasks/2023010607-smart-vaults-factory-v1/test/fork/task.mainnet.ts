import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { SmartVaultsFactoryDeployment } from '../../input'
import { itDeploysSmartVaultsFactoryCorrectly } from '../behavior'

describe.skip('SmartVaultsFactory v1 - mainnet', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010607-smart-vaults-factory-v1', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from, admin } = this.task.input() as SmartVaultsFactoryDeployment
    await impersonate(from, fp(10))
    await impersonate(admin, fp(1))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysSmartVaultsFactoryCorrectly()
})
