import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Hero from "../components/Hero"
import Builds from "../components/Builds"
import GetStarted from "../components/GetStarted"

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title="Homepage" description="PWR Chain Documentation">
      <main>
        <Hero />

        <Builds />

        <GetStarted />
      </main>
    </Layout>
  );
}

export default Home;
