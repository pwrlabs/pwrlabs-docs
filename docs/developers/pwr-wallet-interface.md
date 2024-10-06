---
title: Understanding the PWR Wallet Interface

sidebar_position: 4
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Understanding the PWR Wallet Interface

PWR Wallet injects a javascript interface in all pages when it is installed in the browser, this interface allows developers to interact with the wallet and do basic operations like connecting the wallet, subscribing to events and sending different types of transactions.

## Pwr Wallet interface

This interface can be accessed throw the `window.pwr` method:

```js
interface Window {
    pwr: {
        // data
        name: string;
        version: string;

        // actions
        restablishConnection: () => Promise<string>;
        connect: () => Promise<any>;
        disconnect: (data: object) => Promise<any>;
        getConnections: () => Promise<any>;
        areAutomatedTransactionsEnabled: () => Promise<any>;
        getFingerprints: () => Promise<any>;

        // transactions
        transferPwr: (txnData: { to: string; amount: string }) => Promise<any>;
        transferPwr: (txnData: object) => Promise<string>;
        dataTransaction: (txnData: object) => Promise<string>;
        bytesDataTransaction: (txnData: object) => Promise<string>;
        payableVmDataTransaction: (txnData: object) => Promise<string>;
        claimIdVm: (txnData: object) => Promise<string>;
        delegate: (txnData: object) => Promise<string>;
        withdraw: (txnData: object) => Promise<string>;
        moveStake: (txnData: object) => Promise<string>;
        earlyWithdrawPenalty: (txnData: object) => Promise<string>;
        feePerByte: (txnData: object) => Promise<string>;
        otherProposal: (txnData: object) => Promise<string>;
        overallBurnPercentage: (txnData: object) => Promise<string>;
        rewardPerYear: (txnData: object) => Promise<string>;
        validatorCountLimit: (txnData: object) => Promise<string>;
        validatorJoiningFee: (txnData: object) => Promise<string>;
        vmIdClaimingFee: (txnData: object) => Promise<string>;
        vmOwnerTransactionFeeShare: (txnData: object) => Promise<string>;
        voteOnProposal: (txnData: object) => Promise<string>;
        maxBlockSize: (txnData: object) => Promise<string>;
        maxTransactionSize: (txnData: object) => Promise<string>;

        // events
        onConnect: {
            addListener: (callback: (address: string) => void) => void;
        };
        onDisconnect: {
            addListener: (callback: () => void) => void;
        };
        onAccountChange: {
            addListener: (callback: (accounts: string[]) => void) => void;
        };
    };
}
```

- **connect**: This method prompts a window that allows the user to connect the wallet to the website, the user can reject the request or accept it. After correctly calling this method it will return the addresses of the connected wallets
- **disconnect**: This method is similar to connect method, it prompts a window that allows the user to disconnect a wallet, unlike other wallets, pwr can be disconnected programmatically, but it will first require the user to confirm this was an intended action.
- **restablishConnection**: when the user connects the wallet and after reloading the page, the connection to it will get lost, this method was created to allow devs to recover previous sessions (in the case that the wallet is still connected to the website). After calling this method it will return the addresses connected
- **isConnected**: this function will return a boolean representing whether the wallet is connected to the website or not
- **transactions**: All functions to send a transaction to PWR Chain - you can check [Send Transactions to PWR Chain](/developers/sdks/send-transactions-to-pwr-chain).


## Event listeners

In order to subscribe to wallet events, like the wallet connection, account change and wallet disconnection, you should use the eventListener methods:

- **onConnect.addListener**: This event will be fired each time the wallet is connected, it will pass the addresses of the connected wallets to the callback function
- **onDisconnect.addListener**: This event will be fired each time the wallet is disconnected manually or programmatically, it won’t pas any argument to the callback function
- **onAccountChange.addListener**: This event will return an array of all the accounts that are connected at the request moment, the selected account will be the first element of the array.

## PWR JS

You will install the PWR JS SDK as we did in previous guides - [Installing & Importing PWR SDK](/developers/sdks/installing-and-importing-pwr-sdk) and [Wallets in PWR Chain](/developers/sdks/wallets-in-pwr-chain). 

### Connections

You can connect to the wallet and disconnect via PWR SDK.

```js
import { connect, disconnect, getConnection, isInstalled, getEvent } from "@pwrjs/core";

// connect wallet with website
connect().then(console.log); // you will use `await` instead of `.then()`

// disconnect wallet from the website
disconnect().then(console.log);

// return the wallet/account address connected
getConnection().then(console.log);

// check if the user installed PWR Wallet
isInstalled() // it will return `boolean`

// listen if the user changes accounts
getEvent("onAccountChange", (accounts) => {
    // check if already connected
    (accounts.length) && console.log(`Account address: ${accounts[0]}`);
})
```

### Send Transaction

The difference from the way we send transactions to PWR Wallet using `private key` is that we will add `true` to the functions mentioned above and present in PWRWallet to send transactions from the `PWR Wallet`.

```js
import { PWRWallet } from "@pwrjs/core";
const privateKey = "YOUR_PRIVATE_KEY_HERE";
const wallet = new PWRWallet(privateKey);

// `transferPWR` from your wallet (private key)
wallet.transferPWR(recipientAddress, amount).then(console.log);
// `transferPWR` from PWR Wallet
wallet.transferPWR(recipientAddress, amount, true).then(console.log);

// `sendVMDataTxn` from your wallet (private key)
wallet.sendVMDataTxn(vmId, data).then(console.log);
// `sendVMDataTxn` from PWR Wallet
wallet.sendVMDataTxn(vmId, data, true).then(console.log);

// `sendPayableVmDataTransaction` from your wallet (private key)
wallet.sendPayableVmDataTransaction(vmId, amount, data).then(console.log);
// `sendPayableVmDataTransaction` from PWR Wallet
wallet.sendPayableVmDataTransaction(vmId, amount, data, true).then(console.log);

// `delegate` from your wallet (private key)
wallet.delegate(validator, amount).then(console.log);
// `delegate` from PWR Wallet
wallet.delegate(validator, amount, true).then(console.log);

// `withdraw` from your wallet (private key)
wallet.withdraw(validator, amount).then(console.log);
// `withdraw` from PWR Wallet
wallet.withdraw(validator, amount, true).then(console.log);

// `moveStake` from your wallet (private key)
wallet.moveStake(amount, fromValidator, toValidator).then(console.log);
// `moveStake` from PWR Wallet
wallet.moveStake(amount, fromValidator, toValidator, true).then(console.log);

// and others...
```
