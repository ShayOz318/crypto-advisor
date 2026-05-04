import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveOnboarding } from "../api/api.js";

function Onboarding() {
    const [assets, setAssets] = useState([]);
    const [investorType, setInvestorType] = useState("");
    const [contentTypes, setContentTypes] = useState([]);

    const navigate = useNavigate();

    const toggleValue = (value, currentValues, setValues) => {
        if (currentValues.includes(value)) {
            setValues(currentValues.filter((item) => item !== value));
        } else {
            setValues([...currentValues, value]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await saveOnboarding({
                assets,
                investorType,
                contentTypes
            });

            alert("Preferences saved!");
            navigate("/dashboard");
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
        <div className="page">
            <h1>Onboarding</h1>
            <p>Tell us what kind of crypto content you are interested in.</p>

            <form onSubmit={handleSubmit}>
                <h2>What crypto assets are you interested in?</h2>

                {["BTC", "ETH", "SOL", "DOGE"].map((asset) => (
                    <label key={asset}>
                        <input
                            type="checkbox"
                            checked={assets.includes(asset)}
                            onChange={() => toggleValue(asset, assets, setAssets)}
                        />
                        {asset}
                    </label>
                ))}

                <h2>What type of investor are you?</h2>

                <select
                    value={investorType}
                    onChange={(e) => setInvestorType(e.target.value)}
                >
                    <option value="">Select investor type</option>
                    <option value="HODLer">HODLer</option>
                    <option value="Day Trader">Day Trader</option>
                    <option value="NFT Collector">NFT Collector</option>
                </select>

                <h2>What kind of content would you like to see?</h2>

                {["Market News", "Charts", "AI Insight", "Fun"].map((type) => (
                    <label key={type}>
                        <input
                            type="checkbox"
                            checked={contentTypes.includes(type)}
                            onChange={() => toggleValue(type, contentTypes, setContentTypes)}
                        />
                        {type}
                    </label>
                ))}

                <br /><br />

                <button type="submit">Save Preferences</button>
            </form>
        </div>
    );
}

export default Onboarding;