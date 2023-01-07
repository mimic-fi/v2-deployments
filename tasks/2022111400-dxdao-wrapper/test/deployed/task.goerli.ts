import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysDxDaoWrapperCorrectly } from '../behavior.goerli'

describe('DXdao Wrapper - goerli', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111400-dxdao-wrapper', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysDxDaoWrapperCorrectly()
})
