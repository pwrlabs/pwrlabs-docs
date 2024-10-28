import React from 'react'
import "./index.css"
import { useColorMode } from '@docusaurus/theme-common'

export default function Hero() {
    const { colorMode } = useColorMode();

    return (
        <section className="hero-container" style={{marginTop: "38px"}}>
            <div className="hero-content-wrapper">
                <div className="hero-content">
                    <k className="hero-tagline">
                        Build, Innovate, Integrate with PWR Chain
                    </k>

                    <h1 className="hero-title">
                        Welcome to PWR Chain Docs
                    </h1>

                    <p className="hero-description">
                        PWR Chain is the first true Layer 0 blockchain, designed for unmatched scalability and seamless
                        integration. Its unique architecture separates validation from processing, enabling easy deployment
                        across VMs, side chains, smart contracts, and even traditional software.
                    </p>

                    <div className="hero-img">
                        <img 
                            src="/homepage/hero-light.svg"
                            style={{ display: colorMode === "dark" ? 'none' : 'block' }}
                        />
                        <img 
                            src="/homepage/hero-dark.svg"
                            style={{ display: colorMode === "dark" ? 'block' : 'none' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
