import { bn, currentTimestamp, DAY, fp } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'

/* eslint-disable no-secrets/no-secrets */

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const MANA = '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'

import { DecentralandSwapperV2Deployment } from '../input'

export default function itDeploysDecentralandSwapperV2Properly(): void {
  let input: DecentralandSwapperV2Deployment
  let smartVault: Contract, dexSwapper: Contract
  let owner: string, relayers: string[]

  before('load input', async function () {
    input = this.task.input() as DecentralandSwapperV2Deployment
    owner = input.params.admin
    relayers = [input.params.relayer]
  })

  before('load instances', async function () {
    smartVault = await this.task.instanceAt('ISmartVault', input.params.smartVault)
    dexSwapper = await this.task.deployedInstance('DEXSwapperV2')
  })

  describe('smart vault', () => {
    it('does not set permissions on the smart vault', async () => {
      await assertPermissions(smartVault, [{ name: 'dexSwapper', account: dexSwapper, roles: [] }])
    })
  })

  describe('DEX swapper v2', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(dexSwapper, [
        { name: 'owner', account: owner, roles: ['authorize', 'unauthorize'] },
        { name: 'dexSwapper', account: dexSwapper, roles: [] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await dexSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected swapper params', async function () {
      expect(await dexSwapper.tokenIn()).to.be.equal(MANA)
      expect(await dexSwapper.tokenOut()).to.be.equal(DAI)
      expect(await dexSwapper.maxSlippage()).to.be.equal(fp(0.005))
    })

    it('sets the expected swap limit params', async function () {
      const swapLimit = await dexSwapper.swapLimit()
      expect(swapLimit.token).to.be.equal(MANA)
      expect(swapLimit.amount).to.be.equal(fp(30e3))
      expect(swapLimit.period).to.be.equal(DAY)
      expect(swapLimit.accrued).to.be.equal(0)
      expect(swapLimit.nextResetTime).to.be.equal((await currentTimestamp()).add(DAY))
    })

    it('sets the expected threshold', async function () {
      expect(await dexSwapper.thresholdToken()).to.be.equal(MANA)
      expect(await dexSwapper.thresholdAmount()).to.be.equal(fp(100))
    })

    it('sets the expected gas limits', async function () {
      expect(await dexSwapper.gasPriceLimit()).to.be.equal(bn(50e9))
      expect(await dexSwapper.payingGasToken()).to.be.equal(DAI)
      expect(await dexSwapper.totalCostLimit()).to.be.equal(0)
    })

    it('whitelists the requested relayers', async function () {
      for (const relayer of relayers) {
        expect(await dexSwapper.isRelayer(relayer)).to.be.true
      }
    })
  })
}
