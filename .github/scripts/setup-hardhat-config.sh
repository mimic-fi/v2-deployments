#!/bin/sh
GOERLI_URL="$1"
MUMBAI_URL="$2"
MAINNET_URL="$3"
POLYGON_URL="$4"
OPTIMISM_URL="$5"
ARBITRUM_URL="$6"
GNOSIS_URL="$7"
AVALANCHE_URL="$8"
BSC_URL="$9"
FANTOM_URL="${10}"

set -o errexit

mkdir -p $HOME/.hardhat

echo "
{
  \"networks\": {
    \"goerli\": { \"url\": \"${GOERLI_URL}\" },
    \"mumbai\": { \"url\": \"${MUMBAI_URL}\" },
    \"mainnet\": { \"url\": \"${MAINNET_URL}\" },
    \"polygon\": { \"url\": \"${POLYGON_URL}\" },
    \"optimism\": { \"url\": \"${OPTIMISM_URL}\" },
    \"arbitrum\": { \"url\": \"${ARBITRUM_URL}\" },
    \"gnosis\": { \"url\": \"${GNOSIS_URL}\" },
    \"avalanche\": { \"url\": \"${AVALANCHE_URL}\" },
    \"bsc\": { \"url\": \"${BSC_URL}\" },
    \"fantom\": { \"url\": \"${FANTOM_URL}\" }
  }
}
" > $HOME/.hardhat/networks.mimic.json
