import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysSmartVaultsFactoryCorrectly } from '../behavior'

describe('SmartVaultsFactory v1 - fantom', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010607-smart-vaults-factory-v1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysSmartVaultsFactoryCorrectly()
})
