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
        getConnections: () => Promise<string[]>;
        connect: () => Promise<any>;
        disconnect: (data: object) => Promise<any>;
        getFingerprints: () => Promise<string>;

        // sign message function
        signMessage: (data: object) => Promise<any>;

        // automated transactions
        enableAutomatedTxns: () => Promise<any>;
        areAutomatedTransactionsEnabled: () => Promise<boolean>;
        disableAutomatedTxns: () => Promise<any>;

        // transactions
        transferPwr: (txnData: object) => Promise<string>;
        payableVidaDataTransaction: (txnData: object) => Promise<string>;
        claimVidaId: (txnData: object) => Promise<string>;
        delegate: (txnData: object) => Promise<string>;
        withdraw: (txnData: object) => Promise<string>;
        moveStake: (txnData: object) => Promise<string>;
        proposeEarlyWithdrawPenalty: (txnData: object) => Promise<string>;
        proposeChangefeePerByte: (txnData: object) => Promise<string>;
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

        onAccountChange: {
            addListener: (callback: (accounts: string[]) => void) => void;
        };
        onConnect: {
            addListener: (callback: (address: string[]) => void) => void;
        };
        onDisconnect: {
            addListener: (callback: () => void) => void;
        };
    };
}
```

- **connect**: This method prompts a window that allows the user to connect the wallet to the website, the user can reject the request or accept it. After correctly calling this method it will return the addresses of the connected wallets
- **disconnect**: This method is similar to connect method, it prompts a window that allows the user to disconnect a wallet, unlike other wallets, pwr can be disconnected programmatically, but it will first require the user to confirm this was an intended action.
- **getConnections**: this function will return an array of strings representing the addresses of the connected wallets
- **signMessage**: this function will return a string representing the signed message
- **enableAutomatedTxns**: this function will enable automated transactions
- **areAutomatedTransactionsEnabled**: this function will return a boolean representing whether the automated transactions are enabled or not
- **disableAutomatedTxns**: this function will disable automated transactions

## Event listeners

In order to subscribe to wallet events, like the wallet connection, account change and wallet disconnection, you should use the eventListener methods:

- **onConnect.addListener**: This event will be fired each time the wallet is connected, it will pass the addresses of the connected wallets to the callback function
- **onDisconnect.addListener**: This event will be fired each time the wallet is disconnected manually or programmatically, it won’t pas any argument to the callback function
- **onAccountChange.addListener**: This event will return an array of all the accounts that are connected at the request moment, the selected account will be the first element of the array.

## PWRJS Browser Wallet

You will install the PWRJS Browser Wallet as we did in previous guides - [Installing & Importing PWR SDK](/developers/sdks/overview). 

### Connections

You can connect to the wallet and disconnect via PWRJS Browser Wallet.

```js
import { 
  BrowserWallet, connect, disconnect, 
  getEvent, getConnection, isInstalled 
} from "@pwrjs/browser-wallet";

// connect wallet with the website
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

### Send Transactions

When using BrowserWallet, you can directly call the transaction methods on your wallet instance as shown in the examples below. The wallet interface will handle the transaction signing automatically.

```js
import { BrowserWallet } from "@pwrjs/browser-wallet";
const wallet = new BrowserWallet();

// `transferPWR` from PWR Wallet in the browser
wallet.transferPWR(recipientAddress, amount).then(console.log);

// `sendVidaDataTxn` from PWR Wallet in the browser
wallet.sendVidaData(vidaId, data).then(console.log);

// `sendPayableVidaData` from PWR Wallet in the browser
wallet.sendPayableVidaData(vidaId, data, amount).then(console.log);

// `delegate` from PWR Wallet in the browser
wallet.delegate(validator, amount).then(console.log);

// `withdraw` from PWR Wallet in the browser
wallet.withdraw(validator, amount).then(console.log);

// `moveStake` from PWR Wallet in the browser
wallet.moveStake(amount, fromValidator, toValidator).then(console.log);

// `claimVidaId` from PWR Wallet in the browser
wallet.claimVidaId(vidaId).then(console.log);

// and others...
```
