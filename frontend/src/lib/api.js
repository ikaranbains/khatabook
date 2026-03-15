const useDirectApi = process.env.NEXT_PUBLIC_USE_DIRECT_API === "true";
const configuredApiUrl = useDirectApi
  ? process.env.NEXT_PUBLIC_API_URL?.trim() || process.env.NEXT_API_BASE_URL?.trim()
  : "";
const API_BASE_URL = configuredApiUrl ? configuredApiUrl.replace(/\/$/, "") : "";
const LOCAL_TRANSACTIONS_KEY = "khatabook_transactions_cache";
const LOCAL_BUDGETS_KEY = "khatabook_budgets_cache";

function readLocalCache(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalCache(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures (private mode/quota)
  }
}

async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    const target = API_BASE_URL || "same-origin /api/v1";
    throw new Error(
      `Unable to connect to API (${target}). Check frontend env and backend availability.`,
    );
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => ({})) : {};
  const textPayload = isJson ? "" : await response.text().catch(() => "");

  if (!response.ok) {
    const flattened = payload?.error?.details?.fieldErrors;
    const firstFieldError =
      flattened && typeof flattened === "object"
        ? Object.values(flattened).flat().find(Boolean)
        : null;
    const message =
      firstFieldError ||
      payload?.error?.message ||
      payload?.message ||
      textPayload ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload?.data;
}

function normalizeTransaction(item) {
  const normalizedName =
    (item.name && String(item.name).trim()) ||
    (item.description && String(item.description).trim()) ||
    "Untitled transaction";
  const amount = Number(item.amount || 0);

  return {
    ...item,
    id: item._id || item.id,
    name: normalizedName,
    description: item.description || "",
    amount,
    date: item.date || item.createdAt,
  };
}

function normalizeBudget(item) {
  const customCategoryName = item.customCategoryName
    ? String(item.customCategoryName).trim()
    : "";
  const normalizedCategory =
    item.category === "Other" && customCategoryName ? customCategoryName : item.category;

  return {
    ...item,
    id: item._id || item.id,
    category: normalizedCategory,
    customCategoryName,
    amount: Number(item.amount || 0),
    spent: Number(item.spent || 0),
    remaining: Number(item.remaining || 0),
    percentage: Number(item.percentage || 0),
  };
}

function normalizeWorkspace(item) {
  return {
    ...item,
    id: item._id || item.id,
    salaryAmount: Number(item.salaryAmount || 0),
  };
}

async function getCurrentWorkspace() {
  const data = await request("/api/v1/workspaces/default");
  return normalizeWorkspace(data || {});
}

async function updateCurrentWorkspace(updates) {
  const data = await request("/api/v1/workspaces/default", {
    method: "PATCH",
    body: updates,
  });
  return normalizeWorkspace(data || {});
}

async function getTransactions() {
  try {
    const data = await request("/api/v1/transactions");
    const normalized = Array.isArray(data) ? data.map(normalizeTransaction) : [];
    writeLocalCache(LOCAL_TRANSACTIONS_KEY, normalized);
    return normalized;
  } catch {
    const cached = readLocalCache(LOCAL_TRANSACTIONS_KEY);
    return Array.isArray(cached) ? cached.map(normalizeTransaction) : [];
  }
}

async function createTransaction(transaction) {
  const payload = {
    ...transaction,
    name: transaction.name?.trim(),
    description: transaction.description?.trim() || "",
  };

  const data = await request("/api/v1/transactions", {
    method: "POST",
    body: payload,
  });
  return normalizeTransaction(data);
}

async function removeTransaction(id) {
  await request(`/api/v1/transactions/${id}`, { method: "DELETE" });
}

async function getBudgets() {
  try {
    const data = await request("/api/v1/budgets");
    const normalized = Array.isArray(data) ? data.map(normalizeBudget) : [];
    writeLocalCache(LOCAL_BUDGETS_KEY, normalized);
    return normalized;
  } catch {
    const cached = readLocalCache(LOCAL_BUDGETS_KEY);
    return Array.isArray(cached) ? cached.map(normalizeBudget) : [];
  }
}

async function createBudget(budget) {
  const payload = {
    ...budget,
    category: budget.category?.trim(),
    customCategoryName: budget.customCategoryName?.trim() || "",
  };

  const data = await request("/api/v1/budgets", {
    method: "POST",
    body: payload,
  });
  return normalizeBudget(data);
}

async function removeBudget(id) {
  await request(`/api/v1/budgets/${id}`, { method: "DELETE" });
}

export {
  getCurrentWorkspace,
  getTransactions,
  updateCurrentWorkspace,
  createTransaction,
  removeTransaction,
  getBudgets,
  createBudget,
  removeBudget,
};
