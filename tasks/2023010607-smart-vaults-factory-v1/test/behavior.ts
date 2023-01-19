import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { SmartVaultsFactoryDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

export function itDeploysSmartVaultsFactoryCorrectly(): void {
  let smartVaultsFactory: Contract

  before('load factory', async function () {
    smartVaultsFactory = await this.task.deployedInstance('SmartVaultsFactory')
  })

  it('has the expected address', async function () {
    expect(smartVaultsFactory.address).to.be.equal('0x8373c68629191EF10f654CE8e32bbfe3c7A1D743')
  })

  it('registers the SwapConnector under the expected namespace', async function () {
    const factory = await this.task.inputDeployedInstance('Create3Factory')

    const { namespace, contractName, version } = this.task.input() as SmartVaultsFactoryDeployment
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${contractName}.${version}`])
    expect(await factory.addressOf(salt)).to.be.equal(smartVaultsFactory.address)
  })

  it('sets the smart vaults factory correctly', async function () {
    const { Registry } = this.task.input() as SmartVaultsFactoryDeployment

    expect(await smartVaultsFactory.registry()).to.be.equal(Registry)
  })

  it('registers the smart vaults factory in the registry correctly', async function () {
    const registry = await this.task.inputDeployedInstance('Registry')

    const data = await registry.implementationData(smartVaultsFactory.address)
    expect(data.stateless).to.be.false
    expect(data.deprecated).to.be.false
    expect(data.namespace).to.be.equal(await smartVaultsFactory.NAMESPACE())
  })
}
