import { MONTH, toUSDC } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { ParaswapFeeRedistributorWithdrawerDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'

export default function itDeploysParaswapFeeRedistributorWithdrawerCorrectly(): void {
  let input: ParaswapFeeRedistributorWithdrawerDeployment
  let smartVault: Contract, withdrawer: Contract

  before('load input', async function () {
    input = this.task.input() as ParaswapFeeRedistributorWithdrawerDeployment
  })

  before('load instances', async function () {
    smartVault = await this.task.instanceAt('SmartVault', input.params.smartVault)
    withdrawer = await this.task.deployedInstance('Withdrawer')
  })

  describe('smart vault', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(smartVault, [
        {
          name: 'owner',
          account: input.params.owner,
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
        { name: 'mimic', account: input.admin, roles: ['authorize', 'unauthorize', 'setFeeCollector'] },
        { name: 'withdrawer', account: withdrawer, roles: ['withdraw'] },
        { name: 'relayer', account: input.params.relayer, roles: [] },
      ])
    })
  })

  describe('withdrawer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(withdrawer, [
        {
          name: 'owner',
          account: input.params.owner,
          roles: [
            'authorize',
            'unauthorize',
            'setLimits',
            'setRelayer',
            'setThreshold',
            'setTimeLock',
            'setRecipient',
            'call',
          ],
        },
        { name: 'mimic', account: input.admin, roles: ['authorize', 'unauthorize'] },
        { name: 'relayer', account: input.params.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await withdrawer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected recipient', async () => {
      expect(await withdrawer.recipient()).to.be.equal(input.params.owner)
    })

    it('sets the expected time-lock', async () => {
      expect(await withdrawer.period()).to.be.equal(MONTH)
      expect(await withdrawer.nextResetTime()).not.to.be.eq(0)
    })

    it('sets the expected token threshold params', async () => {
      expect(await withdrawer.thresholdToken()).to.be.equal(USDC)
      expect(await withdrawer.thresholdAmount()).to.be.equal(toUSDC(500))
    })

    it('sets the expected gas limits', async () => {
      expect(await withdrawer.gasPriceLimit()).to.be.equal(50e9)
      expect(await withdrawer.txCostLimit()).to.be.equal(0)
    })

    it('whitelists the requested relayer', async () => {
      expect(await withdrawer.isRelayer(input.params.relayer)).to.be.true
    })
  })
}
