import { bn, fp, impersonate, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { expect } from 'chai'
import { BigNumber, Contract } from 'ethers'
import { defaultAbiCoder } from 'ethers/lib/utils'

import { assertPermissions, assertRelayedBaseCost } from '../../../src/asserts'

/* eslint-disable no-secrets/no-secrets */

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const MANA = '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const CHAINLINK_ORACLE_DAI_ETH = '0x773616E4d11A78F511299002da57A0a94577F1f4'
const CHAINLINK_ORACLE_MANA_ETH = '0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9'

const WHALE = '0x9A6ebE7E2a7722F8200d0ffB63a1F6406A0d7dce'

import { DecentralandManaSwapperDeployment } from '../input'

export default function itDeploysDecentralandManaSwapperCorrectly(): void {
  let input: DecentralandManaSwapperDeployment
  let smartVault: Contract, withdrawer: Contract, dexSwapper: Contract, otcSwapper: Contract
  let owner: string, relayers: string[], managers: string[], feeCollector: string

  before('load accounts', async function () {
    input = this.task.input() as DecentralandManaSwapperDeployment
    ;({ owner, managers, relayers, feeCollector } = input.accounts)
  })

  before('load instances', async function () {
    withdrawer = await this.task.deployedInstance('Withdrawer')
    dexSwapper = await this.task.deployedInstance('DEXSwapper')
    otcSwapper = await this.task.deployedInstance('OTCSwapper')
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  describe('smart vault', () => {
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
            'setWithdrawFee',
            'setSwapFee',
            'setPerformanceFee',
          ],
        },
        { name: 'feeCollector', account: feeCollector, roles: ['setFeeCollector'] },
        { name: 'dexSwapper', account: dexSwapper, roles: ['swap', 'withdraw'] },
        { name: 'otcSwapper', account: otcSwapper, roles: ['collect', 'withdraw'] },
        { name: 'withdrawer', account: withdrawer, roles: ['withdraw'] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })

    it('sets a fee collector', async function () {
      expect(await smartVault.feeCollector()).to.be.equal(feeCollector)
    })

    it('sets a swap fee', async function () {
      const swapFee = await smartVault.swapFee()

      expect(swapFee.pct).to.be.equal(fp(0.01))
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

    it('sets a price feed for WETH-DAI', async function () {
      expect(await smartVault.getPriceFeed(DAI, WETH)).to.be.equal(CHAINLINK_ORACLE_DAI_ETH)
      expect(await smartVault.getPriceFeed(MANA, WETH)).to.be.equal(CHAINLINK_ORACLE_MANA_ETH)
    })
  })

  describe('dex swapper', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(dexSwapper, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setTokenIn',
            'setTokenOut',
            'setMaxSlippage',
            'setThreshold',
            'call',
          ],
        },
        { name: 'dexSwapper', account: dexSwapper, roles: [] },
        { name: 'otcSwapper', account: otcSwapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
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

    it('sets the expected threshold', async function () {
      expect(await dexSwapper.thresholdToken()).to.be.equal(MANA)
      expect(await dexSwapper.thresholdAmount()).to.be.equal(fp(100))
    })

    it('sets the expected gas limits', async function () {
      expect(await dexSwapper.gasPriceLimit()).to.be.equal(bn(50e9))
      expect(await dexSwapper.totalCostLimit()).to.be.equal(0)
      expect(await dexSwapper.payingGasToken()).to.be.equal(DAI)
    })

    it('whitelists the requested relayers', async function () {
      for (const relayer of relayers) {
        expect(await dexSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async function () {
      for (const manager of managers) {
        expect(await dexSwapper.isRelayer(manager)).to.be.false
      }
    })

    describe('call', async function () {
      let bot: SignerWithAddress, mana: Contract, dai: Contract, whale: SignerWithAddress

      const source = 1 // uniswap v3
      const amountIn = fp(200)
      const slippage = fp(0.05) // 5 %
      const data = defaultAbiCoder.encode(['address[]', 'uint24[]'], [[WETH], [3000, 500]])

      before('allow larger slippage', async function () {
        const signer = await impersonate(owner)
        await dexSwapper.connect(signer).setMaxSlippage(slippage)
      })

      before('load accounts', async function () {
        bot = await impersonate(relayers[0], fp(10))
        dai = await this.task.instanceAt('IERC20', DAI)
        mana = await this.task.instanceAt('IERC20', MANA)
        whale = await impersonate(WHALE, fp(100))
      })

      beforeEach('fund smart vault', async function () {
        await mana.connect(whale).transfer(smartVault.address, amountIn)
      })

      it('can swap MANA when passing the threshold', async function () {
        const previousSmartVaultBalance = await dai.balanceOf(smartVault.address)
        const previousFeeCollectorBalance = await dai.balanceOf(feeCollector)

        const tx = await dexSwapper.connect(bot).call(source, amountIn, slippage, data)

        const price = await smartVault.getPrice(MANA, DAI)
        const expectedAmountOut = amountIn.mul(price).div(fp(1))
        const expectedMinAmountOut = expectedAmountOut.sub(expectedAmountOut.mul(slippage).div(fp(1)))

        const currentSmartVaultBalance = await dai.balanceOf(smartVault.address)
        const currentFeeCollectorBalance = await dai.balanceOf(feeCollector)
        const relayedCost = currentFeeCollectorBalance.sub(previousFeeCollectorBalance)
        const receivedAmountOut = currentSmartVaultBalance.sub(previousSmartVaultBalance).add(relayedCost)
        expect(receivedAmountOut).to.be.at.least(expectedMinAmountOut)

        const daiWethPrice = await smartVault.getPrice(DAI, WETH)
        const redeemedCost = currentFeeCollectorBalance.sub(previousFeeCollectorBalance).mul(daiWethPrice).div(fp(1))
        await assertRelayedBaseCost(this.task, tx, redeemedCost, 0.35)
      })
    })
  })

  describe('otc swapper', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(otcSwapper, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setTokenIn',
            'setTokenOut',
            'setMaxSlippage',
            'setThreshold',
            'call',
          ],
        },
        { name: 'dexSwapper', account: dexSwapper, roles: ['call'] },
        { name: 'otcSwapper', account: otcSwapper, roles: ['call'] },
        { name: 'withdrawer', account: withdrawer, roles: ['call'] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await otcSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected swapper params', async function () {
      expect(await otcSwapper.tokenIn()).to.be.equal(DAI)
      expect(await otcSwapper.tokenOut()).to.be.equal(MANA)
      expect(await otcSwapper.maxSlippage()).to.be.equal(fp(0.005))
    })

    it('sets the expected threshold', async function () {
      expect(await otcSwapper.thresholdToken()).to.be.equal(MANA)
      expect(await otcSwapper.thresholdAmount()).to.be.equal(fp(100))
    })

    it('sets the expected gas limits', async function () {
      expect(await otcSwapper.gasPriceLimit()).to.be.equal(bn(50e9))
      expect(await otcSwapper.totalCostLimit()).to.be.equal(0)
      expect(await otcSwapper.payingGasToken()).to.be.equal(DAI)
    })

    it('whitelists the requested relayers', async function () {
      for (const relayer of relayers) {
        expect(await otcSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async function () {
      for (const manager of managers) {
        expect(await otcSwapper.isRelayer(manager)).to.be.false
      }
    })

    describe('call', async function () {
      let expectedAmountOut: BigNumber
      let mana: Contract, dai: Contract, whale: SignerWithAddress

      const amountIn = fp(500)

      before('load accounts', async function () {
        dai = await this.task.instanceAt('IERC20', DAI)
        mana = await this.task.instanceAt('IERC20', MANA)
        whale = await impersonate(WHALE, fp(100))
      })

      beforeEach('fund smart vault', async function () {
        const price = await smartVault.getPrice(DAI, MANA)
        const maxAmountOut = amountIn.mul(price).div(fp(1))
        const maxSlippage = await otcSwapper.maxSlippage()
        expectedAmountOut = maxAmountOut.mul(fp(1).add(maxSlippage)).div(fp(1)) // rounding error
        await mana.connect(whale).transfer(smartVault.address, expectedAmountOut)
      })

      it('can swap MANA when passing the threshold', async function () {
        const previousSenderDaiBalance = await dai.balanceOf(whale.address)
        const previousSenderManaBalance = await mana.balanceOf(whale.address)
        const previousSmartVaultDaiBalance = await dai.balanceOf(smartVault.address)
        const previousSmartVaultManaBalance = await mana.balanceOf(smartVault.address)

        await dai.connect(whale).approve(smartVault.address, amountIn)
        await otcSwapper.connect(whale).call(amountIn, 0)

        const currentSenderDaiBalance = await dai.balanceOf(whale.address)
        expect(currentSenderDaiBalance).to.be.equal(previousSenderDaiBalance.sub(amountIn))

        const currentSenderManaBalance = await mana.balanceOf(whale.address)
        expect(currentSenderManaBalance).to.be.at.equal(previousSenderManaBalance.add(expectedAmountOut))

        const currentSmartVaultDaiBalance = await dai.balanceOf(smartVault.address)
        expect(currentSmartVaultDaiBalance).to.be.equal(previousSmartVaultDaiBalance.add(amountIn))

        const currentSmartVaultManaBalance = await mana.balanceOf(smartVault.address)
        expect(currentSmartVaultManaBalance).to.be.at.equal(previousSmartVaultManaBalance.sub(expectedAmountOut))
      })

      it('covers gas cost when relaying txs', async function () {
        const bot = await impersonate(relayers[0], fp(10))
        const previousBalance = await dai.balanceOf(feeCollector)

        await dai.connect(whale).transfer(bot.address, amountIn)
        await dai.connect(bot).approve(smartVault.address, amountIn)
        const tx = await otcSwapper.connect(bot).call(amountIn, 0)

        const currentBalance = await dai.balanceOf(feeCollector)
        const price = await smartVault.getPrice(DAI, WETH)
        const redeemedCost = currentBalance.sub(previousBalance).mul(price).div(fp(1))
        await assertRelayedBaseCost(this.task, tx, redeemedCost, 0.1)
      })
    })
  })

  describe('withdrawer', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(withdrawer, [
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
            'setToken',
            'call',
          ],
        },
        { name: 'dexSwapper', account: dexSwapper, roles: [] },
        { name: 'otcSwapper', account: otcSwapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await withdrawer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the owner as the recipient', async function () {
      expect(await withdrawer.recipient()).to.be.equal(owner)
    })

    it('sets the expected token', async function () {
      expect(await withdrawer.token()).to.be.equal(DAI)
    })

    it('sets the expected threshold', async function () {
      expect(await withdrawer.thresholdToken()).to.be.equal(DAI)
      expect(await withdrawer.thresholdAmount()).to.be.equal(fp(50))
    })

    it('sets the expected gas limits', async function () {
      expect(await withdrawer.gasPriceLimit()).to.be.equal(bn(50e9))
      expect(await withdrawer.totalCostLimit()).to.be.equal(0)
      expect(await withdrawer.payingGasToken()).to.be.equal(DAI)
    })

    it('whitelists the requested relayers', async function () {
      for (const relayer of relayers) {
        expect(await withdrawer.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async function () {
      for (const manager of managers) {
        expect(await withdrawer.isRelayer(manager)).to.be.false
      }
    })

    describe('call', async function () {
      let bot: SignerWithAddress, dai: Contract, whale: SignerWithAddress

      const amount = fp(200)

      before('load accounts', async function () {
        bot = await impersonate(relayers[0], fp(10))
        dai = await this.task.instanceAt('IERC20', DAI)
        whale = await impersonate(WHALE, fp(100))
      })

      beforeEach('fund smart vault', async function () {
        await dai.connect(whale).transfer(smartVault.address, amount)
      })

      it('can withdraw DAI when passing the threshold', async function () {
        const previousRecipientBalance = await dai.balanceOf(owner)
        const previousSmartVaultBalance = await dai.balanceOf(smartVault.address)
        const previousFeeCollectorBalance = await dai.balanceOf(feeCollector)

        const tx = await withdrawer.connect(bot).call()

        const currentSmartVaultBalance = await dai.balanceOf(smartVault.address)
        expect(currentSmartVaultBalance).to.be.equal(0)

        const currentFeeCollectorBalance = await dai.balanceOf(feeCollector)
        const relayedCost = currentFeeCollectorBalance.sub(previousFeeCollectorBalance)
        const currentRecipientBalance = await dai.balanceOf(owner)
        const expectedRecipientBalance = previousRecipientBalance.add(previousSmartVaultBalance).sub(relayedCost)
        expect(currentRecipientBalance).to.be.equal(expectedRecipientBalance)

        const price = await smartVault.getPrice(DAI, WETH)
        const redeemedCost = currentFeeCollectorBalance.sub(previousFeeCollectorBalance).mul(price).div(fp(1))
        await assertRelayedBaseCost(this.task, tx, redeemedCost, 0.1)
      })
    })
  })
}
