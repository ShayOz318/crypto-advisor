const BASE_URL = import.meta.env.VITE_API_URL;

function getBaseUrl() {
    if (!BASE_URL || !BASE_URL.trim()) {
        throw new Error("VITE_API_URL is not configured");
    }
    return BASE_URL.replace(/\/+$/, "");
}

function buildApiUrl(path) {
    return `${getBaseUrl()}${path}`;
}

function getToken() {
    return localStorage.getItem("token");
}

export async function signup(name, email, password) {
    const response = await fetch(buildApiUrl("/api/auth/signup"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function login(email, password) {
    const response = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function saveOnboarding(preferences) {
    const response = await fetch(buildApiUrl("/api/onboarding"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(preferences),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getOnboardingPreferences() {
    const response = await fetch(buildApiUrl("/api/onboarding"), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const raw = await response.text();
    if (!raw) {
        return {
            assets: [],
            investorType: "",
            contentTypes: [],
        };
    }

    return JSON.parse(raw);
}

export async function getDashboard() {
    const response = await fetch(buildApiUrl("/api/dashboard"), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getCoinWeeklyChart(symbol) {
    const response = await fetch(buildApiUrl(`/api/dashboard/coin-chart?symbol=${encodeURIComponent(symbol)}`), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function sendFeedback(sectionType, vote, itemId, itemLabel) {
    const response = await fetch(buildApiUrl("/api/feedback"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ sectionType, vote, itemId, itemLabel }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function updateUserName(name) {
    const response = await fetch(buildApiUrl("/api/settings/name"), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function updateUserPassword(currentPassword, newPassword) {
    const response = await fetch(buildApiUrl("/api/settings/password"), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
}