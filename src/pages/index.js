import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import Card from "../components/Card";

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title="Homepage" description="PWR Chain Documentation">
      <main className={styles.main}>
        <br />
        <section className={styles.features}>
          <div className="container">
            <h1
              title="tagline"
              className="landing-tagline"
              style={{
                fontWeight: "700",
                marginBottom: "0px",
                fontSize: "x-large",
                paddingTop: "55px",
                paddingBottom: "10px",
              }}
            >
              Welcome to the PWR Chain Documentation Site
            </h1>
            <div className="landing-page-boxes-con">
              <Card
                to="pwrchain/overview"
                header={{
                  label: "Intro to PWR Chain",
                }}
                body={{
                  label:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eget vulputate neque. Maecenas sit amet ornare augue",
                }}
              />

              <Card
                to="/"
                header={{
                  label: "Guides",
                }}
                body={{
                  label:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eget vulputate neque. Maecenas sit amet ornare augue",
                }}
              />

              <Card
                to="/"
                header={{
                  label: "Guides for PWR",
                }}
                body={{
                  label:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eget vulputate neque. Maecenas sit amet ornare augue",
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
