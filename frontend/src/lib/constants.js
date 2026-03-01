export const APP_TAB_IDS = ["dashboard", "transactions", "budget"];

export const TRANSACTION_CATEGORIES = {
  expense: [
    "Groceries",
    "Rent",
    "Utilities",
    "Transportation",
    "Healthcare",
    "Education",
    "Entertainment",
    "Dining Out",
    "Shopping",
    "Insurance",
    "Loan EMI",
    "Investments",
    "Taxes",
    "Other",
  ],
  income: [
    "Salary",
    "Business Income",
    "Freelance",
    "Investments",
    "Rent Income",
    "Interest",
    "Dividends",
    "Bonus",
    "Other",
  ],
};

export const GST_RATES = {
  Groceries: 0,
  "Dining Out": 5,
  Transportation: 5,
  Shopping: 12,
  Entertainment: 18,
  Healthcare: 0,
  Education: 0,
  Utilities: 18,
  Other: 18,
};

export const BUDGET_CATEGORIES = [
  "Groceries",
  "Rent",
  "Utilities",
  "Transportation",
  "Healthcare",
  "Education",
  "Entertainment",
  "Dining Out",
  "Shopping",
  "Insurance",
  "Loan EMI",
  "Investments",
  "Other",
];

export const BUDGET_PERIOD_OPTIONS = ["monthly", "yearly", "weekly"];

export const HEADER_TAB_ITEMS = [
  { id: "dashboard", label: "Overview", iconKey: "overview" },
  { id: "transactions", label: "Transactions", iconKey: "transactions" },
  { id: "budget", label: "Budget", iconKey: "budget" },
];

export const FOOTER_SOCIAL_LINKS = [
  {
    iconKey: "github",
    href: "https://github.com",
    label: "GitHub",
    ariaLabel: "Visit our GitHub repository",
  },
  {
    iconKey: "twitter",
    href: "https://twitter.com",
    label: "Twitter",
    ariaLabel: "Follow us on Twitter",
  },
  {
    iconKey: "mail",
    href: "mailto:hello@khatabook.com",
    label: "Email",
    ariaLabel: "Send us an email",
  },
];

export const TRANSACTION_CATEGORY_ICONS = {
  Groceries: "🛒",
  Rent: "🏠",
  Utilities: "💡",
  Transportation: "🚗",
  Healthcare: "🏥",
  Education: "📚",
  Entertainment: "🎬",
  "Dining Out": "🍽️",
  Shopping: "🛍️",
  Insurance: "🛡️",
  "Loan EMI": "💰",
  Investments: "📈",
  Taxes: "📋",
  Salary: "💼",
  "Business Income": "💼",
  Freelance: "💻",
  "Rent Income": "🏘️",
  Interest: "🏦",
  Dividends: "📈",
  Bonus: "🎁",
  Other: "📌",
};

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const BUDGET_CATEGORY_CHART_COLORS = [
  "#ff5f34",
  "#be94f5",
  "#fccc42",
  "#5cc9ff",
  "#8ddf7b",
  "#ff9b6a",
  "#6bd6b7",
  "#ffd076",
  "#7bd1ff",
  "#c6a5ff",
];
