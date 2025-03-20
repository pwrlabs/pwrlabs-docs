// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
require("dotenv").config();

const { themes } = require("prism-react-renderer");
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;
const math = require("remark-math");
const katex = require("rehype-katex");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "PWR Chain",
  favicon: "/img/pwrlabs.avif",

  // Set the production url of your site here
  url: "https://docs.pwrlabs.io/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "pwrlabs", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",

  markdown: {
    mermaid: true
  },

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            from: "/overview/",
            to: "/pwrchain/overview/",
          },
          {
            from: "/overview/readme/",
            to: "/pwrchain/overview/",
          },
          {
            from: "/overview/intro/",
            to: "/pwrchain/overview/",
          },

          {
            from: "/developers/",
            to: "/developers/developing-on-pwr-chain/what-is-a-decentralized-application/",
          },
          {
            from: "/developers/sdks/",
            to: "/developers/sdks/installing-and-importing-pwr-sdk/",
          },
        ],
        createRedirects(existingPath) {

          // pwrchain redirects
          if (existingPath.includes('/pwrchain')) {
            return [
              existingPath.replace('/pwrchain', ''),
            ];
          }

          return undefined; // Return a falsy value: no redirect created
        },
      },
    ],
  ],

  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
      type: "text/css",
      integrity:
        "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
      crossorigin: "anonymous",
    },
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          breadcrumbs: true,
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },

        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },

        gtag: {
          trackingID: 'G-GGGGGGGGGG',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: '/img/pwrlabs.avif',

      navbar: {
        title: "PWR Chain Docs",
        logo: {
          alt: "PWR Chain Logo",
          src: "/img/pwrlabs.avif",
        },
        items: [
          {
            to: "pwrchain/overview",
            label: "Concepts",
            position: "left",
            activeBasePath: 'pwrchain/',
          },
          {
            to: "developers/developing-on-pwr-chain/what-is-a-decentralized-application",
            label: "Developers",
            position: "left",
            activeBasePath: 'developers/',
          },
          {
            href: 'https://community.pwrlabs.io/',
            label: 'Grants',
            position: 'right',
          },
          {
            href: "https://github.com/pwrlabs",
            className: "header--github-link",
            "aria-label": "GitHub repository",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "PWR Chain",
            items: [
              {
                label: "About",
                href: "https://www.pwrlabs.io/",
              },
              {
                label: "GitHub",
                href: "https://github.com/pwrlabs",
              },
              // {
              //   label: "Privacy Policy",
              //   href: "https://www.pwrlabs.io/",
              // },
              // {
              //   label: "Terms of Service",
              //   href: "https://www.pwrlabs.io/",
              // },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.com/invite/YASmBk9EME",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/pwrlabs",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Youtube",
                href: "https://www.youtube.com/@pwrlabs",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} PWR Labs`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["bash", "csharp", "java", "python", "go", "rust"],
      },
    }),
  themes: [
    [
      // @ts-ignore
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      // @ts-ignore
      ({
        // `hashed` is recommended as long-term-cache of index file is possible
        language: ["en"],
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: "/",
      }),
    ],
    '@docusaurus/theme-mermaid'
  ],
};

module.exports = config;
