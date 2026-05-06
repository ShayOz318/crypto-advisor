import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getOnboardingPreferences,
    saveOnboarding,
    updateUserName,
    updateUserPassword,
} from "../api/api.js";

const COIN_OPTIONS = ["BTC", "ETH", "SOL", "DOGE", "ADA", "XRP", "BNB", "AVAX", "MATIC", "LINK", "DOT", "LTC", "SHIB"];

function Settings() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("preferences");
    const [assets, setAssets] = useState([]);
    const [investorType, setInvestorType] = useState("");
    const [contentTypes, setContentTypes] = useState([]);
    const [name, setName] = useState(localStorage.getItem("userName") ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPreferences() {
            try {
                const preferences = await getOnboardingPreferences();
                setAssets(preferences.assets ?? []);
                setInvestorType(preferences.investorType ?? "");
                setContentTypes(preferences.contentTypes ?? []);
            } catch {
                // keep defaults
            } finally {
                setIsLoading(false);
            }
        }

        loadPreferences();
    }, []);

    const toggleValue = (value, values, setValues) => {
        if (values.includes(value)) {
            setValues(values.filter((item) => item !== value));
        } else {
            setValues([...values, value]);
        }
    };

    const handleSavePreferences = async (e) => {
        e.preventDefault();
        try {
            await saveOnboarding({ assets, investorType, contentTypes });
            navigate("/dashboard");
        } catch (error) {
            alert(error.message || "Failed to update preferences");
        }
    };

    const handleUpdateName = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateUserName(name);
            if (updated?.name) {
                localStorage.setItem("userName", updated.name);
                setName(updated.name);
            }
            alert("Name updated");
        } catch (error) {
            alert(error.message || "Failed to update name");
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            await updateUserPassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            alert("Password updated");
        } catch (error) {
            alert(error.message || "Failed to update password");
        }
    };

    if (isLoading) {
        return <div className="page">Loading settings...</div>;
    }

    return (
        <div className="page settings-page">
            <h1>Settings</h1>

            <div className="settings-switcher">
                <button
                    type="button"
                    className={activeSection === "preferences" ? "is-active" : ""}
                    onClick={() => setActiveSection("preferences")}
                >
                    Preferences
                </button>
                <button
                    type="button"
                    className={activeSection === "profile" ? "is-active" : ""}
                    onClick={() => setActiveSection("profile")}
                >
                    Personal Profile
                </button>
            </div>

            {activeSection === "preferences" ? (
                <form className="preferences-form" onSubmit={handleSavePreferences}>
                    <h2>Preferences</h2>

                    <h3>Crypto Assets</h3>
                    <div className="options-grid">
                        {COIN_OPTIONS.map((asset) => (
                            <label key={asset} className="option-chip">
                                <input
                                    type="checkbox"
                                    checked={assets.includes(asset)}
                                    onChange={() => toggleValue(asset, assets, setAssets)}
                                />
                                {asset}
                            </label>
                        ))}
                    </div>

                    <h3>Investor Type</h3>
                    <select value={investorType} onChange={(e) => setInvestorType(e.target.value)}>
                        <option value="">Select investor type</option>
                        <option value="HODLer">HODLer</option>
                        <option value="Day Trader">Day Trader</option>
                        <option value="NFT Collector">NFT Collector</option>
                    </select>

                    <h3>Content Types</h3>
                    <div className="options-grid">
                        {["Market News", "Charts", "AI Insight", "Fun"].map((type) => (
                            <label key={type} className="option-chip">
                                <input
                                    type="checkbox"
                                    checked={contentTypes.includes(type)}
                                    onChange={() => toggleValue(type, contentTypes, setContentTypes)}
                                />
                                {type}
                            </label>
                        ))}
                    </div>

                    <button type="submit">Save Preferences</button>
                </form>
            ) : (
                <>
                    <form onSubmit={handleUpdateName}>
                        <h2>Change Name</h2>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter new name"
                            required
                        />
                        <button type="submit">Update Name</button>
                    </form>

                    <form onSubmit={handleUpdatePassword}>
                        <h2>Change Password</h2>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Current password"
                            required
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password (min 6 chars)"
                            minLength={6}
                            required
                        />
                        <button type="submit">Update Password</button>
                    </form>
                </>
            )}
        </div>
    );
}

export default Settings;
