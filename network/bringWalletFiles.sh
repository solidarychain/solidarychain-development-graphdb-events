#!/bin/bash

WALLET_IDENTITY=admin
WALLET_ORG=.hfc-org1
WALLETS_PATH=wallets
BASE_PATH=../../solidarychain-production-network/fabric-samples/5node2channel/wallet/fabcar/javascript/generated/${WALLETS_PATH}/${WALLET_ORG}
SIGNING_IDENTITY=$(cat ${BASE_PATH}/${WALLET_IDENTITY} | jq -r ".enrollment.signingIdentity")

rm ./${WALLETS_PATH}/${WALLET_IDENTITY}/*
cp ${BASE_PATH}/${WALLET_IDENTITY} ${WALLETS_PATH}/admin/
cp ${BASE_PATH}/${SIGNING_IDENTITY}-priv ${WALLETS_PATH}/admin/
cp ${BASE_PATH}/${SIGNING_IDENTITY}-pub ${WALLETS_PATH}/admin/
tree ${WALLETS_PATH}/${WALLET_IDENTITY}