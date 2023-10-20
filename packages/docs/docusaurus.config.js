const darkCodeTheme = require("prism-react-renderer/themes/dracula")
const lightCodeTheme = require("prism-react-renderer/themes/github")

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Verite Documentation",
  tagline: "Verite decentralized identity for DeFi",
  url: "https://verite.id/",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "circle.com",
  projectName: "verite-docs",
  themeConfig: {
    navbar: {
      logo: {
        alt: "Verite Logo",
        src: "img/Verite_Full_Color.svg"
      },
      items: [
        {
          to: "verite",
          activeBasePath: "docs/",
          label: "Intro",
          position: "left"
        },
        {
          to: "https://github.com/circlefin/verite/tree/main/packages/e2e-demo#readme",
          label: "Demos",
          position: "left",
          target: "_self"
        },
        {
          to: "blog",
          activeBasePath: "blog/",
          label: "Blog",
          position: "left"
        }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Intro to Verite",
              to: "/verite"
            }
          ]
        },
        {
          title: "Community",
          items: [
            {
              label: "Github",
              href: "https://github.com/circlefin/verite"
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Circle Internet Financial Limited. Built with Docusaurus.`
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme
    }
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "verite",
          routeBasePath: "/verite",
          sidebarPath: require.resolve("./sidebars.js")
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/circlefin/verite-docs"
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      }
    ]
  ],
  customFields: {
    cookieDomain: process.env.COOKIE_DOMAIN,
    demosUrl: process.env.DEMOS_URL || "/"
  },
  scripts: [
    {
      type: "text/javascript",
      id: "hs-script-loader",
      async: true,
      defer: true,
      src: "//js.hs-scripts.com/9304636.js"
    }
  ]
}
