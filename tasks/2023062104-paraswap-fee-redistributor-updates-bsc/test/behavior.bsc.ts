import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { ParaswapFeeRedistributorUpdatesBSC } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itUpdatesParaswapFeeDistributorCorrectly(): void {
  let input: ParaswapFeeRedistributorUpdatesBSC
  let smartVault: Contract, manager: Contract
  let nativeClaimer: Contract, oldERC20Claimer: Contract, withdrawer: Contract
  let newERC20Claimer: Contract, metamaskClaimer: Contract, connextBridger: Contract

  before('load accounts', async function () {
    input = this.task.input() as ParaswapFeeRedistributorUpdatesBSC
  })

  before('load instances', async function () {
    manager = await this.task.deployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    withdrawer = await this.task.inputDeployedInstance('Withdrawer')
    nativeClaimer = await this.task.inputDeployedInstance('NativeClaimer')
    oldERC20Claimer = await this.task.inputDeployedInstance('ERC20Claimer')
    newERC20Claimer = await this.task.deployedInstance('ERC20Claimer2')
    metamaskClaimer = await this.task.deployedInstance('MetamaskClaimer')
    connextBridger = await this.task.deployedInstance('ConnextBridger')
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
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'native claimer', account: nativeClaimer, roles: ['call', 'wrap', 'withdraw'] },
        { name: 'old erc20 claimer', account: oldERC20Claimer, roles: [] },
        { name: 'new erc20 claimer', account: newERC20Claimer, roles: ['call', 'swap', 'withdraw'] },
        { name: 'metamask claimer', account: metamaskClaimer, roles: ['call', 'withdraw'] },
        { name: 'connext bridger', account: connextBridger, roles: ['bridge', 'withdraw'] },
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
          roles: ['setLimits', 'setRelayer', 'setTimeLock', 'setRecipient', 'setThreshold'],
        },
        {
          name: 'mimic',
          account: input.mimic,
          roles: ['setLimits', 'setThreshold', 'setTimeLock'],
        },
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
          roles: ['setThreshold'],
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
          roles: ['setThreshold'],
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

  describe('connext bridger', () => {
    it('has the expected address', async () => {
      expect(connextBridger.address).to.be.equal('0xB1507336421394Baf99aB23d6B39bd5b1592263E')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(connextBridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'mimic', account: input.mimic, roles: [] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await connextBridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper destination chain ID', async () => {
      expect(await connextBridger.destinationChainId()).to.be.equal(input.connextBridger.destinationChainId)
    })

    it('sets the proper allowed tokens', async () => {
      expect(await connextBridger.getAllowedTokens()).to.have.members(input.connextBridger.allowedTokens)
    })

    it('sets the proper max relayer fee pct', async () => {
      expect(await connextBridger.maxRelayerFeePct()).to.be.equal(input.connextBridger.maxRelayerFeePct)
    })

    it('sets the expected gas limits', async () => {
      expect(await connextBridger.txCostLimit()).to.be.equal(0)
      expect(await connextBridger.gasPriceLimit()).to.be.equal(input.connextBridger.gasPriceLimit)
    })

    it('sets the expected token threshold params', async () => {
      expect(await connextBridger.thresholdToken()).to.be.equal(input.connextBridger.thresholdToken)
      expect(await connextBridger.thresholdAmount()).to.be.equal(input.connextBridger.thresholdAmount)
    })

    it('whitelists the requested relayers', async () => {
      expect(await connextBridger.isRelayer(input.relayer)).to.be.true
    })
  })
}
