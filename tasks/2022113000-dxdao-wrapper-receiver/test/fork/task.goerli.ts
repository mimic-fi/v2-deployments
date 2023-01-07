import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { DXDaoWrapperReceiverDeployment } from '../../input'
import { itDeploysSwapConnectorCorrectly } from '../behavior'

describe('DXDao Wrapper Receiver - goerli', function () {
  before('load task', function () {
    this.task = Task.forTest('2022113000-dxdao-wrapper-receiver', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from } = this.task.input() as DXDaoWrapperReceiverDeployment
    await impersonate(from, fp(2))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysSwapConnectorCorrectly()
})
