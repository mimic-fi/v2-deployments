import { fp, impersonate, MONTH, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { BalancerFeeCollectorL1Deployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const BAL = '0xba100000625a3754423978a60c9317c58a424e3D'
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const CHAINLINK_ORACLE_BAL_ETH = '0xC1438AA3823A6Ba0C159CfA8D98dF5A994bA120b'
const CHAINLINK_ORACLE_DAI_ETH = '0x773616E4d11A78F511299002da57A0a94577F1f4'
const CHAINLINK_ORACLE_USDC_ETH = '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'

export default function itDeploysBalancerFeeCollectorCorrectly(): void {
  let input: BalancerFeeCollectorL1Deployment
  let smartVault: Contract, manager: Contract
  let claimer: Contract, oneInchSwapper: Contract, paraswapSwapper: Contract, withdrawer: Contract
  let owner: string, mimic: string, relayers: string[], managers: string[], feeCollector: string

  before('load accounts', async function () {
    input = this.task.input() as BalancerFeeCollectorL1Deployment
    ;({ owner, mimic, managers, relayers, feeCollector } = input.accounts)
  })

  before('load instances', async function () {
    manager = await this.task.deployedInstance('PermissionsManager')
    claimer = await this.task.deployedInstance('Claimer')
    oneInchSwapper = await this.task.deployedInstance('OneInchSwapper')
    paraswapSwapper = await this.task.deployedInstance('ParaswapSwapper')
    withdrawer = await this.task.deployedInstance('Withdrawer')
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  describe('permissions manager', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(manager, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: owner, roles: ['execute'] },
        { name: 'mimic', account: mimic, roles: ['execute'] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })
  })

  describe('smart vault', () => {
    it('has the expected address', async function () {
      expect(smartVault.address).to.be.equal('0x94Dd9C6152a2A0BBcB52d3297b723A6F01D5F9f7')
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
          ],
        },
        { name: 'mimic', account: mimic, roles: ['setFeeCollector'] },
        { name: 'claimer', account: claimer, roles: ['call', 'withdraw'] },
        { name: '1inch swapper', account: oneInchSwapper, roles: ['swap', 'withdraw'] },
        { name: 'psp swapper', account: paraswapSwapper, roles: ['swap', 'withdraw'] },
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

      expect(withdrawFee.pct).to.be.equal(fp(0.002))
      expect(withdrawFee.cap).to.be.equal(toUSDC(10000))
      expect(withdrawFee.token).to.be.equal(USDC)
      expect(withdrawFee.period).to.be.equal(MONTH)
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
      expect(await smartVault.getPriceFeed(BAL, WETH)).to.be.equal(CHAINLINK_ORACLE_BAL_ETH)
      expect(await smartVault.getPriceFeed(DAI, WETH)).to.be.equal(CHAINLINK_ORACLE_DAI_ETH)
      expect(await smartVault.getPriceFeed(USDC, WETH)).to.be.equal(CHAINLINK_ORACLE_USDC_ETH)
    })
  })

  describe('claimer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(claimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setThreshold',
            'setOracleSigner',
            'setProtocolFeeWithdrawer',
            'call',
          ],
        },
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await claimer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper oracle signer', async () => {
      expect(await claimer.isOracleSigner(relayers[0])).to.be.true
    })

    it('sets the proper protocol fee withdrawer', async () => {
      expect(await claimer.protocolFeeWithdrawer()).to.be.equal('0x5ef4c5352882b10893b70DbcaA0C000965bd23c5')
    })

    it('sets the expected token threshold params', async () => {
      expect(await claimer.thresholdToken()).to.be.equal(USDC)
      expect(await claimer.thresholdAmount()).to.be.equal(toUSDC(5000))
    })

    it('sets the expected limits', async () => {
      expect(await claimer.txCostLimit()).to.be.equal(0)
      expect(await claimer.gasPriceLimit()).to.be.equal(100e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await claimer.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await claimer.isRelayer(manager)).to.be.false
      }
    })

    it('can authorize claimer methods', async () => {
      const who = mimic
      const what = claimer.interface.getSighash('call')
      expect(await claimer.isAuthorized(who, what)).to.be.false

      const requests = [{ target: claimer.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await claimer.isAuthorized(who, what)).to.be.true
    })
  })

  describe('1inch swapper', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(oneInchSwapper, [
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
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await oneInchSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected signer', async () => {
      expect(await oneInchSwapper.swapSigner()).to.be.equal('0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA')
    })

    it('sets the expected slippages', async () => {
      expect(await oneInchSwapper.defaultMaxSlippage()).to.be.equal(fp(0.002))
      expect(await oneInchSwapper.getTokenSlippage(USDC)).to.be.equal(fp(0.002))
    })

    it('sets the expected denied tokens', async () => {
      expect(await oneInchSwapper.isTokenDenied(USDC)).to.be.false
    })

    it('sets the expected token threshold params', async () => {
      expect(await oneInchSwapper.thresholdToken()).to.be.equal(USDC)
      expect(await oneInchSwapper.thresholdAmount()).to.be.equal(toUSDC(5000))
    })

    it('sets the expected gas limits', async () => {
      expect(await oneInchSwapper.txCostLimit()).to.be.equal(0)
      expect(await oneInchSwapper.gasPriceLimit()).to.be.equal(100e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await oneInchSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await oneInchSwapper.isRelayer(manager)).to.be.false
      }
    })

    it('can authorize 1inch swapper methods', async () => {
      const who = mimic
      const what = oneInchSwapper.interface.getSighash('call')
      expect(await oneInchSwapper.isAuthorized(who, what)).to.be.false

      const requests = [{ target: oneInchSwapper.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await oneInchSwapper.isAuthorized(who, what)).to.be.true
    })
  })

  describe('paraswap swapper', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(paraswapSwapper, [
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
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await paraswapSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected signer', async () => {
      expect(await paraswapSwapper.swapSigner()).to.be.equal('0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA')
    })

    it('sets the expected slippages', async () => {
      expect(await paraswapSwapper.defaultMaxSlippage()).to.be.equal(fp(0.002))
      expect(await paraswapSwapper.getTokenSlippage(USDC)).to.be.equal(fp(0.002))
    })

    it('sets the expected denied tokens', async () => {
      const deniedTokens = await oneInchSwapper.getDeniedTokens()
      expect(deniedTokens).to.be.have.lengthOf(1)
      expect(deniedTokens[0]).to.be.equal(BAL)
    })

    it('sets the expected token threshold params', async () => {
      expect(await paraswapSwapper.thresholdToken()).to.be.equal(USDC)
      expect(await paraswapSwapper.thresholdAmount()).to.be.equal(toUSDC(5000))
    })

    it('sets the expected gas limits', async () => {
      expect(await paraswapSwapper.txCostLimit()).to.be.equal(0)
      expect(await paraswapSwapper.gasPriceLimit()).to.be.equal(100e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await paraswapSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await paraswapSwapper.isRelayer(manager)).to.be.false
      }
    })

    it('can authorize paraswap swapper methods', async () => {
      const who = mimic
      const what = paraswapSwapper.interface.getSighash('call')
      expect(await paraswapSwapper.isAuthorized(who, what)).to.be.false

      const requests = [{ target: paraswapSwapper.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await paraswapSwapper.isAuthorized(who, what)).to.be.true
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
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await withdrawer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the owner as the recipient', async () => {
      expect(await withdrawer.recipient()).to.be.equal('0xe649B71783d5008d10a96b6871e3840a398d4F06')
    })

    it('sets the expected token threshold params', async () => {
      expect(await withdrawer.thresholdToken()).to.be.equal(USDC)
      expect(await withdrawer.thresholdAmount()).to.be.equal(toUSDC(10))
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

    it('can authorize withdrawer methods', async () => {
      const who = mimic
      const what = withdrawer.interface.getSighash('call')
      expect(await withdrawer.isAuthorized(who, what)).to.be.false

      const requests = [{ target: withdrawer.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await withdrawer.isAuthorized(who, what)).to.be.true
    })
  })
}
