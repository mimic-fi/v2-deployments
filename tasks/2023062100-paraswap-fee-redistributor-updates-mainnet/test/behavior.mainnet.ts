import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { ParaswapFeeRedistributorUpdatesMainnet } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itUpdatesParaswapFeeDistributorCorrectly(): void {
  let input: ParaswapFeeRedistributorUpdatesMainnet
  let smartVault: Contract, manager: Contract
  let nativeClaimer: Contract, oldERC20Claimer: Contract, withdrawer: Contract, swapFeeSetter: Contract
  let newERC20Claimer: Contract, metamaskClaimer: Contract

  before('load accounts', async function () {
    input = this.task.input() as ParaswapFeeRedistributorUpdatesMainnet
  })

  before('load instances', async function () {
    manager = await this.task.deployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    withdrawer = await this.task.inputDeployedInstance('Withdrawer')
    swapFeeSetter = await this.task.inputDeployedInstance('SwapFeeSetter')
    nativeClaimer = await this.task.inputDeployedInstance('NativeClaimer')
    oldERC20Claimer = await this.task.inputDeployedInstance('ERC20Claimer')
    newERC20Claimer = await this.task.deployedInstance('ERC20Claimer2')
    metamaskClaimer = await this.task.deployedInstance('MetamaskClaimer')
  })

  describe('permissions manager', () => {
    it('has the expected address', async () => {
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
    it('updates its permissions correctly', async () => {
      await assertPermissions(smartVault, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'withdrawer', account: withdrawer, roles: ['withdraw'] },
        { name: 'swap fee setter', account: swapFeeSetter, roles: [] },
        { name: 'native claimer', account: nativeClaimer, roles: ['call', 'wrap', 'withdraw'] },
        { name: 'old erc20 claimer', account: oldERC20Claimer, roles: [] },
        { name: 'new erc20 claimer', account: newERC20Claimer, roles: ['call', 'swap', 'withdraw'] },
        { name: 'metamask claimer', account: metamaskClaimer, roles: ['call', 'withdraw'] },
      ])
    })

    it('resets the swap fee', async () => {
      const swapFee = await smartVault.swapFee()

      expect(swapFee.pct).to.be.equal(0)
      expect(swapFee.cap).to.be.equal(0)
      expect(swapFee.token).to.be.equal(ZERO_ADDRESS)
      expect(swapFee.period).to.be.equal(0)
    })

    it('sets the withdraw fee', async () => {
      const withdrawFee = await smartVault.withdrawFee()

      expect(withdrawFee.pct).to.be.equal(input.withdrawFee.pct)
      expect(withdrawFee.cap).to.be.equal(input.withdrawFee.cap)
      expect(withdrawFee.token).to.be.equal(input.withdrawFee.token)
      expect(withdrawFee.period).to.be.equal(input.withdrawFee.period)
    })
  })

  describe('withdrawer', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(withdrawer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: input.owner,
          roles: ['setLimits', 'setRelayer', 'setThreshold', 'setTimeLock', 'setRecipient', 'call'],
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

  describe('swap fee setter', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(swapFeeSetter, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['setSmartVault', 'setTimeLock'] },
        { name: 'mimic', account: input.mimic, roles: [] },
        { name: 'relayer', account: input.relayer, roles: [] },
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
          roles: ['setLimits'],
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
          roles: ['setLimits'],
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

  describe('metamask claimer', () => {
    it('has the expected address', async () => {
      expect(metamaskClaimer.address).to.be.equal('0x450F8eF3d972060710BFC4615bb69491dfd670f3')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(metamaskClaimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'mimic', account: input.mimic, roles: [] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await metamaskClaimer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper gnosis safe', async () => {
      expect(await metamaskClaimer.safe()).to.be.equal(input.metamaskClaimer.safe)
    })

    it('sets the proper metamask fee distributor set', async () => {
      expect(await metamaskClaimer.metamaskFeeDistributor()).to.be.equal(input.metamaskClaimer.distributor)
    })

    it('sets the proper gas token', async () => {
      expect(await metamaskClaimer.gasToken()).to.be.equal(input.metamaskClaimer.gasToken)
    })

    it('sets the expected gas limits', async () => {
      expect(await metamaskClaimer.txCostLimit()).to.be.equal(0)
      expect(await metamaskClaimer.gasPriceLimit()).to.be.equal(input.metamaskClaimer.gasPriceLimit)
    })

    it('sets the expected token threshold params', async () => {
      expect(await metamaskClaimer.thresholdToken()).to.be.equal(input.metamaskClaimer.thresholdToken)
      expect(await metamaskClaimer.thresholdAmount()).to.be.equal(input.metamaskClaimer.thresholdAmount)
    })

    it('whitelists the requested relayers', async () => {
      expect(await metamaskClaimer.isRelayer(input.relayer)).to.be.true
    })
  })
}
