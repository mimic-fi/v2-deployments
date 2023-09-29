import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { ParaswapFeeRedistributorConnextBridgerUpdate } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itUpdatesParaswapFeeDistributorConnextBridgerCorrectly(): void {
  let input: ParaswapFeeRedistributorConnextBridgerUpdate
  let smartVault: Contract, manager: Contract, oldConnextBridger: Contract, newConnextBridger: Contract

  before('load accounts', async function () {
    input = this.task.input() as ParaswapFeeRedistributorConnextBridgerUpdate
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    oldConnextBridger = await this.task.inputDeployedInstance('ConnextBridger')
    newConnextBridger = await this.task.deployedInstance('ConnextBridger')
  })

  describe('smart vault', () => {
    it('updates its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'old connext bridger', account: oldConnextBridger, roles: [] },
        { name: 'new connext bridger', account: newConnextBridger, roles: ['bridge', 'withdraw'] },
      ])
    })
  })

  describe('old connext bridger', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(oldConnextBridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: [] },
        { name: 'mimic', account: input.mimic, roles: [] },
        { name: 'relayer', account: input.relayer, roles: [] },
      ])
    })
  })

  describe('new connext bridger', () => {
    it('has the expected address', async () => {
      expect(newConnextBridger.address).to.be.equal('0x24C304F1621028b0a5BBADD17f5fEe4e30611B88')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(newConnextBridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'mimic', account: input.mimic, roles: [] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await newConnextBridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper destination chain ID', async () => {
      expect(await newConnextBridger.destinationChainId()).to.be.equal(await oldConnextBridger.destinationChainId())
    })

    it('sets the proper allowed tokens', async () => {
      expect(await newConnextBridger.getAllowedTokens()).to.have.members(await oldConnextBridger.getAllowedTokens())
    })

    it('sets the max slippage correctly', async () => {
      expect(await newConnextBridger.maxSlippage()).to.be.equal(input.maxSlippage)
    })

    it('sets the proper max relayer fee pct', async () => {
      expect(await newConnextBridger.maxRelayerFeePct()).to.be.equal(await oldConnextBridger.maxRelayerFeePct())
    })

    it('sets the expected gas limits', async () => {
      expect(await newConnextBridger.txCostLimit()).to.be.equal(await oldConnextBridger.txCostLimit())
      expect(await newConnextBridger.gasPriceLimit()).to.be.equal(await oldConnextBridger.gasPriceLimit())
    })

    it('sets the expected token threshold params', async () => {
      expect(await newConnextBridger.thresholdToken()).to.be.equal(await oldConnextBridger.thresholdToken())
      expect(await newConnextBridger.thresholdAmount()).to.be.equal(await oldConnextBridger.thresholdAmount())
    })

    it('whitelists the requested relayers', async () => {
      expect(await newConnextBridger.isRelayer(input.relayer)).to.be.true
    })
  })
}
