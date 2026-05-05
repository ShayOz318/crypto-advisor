const BASE_URL = "http://localhost:8080";

function getToken() {
    return localStorage.getItem("token");
}

export async function signup(name, email, password) {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
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
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
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
    const response = await fetch(`${BASE_URL}/api/onboarding`, {
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
    const response = await fetch(`${BASE_URL}/api/onboarding`, {
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
    const response = await fetch(`${BASE_URL}/api/dashboard`, {
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
    const response = await fetch(`${BASE_URL}/api/dashboard/coin-chart?symbol=${encodeURIComponent(symbol)}`, {
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
    const response = await fetch(`${BASE_URL}/api/feedback`, {
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