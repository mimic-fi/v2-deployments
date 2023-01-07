import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysSmartVaultCorrectly } from '../behavior'

describe('SmartVault v2 - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022112301-smart-vault-v2', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysSmartVaultCorrectly()
})
