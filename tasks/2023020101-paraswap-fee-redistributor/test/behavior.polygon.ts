import { fp, MONTH, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { USD } from '../../../constants/chainlink/denominations'
import { assertPermissions } from '../../../src/asserts'
import { ParaswapFeeRedistributorDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const PSP = '0x42d61d766b85431666b39b89c43011f24451bff6'
const USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
const WMATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'

const CHAINLINK_USDC_USD = '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7'
const CHAINLINK_MATIC_USD = '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0'

const FEE_CLAIMER = '0x8b5cF413214CA9348F047D1aF402Db1b4E96c060'
const SWAP_SIGNER = '0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA'

export default function itDeploysParaswapFeeRedistributorCorrectly(): void {
  let input: ParaswapFeeRedistributorDeployment
  let smartVault: Contract, erc20Claimer: Contract, nativeClaimer: Contract, swapFeeSetter: Contract
  let owner: string, relayers: string[], managers: string[], feeCollector: string, mimicAdmin: string

  before('load accounts', async function () {
    input = this.task.input() as ParaswapFeeRedistributorDeployment
    ;({ owner, managers, relayers, feeCollector, mimicAdmin } = input.accounts)
  })

  before('load instances', async function () {
    erc20Claimer = await this.task.deployedInstance('ERC20Claimer')
    nativeClaimer = await this.task.deployedInstance('NativeClaimer')
    swapFeeSetter = await this.task.deployedInstance('SwapFeeSetter')
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  describe('smart vault', () => {
    it('has set its permissions correctly', async () => {
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
            'bridge',
            'setStrategy',
            'setPriceFeed',
            'setPriceFeeds',
            'setPriceOracle',
            'setSwapConnector',
            'setBridgeConnector',
            'setBridgeFee',
            'setWithdrawFee',
            'setPerformanceFee',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: ['authorize', 'unauthorize', 'setFeeCollector'] },
        { name: 'erc20Claimer', account: erc20Claimer, roles: ['call', 'swap', 'withdraw'] },
        { name: 'nativeClaimer', account: nativeClaimer, roles: ['call', 'wrap', 'withdraw'] },
        { name: 'swapFeeSetter', account: swapFeeSetter, roles: ['setSwapFee', 'withdraw'] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })

    it('sets a fee collector', async () => {
      expect(await smartVault.feeCollector()).to.be.equal(feeCollector)
    })

    it('does not set a swap fee', async () => {
      const swapFee = await smartVault.swapFee()

      expect(swapFee.pct).to.be.equal(0)
      expect(swapFee.cap).to.be.equal(0)
      expect(swapFee.token).to.be.equal(ZERO_ADDRESS)
      expect(swapFee.period).to.be.equal(0)
    })

    it('does not set a bridge fee', async () => {
      const bridgeFee = await smartVault.bridgeFee()

      expect(bridgeFee.pct).to.be.equal(0)
      expect(bridgeFee.cap).to.be.equal(0)
      expect(bridgeFee.token).to.be.equal(ZERO_ADDRESS)
      expect(bridgeFee.period).to.be.equal(0)
    })

    it('does not set a withdraw fee', async () => {
      const withdrawFee = await smartVault.withdrawFee()

      expect(withdrawFee.pct).to.be.equal(0)
      expect(withdrawFee.cap).to.be.equal(0)
      expect(withdrawFee.token).to.be.equal(ZERO_ADDRESS)
      expect(withdrawFee.period).to.be.equal(0)
    })

    it('does not set a performance fee', async () => {
      const performanceFee = await smartVault.performanceFee()

      expect(performanceFee.pct).to.be.equal(0)
      expect(performanceFee.cap).to.be.equal(0)
      expect(performanceFee.token).to.be.equal(ZERO_ADDRESS)
      expect(performanceFee.period).to.be.equal(0)
    })

    it('sets a price oracle', async () => {
      expect(await smartVault.priceOracle()).to.be.equal(input.params.smartVaultParams.priceOracle)
    })

    it('sets a swap connector', async () => {
      expect(await smartVault.swapConnector()).to.be.equal(input.params.smartVaultParams.swapConnector)
    })

    it('sets a bridge connector', async () => {
      expect(await smartVault.bridgeConnector()).to.be.equal(input.params.smartVaultParams.bridgeConnector)
    })

    it('sets the expected price feeds', async function () {
      expect(await smartVault.getPriceFeed(USDC, USD)).to.be.equal(CHAINLINK_USDC_USD)
      expect(await smartVault.getPriceFeed(WMATIC, USD)).to.be.equal(CHAINLINK_MATIC_USD)
    })
  })

  describe('erc20 claimer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(erc20Claimer, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setSwapSigner',
            'setMaxSlippage',
            'setIgnoreTokenSwaps',
            'setFeeClaimer',
            'setThreshold',
            'call',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: ['authorize', 'unauthorize'] },
        { name: 'erc20Claimer', account: erc20Claimer, roles: [] },
        { name: 'nativeClaimer', account: nativeClaimer, roles: [] },
        { name: 'swapFeeSetter', account: swapFeeSetter, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await erc20Claimer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected fee claimer params', async () => {
      expect(await erc20Claimer.maxSlippage()).to.be.equal(fp(0.005))
      expect(await erc20Claimer.swapSigner()).to.be.equal(SWAP_SIGNER)
      expect(await erc20Claimer.feeClaimer()).to.be.equal(FEE_CLAIMER)
      expect(await erc20Claimer.isTokenSwapIgnored(PSP)).to.be.true
    })

    it('sets the expected token threshold params', async () => {
      expect(await erc20Claimer.thresholdToken()).to.be.equal(USDC)
      expect(await erc20Claimer.thresholdAmount()).to.be.equal(toUSDC(100))
    })

    it('sets the expected gas limits', async () => {
      expect(await erc20Claimer.gasPriceLimit()).to.be.equal(200e9)
      expect(await erc20Claimer.txCostLimit()).to.be.equal(0)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await erc20Claimer.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await erc20Claimer.isRelayer(manager)).to.be.false
      }
    })
  })

  describe('native claimer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(nativeClaimer, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setFeeClaimer',
            'setThreshold',
            'call',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: ['authorize', 'unauthorize'] },
        { name: 'erc20Claimer', account: erc20Claimer, roles: [] },
        { name: 'nativeClaimer', account: nativeClaimer, roles: [] },
        { name: 'swapFeeSetter', account: swapFeeSetter, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await nativeClaimer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected gas limits', async () => {
      expect(await nativeClaimer.gasPriceLimit()).to.be.equal(200e9)
      expect(await nativeClaimer.txCostLimit()).to.be.equal(0)
    })

    it('sets the expected fee claimer params', async () => {
      expect(await nativeClaimer.feeClaimer()).to.be.equal(FEE_CLAIMER)
    })

    it('sets the expected token threshold params', async () => {
      expect(await nativeClaimer.thresholdToken()).to.be.equal(USDC)
      expect(await nativeClaimer.thresholdAmount()).to.be.equal(toUSDC(100))
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await nativeClaimer.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await nativeClaimer.isRelayer(manager)).to.be.false
      }
    })
  })

  describe('swap fee setter', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(swapFeeSetter, [
        {
          name: 'owner',
          account: owner,
          roles: ['authorize', 'unauthorize', 'setSmartVault', 'setRelayer', 'setLimits', 'setTimeLock', 'call'],
        },
        { name: 'mimic', account: mimicAdmin, roles: ['authorize', 'unauthorize', 'call'] },
        { name: 'erc20Claimer', account: erc20Claimer, roles: [] },
        { name: 'nativeClaimer', account: nativeClaimer, roles: [] },
        { name: 'swapFeeSetter', account: swapFeeSetter, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await swapFeeSetter.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected time-lock', async () => {
      expect(await swapFeeSetter.period()).to.be.equal(3 * MONTH)
      expect(await swapFeeSetter.nextResetTime()).not.to.be.eq(0)
    })

    it('sets the expected fees', async () => {
      const fee0 = await swapFeeSetter.fees(0)
      expect(fee0.pct).to.be.equal(0)
      expect(fee0.cap).to.be.equal(0)
      expect(fee0.token).to.be.equal(ZERO_ADDRESS)
      expect(fee0.period).to.be.equal(0)

      const fee1 = await swapFeeSetter.fees(1)
      expect(fee1.pct).to.be.equal(fp(0.005))
      expect(fee1.cap).to.be.equal(toUSDC(5000))
      expect(fee1.token).to.be.equal(USDC)
      expect(fee1.period).to.be.equal(MONTH)

      const fee2 = await swapFeeSetter.fees(2)
      expect(fee2.pct).to.be.equal(fp(0.01))
      expect(fee2.cap).to.be.equal(toUSDC(5000))
      expect(fee2.token).to.be.equal(USDC)
      expect(fee2.period).to.be.equal(MONTH)

      const fee3 = await swapFeeSetter.fees(3)
      expect(fee3.pct).to.be.equal(fp(0.015))
      expect(fee3.cap).to.be.equal(toUSDC(5000))
      expect(fee3.token).to.be.equal(USDC)
      expect(fee3.period).to.be.equal(MONTH)

      const fee4 = await swapFeeSetter.fees(4)
      expect(fee4.pct).to.be.equal(fp(0.02))
      expect(fee4.cap).to.be.equal(toUSDC(5000))
      expect(fee4.token).to.be.equal(USDC)
      expect(fee4.period).to.be.equal(MONTH)
    })
  })
}
