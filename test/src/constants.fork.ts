import { getForkedNetwork, instanceAt } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import hre from 'hardhat'

import * as chainlink from '../../constants/chainlink'
import * as hop from '../../constants/hop'
import * as tokens from '../../constants/tokens'

const network = getForkedNetwork(hre)

/* eslint-disable no-secrets/no-secrets */
/* eslint-disable @typescript-eslint/ban-ts-comment */

describe(`Constants - ${network}`, () => {
  describe('tokens', () => {
    // @ts-ignore
    const erc20s = tokens[network]

    const abi = [
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ]

    const overrides: { [key: string]: { [key: string]: string } } = {
      mainnet: {
        AURA_BAL: 'auraBAL',
      },
      avalanche: {
        DAI: 'DAI.e',
        WETH: 'WETH.e',
        USDT: 'USDt',
      },
      fantom: {
        WETH: 'ETH',
        USDT: 'fUSDT',
      },
      bsc: {
        WETH: 'ETH',
      },
    }

    it('defines ERC20s properly', async () => {
      for (const symbol of Object.keys(erc20s)) {
        console.log(`Checking ${symbol} address...`)
        const token = await instanceAt({ abi }, erc20s[symbol])
        const expectedSymbol = overrides?.[network]?.[symbol] || symbol
        expect(await token.symbol()).to.be.equal(expectedSymbol)
      }
    })
  })

  describe('chainlink', () => {
    // @ts-ignore
    const feeds = chainlink[network]

    const abi = [
      {
        inputs: [],
        name: 'description',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ]

    it('defines feeds properly', async () => {
      for (const key of Object.keys(feeds)) {
        const [base, quote] = key.split('_')
        console.log(`Checking chainlink feed for ${base}/${quote} pair...`)

        const feed = await instanceAt({ abi }, feeds[key])
        const description = await feed.description()

        const [actualBase, actualQuote] = description.split(' / ')
        expect(actualBase).to.be.equal(base)
        expect(actualQuote).to.be.equal(quote)
      }
    })
  })

  describe('hop', () => {
    if (network == 'mainnet' || network == 'goerli') {
      const bridges = hop[network]

      const abi = [
        {
          inputs: [],
          name: 'l1CanonicalToken',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function',
        },
      ]

      it('defines bridges properly', async () => {
        for (const key of Object.keys(bridges).filter((token) => !token.startsWith('ETH'))) {
          const symbol = key.split('_')[0]
          console.log(`Checking hop bridge for token ${symbol}...`)

          // @ts-ignore
          const bridge = await instanceAt({ abi }, bridges[key])

          // @ts-ignore
          const expectedToken = tokens[network][symbol].toLowerCase()
          const actualToken = (await bridge.l1CanonicalToken()).toLowerCase()
          expect(actualToken).to.be.equal(expectedToken)
        }
      })
    } else {
      // @ts-ignore
      const amms = hop[network] || {}

      const abi = [
        {
          inputs: [],
          name: 'l2CanonicalToken',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'l2CanonicalTokenIsEth',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
      ]

      const overrides: { [key: string]: { [key: string]: string } } = {
        arbitrum: {
          ETH: 'WETH',
        },
        optimism: {
          ETH: 'WETH',
        },
        gnosis: {
          ETH: 'WETH',
          DAI: 'WXDAI',
        },
        polygon: {
          ETH: 'WETH',
        },
      }

      it('defines AMMs properly', async () => {
        for (const key of Object.keys(amms)) {
          const symbol = key.split('_')[0]
          const amm = await instanceAt({ abi }, amms[key])

          if (await amm.l2CanonicalTokenIsEth()) {
            console.log(`Checking hop AMM for canonical token ${symbol}...`)
            if (network == 'gnosis') expect(symbol).to.be.equal('DAI')
            if (network == 'optimism' || network == 'arbitrum') expect(symbol).to.be.equal('ETH')
          } else {
            console.log(`Checking hop AMM for non-canonical token ${symbol}...`)
            const lookingSymbol = overrides?.[network]?.[symbol] || symbol
            // @ts-ignore
            const expectedToken = tokens[network][lookingSymbol].toLowerCase()
            const actualToken = (await amm.l2CanonicalToken()).toLowerCase()
            expect(actualToken).to.be.equal(expectedToken)
          }
        }
      })
    }
  })
})
