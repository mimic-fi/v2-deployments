import { fp, HOUR, impersonate, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { USD } from '../../../constants/chainlink/denominations'
import { assertPermissions } from '../../../src/asserts'
import { BalancerFeeCollectorL2Deployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const WETH = '0x4200000000000000000000000000000000000006'
const DAI = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'
const USDC = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'

const CHAINLINK_ORACLE_ETH_USD = '0x13e3Ee699D1909E989722E753853AE30b17e08c5'
const CHAINLINK_ORACLE_USDC_USD = '0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3'
const CHAINLINK_ORACLE_DAI_USD = '0x8dBa75e83DA73cc766A7e5a0ee71F656BAb470d6'

const HOP_ETH_AMM = '0x86cA30bEF97fB651b8d866D45503684b90cb3312'
const HOP_DAI_AMM = '0xb3C68a491608952Cb1257FC9909a537a0173b63B'
const HOP_USDC_AMM = '0x2ad09850b0CA4c7c1B33f5AcD6cBAbCaB5d6e796'

export default function itDeploysBalancerFeeCollectorCorrectly(): void {
  let input: BalancerFeeCollectorL2Deployment
  let smartVault: Contract, manager: Contract
  let claimer: Contract, oneInchSwapper: Contract, paraswapSwapper: Contract, bridger: Contract
  let owner: string, mimic: string, relayers: string[], managers: string[], feeCollector: string

  before('load accounts', async function () {
    input = this.task.input() as BalancerFeeCollectorL2Deployment
    ;({ owner, mimic, managers, relayers, feeCollector } = input.accounts)
  })

  before('load instances', async function () {
    manager = await this.task.deployedInstance('PermissionsManager')
    claimer = await this.task.deployedInstance('Claimer')
    oneInchSwapper = await this.task.deployedInstance('OneInchSwapper')
    paraswapSwapper = await this.task.deployedInstance('ParaswapSwapper')
    bridger = await this.task.deployedInstance('L2HopBridger')
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
        { name: 'bridger', account: bridger, roles: [] },
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
        { name: 'bridger', account: bridger, roles: ['bridge', 'withdraw'] },
        { name: '1inch swapper', account: oneInchSwapper, roles: ['swap', 'withdraw'] },
        { name: 'psp swapper', account: paraswapSwapper, roles: ['swap', 'withdraw'] },
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

    it('sets a swap connector', async function () {
      expect(await smartVault.swapConnector()).to.be.equal(input.params.smartVaultParams.swapConnector)
    })

    it('sets a bridge connector', async function () {
      expect(await smartVault.bridgeConnector()).to.be.equal(input.params.smartVaultParams.bridgeConnector)
    })

    it('sets the expected price feeds', async function () {
      expect(await smartVault.getPriceFeed(DAI, USD)).to.be.equal(CHAINLINK_ORACLE_DAI_USD)
      expect(await smartVault.getPriceFeed(USDC, USD)).to.be.equal(CHAINLINK_ORACLE_USDC_USD)
      expect(await smartVault.getPriceFeed(WETH, USD)).to.be.equal(CHAINLINK_ORACLE_ETH_USD)
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
        { name: 'bridger', account: bridger, roles: [] },
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
      expect(await claimer.protocolFeeWithdrawer()).to.be.equal('0x7f4b5250C63E24360055342D2a4427079290F044')
    })

    it('sets the expected token threshold params', async () => {
      expect(await claimer.thresholdToken()).to.be.equal(USDC)
      expect(await claimer.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected limits', async () => {
      expect(await claimer.txCostLimit()).to.be.equal(0)
      expect(await claimer.gasPriceLimit()).to.be.equal(0.5e9)
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
        { name: 'bridger', account: bridger, roles: [] },
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
      expect(await oneInchSwapper.getDeniedTokens()).to.be.empty
    })

    it('sets the expected token threshold params', async () => {
      expect(await oneInchSwapper.thresholdToken()).to.be.equal(USDC)
      expect(await oneInchSwapper.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected gas limits', async () => {
      expect(await oneInchSwapper.txCostLimit()).to.be.equal(0)
      expect(await oneInchSwapper.gasPriceLimit()).to.be.equal(0.5e9)
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
        { name: 'bridger', account: bridger, roles: [] },
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
      expect(await oneInchSwapper.getDeniedTokens()).to.be.empty
    })

    it('sets the expected token threshold params', async () => {
      expect(await paraswapSwapper.thresholdToken()).to.be.equal(USDC)
      expect(await paraswapSwapper.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected gas limits', async () => {
      expect(await paraswapSwapper.txCostLimit()).to.be.equal(0)
      expect(await paraswapSwapper.gasPriceLimit()).to.be.equal(0.5e9)
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

  describe('bridger', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(bridger, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setThreshold',
            'setMaxSlippage',
            'setMaxDeadline',
            'setMaxBonderFeePct',
            'setDestinationChainId',
            'setTokenAmm',
            'transferToSmartVault',
            'call',
          ],
        },
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await bridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token threshold params', async () => {
      expect(await bridger.thresholdToken()).to.be.equal(USDC)
      expect(await bridger.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected gas limits', async () => {
      expect(await bridger.txCostLimit()).to.be.equal(0)
      expect(await bridger.gasPriceLimit()).to.be.equal(0.5e9)
    })

    it('allows the requested destination chain ID', async () => {
      expect(await bridger.destinationChainId()).to.be.equal(1)
    })

    it('sets the requested AMMs', async () => {
      expect(await bridger.getTokenAmm(DAI)).to.be.equal(HOP_DAI_AMM)
      expect(await bridger.getTokenAmm(USDC)).to.be.equal(HOP_USDC_AMM)
      expect(await bridger.getTokenAmm(WETH)).to.be.equal(HOP_ETH_AMM)
    })

    it('sets the requested maximums', async () => {
      expect(await bridger.maxDeadline()).to.be.equal(HOUR)
      expect(await bridger.maxSlippage()).to.be.equal(fp(0.002))
      expect(await bridger.maxBonderFeePct()).to.be.equal(fp(0.5))
    })

    it('allows the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await bridger.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await bridger.isRelayer(manager)).to.be.false
      }
    })

    it('can authorize bridger methods', async () => {
      const who = mimic
      const what = bridger.interface.getSighash('call')
      expect(await bridger.isAuthorized(who, what)).to.be.false

      const requests = [{ target: bridger.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await bridger.isAuthorized(who, what)).to.be.true
    })
  })
}
