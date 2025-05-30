---
title: Build Transfer PWR DApp using Next.js

sidebar_position: 5
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Build Transfer PWR DApp using Next.js

In this lesson, you will learn how to build a decentralized application (DApp) that allows users to transfer PWR tokens using Next.js. This DApp will provide a seamless interface for users to connect their wallets and initiate PWR token transfers securely and efficiently.

## Prerequisites

Before starting, make sure you have the following:

- Download and [setup PWR Wallet](/pwrchain/how-to-create-a-browser-wallet) if you do not have it already.
- Request some Testnet PWR from a faucet like this one - [PWR Chain Faucet](https://faucet.pwrlabs.io/).
- Install [Node.js](https://nodejs.org/en/download/package-manager) if you do not have it already (Use the LTS version, as that is stable. The latest version is experimental and may have bugs).
- We can start building.

## Setting up our Next.js project

Open up your Terminal and run the following command to create a new project:

```bash
npx create-next-app@latest tranfer-dapp && cd tranfer-dapp
```

You will get options to create your project, select them as follows:

```bash
✔️ Would you like to use TypeScript? … (No)
✔️ Would you like to use ESLint? … (Yes)
✔️ Would you like to use Tailwind CSS? … (Yes)
✔️ Would you like to use src/ directory? … (No)
✔️ Would you like to use App Router? (recommended) … (Yes)
✔️ Would you like to customize the default import alias (@/*)? … (No)
```

Once it's done, you'll need to install the [PWRJS library](/developers/sdks/overview) into the project, run the following command:

```bash
npm install @pwrjs/core @pwrjs/browser-wallet
```

## Build the homepage

In this part we will build, connect wallet, disconnect, listen for events and send transactions (transferPWR) to PWR Chain.

Building the homepage (`src/app/page.js`) which will show everything. The code is explained in the comments, take the time to write it yourself and understand it.

```jsx
"use client";
import { useState, useEffect } from "react";
import { 
  BrowserWallet, connect, disconnect, 
  isInstalled, getConnection, getEvent,
} from "@pwrjs/browser-wallet";

export default function Home() {
  // Create a new pwr wallet
  const pwr = new BrowserWallet();
  // Check if the user's wallet is connected
  const [connected, setConnected] = useState(false);
  // State variable to store recipient address input
  const [recipient, setRecipient] = useState("");
  // State variable to store amount input
  const [amount, setAmount] = useState(0);
  // State variable to store tx hash after send it
  const [txHash, setTxHash] = useState("");

  // Connect wallet with the website
  const connectWallet = async () => {
    const res = await connect();
    // Check if the connect completed
    res && setConnected(true);
  }

  // Disconnect wallet from the website
  const disconnectWallet = async () => {
    const res = await disconnect();
    // Check if the disconnect completed
    (!res) && setConnected(false);
  }

  // Transfer pwr tokens from the user's wallet connected to recipient address
  const trasnfer = async () => {
    if (connected && recipient.length==42) {
      // send the transfer tx to pwr chain
      // the `true` parameter means send the transaction from the browser user's wallet
      const tx = await pwr.transferPWR(recipient, amount.toString());

      if (tx) {
        setTxHash(tx);
        alert(`Sent ${amount} to ${recipient.slice(0, 7)}...${recipient.slice(-5)}`);
      }
    } else {
      alert("Check from the recipient address or wallet connection.");
    }
  }

  // Piece of code that runs everytime the user's wallet changes or disconnected
  useEffect(() => {
    // Check if pwr wallet already installed
    if (isInstalled()) {
      // Used to re-fetch the connected user's account every time
      // the website is refreshed.
      getConnection().then(address => {
        address && setConnected(true);
      });

      // Used to listen to any account changes that occur in the wallet.
      getEvent("onAccountChange", (accounts) => {
        console.log(accounts[0])
        setConnected(accounts.length > 0);
      })
    }
  }, []);

  return (
    <div className='max-w-md mx-auto bg-[#0c1012] p-5 rounded-lg justify-center items-center mt-36'>
      <p className="text-center mb-6 font-bold">TRANSFER PWR APP</p>
      <form>
        <div className="mb-5">
          <label className="block mb-2 text-md font-medium text-[#bebbbb]">Recipient Address</label>

          <input onChange={(e) => setRecipient(e.target.value)} placeholder='0xac09bec...f80' className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div className="mb-5">
          <label className="block mb-2 text-md font-medium text-[#bebbbb]">Amount</label>

          <input onChange={(e) => setAmount(e.target.value)} placeholder='0' className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
        </div>
      </form>

      {connected ? (
        <div>
          <button onClick={() => trasnfer()} className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full mt-4 px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">
            Transfer
          </button>

          <button onClick={disconnectWallet} className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full mt-4 px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">
            Disconnect
          </button>

          {txHash && (
            <p className="text-[#bebbbb] pt-4">
              Transaction hash: {" "}
              <a href={`https://explorer.pwrlabs.io/transactions/${txHash}`} className="text-blue-300 underline" target="_blank">
                {txHash.slice(0, 6)}...{txHash.slice(-4)}
              </a>
            </p>
          )}
        </div>
      ) : (
        <button onClick={connectWallet} className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full mt-4 px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

## Testing the app

Let's run it! With your Terminal pointing to the frontend directory - execute the following command:

```bash
npm run dev
```

This will start the Next.js server and your website should be accessible at [http://localhost:3000/](http://localhost:3000/)

Go through the app, try out different things - connect wallet, transfer pwr and send transactios, change accounts, and disconnect and see all the things happening on [PWR Chain Explorer](https://explorer.pwrlabs.io) as well.

Submit your first transaction using your app - what should appear after submitting the transaction:

<div style={{display:"flex", justifyContent:"center", alignItems:"center", marginBottom:"20px"}}>
<img src="/img/transfer-pwr-dapp.png" width= "60%"/>
</div>

If you've made it this far, you're done 🥳

## Congratulations!

You're all done! I hope you were able to learn a few new things from this one. 

If you have any doubts or questions, join the [Discord Server](https://discord.com/invite/YASmBk9EME) and we'll be waiting for you there!
