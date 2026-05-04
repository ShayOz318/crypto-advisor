const BASE_URL = "http://localhost:8080";

export async function signup(name, email, password) {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
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
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getDashboard() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/api/dashboard`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!response.ok) {
        throw new Error("Failed to load dashboard");
    }

    return response.json();
}

export async function sendFeedback(sectionType, vote) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ sectionType, vote })
    });

    if (!response.ok) {
        throw new Error("Failed to send feedback");
    }

    return response.json();
}