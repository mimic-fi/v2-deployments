import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysRegistryCorrectly } from '../behavior'

describe('Registry v1 - goerli', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111102-registry-v1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysRegistryCorrectly()
})
