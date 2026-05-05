import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOnboardingPreferences, saveOnboarding } from "../api/api.js";

const COIN_OPTIONS = ["BTC", "ETH", "SOL", "DOGE", "ADA", "XRP", "BNB", "AVAX", "MATIC", "LINK", "DOT", "LTC", "SHIB"];

function getPreferencesCacheKey() {
    const token = localStorage.getItem("token") ?? "guest";
    return `onboardingPreferences:${token.slice(-16)}`;
}

function readCachedPreferences() {
    try {
        const raw = localStorage.getItem(getPreferencesCacheKey());
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        return {
            assets: Array.isArray(parsed.assets) ? parsed.assets : [],
            investorType: typeof parsed.investorType === "string" ? parsed.investorType : "",
            contentTypes: Array.isArray(parsed.contentTypes) ? parsed.contentTypes : [],
        };
    } catch {
        return null;
    }
}

function writeCachedPreferences(preferences) {
    localStorage.setItem(getPreferencesCacheKey(), JSON.stringify(preferences));
}

function Onboarding() {
    const [assets, setAssets] = useState([]);
    const [investorType, setInvestorType] = useState("");
    const [contentTypes, setContentTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const cached = readCachedPreferences();
        if (cached) {
            setAssets(cached.assets);
            setInvestorType(cached.investorType);
            setContentTypes(cached.contentTypes);
            setIsLoading(false);
        }

        async function loadPreferences() {
            try {
                const preferences = await getOnboardingPreferences();
                if (preferences) {
                    const normalized = {
                        assets: preferences.assets ?? [],
                        investorType: preferences.investorType ?? "",
                        contentTypes: preferences.contentTypes ?? [],
                    };
                    setAssets(normalized.assets);
                    setInvestorType(normalized.investorType);
                    setContentTypes(normalized.contentTypes);
                    writeCachedPreferences(normalized);
                }
            } catch (error) {
                // Keep empty defaults if no saved preferences exist yet.
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const preferencesToSave = {
                assets,
                investorType,
                contentTypes,
            };
            writeCachedPreferences(preferencesToSave);
            await saveOnboarding(preferencesToSave);

            navigate("/dashboard");
        } catch (error) {
            alert("Failed to save preferences");
        }
    };

    if (isLoading) {
        return <div className="page">Loading preferences...</div>;
    }

    return (
        <div className="page preferences-page">
            <h1>Personalize Your Dashboard</h1>

            <form className="preferences-form" onSubmit={handleSubmit}>
                <h2>Crypto Assets</h2>

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

                <h2>Investor Type</h2>

                <select
                    value={investorType}
                    onChange={(e) => setInvestorType(e.target.value)}
                >
                    <option value="">Select investor type</option>
                    <option value="HODLer">HODLer</option>
                    <option value="Day Trader">Day Trader</option>
                    <option value="NFT Collector">NFT Collector</option>
                </select>

                <h2>Content Types</h2>

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
        </div>
    );
}

export default Onboarding;