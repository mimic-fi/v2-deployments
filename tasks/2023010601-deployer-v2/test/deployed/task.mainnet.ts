import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysDeployerCorrectly } from '../behavior'

describe.skip('Deployer v2 - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010601-deployer-v2', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysDeployerCorrectly()
})