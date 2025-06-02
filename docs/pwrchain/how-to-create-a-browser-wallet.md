---
title: How to Create a Browser Wallet
sidebar_position: 7
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to Create a Browser Wallet

## Installation and Setup

Install the PWR Wallet Extension:
- Navigate to the [PWR Wallet Extension](https://chromewebstore.google.com/u/3/detail/pwr-wallet/kennjipeijpeengjlogfdjkiiadhbmjl) page on the Chrome Web Store.
- Click on "Add to Chrome" to install the extension in your browser.

<img src="/img/wallet-store.png" />

- Once installed, click on the PWR Wallet icon in your browser's extension tray to open it.

## Creating a New Wallet

<Tabs>
<TabItem value="step1" label="Step 1">
    #### Set Up a New Wallet
    - Create a New Wallet:
    <div style={{display:"flex", justifyContent:"center", alignItems: "center"}}>
        <img src="/img/create-wallet.png" />
    </div>
</TabItem>
<TabItem value="step2" label="Step 2">
    #### Enter your Password
    - Enter a strong password that you will use to access your wallet.
    - Confirm your password by entering it again.
    - Click on **Create a new wallet**.
    <div style={{display:"flex", justifyContent:"center", alignItems: "center"}}>
        <img src="/img/new-wallet.png" />
    </div>
</TabItem>
<TabItem value="step3" label="Step 3">
    #### Reveal your Secret Phrase
    - Click on **"Reveal secret phrase"** to display your 12-word secret phrase.
    <div style={{display:"flex", justifyContent:"center", alignItems: "center"}}>
        <img src="/img/secret-phrase.png" />
    </div>
</TabItem>
<TabItem value="step4" label="Step 4">
    #### Secure Your Wallet
    Carefully write down this phrase on paper. This is crucial as these words are the keys to your wallet and funds.
    - If you ever lose your wallet, these words will be your way to get it back by [importing them into a new wallet](#how-to-import-an-existing-wallet).
    - Keep this paper in a secure location. Do not share these words with anyone.
    - Confirm that you have saved the secret phrase by clicking on "I have saved these words".
    <div style={{display:"flex", justifyContent:"center", alignItems: "center"}}>
        <img src="/img/save-secret-phrase.png" />
    </div>
</TabItem>
<TabItem value="final-step" label="Final Step">
    #### Wallet Creation Confirmation
    - After confirming that you have saved your secret phrase, a message will confirm that your wallet has been created successfully.
    - Click on **"Got it"** to finish the setup.
    <div style={{display:"flex", justifyContent:"center", alignItems: "center"}}>
        <img src="/img/wallet-creation.png" />
    </div>
</TabItem>
</Tabs>

## Using Your PWR Wallet

Click on the PWR Wallet icon anytime to open your wallet. You can now send, receive, and manage your funds securely.

<div style={{display:"flex", justifyContent:"center", alignItems:"center", marginBottom:"20px"}}>
    <img src="/img/wallet-using.png" />
</div>


## How to Import an Existing Wallet

If you already have a PWR Wallet, you can import it using your seed phrase:

- Open the PWR Wallet extension and select "Import Wallet".
- Enter your seed phrase.
- Set up a new password for the browser wallet.
- Your wallet will be restored with all its existing balances and transactions.

## Claim Testing Coins

To start testing or building projects on PWR Chain you need some PWR coins.

## Using the faucet

Go to [https://faucet.pwrlabs.io](https://faucet.pwrlabs.io).

Make sure that PWR blockchain is selected, enter your wallet address and click on `Give Me x PWR` button:

<img src="/img/faucet.png" style={{marginBottom: "20px"}}/>

**After correctly claiming the tokens you should see your new balance in the wallet.**

## Security Tips

Keep Your Secret Phrase Safe: Your secret phrase is the key to your wallet. Losing it means losing access to your funds.

Privacy: We never have access to your wallet or funds. PWR Chain will never ask for your secret phrase.

Avoid Sharing: Sharing your secret phrase can lead to theft. Keep it private and secure at all times.
