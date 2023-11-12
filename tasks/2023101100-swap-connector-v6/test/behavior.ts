import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { SwapConnectorDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itDeploysSwapConnectorCorrectly(): void {
  let swapConnector: Contract

  before('load swap connector', async function () {
    swapConnector = await this.task.deployedInstance('SwapConnector')
  })

  it('has the expected address', async function () {
    expect(swapConnector.address).to.be.equal('0xe07300c13D49b8560F51bB30b45c22CA7Cd08af8')
  })

  it('registers the SwapConnector under the expected namespace', async function () {
    const factory = await this.task.inputDeployedInstance('Create3Factory')

    const { namespace, version } = this.task.input() as SwapConnectorDeployment
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.SwapConnector.${version}`])
    expect(await factory.addressOf(salt)).to.be.equal(swapConnector.address)
  })

  it('sets the swap connector correctly', async function () {
    const { Registry } = this.task.input() as SwapConnectorDeployment

    expect(await swapConnector.registry()).to.be.equal(Registry)
  })

  it('registers the swap connector in the registry correctly', async function () {
    const registry = await this.task.inputDeployedInstance('Registry')

    const data = await registry.implementationData(swapConnector.address)
    expect(data.stateless).to.be.true
    expect(data.deprecated).to.be.false
    expect(data.namespace).to.be.equal(await swapConnector.NAMESPACE())
  })
}
