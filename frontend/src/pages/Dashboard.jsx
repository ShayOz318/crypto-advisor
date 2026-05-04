import { useEffect, useState } from "react";
import { getDashboard, sendFeedback } from "../api/api.js";

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedCoin, setSelectedCoin] = useState("BTC");
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const mockData = {
        coinPrices: ["BTC: $78,731", "ETH: $2,329", "SOL: $84"],
        marketNews: [
            "Bitcoin market shows volatility",
            "Ethereum adoption continues to rise",
            "Crypto regulations evolve globally"
        ],
        aiInsight:
            "As a Day Trader, monitor BTC, ETH and SOL carefully and focus on clear entry and exit points.",
        meme: "Crypto traders checking charts every 5 minutes."
    };

    const chartData = {
        BTC: [
            { day: "Mon", price: 74200 },
            { day: "Tue", price: 75150 },
            { day: "Wed", price: 74820 },
            { day: "Thu", price: 76300 },
            { day: "Fri", price: 77120 },
            { day: "Sat", price: 78600 },
            { day: "Sun", price: 78731 }
        ],
        ETH: [
            { day: "Mon", price: 2180 },
            { day: "Tue", price: 2225 },
            { day: "Wed", price: 2195 },
            { day: "Thu", price: 2260 },
            { day: "Fri", price: 2290 },
            { day: "Sat", price: 2315 },
            { day: "Sun", price: 2329 }
        ],
        SOL: [
            { day: "Mon", price: 71 },
            { day: "Tue", price: 74 },
            { day: "Wed", price: 73 },
            { day: "Thu", price: 78 },
            { day: "Fri", price: 81 },
            { day: "Sat", price: 83 },
            { day: "Sun", price: 84 }
        ]
    };

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const data = await getDashboard();
                setDashboardData(data);
            } catch {
                setDashboardData(mockData);
            }
        };

        loadDashboard();
    }, []);

    const handleVote = async (sectionType, vote) => {
        try {
            await sendFeedback(sectionType, vote);
            alert("Feedback saved!");
        } catch {
            alert("Feedback failed for guest mode");
        }
    };

    if (!dashboardData) {
        return <div className="page">Loading...</div>;
    }

    const selectedData = chartData[selectedCoin];
    const prices = selectedData.map((item) => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const chartWidth = 420;
    const chartHeight = 180;
    const padding = 35;

    const getX = (index) => {
        return padding + index * ((chartWidth - padding * 2) / (selectedData.length - 1));
    };

    const getY = (price) => {
        if (maxPrice === minPrice) {
            return chartHeight / 2;
        }

        return (
            padding +
            ((maxPrice - price) / (maxPrice - minPrice)) * (chartHeight - padding * 2)
        );
    };

    const points = selectedData
        .map((item, index) => `${getX(index)},${getY(item.price)}`)
        .join(" ");

    return (
        <div className="page dashboard-page">
            <div className="background-coin coin-one">₿</div>
            <div className="background-coin coin-two">Ξ</div>
            <div className="background-coin coin-three">◎</div>

            <div className="hero">
                <span className="badge">AI Crypto Advisor</span>
                <h1>Daily Crypto Dashboard</h1>
                <p>Your personalized crypto overview, insights and market mood.</p>
            </div>

            <section className="chart-card">
                <h2>Coin Performance</h2>
                <p>Choose a coin and view its weekly price movement.</p>

                <select
                    className="coin-select"
                    value={selectedCoin}
                    onChange={(e) => {
                        setSelectedCoin(e.target.value);
                        setHoveredPoint(null);
                    }}
                >
                    <option value="BTC">Bitcoin — BTC</option>
                    <option value="ETH">Ethereum — ETH</option>
                    <option value="SOL">Solana — SOL</option>
                </select>

                <div className="chart-wrapper">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart">
                        <line
                            x1={padding}
                            y1={padding}
                            x2={padding}
                            y2={chartHeight - padding}
                            className="axis-line"
                        />

                        <line
                            x1={padding}
                            y1={chartHeight - padding}
                            x2={chartWidth - padding}
                            y2={chartHeight - padding}
                            className="axis-line"
                        />

                        <text x="5" y={padding + 5} className="axis-label">
                            ${maxPrice.toLocaleString()}
                        </text>

                        <text x="5" y={chartHeight - padding + 5} className="axis-label">
                            ${minPrice.toLocaleString()}
                        </text>

                        <polyline points={points} className="chart-line" />

                        {selectedData.map((item, index) => {
                            const x = getX(index);
                            const y = getY(item.price);

                            return (
                                <g key={item.day}>
                                    <text
                                        x={x}
                                        y={chartHeight - 8}
                                        textAnchor="middle"
                                        className="day-label"
                                    >
                                        {item.day}
                                    </text>

                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="6"
                                        className="chart-dot"
                                        onMouseEnter={() => setHoveredPoint({ ...item, x, y })}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                </g>
                            );
                        })}

                        {hoveredPoint && (
                            <g>
                                <rect
                                    x={hoveredPoint.x - 55}
                                    y={hoveredPoint.y - 42}
                                    width="110"
                                    height="30"
                                    rx="10"
                                    className="tooltip-box"
                                />
                                <text
                                    x={hoveredPoint.x}
                                    y={hoveredPoint.y - 22}
                                    textAnchor="middle"
                                    className="tooltip-text"
                                >
                                    {hoveredPoint.day}: ${hoveredPoint.price.toLocaleString()}
                                </text>
                            </g>
                        )}
                    </svg>
                </div>
            </section>

            <div className="dashboard-grid">
                <section className="card">
                    <h2>🪙 Coin Prices</h2>
                    {dashboardData.coinPrices.map((price, index) => (
                        <p key={index}>{price}</p>
                    ))}
                    <button onClick={() => handleVote("COIN_PRICES", "LIKE")}>👍</button>
                    <button onClick={() => handleVote("COIN_PRICES", "DISLIKE")}>👎</button>
                </section>

                <section className="card">
                    <h2>📰 Market News</h2>
                    {dashboardData.marketNews.map((news, index) => (
                        <p key={index}>{news}</p>
                    ))}
                    <button onClick={() => handleVote("MARKET_NEWS", "LIKE")}>👍</button>
                    <button onClick={() => handleVote("MARKET_NEWS", "DISLIKE")}>👎</button>
                </section>

                <section className="card highlight-card">
                    <h2>🤖 AI Insight</h2>
                    <p>{dashboardData.aiInsight}</p>
                    <button onClick={() => handleVote("AI_INSIGHT", "LIKE")}>👍</button>
                    <button onClick={() => handleVote("AI_INSIGHT", "DISLIKE")}>👎</button>
                </section>

                <section className="card">
                    <h2>😂 Fun Crypto Meme</h2>
                    <p>{dashboardData.meme}</p>
                    <button onClick={() => handleVote("MEME", "LIKE")}>👍</button>
                    <button onClick={() => handleVote("MEME", "DISLIKE")}>👎</button>
                </section>
            </div>
        </div>
    );
}

export default Dashboard;