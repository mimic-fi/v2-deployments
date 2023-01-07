import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { DxDaoWrapperDeployment } from '../../input'
import { itDeploysDxDaoWrapperCorrectly } from '../behavior.mainnet'

describe('DXdao Wrapper - mainnet', function () {
  before('load task', function () {
    this.task = Task.forTest('2022111400-dxdao-wrapper', getForkedNetwork(hre))
  })

  before('impersonate sender', async function () {
    const { from } = this.task.input() as DxDaoWrapperDeployment
    await impersonate(from, fp(2))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysDxDaoWrapperCorrectly()
})
