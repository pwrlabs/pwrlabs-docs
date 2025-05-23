---
title: Overview
sidebar_position: 1
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Overview

`Use PWR SDK to easily read, send transactions, and easily interact with the PWR Chain`

First step of building on PWR Chain is installing and importing the PWR SDK. This SDK is available in many coding languages, and helps developers read data, send transactions, and easily interact with PWR Chain.

## Installing SDK

You will install the PWR Chain SDK library the same way you do for each language:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```bash
    npm install @pwrjs/core
    // or
    yarn add @pwrjs/core
    // or
    pnpm add @pwrjs/core
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```bash
    pip install pwrpy
    // or
    pip3 install pwrpy
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```bash
    cargo add pwr-rs
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```bash
    go get github.com/pwrlabs/pwrgo
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```bash
    dotnet add package PWR
    ```
</TabItem>
<TabItem value="java-maven" label="Java Maven">
    ```html
        <repositories>
            <repository>
                <id>jitpack.io</id>
                <url>https://jitpack.io</url>
            </repository>
        </repositories>
        
        <dependencies>
            <dependency>
                <groupId>com.github.pwrlabs</groupId>
                <artifactId>pwrj</artifactId>
                <version>7.1.0</version>
            </dependency>
        </dependencies>
    ```
</TabItem>
<TabItem value="java-gradle" label="Java Gradle">
    ```js
        dependencyResolutionManagement {
            repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
            repositories {
                mavenCentral()
                maven { url 'https://jitpack.io' }
            }
        }
        
        dependencies {
            implementation 'com.github.pwrlabs:pwrj:7.1.0'
        }
    ```
</TabItem>
</Tabs>

## Importing SDKs

After you have installed sdks, you can import them in your project:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    import { PWRJS, PWRWallet } from '@pwrjs/core';
    // or
    const { PWRJS, PWRWallet } = require('@pwrjs/core');
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrapisdk import PWRPY
    from pwrpy.pwrwallet import Wallet
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::{ Wallet, RPC };
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "github.com/pwrlabs/pwrgo/rpc"
    )
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    import com.github.pwrlabs.pwrj.protocol.PWRJ;
    import com.github.pwrlabs.pwrj.protocol.TransactionBuilder;
    import com.github.pwrlabs.pwrj.record.validator.Validator;
    import com.github.pwrlabs.pwrj.wallet.PWRWallet;
    ```
</TabItem>
</Tabs>

Once you have installed and imported the PWR SDK into your application you can start to the next sections to learn about everything you need to build your project.

> You can jump to [PWR Chain examples](https://github.com/keep-pwr-strong/examples) on github for more examples.
