import { bn, fp, impersonate, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { assertPermissions } from '../../../src/asserts'
import { DxDaoWrapperDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const CHAINLINK_ORACLE_USDC_ETH = '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'

export function itDeploysDxDaoWrapperCorrectly(): void {
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

  describe('smart vault', function () {
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
      expect(await smartVault.getPriceFeed(USDC, WETH)).to.be.equal(CHAINLINK_ORACLE_USDC_ETH)
    })

    it('does not set a swap connector', async function () {
      expect(await smartVault.swapConnector()).to.be.equal(ZERO_ADDRESS)
    })

    it('sets a price feed for WETH-USDC', async function () {
      expect(await smartVault.getPriceFeed(USDC, WETH)).not.to.be.equal(ZERO_ADDRESS)
      expect(await smartVault.getPrice(WETH, USDC)).to.be.gt(bn(1200e6))
    })
  })

  describe('wrapper', function () {
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
      expect(await wrapper.thresholdToken()).to.be.equal(USDC)
      expect(await wrapper.thresholdAmount()).to.be.equal(bn(200e6))
    })

    it('sets the expected gas limits', async function () {
      expect(await wrapper.gasPriceLimit()).to.be.equal(bn(50e9))
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
      const bot = await impersonate(relayers[0], fp(100))
      const weth = await this.task.instanceAt('IERC20', WETH)
      const previousOwnerBalance = await weth.balanceOf(owner)
      const previousFeeCollectorBalance = await weth.balanceOf(feeCollector)

      await bot.sendTransaction({ to: smartVault.address, value: fp(0.1) })
      await expect(wrapper.connect(bot).call()).to.be.revertedWith('MIN_THRESHOLD_NOT_MET')

      await bot.sendTransaction({ to: smartVault.address, value: fp(0.5) })
      await wrapper.connect(bot).call()

      expect(await ethers.provider.getBalance(smartVault.address)).to.be.equal(0)

      const currentFeeCollectorBalance = await weth.balanceOf(feeCollector)
      const relayedCost = currentFeeCollectorBalance.sub(previousFeeCollectorBalance)
      const currentOwnerBalance = await weth.balanceOf(owner)
      const expectedWrappedBalance = fp(0.6).sub(relayedCost)
      expect(currentOwnerBalance).to.be.equal(previousOwnerBalance.add(expectedWrappedBalance))
    })
  })
}
