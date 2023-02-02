import { toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { USD } from '../../../constants/chainlink/denominations'
import { assertPermissions } from '../../../src/asserts'
import { DxDaoWrapperDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'
const WXDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'

const CHAINLINK_DAI_USD = '0x678df3415fc31947dA4324eC63212874be5a82f8'
const CHAINLINK_USDC_USD = '0x26C31ac71010aF62E6B486D1132E266D6298857D'

export default function itDeploysDxdaoWrapperV2Properly(): void {
  let input: DxDaoWrapperDeployment
  let smartVault: Contract, wrapper: Contract
  let owner: string, managers: string[], relayers: string[], feeCollector: string, mimicAdmin: string

  before('load accounts', async function () {
    input = this.task.input() as DxDaoWrapperDeployment
    ;({ owner, managers, relayers, feeCollector, mimicAdmin } = input.accounts)
  })

  before('load instances', async function () {
    wrapper = await this.task.deployedInstance('Wrapper')
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
            'setSwapFee',
            'setBridgeFee',
            'setPerformanceFee',
            'setWithdrawFee',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: ['setFeeCollector'] },
        { name: 'wrapper', account: wrapper, roles: ['wrap', 'withdraw'] },
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
      expect(await smartVault.getPriceFeed(WXDAI, USD)).to.be.equal(CHAINLINK_DAI_USD)
      expect(await smartVault.getPriceFeed(USDC, USD)).to.be.equal(CHAINLINK_USDC_USD)
    })
  })

  describe('wrapper', () => {
    it('has set its permissions correctly', async () => {
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
            'transferToSmartVault',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: [] },
        { name: 'wrapper', account: wrapper, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await wrapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the owner as the recipient', async () => {
      expect(await wrapper.recipient()).to.be.equal(owner)
    })

    it('sets the expected token threshold params', async () => {
      expect(await wrapper.thresholdToken()).to.be.equal(USDC)
      expect(await wrapper.thresholdAmount()).to.be.equal(toUSDC(200))
    })

    it('sets the expected gas limits', async () => {
      expect(await wrapper.txCostLimit()).to.be.equal(0)
      expect(await wrapper.gasPriceLimit()).to.be.equal(40e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await wrapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await wrapper.isRelayer(manager)).to.be.false
      }
    })
  })
}
