---
title: Build SocialFi DApp using Next.js

sidebar_position: 6
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Build SocialFi DApp using Next.js

In this lesson, you will learn how to build a small SocialFi project that allows users to share posts and like it using Next.js. This DApp will provide a seamless interface for users to connect their wallets, send data to our VM and fetch the data securely and efficiently.

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
npm install @pwrjs/core
```

## Build fetch posts

There won't be anything strange, just the same way we used in previous guides.

We will filter posts and likes so that:

- Data with `type === "post"`: We will filter it so that it adds only recent posts.
- Data with `type === "like"`: We will filter it so that it adds likes related to the post and not duplicates.

Create a file named `impls.js` in a new folder called `components` and add the following code. The code is explained in the comments, take the time to write it yourself and understand it.

```js
import { PWRJS } from "@pwrjs/core";

// Setting up your wallet in the SDK
const rpc = new PWRJS("https://pwrrpc.pwrlabs.io/");

export async function syncPosts(setPosts) {
    let startingBlock = "YOUR_STARTING_BLOCK";
    const vmId = "YOUR_VM_ID";

    const loop = async () => {
        try {
            const latestBlock = await rpc.getLatestBlockNumber();
            let effectiveLatestBlock = latestBlock > startingBlock + 1000 ? startingBlock + 1000 : latestBlock;

            if (effectiveLatestBlock > startingBlock) {
                // Fetch the transactions in `vmId = 1234`
                const txns = await rpc.getVMDataTransactions(startingBlock, effectiveLatestBlock, vmId);
                const likesMap = {}; // Initialize a likes map
                const likesSet = new Set(); // Initialize a set to track unique likes

                for (let txn of txns) {
                    const dataHex = txn.data;
                    // Remove the '0x' prefix and decode the hexadecimal data to bytes data
                    const data = Buffer.from(dataHex.substring(2), 'hex');
                    // Convert the bytes data to UTF-8 string as json
                    const post = JSON.parse(data.toString('utf8'));

                    if (post.type.toLowerCase() === "post" & post.id != null) {
                        // Create a new post struct
                        const newPost = {
                            type: post.type,
                            post: post.post,
                            timestamp: post.timestamp,
                            sender: post.sender,
                            likes: 0, // Initialize likes to 0
                            id: post.id,
                        };

                        // Add the new post to the state
                        setPosts((prev) => {
                            const exists = prev.some(prevPost => prevPost.id === newPost.id);
                            return exists ? prev : [...prev, newPost];
                        });
                    } else if (post.type.toLowerCase() === "like") {
                        // Create a unique identifier for the like
                        const likeKey = `${post.postId}-${post.sender}`;

                        // Check if the like already exists
                        if (!likesSet.has(likeKey)) {
                            // Increment likes in the likesMap
                            const postId = post.postId;
                            likesMap[postId] = (likesMap[postId] || 0) + 1; // Increment like count
                            likesSet.add(likeKey); // Add the like to the set
                        }
                    }
                }

                // Update posts with the total likes from likesMap
                setPosts((prevPosts) => {
                    return prevPosts.map(post => {
                        return {
                            ...post,
                            likes: likesMap[post.id] || post.likes // Update likes count or keep existing
                        };
                    });
                });

                startingBlock = effectiveLatestBlock + 1;
            }
            setTimeout(loop, 1000); // Wait 1 second before the next loop
        } catch (e) {
            console.error(e);
        }
    };
    loop();
}
```

## Build the homepage

In this part we will build, connect wallet, disconnect, listen for events, send VM data (posts and likes), and fetch posts to the homepage.

Building the homepage (`src/app/page.js`) which will show everything. The code is explained in the comments, take the time to write it yourself and understand it.

```jsx
"use client";

import { useState, useEffect } from "react";
import { 
  PWRWallet, connect, disconnect, 
  getEvent, getConnection, isInstalled 
} from "@pwrjs/core";
import { syncPosts } from "../components/getPosts";

const vmId = 5544;
const timestamp = new Date().getTime();

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
  const pwr = new PWRWallet();
  // Check if the user's wallet is connected
  const [connected, setConnected] = useState(false);
  // State variable to store wallet address connected
  const [address, setAddress] = useState("");
  // State variable to store post content
  const [content, setContent] = useState("");
  // State variable to store all posts fetched
  const [posts, setPosts] = useState([]);

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

  // Send `post` data using PWR SDK and PWR Wallet
  const sendPost = async () => {
    // Post structure
    const data = {
      type: "post",
      post: content,
      timestamp: timestamp,
      sender: address,
      id: posts[posts.length-1].id + 1,
    };
    // Convert data type to `Buffer`
    const post = Buffer.from(JSON.stringify(data), 'utf8');

    try {
      // Send `post` to our vmId
      const tx = await pwr.sendVMDataTxn2(vmId, post, true);
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
            timestamp: timestamp,
            sender: address,
          };
          // Convert data type to `Buffer`
          const likes = Buffer.from(JSON.stringify(data), 'utf8');

          // Send `like` to our vmId
          const tx = await pwr.sendVMDataTxn2(vmId, likes, true);
          alert(`SENT LIKE! ${tx.slice(0, 6)}...${tx.slice(-6)}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Piece of code that runs everytime the user's wallet changes or disconnected
  useEffect(() => {
    // Check if pwr wallet already installed
    if (isInstalled()) {
      // Used to re-fetch the connected user's account every time
      // the website is refreshed.
      getConnection().then(address => {
        if (address) {
          setConnected(true);
          setAddress(address);
        }
      });

      // Used to listen to any account changes that occur in the wallet.
      getEvent("onAccountChange", (accounts) => {
        setAddress(accounts[0]);
        setConnected(accounts.length > 0);
      })

      // Fetch the posts from `syncPosts` to our state variable `posts`
      syncPosts(setPosts);
    }
  }, [posts]);

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
                      {address.slice(0, 7)}...{address.slice(-6)}
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
          {posts.map(post => (
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
