export interface NavLink {
  labelKey: string;
  href: string;
}

export interface NavColumn {
  titleKey: string;
  links: NavLink[];
}

export const megaMenuColumns: NavColumn[] = [
  {
    titleKey: "buy",
    links: [
      { labelKey: "buyHouses", href: "/properties?purpose=SALE&type=HOUSE" },
      { labelKey: "buyPlots", href: "/properties?purpose=SALE&type=PLOT" },
      { labelKey: "buyPlotFiles", href: "/properties?purpose=SALE&type=PLOT_FILE" },
      { labelKey: "buyCommercial", href: "/properties?purpose=SALE&category=COMMERCIAL" },
      { labelKey: "buyProjects", href: "/projects" },
    ],
  },
  {
    titleKey: "rent",
    links: [
      { labelKey: "rentHouses", href: "/properties?purpose=RENT&type=HOUSE" },
      { labelKey: "rentPortions", href: "/properties?purpose=RENT&type=UPPER_PORTION" },
      { labelKey: "rentFlats", href: "/properties?purpose=RENT&type=FLAT" },
      {
        labelKey: "rentShopsOffices",
        href: "/properties?purpose=RENT&category=COMMERCIAL",
      },
    ],
  },
  {
    titleKey: "locations",
    links: [
      { labelKey: "locDhaPhases", href: "/areas/lahore/dha" },
      { labelKey: "locEme", href: "/areas/lahore/eme" },
      { labelKey: "locRaya", href: "/areas/lahore/raya" },
      { labelKey: "locBahriaTown", href: "/areas/lahore/bahria-town" },
      { labelKey: "locModelTown", href: "/areas/lahore/model-town" },
    ],
  },
  {
    titleKey: "services",
    links: [
      { labelKey: "serviceConstruction", href: "/services/construction" },
      { labelKey: "serviceArchitecture", href: "/services/architecture" },
      { labelKey: "serviceInterior", href: "/services/interior-design" },
      { labelKey: "serviceInvestment", href: "/services/investment-consulting" },
      { labelKey: "servicePropertyMgmt", href: "/services/property-management" },
      { labelKey: "serviceValuation", href: "/services/valuation" },
    ],
  },
  {
    titleKey: "tools",
    links: [
      { labelKey: "toolFileRates", href: "/file-rates" },
      { labelKey: "toolMaps", href: "/maps" },
      { labelKey: "toolPriceTrends", href: "/tools/price-trends" },
      { labelKey: "toolInvestmentCalc", href: "/tools/investment-calculator" },
      { labelKey: "toolMortgageCalc", href: "/tools/mortgage-calculator" },
      { labelKey: "toolAreaGuides", href: "/areas" },
    ],
  },
  {
    titleKey: "company",
    links: [
      { labelKey: "companyAbout", href: "/about" },
      { labelKey: "companyTeam", href: "/agents" },
      { labelKey: "companyCareers", href: "/careers" },
      { labelKey: "companyBlog", href: "/blog" },
      { labelKey: "companyReviews", href: "/reviews" },
      { labelKey: "companyFaq", href: "/faq" },
      { labelKey: "companyContact", href: "/contact" },
    ],
  },
];

export const mobileNavItems = [
  { labelKey: "search", href: "/properties", icon: "Search" as const },
  { labelKey: "saved", href: "/saved", icon: "Heart" as const },
  { labelKey: "map", href: "/properties?view=map", icon: "MapPin" as const },
  { labelKey: "chat", href: "#advisor-chat", icon: "MessageCircle" as const },
  { labelKey: "account", href: "/profile", icon: "User" as const },
];
