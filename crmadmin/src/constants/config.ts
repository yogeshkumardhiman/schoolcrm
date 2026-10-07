export const APP_CONFIG = {
  institution: {
    name: "School",
    hubName: "Hub",
    fullName: "School Campus",
    shortName: "School ERP",
    motto: "Excellence in Education",
    contactEmail: "",
    contactPhone: "",
    address: "Institutional Campus",
    emailDomain: ""
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
    version: "v2.5.0",
    status: "Stable Production",
    footerText: "Authorized Academic Result Governance",
    enableTransport: true,
    enableGrievance: true,
    enableCompliance: true,
    maxClass: "12TH"
  },

  theme: {
    primary: "#111827", // Slate 900 (Executive Dark)
    secondary: "#2563eb", // Blue 600 (Academic Blue)
    accent: "#f59e0b", // Amber 500 (Alert/Highlight)
    success: "#10b981", // Emerald 500
    danger: "#ef4444", // Red 500
    surface: "#ffffff",
    background: "#F8FAFC",
  },

  fonts: {
    heading: "font-black tracking-tighter", // Poppins stack
    subheading: "font-bold tracking-tight",
    body: "font-medium",
    mono: "font-mono tracking-widest uppercase",
  },

  auth: {
    tokens: {
      auth: "crm_auth_token",
      role: "crm_user_role",
      id: "crm_user_id",
      class: "crm_user_class",
      data: "crm_user_data",
      permissions: "crm_user_permissions",
    }
  }
};

