import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { SmartVaultDeployment } from '../../input'
import { itDeploysSmartVaultCorrectly } from '../behavior'

describe('SmartVault v2 - goerli', function () {
  before('load task', function () {
    this.task = Task.forTest('2022112301-smart-vault-v2', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from, admin } = this.task.input() as SmartVaultDeployment
    await impersonate(from)
    await impersonate(admin, fp(1))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysSmartVaultCorrectly()
})
