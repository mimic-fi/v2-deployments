import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysSmartVaultCorrectly } from '../behavior'

describe('SmartVault v3 - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010603-smart-vault-v3', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysSmartVaultCorrectly()
})
