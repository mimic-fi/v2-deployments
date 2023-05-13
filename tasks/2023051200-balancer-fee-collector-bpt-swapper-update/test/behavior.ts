import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { BalancerFeeCollectorBptSwapperUpdate } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itDeploysBalancerFeeCollectorV2Correctly(): void {
  let input: BalancerFeeCollectorBptSwapperUpdate
  let smartVault: Contract, manager: Contract
  let oldBptSwapper: Contract, newBptSwapper: Contract

  before('load accounts', async function () {
    input = this.task.input() as BalancerFeeCollectorBptSwapperUpdate
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    oldBptSwapper = await this.task.inputDeployedInstance('BPTSwapper')
    newBptSwapper = await this.task.deployedInstance('BPTSwapper')
  })

  describe('smart vault', () => {
    it('updates its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'old bpt swapper', account: oldBptSwapper, roles: [] },
        { name: 'new bpt swapper', account: newBptSwapper, roles: ['call', 'withdraw'] },
      ])
    })
  })

  describe('old bot swapper', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(oldBptSwapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: [] },
        { name: 'relayer', account: input.relayer, roles: [] },
      ])
    })
  })

  describe('new bpt swapper', () => {
    it('has the expected address', async () => {
      expect(newBptSwapper.address).to.be.equal('0xFE820dfdb88CE7085633055D912Aa9ECeA5bE8a6')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(newBptSwapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: input.owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setPermissiveRelayedMode',
            'setRelayer',
            'setThreshold',
            'setOracleSigner',
            'setPayingGasToken',
            'call',
          ],
        },
        { name: 'old bpt swapper', account: oldBptSwapper, roles: [] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await newBptSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper oracle signer', async () => {
      expect(await newBptSwapper.isOracleSigner(input.relayer)).to.be.true
    })

    it('sets the proper paying gas token', async () => {
      expect(await newBptSwapper.payingGasToken()).to.be.equal(await oldBptSwapper.thresholdToken())
      expect(await newBptSwapper.isPermissiveRelayedModeActive()).to.be.equal(
        await oldBptSwapper.isPermissiveRelayedModeActive()
      )
    })

    it('sets the expected token threshold params', async () => {
      expect(await newBptSwapper.thresholdToken()).to.be.equal(await oldBptSwapper.thresholdToken())
      expect(await newBptSwapper.thresholdAmount()).to.be.equal(await oldBptSwapper.thresholdAmount())
    })

    it('sets the expected limits', async () => {
      expect(await newBptSwapper.gasPriceLimit()).to.be.equal(await oldBptSwapper.gasPriceLimit())
    })

    it('whitelists the requested relayers', async () => {
      expect(await newBptSwapper.isRelayer(input.relayer)).to.be.true
    })
  })
}
