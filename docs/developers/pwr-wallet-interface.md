---
title: Understanding the PWR Wallet Interface

sidebar_position: 4
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Understanding the PWR Wallet Interface

PWR Wallet injects a javascript interface in all pages when it is installed in the browser, this interface allows developers to interact with the wallet and do basic operations like connecting the wallet, subscribing to events and sending different types of transactions.

this interface can be accessed throw the `window.pwr` method

## Pwr Wallet interface

```js
interface Window {
    pwr: {
        // data
        name: string;
        version: string;

        // actions
        restablishConnection: () => Promise<string>;
        connect: () => Promise<any>;
        disconnect: () => Promise<any>;

        // transactions
        transferPwr: (txnData: { to: string; amount: string }) => Promise<any>;

        // getters  
        isConnected: () => promise<boolean>;

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
- **transferPwr**: This function is used to transfer pwr, the first argument is the destiny address and the second argument is the amount to be transfered, specified in sparkle units. 

## Event listeners

In order to subscribe to wallet events, like the wallet connection, account change and wallet disconnection, you should use the eventListener methods:

- **onConnect.addListener**: This event will be fired each time the wallet is connected, it will pass the addresses of the connected wallets to the callback function
- **onDisconnect.addListener**: This event will be fired each time the wallet is disconnected manually or programmatically, it won’t pas any argument to the callback function
- **onAccountChange.addListener**: This event will return an array of all the accounts that are connected at the request moment, the selected account will be the first element of the array.
