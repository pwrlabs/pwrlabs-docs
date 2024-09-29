import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import Box from "../components/Box";

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title="Homepage" description="PWR Chain Documentation">
      <main className={styles.main}>
        <br />
        <section className={styles.features}>
          <div className="container">
            <h2
              title="tagline"
              className="landing-tagline"
              style={{
                fontWeight: "700",
                marginBottom: "0px",
                paddingTop: "55px",
                paddingBottom: "10px",
                textAlign: "center",
              }}
            >
              Welcome to the PWR Chain Documentation
            </h2>
            <div className="landing-page-boxes-con">
              <Box
                to="pwrchain/overview"
                header={{
                  label: "Intro to PWR Chain",
                }}
                body={{
                  label:
                    "Start your journey with an overview of the protocol including key terms, and features.",
                }}
              />

              <Box
                to="pwrchain/architecture-of-pwr-chain/base-layer"
                header={{
                  label: "Architecture of PWR",
                }}
                body={{
                  label:
                    "Explains the infrastructure and network design, covering how nodes, and data flow operate.",
                }}
              />

              <Box
                to="pwrchain/core-technology/consensus-mechanism/proof-of-power"
                header={{
                  label: "Core Technology",
                }}
                body={{
                  label:
                    "Highlights the core technological components that power the PWR Chain.",
                }}
              />

              <Box
                to="developers/developing-on-pwr-chain/what-is-a-decentralized-application"
                header={{
                  label: "Guides for Developers",
                }}
                body={{
                  label:
                    "Step-by-step instructions for developers to build, and deploy on PWR Chain.",
                }}
              />

              <Box
                to="developers/sdks/installing-and-importing-pwr-sdk"
                header={{
                  label: "PWR Chain SDKs",
                }}
                body={{
                  label:
                    "A comprehensive guide to the PWR Chain SDKs, and how to build DApps and VMs.",
                }}
              />

              <Box
                to="pwrchain/governance-and-economics/tokenomics/pwr-utility-and-value"
                header={{
                  label: "Governance",
                }}
                body={{
                  label:
                    "Details on the governance model, tokenomics, and how economic incentives are structured.",
                }}
              />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
