import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itBehavesLikeCreate3Factory } from '../behavior'

describe('Create3Factory v2 - fantom', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010600-create3-factory-v2', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itBehavesLikeCreate3Factory()
})
