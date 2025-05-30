---
title: Build SocialFi DApp using Next.js

sidebar_position: 6
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Build SocialFi DApp using Next.js

In this lesson, you will learn how to build a small SocialFi project that allows users to share posts and like it using Next.js. This DApp will provide a seamless interface for users to connect their wallets, send data to our VIDA and fetch the data securely and efficiently.

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
npm install @pwrjs/core @pwrjs/browser-wallet uuid
```

## Build fetch posts

There won't be anything strange, just the same way we used in previous guides.

We will filter posts and likes so that:

- Data with `type === "post"`: We will filter it so that it adds only recent posts.
- Data with `type === "like"`: We will filter it so that it adds likes related to the post and not duplicates.

Create a file named `syncPosts.js` in a new folder called `components` and add the following code. The code is explained in the comments, take the time to write it yourself and understand it.

```js
import { vidaId } from "@/app/page";
import PWRJS from "@pwrjs/core";

// Sync posts and likes from the blockchain
export async function syncPosts(setPosts) {
  const rpc = new PWRJS("https://pwrrpc.pwrlabs.io/");
  const startingBlock = BigInt(await rpc.getLatestBlockNumber());

  // Handler function that processes incoming blockchain transactions
  // It parses transaction data and updates the posts state accordingly
  // - For post transactions: adds new posts if they don't already exist
  // - For like transactions: increments like count if user hasn't liked before
  function handlerTransactions(transaction) {
    let dataHex = transaction.data;
    const data = Buffer.from(dataHex, 'hex');
    const postData = JSON.parse(data.toString('utf8'));

    if (postData.type.toLowerCase() === "post" && postData.id != null) {
      // Add new post if it doesn't exist
      setPosts(prev => {
        const exists = prev.some(p => p.id === postData.id);
        if (exists) return prev;
        return [
          ...prev,
          {
            ...postData,
            likes: 0,
            likedBy: []
          }
        ];
      });
    } else if (postData.type.toLowerCase() === "like") {
      setPosts(prev =>
        prev.map(post => {
          if (post.id === postData.postId) {
            // Only increment if this sender hasn't liked before
            if (!post.likedBy?.includes(postData.sender)) {
              return {
                ...post,
                likes: post.likes + 1,
                likedBy: [...(post.likedBy || []), postData.sender]
              };
            }
          }
          return post;
        })
      );
    }
  }

  // Subscribe to vidaId transactions
  rpc.subscribeToVidaTransactions(vidaId, startingBlock, handlerTransactions);
}
```

## Build the homepage

In this part we will build, connect wallet, disconnect, listen for events, send VIDA data (posts and likes), and fetch posts to the homepage.

Building the homepage (`src/app/page.js`) which will show everything. The code is explained in the comments, take the time to write it yourself and understand it.

```jsx
"use client";
import { useState, useEffect } from "react";
import { 
  BrowserWallet, connect, disconnect, 
  getEvent, getConnection, isInstalled 
} from "@pwrjs/browser-wallet";
import { syncPosts } from "@/components/syncPosts";
import { v4 as uuidv4 } from 'uuid';

export const vidaId = 5544;

// Format post timestamp
const formatTimestamp = (t) => {
  const diff = Date.now() - t;
  for (const [label, value] of [['y', 31536000000], ['d', 86400000], ['h', 3600000], ['m', 60000], ['s', 1000]]) {
    const count = Math.floor(diff / value);
    if (count) return `${count}${label}`;
  }
  return '0s';
};

export default function Home() {
  // Create a new pwr wallet
  const pwr = new BrowserWallet();
  // Check if the user's wallet is connected
  const [connected, setConnected] = useState(false);
  // State variable to store wallet address connected
  const [address, setAddress] = useState(null);
  // State variable to store post content
  const [content, setContent] = useState("");
  // State variable to store all posts fetched
  const [posts, setPosts] = useState([]);

  // Connect wallet with the website
  const connectWallet = async () => {
    const res = await connect();
    // Check if the connect completed
    res && setConnected(true);
    if (!res && isInstalled()) {
      const connections = await getConnection();
      if (connections.length > 0) {
        setConnected(true);
        setAddress(connections);
      }
    }
  }

  // Disconnect wallet from the website
  const disconnectWallet = async () => {
    const res = await disconnect();
    // Check if the disconnect completed
    (!res) && setConnected(false);
  }

  // Send `post` data using PWR SDK and PWR Wallet
  const sendPost = async () => {
    // Post structure
    const data = {
      type: "post",
      post: content,
      timestamp: new Date().getTime(),
      sender: address,
      id: uuidv4(),
    };
    // Convert data type to `Buffer`
    const post = Buffer.from(JSON.stringify(data), 'utf8');

    try {
      // Send `post` to our vidaId
      const tx = await pwr.sendVidaData(vidaId, post, true);
      alert(`SENT POST! ${tx.slice(0, 6)}...${tx.slice(-6)}`);
    } catch (err) {
      console.error(err);
    }
  }

  // Send `like` data using PWR SDK and PWR Wallet
  const sendLike = async (postId) => {
    try {
      for (let i=0; i <= posts.length; i++) {
        if (posts[i]?.id === postId) {
          // Like structure
          const data = {
            type: "like",
            likes: posts[i]?.likes + 1,
            postId: postId,
            timestamp: new Date().getTime(),
            sender: address,
          };
          // Convert data type to `Buffer`
          const likes = Buffer.from(JSON.stringify(data), 'utf8');

          // Send `like` to our vidaId
          const tx = await pwr.sendVidaData(vidaId, likes, true);
          alert(`SENT LIKE! ${tx.slice(0, 6)}...${tx.slice(-6)}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
    }

  // Piece of code that runs everytime the user's wallet changes or disconnected
  useEffect(() => {
    syncPosts(setPosts);

    // Check if pwr wallet already installed
    if (isInstalled()) {
      // Used to re-fetch the connected user's account every time
      // the website is refreshed.
      getConnection().then(addressConnected => {
        if (addressConnected && address == null) {
          setConnected(true);
          setAddress(addressConnected);
        }
      });

      // Used to listen to any account changes that occur in the wallet.
      getEvent("onAccountChange", (addresses) => {
        setAddress(addresses[0]);
        console.log("Account changed to: ", addresses[0]);
        setConnected(addresses.length > 0);
      });
    }
  }, [address]);

  return (
    <div>
      <nav className="relative z-2 w-full md:static md:text-sm md:border-none">
        <div className="items-center gap-x-14 px-4 max-w-screen-xl mx-auto md:flex md:px-8">
        <div className="flex items-center justify-between py-3 md:py-5 md:block text-lg text-white">
          <a>
          Social Fi
          </a>
        </div>
        <div className="nav-menu flex-1 pb-3 mt-8 md:block md:pb-0 md:mt-0">
          <ul className="items-center space-y-6 md:flex md:space-x-6 md:space-x-reverse md:space-y-0">
          <div className='flex-1 items-center justify-end gap-x-6 space-y-3 md:flex md:space-y-0'>
            
            <li>
            {connected ? (
              <button
              onClick={disconnectWallet}
              className="block py-3 px-4 font-medium text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:shadow-none rounded-lg shadow md:inline"
              >
              {address?.slice(0, 7)}...{address?.slice(-6)}
              </button>
            ) : (
              <button 
              onClick={connectWallet} 
              className="block py-3 px-4 font-medium text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:shadow-none rounded-lg shadow md:inline"
              >
              Connect Wallet
              </button>
            )}
            </li>
          </div>
          </ul>
        </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-5 rounded-lg justify-center items-center mt-4">
        <div className="flex flex-col bg-[#0c1012] p-5">
          <form>
            <div className="mb-5">
              <input onChange={(e) => setContent(e.target.value)} placeholder='What you want say?' className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </form>
          <button
            onClick={sendPost}
            className="block w-full h-10 font-medium text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:shadow-none rounded-lg shadow md:inline"
          >
            New Post
          </button>
        </div>

        <div className="flex flex-col bg-[#0c1012] p-5 mt-6">
        {[...posts]
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(post => (
            <div className="flex flex-col" key={post?.id}>
              <p className="pl-2 font-semibold">
                {post?.sender.slice(0, 5)}...{post?.sender.slice(-3)} - {formatTimestamp(post?.timestamp)}
              </p>

              <div className="pt-1 pb-1 pl-4">
                {post?.post}
              </div>

              <p onClick={() => sendLike(post?.id)} className="text-red-500 pb-2 pl-4 cursor-pointer">
                {post?.likes} Likes
              </p>

              <hr className="mb-4"/>
            </div>
          ))}
        </div>
      </div>
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

Go through the app, try out different things - connect wallet, send post and like posts, change accounts, and disconnect and see all the things happening on [PWR Chain Explorer](https://explorer.pwrlabs.io) as well.

Submit your first transaction using your app - what should appear after submitting the transaction:

<div style={{display:"flex", justifyContent:"center", alignItems:"center", marginBottom:"20px"}}>
<img src="/img/socialfi-dapp.png" width= "60%"/>
</div>

If you've made it this far, you're done 🥳

## Congratulations!

You're all done! I hope you were able to learn a few new things from this one. 

If you have any doubts or questions, join the [Discord Server](https://discord.com/invite/YASmBk9EME) and we'll be waiting for you there!
