import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { SmartVaultDeployment } from '../../input'
import { itDeploysSmartVaultCorrectly } from '../behavior'

describe('SmartVault v3 - fantom', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010603-smart-vault-v3', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from, admin } = this.task.input() as SmartVaultDeployment
    await impersonate(from, fp(100))
    await impersonate(admin, fp(10))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysSmartVaultCorrectly()
})
