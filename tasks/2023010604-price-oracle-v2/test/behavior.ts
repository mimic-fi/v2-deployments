import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { PriceOracleDeployment } from '../input'

export function itDeploysPriceOracleCorrectly(): void {
  let priceOracle: Contract

  before('load price oracle', async function () {
    priceOracle = await this.task.deployedInstance('PriceOracle')
  })

  it('registers the PriceOracle under the expected namespace', async function () {
    const factory = await this.task.inputDeployedInstance('Create3Factory')

    const { namespace, contractName, version } = this.task.input() as PriceOracleDeployment
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.${contractName}.${version}`])
    expect(await factory.addressOf(salt)).to.be.equal(priceOracle.address)
  })

  it('sets the price oracle correctly', async function () {
    const { Registry } = this.task.input() as PriceOracleDeployment

    expect(await priceOracle.registry()).to.be.equal(Registry)
  })

  it('registers the price oracle in the registry correctly', async function () {
    const registry = await this.task.inputDeployedInstance('Registry')

    const data = await registry.implementationData(priceOracle.address)
    expect(data.stateless).to.be.true
    expect(data.deprecated).to.be.false
    expect(data.namespace).to.be.equal(await priceOracle.NAMESPACE())
  })
}
