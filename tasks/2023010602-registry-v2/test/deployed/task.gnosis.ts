import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysRegistryCorrectly } from '../behavior'

describe('Registry v2 - gnosis', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010602-registry-v2', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysRegistryCorrectly()
})
