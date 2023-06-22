import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { ParaswapFeeRedistributorUpdatesFantom } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itUpdatesParaswapFeeDistributorCorrectly(): void {
  let input: ParaswapFeeRedistributorUpdatesFantom
  let smartVault: Contract, manager: Contract
  let nativeClaimer: Contract, oldERC20Claimer: Contract, withdrawer: Contract
  let newERC20Claimer: Contract, fantomBridger: Contract

  before('load accounts', async function () {
    input = this.task.input() as ParaswapFeeRedistributorUpdatesFantom
  })

  before('load instances', async function () {
    manager = await this.task.deployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    withdrawer = await this.task.inputDeployedInstance('Withdrawer')
    nativeClaimer = await this.task.inputDeployedInstance('NativeClaimer')
    oldERC20Claimer = await this.task.inputDeployedInstance('ERC20Claimer')
    newERC20Claimer = await this.task.deployedInstance('ERC20Claimer2')
    fantomBridger = await this.task.deployedInstance('FantomBridger')
  })

  describe('permissions manager', () => {
    it('has the expected address', async function () {
      expect(manager.address).to.be.equal('0x71007481Ba4d4C34eEB9F1288E591bE61A9c607F')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(manager, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['execute'] },
        { name: 'mimic', account: input.mimic, roles: ['execute'] },
        { name: 'relayers', account: input.relayer, roles: [] },
      ])
    })
  })

  describe('smart vault', () => {
    it('updates its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'withdrawer', account: withdrawer, roles: ['withdraw'] },
        { name: 'native claimer', account: nativeClaimer, roles: ['call', 'wrap', 'withdraw'] },
        { name: 'old erc20 claimer', account: oldERC20Claimer, roles: [] },
        { name: 'new erc20 claimer', account: newERC20Claimer, roles: ['call', 'swap', 'withdraw'] },
        { name: 'fantom bridger', account: fantomBridger, roles: ['call', 'withdraw'] },
      ])
    })
  })

  describe('withdrawer', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(withdrawer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: input.owner,
          roles: ['setLimits', 'setRelayer', 'setTimeLock', 'setRecipient', 'setThreshold', 'call'],
        },
        {
          name: 'mimic',
          account: input.mimic,
          roles: ['setLimits', 'setThreshold', 'setTimeLock'],
        },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })
  })

  describe('native claimer', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(nativeClaimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: input.owner,
          roles: ['setSmartVault', 'setLimits', 'setRelayer', 'setFeeClaimer', 'setThreshold', 'call'],
        },
        {
          name: 'mimic',
          account: input.mimic,
          roles: [],
        },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })
  })

  describe('old erc20 claimer', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(oldERC20Claimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: input.owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setSwapSigner',
            'setMaxSlippage',
            'setIgnoreTokenSwaps',
            'setFeeClaimer',
            'setThreshold',
          ],
        },
        {
          name: 'mimic',
          account: input.mimic,
          roles: [],
        },
        { name: 'relayer', account: input.relayer, roles: [] },
      ])
    })
  })

  describe('new erc20 claimer', () => {
    it('has the expected address', async () => {
      expect(newERC20Claimer.address).to.be.equal('0x46adEC4182aE274337b31dFAF69520FB37843bEA')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(newERC20Claimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'mimic', account: input.mimic, roles: [] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await newERC20Claimer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper protocol fee withdrawer', async () => {
      expect(await newERC20Claimer.feeClaimer()).to.be.equal(await oldERC20Claimer.feeClaimer())
    })

    it('sets the proper swap signer', async () => {
      expect(await newERC20Claimer.swapSigner()).to.be.equal(await oldERC20Claimer.swapSigner())
    })

    it('sets the proper max slippage', async () => {
      expect(await newERC20Claimer.maxSlippage()).to.be.equal(await oldERC20Claimer.maxSlippage())
    })

    it('sets the proper ignored tokens', async () => {
      expect(await newERC20Claimer.getIgnoredTokenSwaps()).to.have.members(await oldERC20Claimer.getIgnoredTokenSwaps())
    })

    it('sets the expected token threshold params', async () => {
      expect(await newERC20Claimer.thresholdToken()).to.be.equal(await oldERC20Claimer.thresholdToken())
      expect(await newERC20Claimer.thresholdAmount()).to.be.equal(await oldERC20Claimer.thresholdAmount())
    })

    it('sets the expected limits', async () => {
      expect(await newERC20Claimer.txCostLimit()).to.be.equal(await oldERC20Claimer.txCostLimit())
      expect(await newERC20Claimer.gasPriceLimit()).to.be.equal(await oldERC20Claimer.gasPriceLimit())
    })

    it('whitelists the requested relayers', async () => {
      expect(await newERC20Claimer.isRelayer(input.relayer)).to.be.true
    })
  })

  describe('fantom bridger', () => {
    it('has the expected address', async () => {
      expect(fantomBridger.address).to.be.equal('0x4506bc69eA00715B541caA6edc70D1d699B7e5ef')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(fantomBridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'mimic', account: input.mimic, roles: [] },
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
