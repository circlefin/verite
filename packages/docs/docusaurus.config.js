const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/dracula")
const DEMOS_URL =
  "https://github.com/centrehq/demo-site/tree/main/packages/demos"

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Verite Documentation",
  tagline: "Verite decentralized identity for DeFi",
  url: "https://verite.id",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "centre.io",
  projectName: "verite-docs",
  themeConfig: {
    navbar: {
      title: "Verite Docs",
      logo: {
        alt: "Verite Logo",
        src: "img/logo.png"
      },
      items: [
        {
          to: "docs/intro",
          activeBasePath: "docs/",
          label: "Intro",
          position: "left"
        },
        {
          to: DEMOS_URL,
          label: "Demos",
          position: "left",
          target: "_self"
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
              to: "/docs/intro"
            }
          ]
        },
        {
          title: "Community",
          items: [
            {
              label: "Github",
              href: "https://github.com/centrehq/verite"
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Centre Consortium, LLC. Built with Docusaurus.`
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
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/centrehq/verite"
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/centrehq/verite-docs"
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      }
    ]
  ],
  customFields: {
    cookieDomain: process.env.COOKIE_DOMAIN,
    passwordProtected: process.env.PASSWORD_PROTECTED === "true",
    demosUrl: DEMOS_URL
  }
}
