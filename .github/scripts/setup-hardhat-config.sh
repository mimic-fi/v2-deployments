#!/bin/sh
GOERLI_URL="$1"
MUMBAI_URL="$2"
MAINNET_URL="$3"
POLYGON_URL="$4"
OPTIMISM_URL="$5"
ARBITRUM_URL="$6"
GNOSIS_URL="$7"

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
    \"gnosis\": { \"url\": \"${GNOSIS_URL}\" }
  }
}
" > $HOME/.hardhat/networks.mimic.json
