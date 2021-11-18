const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/dracula")

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Verity Documentation",
  tagline: "Verity decentralized identity for DeFi",
  url: "https://docs.verity.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "centre.io",
  projectName: "verity-docs",
  themeConfig: {
    navbar: {
      title: "Verity Docs",
      logo: {
        alt: "Verity Logo",
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
          to: process.env.DEMOS_URL || "/",
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
              label: "Intro to Verity",
              to: "/docs/intro"
            }
          ]
        },
        {
          title: "Community",
          items: [
            {
              label: "Github",
              href: "https://github.com/centrehq/verity"
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
          editUrl: "https://github.com/centrehq/verity"
        },
        blog: {
          showReadingTime: true,
          editUrl: "hhttps://github.com/centrehq/verity-docs"
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      }
    ]
  ],
  customFields: {
    protectedPassword: process.env.PROTECTED_PASSWORD,
    passwordCookie: process.env.PASSWORD_PROTECTION_COOKIE || "PPBqWA9"
  }
}
