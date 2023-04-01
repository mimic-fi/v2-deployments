import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { MimicFeeCollectorFunderV2Deployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itDeploysMimicFeeCollectorFunderV2Correctly(): void {
  let input: MimicFeeCollectorFunderV2Deployment
  let smartVault: Contract, holder: Contract, funderV1: Contract, funderV2: Contract
  let manager: Contract, owner: string, bot: string, managers: string[]

  before('load accounts', async function () {
    input = this.task.input() as MimicFeeCollectorFunderV2Deployment
    ;({ owner, managers, relayer: bot } = input)
  })

  before('load instances', async function () {
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    holder = await this.task.inputDeployedInstance('Holder')
    funderV1 = await this.task.inputDeployedInstance('Funder')
    funderV2 = await this.task.deployedInstance('FunderV2')
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
        { name: 'funder v2', account: funderV2, roles: ['swap', 'unwrap', 'withdraw'] },
        { name: 'holder', account: holder, roles: ['wrap', 'swap'] },
        { name: 'managers', account: managers, roles: [] },
      ])
    })
  })

  describe('funder v2', () => {
    it('sets its permissions correctly', async () => {
      await assertPermissions(funderV2, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: ['setSmartVault', 'setTokenIn', 'setMaxSlippage', 'setBalanceLimits', 'setRecipient', 'call'],
        },
        { name: 'bot', account: bot, roles: ['call'] },
        { name: 'funder v1', account: funderV1, roles: [] },
        { name: 'funder v2', account: funderV2, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await funderV2.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token in', async () => {
      expect(await funderV2.tokenIn()).to.be.equal(await funderV1.tokenIn())
    })

    it('sets the expected token balance limits', async () => {
      expect(await funderV2.minBalance()).to.be.equal(await funderV1.minBalance())
      expect(await funderV2.maxBalance()).to.be.equal(await funderV1.maxBalance())
    })

    it('sets the requested max slippage', async () => {
      expect(await funderV2.maxSlippage()).to.be.equal(await funderV1.maxSlippage())
    })

    it('sets the requested recipient', async () => {
      expect(await funderV2.recipient()).to.be.equal(await funderV1.recipient())
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
        { name: 'funder v2', account: funderV2, roles: [] },
        { name: 'holder', account: holder, roles: [] },
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
        { name: 'funder v2', account: funderV2, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })
  })
}
