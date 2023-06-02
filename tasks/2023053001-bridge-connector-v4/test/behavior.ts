import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { BridgeConnectorDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itDeploysBridgeConnectorCorrectly(): void {
  let bridgeConnector: Contract

  before('load bridge connector', async function () {
    bridgeConnector = await this.task.deployedInstance('BridgeConnector')
  })

  it('has the expected address', async function () {
    expect(bridgeConnector.address).to.be.equal('0x97CF725A33aF7653B982EbB61a6CC3BFC06CCf00')
  })

  it('registers the BridgeConnector under the expected namespace', async function () {
    const factory = await this.task.inputDeployedInstance('Create3Factory')

    const { namespace, version } = this.task.input() as BridgeConnectorDeployment
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.BridgeConnector.${version}`])
    expect(await factory.addressOf(salt)).to.be.equal(bridgeConnector.address)
  })

  it('sets the bridge connector correctly', async function () {
    const { Registry } = this.task.input() as BridgeConnectorDeployment

    expect(await bridgeConnector.registry()).to.be.equal(Registry)
  })

  it('registers the bridge connector in the registry correctly', async function () {
    const registry = await this.task.inputDeployedInstance('Registry')

    const data = await registry.implementationData(bridgeConnector.address)
    expect(data.stateless).to.be.true
    expect(data.deprecated).to.be.false
    expect(data.namespace).to.be.equal(await bridgeConnector.NAMESPACE())
  })

  it('deprecates the previous bridge connector', async function () {
    const registry = await this.task.inputDeployedInstance('Registry')

    const { BridgeConnectorV3 } = this.task.input() as BridgeConnectorDeployment
    const data = await registry.implementationData(BridgeConnectorV3)
    expect(data.deprecated).to.be.true
  })
}
