import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { ParaswapFeeRedistributorMetamaskClaimerUpdate } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itUpdatesParaswapFeeDistributorCorrectly(): void {
  let input: ParaswapFeeRedistributorMetamaskClaimerUpdate
  let smartVault: Contract, manager: Contract, oldMetamaskClaimer: Contract, newMetamaskClaimer: Contract

  before('load accounts', async function () {
    input = this.task.input() as ParaswapFeeRedistributorMetamaskClaimerUpdate
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    oldMetamaskClaimer = await this.task.inputDeployedInstance('MetamaskClaimer')
    newMetamaskClaimer = await this.task.deployedInstance('MetamaskClaimer')
  })

  describe('smart vault', () => {
    it('updates its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'old metamask claimer', account: oldMetamaskClaimer, roles: [] },
        { name: 'new metamask claimer', account: newMetamaskClaimer, roles: ['call', 'withdraw'] },
      ])
    })
  })

  describe('old metamask claimer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(oldMetamaskClaimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: [] },
        { name: 'mimic', account: input.mimic, roles: [] },
        { name: 'relayer', account: input.relayer, roles: [] },
      ])
    })
  })

  describe('new metamask claimer', () => {
    it('has the expected address', async () => {
      expect(newMetamaskClaimer.address).to.be.equal('0x8D81d98A98E75A496b523b1bf2070518755C36D4')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(newMetamaskClaimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'mimic', account: input.mimic, roles: [] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await newMetamaskClaimer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper gnosis safe', async () => {
      expect(await newMetamaskClaimer.safe()).to.be.equal(await oldMetamaskClaimer.safe())
    })

    it('sets the proper metamask fee distributor set', async () => {
      expect(await newMetamaskClaimer.metamaskFeeDistributor()).to.be.equal(
        await oldMetamaskClaimer.metamaskFeeDistributor()
      )
    })

    it('sets the proper gas token', async () => {
      expect(await newMetamaskClaimer.gasToken()).to.be.equal(await oldMetamaskClaimer.gasToken())
    })

    it('sets the expected gas limits', async () => {
      expect(await newMetamaskClaimer.txCostLimit()).to.be.equal(await oldMetamaskClaimer.txCostLimit())
      expect(await newMetamaskClaimer.gasPriceLimit()).to.be.equal(await oldMetamaskClaimer.gasPriceLimit())
    })

    it('sets the expected token threshold params', async () => {
      expect(await newMetamaskClaimer.thresholdToken()).to.be.equal(ZERO_ADDRESS)
      expect(await newMetamaskClaimer.thresholdAmount()).to.be.equal(0)
    })

    it('whitelists the requested relayers', async () => {
      expect(await newMetamaskClaimer.isRelayer(input.relayer)).to.be.true
    })
  })
}
