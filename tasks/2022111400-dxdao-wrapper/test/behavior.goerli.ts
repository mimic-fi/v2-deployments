import { bn, fp, impersonate, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { assertPermissions } from '../../../src/asserts'
import { DxDaoWrapperDeployment } from '../input'

const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

export default function itDeploysDxDaoWrapperCorrectly(): void {
  let input: DxDaoWrapperDeployment
  let smartVault: Contract, wrapper: Contract, registry: Contract
  let owner: string, relayers: string[], managers: string[], feeCollector: string

  before('load input', async function () {
    input = this.task.input() as DxDaoWrapperDeployment
    ;({ owner, managers, relayers, feeCollector } = input.accounts)
  })

  before('load instances', async function () {
    wrapper = await this.task.deployedInstance('Wrapper')
    smartVault = await this.task.deployedInstance('SmartVault')
    registry = await this.task.inputDeployedInstance('Registry')
  })

  describe('smart vault', () => {
    it('uses the correct implementation', async function () {
      expect(await registry.implementationOf(smartVault.address)).to.be.equal(input.params.smartVaultParams.impl)
    })

    it('has set its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'collect',
            'withdraw',
            'wrap',
            'unwrap',
            'claim',
            'join',
            'exit',
            'swap',
            'setStrategy',
            'setPriceFeed',
            'setPriceFeeds',
            'setPriceOracle',
            'setSwapConnector',
            'setSwapFee',
            'setPerformanceFee',
            'setWithdrawFee',
          ],
        },
        { name: 'wrapper', account: wrapper, roles: ['wrap', 'withdraw'] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
        { name: 'feeCollector', account: feeCollector, roles: ['setFeeCollector'] },
      ])
    })

    it('sets a fee collector', async function () {
      expect(await smartVault.feeCollector()).to.be.equal(feeCollector)
    })

    it('sets no swap fee', async function () {
      const swapFee = await smartVault.swapFee()

      expect(swapFee.pct).to.be.equal(0)
      expect(swapFee.cap).to.be.equal(0)
      expect(swapFee.token).to.be.equal(ZERO_ADDRESS)
      expect(swapFee.period).to.be.equal(0)
    })

    it('sets no withdraw fee', async function () {
      const withdrawFee = await smartVault.withdrawFee()

      expect(withdrawFee.pct).to.be.equal(0)
      expect(withdrawFee.cap).to.be.equal(0)
      expect(withdrawFee.token).to.be.equal(ZERO_ADDRESS)
      expect(withdrawFee.period).to.be.equal(0)
    })

    it('sets no performance fee', async function () {
      const performanceFee = await smartVault.performanceFee()

      expect(performanceFee.pct).to.be.equal(0)
      expect(performanceFee.cap).to.be.equal(0)
      expect(performanceFee.token).to.be.equal(ZERO_ADDRESS)
      expect(performanceFee.period).to.be.equal(0)
    })

    it('sets a price oracle', async function () {
      expect(await smartVault.priceOracle()).to.be.equal(input.params.smartVaultParams.priceOracle)
    })

    it('does not set a swap connector', async function () {
      expect(await smartVault.swapConnector()).to.be.equal(ZERO_ADDRESS)
    })
  })

  describe('wrapper', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(wrapper, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setThreshold',
            'setRecipient',
            'call',
          ],
        },
        { name: 'wrapper', account: wrapper, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
        { name: 'feeCollector', account: feeCollector, roles: [] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await wrapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the owner as the recipient', async function () {
      expect(await wrapper.recipient()).to.be.equal(owner)
    })

    it('sets the expected token threshold params', async function () {
      expect(await wrapper.thresholdToken()).to.be.equal(WETH)
      expect(await wrapper.thresholdAmount()).to.be.equal(fp(0.5))
    })

    it('sets the expected gas limits', async function () {
      expect(await wrapper.gasPriceLimit()).to.be.equal(bn(100e9))
      expect(await wrapper.totalCostLimit()).to.be.equal(0)
      expect(await wrapper.payingGasToken()).to.be.equal(WETH)
    })

    it('whitelists the requested relayers', async function () {
      for (const relayer of relayers) {
        expect(await wrapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async function () {
      for (const manager of managers) {
        expect(await wrapper.isRelayer(manager)).to.be.false
      }
    })

    it('can wrap WETH when passing the threshold', async function () {
      const bot = await impersonate(relayers[0], fp(10))
      const weth = await this.task.instanceAt('IERC20', WETH)
      const previousOwnerBalance = await weth.balanceOf(owner)
      const previousFeeCollectorBalance = await weth.balanceOf(feeCollector)

      await bot.sendTransaction({ to: smartVault.address, value: fp(0.25) })
      await expect(wrapper.connect(bot).call()).to.be.revertedWith('MIN_THRESHOLD_NOT_MET')

      await bot.sendTransaction({ to: smartVault.address, value: fp(0.25) })
      await wrapper.connect(bot).call()

      expect(await ethers.provider.getBalance(smartVault.address)).to.be.equal(0)

      const currentFeeCollectorBalance = await weth.balanceOf(feeCollector)
      const relayedCost = currentFeeCollectorBalance.sub(previousFeeCollectorBalance)
      const currentOwnerBalance = await weth.balanceOf(owner)
      const expectedWrappedBalance = fp(0.5).sub(relayedCost)
      expect(currentOwnerBalance).to.be.equal(previousOwnerBalance.add(expectedWrappedBalance))
    })
  })
}
