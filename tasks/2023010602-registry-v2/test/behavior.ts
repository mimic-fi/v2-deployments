import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { RegistryDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

export function itDeploysRegistryCorrectly(): void {
  let registry: Contract

  before('load registry', async function () {
    registry = await this.task.deployedInstance('Registry')
  })

  it('has the expected address', async function () {
    expect(registry.address).to.be.equal('0xde6D4872c0C8167fB4F405C7854FD2fED7edca21')
  })

  it('registers the Registry under the expected namespace', async function () {
    const factory = await this.task.inputDeployedInstance('Create3Factory')

    const { namespace, contractName, version } = this.task.input() as RegistryDeployment
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${contractName}.${version}`])
    expect(await factory.addressOf(salt)).to.be.equal(registry.address)
  })

  it('sets the admin correctly', async function () {
    const { admin } = this.task.input() as RegistryDeployment

    const registerRole = registry.interface.getSighash('register')
    expect(await registry.isAuthorized(admin, registerRole)).to.be.true

    const deprecateRole = registry.interface.getSighash('deprecate')
    expect(await registry.isAuthorized(admin, deprecateRole)).to.be.true

    const authorizeRole = registry.interface.getSighash('authorize')
    expect(await registry.isAuthorized(admin, authorizeRole)).to.be.true

    const unauthorizeRole = registry.interface.getSighash('unauthorize')
    expect(await registry.isAuthorized(admin, unauthorizeRole)).to.be.true
  })
}
