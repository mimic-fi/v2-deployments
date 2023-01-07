import { expect } from 'chai'
import { Contract } from 'ethers'

import { SmartVaultDeployment } from '../input'

export function itDeploysSmartVaultCorrectly(): void {
  let smartVault: Contract

  before('load smart vault', async function () {
    smartVault = await this.task.deployedInstance('SmartVault')
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
