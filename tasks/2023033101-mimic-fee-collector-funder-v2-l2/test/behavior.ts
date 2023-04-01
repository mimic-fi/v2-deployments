import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { MimicFeeCollectorFunderV2Deployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itDeploysMimicFeeCollectorFunderV2Correctly(): void {
  let input: MimicFeeCollectorFunderV2Deployment
  let smartVault: Contract, holder: Contract, funderV1: Contract, bridger: Contract
  let manager: Contract, relayerFunder: Contract, deployerFunder: Contract
  let owner: string, bot: string, managers: string[]

  before('load accounts', async function () {
    input = this.task.input() as MimicFeeCollectorFunderV2Deployment
    ;({ owner, managers, relayer: bot } = input)
  })

  before('load instances', async function () {
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    bridger = await this.task.inputDeployedInstance('L2HopBridger')
    holder = await this.task.inputDeployedInstance('Holder')
    funderV1 = await this.task.inputDeployedInstance('Funder')
    relayerFunder = await this.task.deployedInstance('RelayerFunder', 'FunderV2')
    deployerFunder = await this.task.deployedInstance('DeployerFunder', 'FunderV2')
    manager = await this.task.deployedInstance('PermissionsManager')
  })

  describe('smart vault', () => {
    it('has set its permissions correctly', async () => {
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
            'setFeeCollector',
            'setSwapConnector',
            'setBridgeConnector',
            'setSwapFee',
            'setBridgeFee',
            'setPerformanceFee',
            'setWithdrawFee',
          ],
        },
        { name: 'funder v1', account: funderV1, roles: [] },
        { name: 'relayer funder', account: relayerFunder, roles: ['swap', 'unwrap', 'withdraw'] },
        { name: 'deployer funder', account: deployerFunder, roles: ['swap', 'unwrap', 'withdraw'] },
        { name: 'holder', account: holder, roles: ['wrap', 'swap'] },
        { name: 'bridger', account: bridger, roles: ['bridge'] },
        { name: 'managers', account: managers, roles: [] },
      ])
    })
  })

  describe('relayer funder', () => {
    it('sets its permissions correctly', async () => {
      await assertPermissions(relayerFunder, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: ['setSmartVault', 'setTokenIn', 'setMaxSlippage', 'setBalanceLimits', 'setRecipient', 'call'],
        },
        { name: 'bot', account: bot, roles: ['call'] },
        { name: 'funder v1', account: funderV1, roles: [] },
        { name: 'relayer funder', account: relayerFunder, roles: [] },
        { name: 'deployer funder', account: deployerFunder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await relayerFunder.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token in', async () => {
      expect(await relayerFunder.tokenIn()).to.be.equal(await funderV1.tokenIn())
    })

    it('sets the expected token balance limits', async () => {
      expect(await relayerFunder.minBalance()).to.be.equal(await funderV1.minBalance())
      expect(await relayerFunder.maxBalance()).to.be.equal(await funderV1.maxBalance())
    })

    it('sets the requested max slippage', async () => {
      expect(await relayerFunder.maxSlippage()).to.be.equal(await funderV1.maxSlippage())
    })

    it('sets the requested recipient', async () => {
      expect(await relayerFunder.recipient()).to.be.equal(await funderV1.recipient())
    })
  })

  describe('deployer funder', () => {
    it('sets its permissions correctly', async () => {
      await assertPermissions(deployerFunder, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: ['setSmartVault', 'setTokenIn', 'setMaxSlippage', 'setBalanceLimits', 'setRecipient', 'call'],
        },
        { name: 'bot', account: bot, roles: ['call'] },
        { name: 'funder v1', account: funderV1, roles: [] },
        { name: 'relayer funder', account: relayerFunder, roles: [] },
        { name: 'deployer funder', account: deployerFunder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await deployerFunder.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token in', async () => {
      expect(await deployerFunder.tokenIn()).to.be.equal(await funderV1.tokenIn())
    })

    it('sets the expected token balance limits', async () => {
      expect(await deployerFunder.minBalance()).to.be.equal(await funderV1.minBalance())
      expect(await deployerFunder.maxBalance()).to.be.equal(await funderV1.maxBalance())
    })

    it('sets the requested max slippage', async () => {
      expect(await deployerFunder.maxSlippage()).to.be.equal(await funderV1.maxSlippage())
    })

    it('sets the requested recipient', async () => {
      expect(await deployerFunder.recipient()).to.be.equal(input.from)
    })
  })

  describe('funder v1', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(funderV1, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: ['setSmartVault', 'setTokenIn', 'setMaxSlippage', 'setBalanceLimits', 'setRecipient'],
        },
        { name: 'bot', account: bot, roles: [] },
        { name: 'funder v1', account: funderV1, roles: [] },
        { name: 'relayer funder', account: relayerFunder, roles: [] },
        { name: 'deployer funder', account: deployerFunder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: [] },
      ])
    })
  })

  describe('holder', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(holder, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: ['setSmartVault', 'setThreshold', 'setMaxSlippage', 'setTokenOut', 'call'],
        },
        { name: 'bot', account: bot, roles: ['call'] },
        { name: 'funder v1', account: funderV1, roles: [] },
        { name: 'relayer funder', account: relayerFunder, roles: [] },
        { name: 'deployer funder', account: deployerFunder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })
  })

  describe('bridger', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(bridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: [
            'setSmartVault',
            'setThreshold',
            'setMaxSlippage',
            'setMaxDeadline',
            'setMaxDeadline',
            'setMaxBonderFeePct',
            'setAllowedChain',
            'setTokenAmm',
            'call',
          ],
        },
        { name: 'funder v1', account: funderV1, roles: [] },
        { name: 'relayer funder', account: relayerFunder, roles: [] },
        { name: 'deployer funder', account: deployerFunder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })
  })
}
