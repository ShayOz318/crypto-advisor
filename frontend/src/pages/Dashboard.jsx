import { useEffect, useState } from "react";
import { getCoinWeeklyChart, getDashboard, sendFeedback } from "../api/api.js";

function normalizeHeadline(title) {
    return (title ?? "")
        .toLowerCase()
        .replace(/\s*[-|:]\s*(update|live|today|now|breaking).*/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function buildNewsFeed(news) {
    const unique = [];
    const seen = new Set();
    const normalizedSeen = new Set();

    (news ?? []).forEach((item) => {
        const title = (item?.title ?? "").trim();
        if (!title) {
            return;
        }
        const key = title.toLowerCase();
        const normalizedKey = normalizeHeadline(title);
        if (!seen.has(key) && !normalizedSeen.has(normalizedKey)) {
            seen.add(key);
            normalizedSeen.add(normalizedKey);
            unique.push(item);
        }
    });

    if (unique.length <= 1) {
        const base = unique[0] ?? {
            title: "Crypto market update",
            url: "https://cryptopanic.com/",
            imageUrl:
                "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80",
            paragraphOne:
                "This update can influence short-term sentiment and positioning across major digital assets.",
            paragraphTwo:
                "Compare this move with liquidity, regulation, and adoption context to estimate whether impact can persist.",
        };

        return [
            base,
            {
                ...base,
                title: `${base.title} - Market Context`,
                paragraphOne:
                    "This is the same story with more market context: check liquidity flow, short-term sentiment, and how correlated assets react before deciding the headline impact.",
                paragraphTwo:
                    "A stronger signal appears when this news aligns with volume confirmation and broader trend structure, rather than a single rapid move.",
            },
            {
                ...base,
                title: `${base.title} - Strategy View`,
                paragraphOne:
                    "This strategy view reframes the same article into action steps: define risk first, map likely reaction zones, and avoid decisions based on headline emotion only.",
                paragraphTwo:
                    "Use staged entries and clear invalidation levels to handle volatility while still capturing opportunities when follow-through appears.",
            },
        ];
    }

    const canonicalSet = new Set(unique.map((item) => normalizeHeadline(item.title)));
    if (canonicalSet.size <= 1) {
        const base = unique[0];
        return [
            base,
            {
                ...base,
                title: `${base.title} - Market Context`,
                paragraphOne:
                    "This is the same story with more market context: check liquidity flow, short-term sentiment, and how correlated assets react before deciding the headline impact.",
                paragraphTwo:
                    "A stronger signal appears when this news aligns with volume confirmation and broader trend structure, rather than a single rapid move.",
            },
            {
                ...base,
                title: `${base.title} - Strategy View`,
                paragraphOne:
                    "This strategy view reframes the same article into action steps: define risk first, map likely reaction zones, and avoid decisions based on headline emotion only.",
                paragraphTwo:
                    "Use staged entries and clear invalidation levels to handle volatility while still capturing opportunities when follow-through appears.",
            },
        ];
    }

    return unique;
}

function getVoteKey(sectionType, itemId) {
    return `${sectionType}:${itemId}`;
}

function getMotivationalLine(investorType) {
    if (investorType === "Day Trader") {
        return "Stay sharp, move fast, and turn every moment into an opportunity ⚡";
    }
    if (investorType === "NFT Collector") {
        return "Discover rare value, follow your vision, and own the future of digital art 🎨";
    }
    return "Stay patient, trust the process, and let time grow your investment 🚀";
}

function getDashboardCacheKey() {
    const token = localStorage.getItem("token") ?? "guest";
    return `dashboardData:${token.slice(-16)}`;
}

function readCachedDashboard() {
    try {
        const raw = localStorage.getItem(getDashboardCacheKey());
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeCachedDashboard(data) {
    localStorage.setItem(getDashboardCacheKey(), JSON.stringify(data));
}

function extractCurrentPrice(coinPrices, symbol) {
    const target = (coinPrices ?? []).find((line) => line.startsWith(`${symbol}:`));
    if (!target) {
        return null;
    }

    const numeric = Number(target.replace(`${symbol}: $`, "").replaceAll(",", ""));
    return Number.isFinite(numeric) ? numeric : null;
}

function preferredCoins(assets) {
    return [
        ...new Set(
            (assets ?? [])
                .map((symbol) => (typeof symbol === "string" ? symbol.trim() : ""))
                .filter(Boolean)
        ),
    ];
}

function formatUsd(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: price >= 100 ? 2 : 4,
    }).format(price);
}

function getGreetingByHour(hour) {
    if (hour >= 5 && hour < 12) {
        return "Good morning";
    }
    if (hour >= 12 && hour < 17) {
        return "Good afternoon";
    }
    if (hour >= 17 && hour < 21) {
        return "Good evening";
    }
    return "Good night";
}

function normalizeDisplayName(rawName) {
    if (!rawName || typeof rawName !== "string") {
        return "";
    }

    const trimmed = rawName.trim().replace(/\s+/g, " ");
    if (!trimmed) {
        return "";
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function readUserName() {
    const stored = normalizeDisplayName(localStorage.getItem("userName"));
    if (stored) {
        return stored;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        return "";
    }

    try {
        const payloadPart = token.split(".")[1];
        if (!payloadPart) {
            return "";
        }

        const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(atob(normalized));
        const tokenName = normalizeDisplayName(decoded?.name);

        if (tokenName) {
            localStorage.setItem("userName", tokenName);
        }

        return tokenName;
    } catch {
        return "";
    }
}

function CoinLineChart({ points }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ leftPercent: 0, topPercent: 0 });

    useEffect(() => {
        setHoveredIndex(null);
    }, [points]);

    if (!points || points.length < 2) {
        return <p className="chart-empty">Not enough chart data yet.</p>;
    }

    const width = 560;
    const height = 220;
    const padding = 28;

    const prices = points.map((point) => point.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    const xStep = (width - padding * 2) / (points.length - 1);
    const horizontalPaddingPercent = (padding / width) * 100;
    const path = points
        .map((point, index) => {
            const x = padding + xStep * index;
            const y = height - padding - ((point.price - minPrice) / range) * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(" ");

    const updateHover = (index) => {
        const x = padding + xStep * index;
        const y =
            height - padding - ((points[index].price - minPrice) / range) * (height - padding * 2);

        setHoveredIndex(index);
        setTooltipPosition({
            leftPercent: Math.min(92, Math.max(8, (x / width) * 100)),
            topPercent: Math.min(88, Math.max(12, (y / height) * 100)),
        });
    };

    const hoveredPoint = hoveredIndex === null ? null : points[hoveredIndex];
    const previousHoveredPoint =
        hoveredIndex === null || hoveredIndex === 0 ? null : points[hoveredIndex - 1];
    const priceDelta =
        hoveredPoint && previousHoveredPoint
            ? hoveredPoint.price - previousHoveredPoint.price
            : null;
    const deltaPrefix = priceDelta === null ? "" : priceDelta > 0 ? "+" : priceDelta < 0 ? "-" : "";
    const deltaClassName =
        priceDelta === null
            ? "coin-chart-tooltip-delta neutral"
            : priceDelta > 0
              ? "coin-chart-tooltip-delta up"
              : priceDelta < 0
                ? "coin-chart-tooltip-delta down"
                : "coin-chart-tooltip-delta neutral";

    return (
        <div className="coin-chart">
            <div
                className="coin-chart-graph"
                onMouseLeave={() => {
                    setHoveredIndex(null);
                }}
            >
                <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Weekly coin price chart">
                    <polyline points={path} fill="none" stroke="#5b4df5" strokeWidth="3" />
                    {points.map((point, index) => {
                        const x = padding + xStep * index;
                        const y =
                            height - padding - ((point.price - minPrice) / range) * (height - padding * 2);
                        return (
                            <g key={`${point.date}-${index}`}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="14"
                                    fill="transparent"
                                    style={{ cursor: "pointer" }}
                                    onMouseEnter={() => updateHover(index)}
                                    onFocus={() => updateHover(index)}
                                    onBlur={() => setHoveredIndex(null)}
                                    tabIndex={0}
                                />
                                <circle cx={x} cy={y} r="3.5" fill="#26c6f9" pointerEvents="none" />
                            </g>
                        );
                    })}
                </svg>

                {hoveredPoint && (
                    <div
                        className="coin-chart-tooltip"
                        style={{
                            left: `${tooltipPosition.leftPercent}%`,
                            top: `${tooltipPosition.topPercent}%`,
                        }}
                    >
                        <div className="coin-chart-tooltip-date">{hoveredPoint.date}</div>
                        <div className="coin-chart-tooltip-price">{formatUsd(hoveredPoint.price)}</div>
                        <div className={deltaClassName}>
                            {priceDelta === null
                                ? "No prior point"
                                : `${deltaPrefix}${formatUsd(Math.abs(priceDelta))}`}
                        </div>
                    </div>
                )}
            </div>
            <div className="chart-labels">
                <div
                    className="chart-labels-inner"
                    style={{
                        paddingLeft: `${horizontalPaddingPercent}%`,
                        paddingRight: `${horizontalPaddingPercent}%`,
                    }}
                >
                    {points.map((point, index) => (
                        <span key={`${point.date}-label-${index}`}>{point.date}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedCoin, setSelectedCoin] = useState("BTC");
    const [coinChartData, setCoinChartData] = useState([]);
    const [chartDataByCoin, setChartDataByCoin] = useState({});
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [now, setNow] = useState(new Date());
    const [selectedVotes, setSelectedVotes] = useState({});
    const chartUpdateCadence = dashboardData?.chartUpdateCadence ?? "daily";

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const cached = readCachedDashboard();
        if (cached) {
            setDashboardData(cached);
        }

        async function loadDashboard() {
            try {
                const data = await getDashboard();
                setDashboardData(data);
                writeCachedDashboard(data);
            } catch (error) {
                alert("Failed to load dashboard");
            }
        }

        loadDashboard();
    }, []);

    useEffect(() => {
        async function loadCoinChart() {
            if (!selectedCoin) {
                return;
            }

            setIsChartLoading(true);
            try {
                const chartData = await getCoinWeeklyChart(selectedCoin);
                if (chartData.length >= 2) {
                    setCoinChartData(chartData);
                    setChartDataByCoin((prev) => ({ ...prev, [selectedCoin]: chartData }));
                    return;
                }
                if (chartDataByCoin[selectedCoin]?.length >= 2) {
                    setCoinChartData(chartDataByCoin[selectedCoin]);
                    return;
                }
                setCoinChartData([]);
            } catch (error) {
                if (chartDataByCoin[selectedCoin]?.length >= 2) {
                    setCoinChartData(chartDataByCoin[selectedCoin]);
                    return;
                }
                setCoinChartData([]);
            } finally {
                setIsChartLoading(false);
            }
        }

        loadCoinChart();
    }, [selectedCoin, dashboardData, chartUpdateCadence]);

    useEffect(() => {
        if (!dashboardData) {
            return;
        }

        const symbols = preferredCoins(dashboardData.assets);

        if (symbols.length === 0) {
            setSelectedCoin("");
            setCoinChartData([]);
            return;
        }

        if (!symbols.includes(selectedCoin)) {
            setSelectedCoin(symbols[0]);
        }
    }, [dashboardData, selectedCoin]);

    useEffect(() => {
        const count = buildNewsFeed(dashboardData?.marketNews).length;
        if (count === 0) {
            setCurrentNewsIndex(0);
            return;
        }
        setCurrentNewsIndex((prev) => {
            if (prev >= count) {
                return 0;
            }
            return prev === 0 ? Math.floor(Math.random() * count) : prev;
        });
    }, [dashboardData?.marketNews]);

    useEffect(() => {
        const newsCount = buildNewsFeed(dashboardData?.marketNews).length;
        if (newsCount <= 1) {
            return undefined;
        }

        const intervalId = setInterval(() => {
            setCurrentNewsIndex((prev) => (prev + 1) % newsCount);
        }, 45000);

        return () => clearInterval(intervalId);
    }, [dashboardData?.marketNews]);

    const handleVote = async (sectionType, vote, itemId, itemLabel) => {
        const voteKey = getVoteKey(sectionType, itemId);
        const previousVote = selectedVotes[voteKey];
        setSelectedVotes((prev) => ({ ...prev, [voteKey]: vote }));
        try {
            await sendFeedback(sectionType, vote, itemId, itemLabel);
            alert("Feedback saved");
        } catch (error) {
            setSelectedVotes((prev) => ({ ...prev, [voteKey]: previousVote }));
            alert("Feedback failed");
        }
    };

    const getSelectedVote = (sectionType, itemId) => {
        const key = getVoteKey(sectionType, itemId);
        return selectedVotes[key];
    };

    if (!dashboardData) {
        return <div className="page">Loading...</div>;
    }

    const enabled = new Set(dashboardData.contentTypes ?? []);
    const showAll = enabled.size === 0;

    const showCoinPrices = showAll || enabled.has("Charts") || enabled.has("Coin Prices");
    const showNews = showAll || enabled.has("Market News");
    const showAi = showAll || enabled.has("AI Insight");
    const memeEnabled = showAll || enabled.has("Fun") || enabled.has("Fun Crypto Meme");
    const showMeme = memeEnabled && Boolean(dashboardData?.memeImageUrl);

    const chartCoins = preferredCoins(dashboardData.assets);
    const coinCards = chartCoins.map((symbol) => ({
        symbol,
        price: extractCurrentPrice(dashboardData.coinPrices, symbol),
    }));
    const greeting = getGreetingByHour(now.getHours());
    const clock = now.toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    });
    const userName = readUserName();
    const personalizedGreeting = userName ? `${greeting}, ${userName}` : greeting;
    const investorType = dashboardData.investorType ?? "HODLer";
    const motivationalLine = getMotivationalLine(investorType);
    const marketNews = buildNewsFeed(dashboardData.marketNews);
    const currentNews = marketNews[currentNewsIndex] ?? null;
    const coinChartTitle =
        chartUpdateCadence === "hourly"
            ? "Coin Prices (updates every hour)"
            : chartUpdateCadence === "weekly"
              ? "Coin Prices (updates weekly on Sunday 00:00)"
              : "Coin Prices (updates once per day)";

    const handlePrevNews = () => {
        if (marketNews.length === 0) {
            return;
        }
        setCurrentNewsIndex((prev) => (prev === 0 ? marketNews.length - 1 : prev - 1));
    };

    const handleNextNews = () => {
        if (marketNews.length === 0) {
            return;
        }
        setCurrentNewsIndex((prev) => (prev === marketNews.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="page dashboard-page">
            <section className="dashboard-hero">
                <div className="dashboard-hero-content">
                    <p className="hero-eyebrow">AI Crypto Advisor</p>
                    <p className="hero-greeting">{personalizedGreeting}</p>
                    <p className="hero-clock">{clock}</p>
                    <h1>Daily Crypto Dashboard</h1>
                    <p className="hero-motivation">{motivationalLine}</p>
                </div>
                <video
                    className="dashboard-hero-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label="Crypto market video background"
                >
                    <source src="/coins2.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </section>

            <div className="dashboard-grid">
                {showCoinPrices && (
                    <section className="card">
                        <h2>{coinChartTitle}</h2>
                        {coinCards.length > 0 ? (
                            <div className="coin-cards-grid">
                                {coinCards.map((coin) => {
                                    const isActive = selectedCoin === coin.symbol;
                                    return (
                                        <article
                                            key={coin.symbol}
                                            className={`coin-price-card ${isActive ? "is-active" : ""}`}
                                            onClick={() => setSelectedCoin(coin.symbol)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    setSelectedCoin(coin.symbol);
                                                }
                                            }}
                                        >
                                            <p className="coin-price-symbol">{coin.symbol}</p>
                                            <p className="coin-price-value">
                                                {Number.isFinite(coin.price)
                                                    ? formatUsd(coin.price)
                                                    : "Price unavailable"}
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="chart-empty">
                                No coins selected in preferences. Update Preferences to choose assets for
                                charts.
                            </p>
                        )}

                        <p className="coin-selected-label">Chart: {selectedCoin}</p>
                        {isChartLoading ? (
                            <p className="chart-empty">
                                {chartUpdateCadence === "hourly"
                                    ? "Loading 12-hour chart..."
                                    : chartUpdateCadence === "weekly"
                                      ? "Loading 7-week chart..."
                                      : "Loading 7-day chart..."}
                            </p>
                        ) : (
                            <CoinLineChart points={coinChartData} />
                        )}
                        <div className="section-vote-buttons">
                            {(() => {
                                const itemId = `coin-chart:${selectedCoin}`;
                                const selected = getSelectedVote("COIN_PRICES", itemId);
                                return (
                                    <>
                                        <button
                                            className={`vote-button ${selected === "LIKE" ? "is-selected" : ""}`}
                                            onClick={() =>
                                                handleVote(
                                                    "COIN_PRICES",
                                                    "LIKE",
                                                    itemId,
                                                    `Chart for ${selectedCoin}`
                                                )
                                            }
                                            aria-pressed={selected === "LIKE"}
                                        >
                                            👍
                                        </button>
                                        <button
                                            className={`vote-button ${
                                                selected === "DISLIKE" ? "is-selected" : ""
                                            }`}
                                            onClick={() =>
                                                handleVote(
                                                    "COIN_PRICES",
                                                    "DISLIKE",
                                                    itemId,
                                                    `Chart for ${selectedCoin}`
                                                )
                                            }
                                            aria-pressed={selected === "DISLIKE"}
                                        >
                                            👎
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </section>
                )}

                {showNews && (
                    <section className="card">
                        <h2>Market News</h2>
                        {currentNews ? (
                            <div className="news-carousel">
                                <img
                                    className="news-carousel-image"
                                    src={currentNews.imageUrl}
                                    alt={currentNews.title}
                                />
                                <p className="news-carousel-item">{currentNews.title}</p>
                                <p className="news-carousel-paragraph">
                                    {currentNews.paragraphOne ??
                                        "This update may affect market behavior and investor sentiment in the short term."}
                                </p>
                                <p className="news-carousel-paragraph">
                                    {currentNews.paragraphTwo ??
                                        "Keep an eye on volume, trend confirmation, and related macro context to evaluate whether the move is sustainable."}
                                </p>
                                {currentNews.url && (
                                    <a
                                        className="news-carousel-link"
                                        href={currentNews.url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Click here for the full article.
                                    </a>
                                )}
                                <div className="news-carousel-controls">
                                    <button type="button" onClick={handlePrevNews} aria-label="Previous news item">
                                        ◀
                                    </button>
                                    <span>
                                        {currentNewsIndex + 1} / {marketNews.length}
                                    </span>
                                    <button type="button" onClick={handleNextNews} aria-label="Next news item">
                                        ▶
                                    </button>
                                </div>
                                <div className="news-vote-buttons">
                                    {(() => {
                                        const itemId = `news:${currentNews.title}`;
                                        const selected = getSelectedVote("MARKET_NEWS", itemId);
                                        return (
                                            <>
                                    <button
                                        className={`vote-button ${selected === "LIKE" ? "is-selected" : ""}`}
                                        onClick={() =>
                                            handleVote(
                                                "MARKET_NEWS",
                                                "LIKE",
                                                itemId,
                                                currentNews.title
                                            )
                                        }
                                        aria-pressed={selected === "LIKE"}
                                    >
                                        👍
                                    </button>
                                    <button
                                        className={`vote-button ${selected === "DISLIKE" ? "is-selected" : ""}`}
                                        onClick={() =>
                                            handleVote(
                                                "MARKET_NEWS",
                                                "DISLIKE",
                                                itemId,
                                                currentNews.title
                                            )
                                        }
                                        aria-pressed={selected === "DISLIKE"}
                                    >
                                        👎
                                    </button>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <p className="chart-empty">No news available right now.</p>
                        )}
                    </section>
                )}

                {showMeme && (
                    <section className="card">
                        <h2>Fun Crypto Meme</h2>
                        <p>{dashboardData.meme ?? "Crypto meme of the moment"}</p>
                        {dashboardData.memeImageUrl ? (
                            <img className="meme-image" src={dashboardData.memeImageUrl} alt="Crypto meme" />
                        ) : null}
                        {dashboardData.memePostUrl ? (
                            <a
                                className="news-carousel-link"
                                href={dashboardData.memePostUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View original post
                            </a>
                        ) : null}
                        <div className="section-vote-buttons">
                            {(() => {
                                const itemId =
                                    dashboardData.memeImageUrl ?? dashboardData.meme ?? "meme:unavailable";
                                const selected = getSelectedVote("MEME", itemId);
                                return (
                                    <>
                            <button
                                className={`vote-button ${selected === "LIKE" ? "is-selected" : ""}`}
                                onClick={() =>
                                    handleVote(
                                        "MEME",
                                        "LIKE",
                                        itemId,
                                        dashboardData.meme ?? "Crypto meme"
                                    )
                                }
                                aria-pressed={selected === "LIKE"}
                            >
                                👍
                            </button>
                            <button
                                className={`vote-button ${selected === "DISLIKE" ? "is-selected" : ""}`}
                                onClick={() =>
                                    handleVote(
                                        "MEME",
                                        "DISLIKE",
                                        itemId,
                                        dashboardData.meme ?? "Crypto meme"
                                    )
                                }
                                aria-pressed={selected === "DISLIKE"}
                            >
                                👎
                            </button>
                                    </>
                                );
                            })()}
                        </div>
                    </section>
                )}

                {showAi && (
                    <section className="card">
                        <h2>AI Insight</h2>
                        <p>{dashboardData.aiInsight ?? "No insight available."}</p>
                        <div className="section-vote-buttons">
                            {(() => {
                                const itemId = "ai:insight-of-day";
                                const selected = getSelectedVote("AI_INSIGHT", itemId);
                                return (
                                    <>
                            <button
                                className={`vote-button ${selected === "LIKE" ? "is-selected" : ""}`}
                                onClick={() =>
                                    handleVote(
                                        "AI_INSIGHT",
                                        "LIKE",
                                        itemId,
                                        dashboardData.aiInsight ?? ""
                                    )
                                }
                                aria-pressed={selected === "LIKE"}
                            >
                                👍
                            </button>
                            <button
                                className={`vote-button ${selected === "DISLIKE" ? "is-selected" : ""}`}
                                onClick={() =>
                                    handleVote(
                                        "AI_INSIGHT",
                                        "DISLIKE",
                                        itemId,
                                        dashboardData.aiInsight ?? ""
                                    )
                                }
                                aria-pressed={selected === "DISLIKE"}
                            >
                                👎
                            </button>
                                    </>
                                );
                            })()}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Dashboard;