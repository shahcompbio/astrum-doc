module.exports = {
  title: "Astrum",
  tagline: "Shah Lab visualization",
  url: "https://spectrum.mskcc.org/docs",
  baseUrl: "/",
  onBrokenLinks: "throw",
  favicon: "img/favicon.ico",
  organizationName: "shahcompbio", // Usually your GitHub org/user name.
  projectName: "astrum-doc", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "Astrum",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        {
          href: "https://github.com/shahcompbio",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Dashboards",
          items: [
            {
              label: "Home",
              href: "https://spectrum.mskcc.org/",
            },
            {
              label: "Sylph",
              href: "https://spectrum.mskcc.org/sylph",
            },
            {
              label: "Hydra",
              href: "https://spectrum.mskcc.org/hydra",
            },
            {
              label: "Mira",
              href: "https://spectrum.mskcc.org/mira",
            },
            {
              label: "Alhena",
              href: "https://spectrum.mskcc.org/alhena",
            },
          ],
        },
      ],
      copyright: `Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: "summary",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/edit/master/website/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/edit/master/website/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
