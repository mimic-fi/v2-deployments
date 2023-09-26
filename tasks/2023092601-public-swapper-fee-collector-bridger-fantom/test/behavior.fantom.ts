import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { PublicSwapperFeeCollectorBridgerFantomInstall } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itInstallsPublicSwapperFeeCollectorBridgerFantomCorrectly(): void {
  let input: PublicSwapperFeeCollectorBridgerFantomInstall
  let smartVault: Contract, manager: Contract, fantomBridger: Contract

  before('load accounts', async function () {
    input = this.task.input() as PublicSwapperFeeCollectorBridgerFantomInstall
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    fantomBridger = await this.task.deployedInstance('FantomBridger')
  })

  describe('smart vault', () => {
    it('updates the bridge connector', async function () {
      expect(await smartVault.bridgeConnector()).to.be.equal(input.BridgeConnector)
    })
  })

  describe('fantom bridger', () => {
    it('has the expected address', async () => {
      expect(fantomBridger.address).to.be.equal('0x300809827D7e6f4F998eb0ece35D8b6d64e6c1A3')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(fantomBridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await fantomBridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper allowed tokens', async () => {
      expect(await fantomBridger.getAllowedTokens()).to.have.members(input.fantomBridger.allowedTokens)
    })

    it('sets the expected gas limits', async () => {
      expect(await fantomBridger.txCostLimit()).to.be.equal(0)
      expect(await fantomBridger.gasPriceLimit()).to.be.equal(input.fantomBridger.gasPriceLimit)
    })

    it('sets the expected token threshold params', async () => {
      expect(await fantomBridger.thresholdToken()).to.be.equal(input.fantomBridger.thresholdToken)
      expect(await fantomBridger.thresholdAmount()).to.be.equal(input.fantomBridger.thresholdAmount)
    })

    it('whitelists the requested relayers', async () => {
      expect(await fantomBridger.isRelayer(input.relayer)).to.be.true
    })
  })
}
