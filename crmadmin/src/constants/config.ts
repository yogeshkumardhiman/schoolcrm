import schoolConfig from "../../school-config.json";

export const APP_CONFIG = {
  institution: {
    name: schoolConfig.institution.name || "SDM",
    hubName: schoolConfig.institution.hubName || "Hub",
    fullName: schoolConfig.institution.fullName || "S.D.M. Public School",
    shortName: schoolConfig.institution.shortName || "SDM CMS",
    motto: schoolConfig.institution.motto || "Excellence in Education",
    contactEmail: schoolConfig.institution.contactEmail || "info@sdm.com",
    contactPhone: schoolConfig.institution.contactPhone || "9999988888",
    address: schoolConfig.institution.address || "Institutional Campus",
    emailDomain: schoolConfig.institution.emailDomain || "sdm.com"
  },

  academic: {
    currentSession: (() => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed (April is 3)
      const sessionYear = currentMonth < 3 ? currentYear - 1 : currentYear;
      return `${sessionYear} - ${sessionYear + 1}`;
    })(),
    classes: ["NURSERY", "LKG", "UKG", "1ST", "2ND", "3RD", "4TH", "5TH", "6TH", "7TH", "8TH", "9TH", "10TH", "11TH", "12TH"],
    examTypes: ["UNIT TEST 1", "UNIT TEST 2", "UNIT TEST 3", "HALF YEARLY", "FINAL"],
    sections: ["A", "B", "C"],
    years: ["2024", "2025", "2026", "2027"]
  },

  gallery: {
    categories: [
      { id: "GENERAL", label: "General Repository" },
      { id: "SCHOOL", label: "School Infrastructure" },
      { id: "EVENTS", label: "Institutional Events" },
      { id: "SPORTS", label: "Sports & Athletics" },
      { id: "ACHIEVEMENTS", label: "Academic Achievements" },
      { id: "ACTIVITIES", label: "Co-Curricular Activities" }
    ],
    eventTypes: [
      { id: "ANNUAL_DAY", label: "Annual Day" },
      { id: "SPORTS_DAY", label: "Sports Day" },
      { id: "COMPETITION", label: "Competition" },
      { id: "EXHIBITION", label: "Science/Art Exhibition" },
      { id: "CELEBRATION", label: "Festival Celebration" }
    ]
  },

  system: {
    version: schoolConfig.system.version || "v2.5.0",
    status: schoolConfig.system.status || "Stable Production",
    footerText: schoolConfig.system.footerText || "Authorized Academic Result Governance",
    enableTransport: schoolConfig.system.enableTransport !== false,
    enableGrievance: schoolConfig.system.enableGrievance !== false,
    enableCompliance: schoolConfig.system.enableCompliance !== false,
    maxClass: schoolConfig.system.maxClass || "12TH"
  },

  theme: {
    primary: schoolConfig.theme.primary || "#111827", // Slate 900 (Executive Dark)
    secondary: schoolConfig.theme.secondary || "#2563eb", // Blue 600 (Academic Blue)
    accent: schoolConfig.theme.accent || "#f59e0b", // Amber 500 (Alert/Highlight)
    success: schoolConfig.theme.success || "#10b981", // Emerald 500
    danger: schoolConfig.theme.danger || "#ef4444", // Red 500
    surface: schoolConfig.theme.surface || "#ffffff",
    background: schoolConfig.theme.background || "#F8FAFC",
  },

  fonts: {
    heading: "font-black tracking-tighter", // Poppins stack
    subheading: "font-bold tracking-tight",
    body: "font-medium",
    mono: "font-mono tracking-widest uppercase",
  },

  auth: {
    tokens: {
      auth: `${(schoolConfig.institution.name || "crm").toLowerCase()}_auth_token`,
      role: `${(schoolConfig.institution.name || "crm").toLowerCase()}_user_role`,
      id: `${(schoolConfig.institution.name || "crm").toLowerCase()}_user_id`,
      class: `${(schoolConfig.institution.name || "crm").toLowerCase()}_user_class`,
      data: `${(schoolConfig.institution.name || "crm").toLowerCase()}_user_data`,
      permissions: `${(schoolConfig.institution.name || "crm").toLowerCase()}_user_permissions`,
    }
  }
};

