import { fp, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { PublicSwapperFeeCollectorL1Deployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const CHAINLINK_ORACLE_USDC_ETH = '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'

export default function itDeploysPublicSwapperFeeCollectorCorrectly(): void {
  let input: PublicSwapperFeeCollectorL1Deployment
  let smartVault: Contract, manager: Contract, swapper: Contract, withdrawer: Contract
  let owner: string, relayers: string[], managers: string[], feeCollector: string

  before('load accounts', async function () {
    input = this.task.input() as PublicSwapperFeeCollectorL1Deployment
    ;({ owner, managers, relayers, feeCollector } = input.accounts)
  })

  before('load instances', async function () {
    manager = await this.task.deployedInstance('PermissionsManager')
    swapper = await this.task.deployedInstance('ParaswapSwapper')
    withdrawer = await this.task.deployedInstance('Withdrawer')
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  describe('permissions manager', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(manager, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: owner, roles: ['execute'] },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })
  })

  describe('smart vault', () => {
    it('has the expected address', async function () {
      expect(smartVault.address).to.be.equal('0xeb4Af8a64070Ef0dEa6260e0Bf2310748f014d88')
    })

    it('uses the correct implementation', async function () {
      const smartVaultsFactory = await this.task.inputDeployedInstance('SmartVaultsFactory')
      const implementation = await smartVaultsFactory.implementationOf(smartVault.address)
      expect(implementation).to.be.equal(input.params.smartVaultParams.impl)
    })

    it('has set its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: [
            'collect',
            'withdraw',
            'wrap',
            'unwrap',
            'claim',
            'join',
            'exit',
            'swap',
            'bridge',
            'setStrategy',
            'setPriceFeed',
            'setPriceFeeds',
            'setPriceOracle',
            'setSwapConnector',
            'setBridgeConnector',
            'setSwapFee',
            'setBridgeFee',
            'setPerformanceFee',
            'setWithdrawFee',
            'setFeeCollector',
          ],
        },
        { name: 'swapper', account: swapper, roles: ['swap', 'withdraw'] },
        { name: 'withdrawer', account: withdrawer, roles: ['withdraw'] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })

    it('sets a fee collector', async function () {
      expect(await smartVault.feeCollector()).to.be.equal(feeCollector)
    })

    it('sets no bridge fee', async function () {
      const bridgeFee = await smartVault.bridgeFee()

      expect(bridgeFee.pct).to.be.equal(0)
      expect(bridgeFee.cap).to.be.equal(0)
      expect(bridgeFee.token).to.be.equal(ZERO_ADDRESS)
      expect(bridgeFee.period).to.be.equal(0)
    })

    it('sets no swap fee', async function () {
      const swapFee = await smartVault.swapFee()

      expect(swapFee.pct).to.be.equal(0)
      expect(swapFee.cap).to.be.equal(0)
      expect(swapFee.token).to.be.equal(ZERO_ADDRESS)
      expect(swapFee.period).to.be.equal(0)
    })

    it('sets a withdraw fee', async function () {
      const withdrawFee = await smartVault.withdrawFee()

      expect(withdrawFee.pct).to.be.equal(fp(0.099))
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

    it('sets a swap connector', async function () {
      expect(await smartVault.swapConnector()).to.be.equal(input.params.smartVaultParams.swapConnector)
    })

    it('sets a bridge connector', async function () {
      expect(await smartVault.bridgeConnector()).to.be.equal(input.params.smartVaultParams.bridgeConnector)
    })

    it('sets the expected price feeds', async function () {
      expect(await smartVault.getPriceFeed(USDC, WETH)).to.be.equal(CHAINLINK_ORACLE_USDC_ETH)
    })
  })

  describe('swapper', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(swapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setTokenOut',
            'setSwapSigner',
            'setDefaultMaxSlippage',
            'setTokenMaxSlippage',
            'setDeniedTokens',
            'setThreshold',
            'call',
          ],
        },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await swapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected signer', async () => {
      expect(await swapper.swapSigner()).to.be.equal('0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA')
    })

    it('sets the expected slippages', async () => {
      expect(await swapper.defaultMaxSlippage()).to.be.equal(fp(0.002))
      expect(await swapper.getTokenSlippage(USDC)).to.be.equal(fp(0.002))
    })

    it('sets the expected denied tokens', async () => {
      const deniedTokens = await swapper.getDeniedTokens()
      expect(deniedTokens).to.be.have.lengthOf(0)
    })

    it('sets the expected token threshold params', async () => {
      expect(await swapper.thresholdToken()).to.be.equal(USDC)
      expect(await swapper.thresholdAmount()).to.be.equal(toUSDC(5000))
    })

    it('sets the expected gas limits', async () => {
      expect(await swapper.txCostLimit()).to.be.equal(0)
      expect(await swapper.gasPriceLimit()).to.be.equal(100e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await swapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await swapper.isRelayer(manager)).to.be.false
      }
    })
  })

  describe('withdrawer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(withdrawer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: ['setSmartVault', 'setLimits', 'setRelayer', 'setThreshold', 'setRecipient', 'call'],
        },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await withdrawer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the owner as the recipient', async () => {
      expect(await withdrawer.recipient()).to.be.equal('0x5B0b6f2FFE9C81F36eb5477B28d2bE3699D48d79')
    })

    it('sets the expected token threshold params', async () => {
      expect(await withdrawer.thresholdToken()).to.be.equal(USDC)
      expect(await withdrawer.thresholdAmount()).to.be.equal(toUSDC(1000))
    })

    it('sets the expected limits', async () => {
      expect(await withdrawer.txCostLimit()).to.be.equal(0)
      expect(await withdrawer.gasPriceLimit()).to.be.equal(100e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await withdrawer.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await withdrawer.isRelayer(manager)).to.be.false
      }
    })
  })
}
