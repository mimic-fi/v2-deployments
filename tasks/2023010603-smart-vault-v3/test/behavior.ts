import { expect } from 'chai'
import { Contract } from 'ethers'

import { SmartVaultDeployment } from '../input'

export default function itDeploysSmartVaultCorrectly(): void {
  let smartVault: Contract

  before('load smart vault', async function () {
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  it('has the expected address', async function () {
    expect(smartVault.address).to.be.equal('0x3E88C9b0e3BE6817973a6E629211E702d12C577F')
  })

  it('sets the smart vault correctly', async function () {
    const { wrappedNativeToken, Registry } = this.task.input() as SmartVaultDeployment

    expect(await smartVault.wrappedNativeToken()).to.be.equal(wrappedNativeToken)
    expect(await smartVault.registry()).to.be.equal(Registry)
  })

  it('registers the smart vault in the registry correctly', async function () {
    const registry = await this.task.inputDeployedInstance('Registry')

    const data = await registry.implementationData(smartVault.address)
    expect(data.stateless).to.be.false
    expect(data.deprecated).to.be.false
    expect(data.namespace).to.be.equal(await smartVault.NAMESPACE())
  })
}
