import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysSmartVaultCorrectly } from '../behavior'

describe('SmartVault v1 - goerli', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111103-smart-vault-v1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysSmartVaultCorrectly()
})
