import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itBehavesLikeCreate3Factory } from '../behavior'

describe('Create3Factory v1 - mumbai', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111100-create3-factory-v1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itBehavesLikeCreate3Factory()
})
