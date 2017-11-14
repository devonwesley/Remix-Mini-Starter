Remix-Mini aka DJ Dippy
=======================

Learn how [Web3JS](https://github.com/ethereum/web3.js/) and [SolcJS](https://github.com/ericxtang/browser-solc) work by builing your own [Remix](https://remix.ethereum.org/#version=soljson-v0.4.18+commit.9cf6e910.js), no server required.

Prerequisites:
--------------

Its expected that you have a basic understanding of Ethereum Blockchain technologies and the programming language Solidity (smart contracts) which compiles down to EVM bytecode.
If you don’t know what Smart Contract’s or Solidity is, explore these links below:

[Smart Contract Overview.](https://en.wikipedia.org/wiki/Smart_contract)

[Introduction to Solidity.](http://solidity.readthedocs.io/en/develop/introduction-to-smart-contracts.html)

Im using a mac, apologies and forewarning’s.

1. NodeJS — is a JavaScript runtime built on Chrome’s V8 JavaScript engine you’ll need at least version 6.9.1.
2. NPM package:

```$ npm i -g ethereumjs-testrpc```

The first package we install is ethereumjs-testrpc, which is a “NodeJS based Ethereum client for testing and development”. TestRPC is a private blockchain with its own genesis block, that has all the functionality of the live Ethereum blockchain.