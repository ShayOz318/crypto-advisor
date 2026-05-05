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

function buildFallbackChartData(currentPrice, isHourlyCadence) {
    if (!Number.isFinite(currentPrice)) {
        return [];
    }

    const now = new Date();
    if (isHourlyCadence) {
        return Array.from({ length: 12 }).map((_, index) => {
            const d = new Date(now);
            d.setHours(now.getHours() - (11 - index), 0, 0, 0);
            const label = `${String(d.getHours()).padStart(2, "0")}:00`;
            return { date: label, price: currentPrice };
        });
    }

    return Array.from({ length: 7 }).map((_, index) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - index));
        const label = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return { date: label, price: currentPrice };
    });
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
                    </div>
                )}
            </div>
            <div className="chart-labels">
                {points.map((point, index) => (
                    <span key={`${point.date}-label-${index}`}>{point.date}</span>
                ))}
            </div>
        </div>
    );
}

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedCoin, setSelectedCoin] = useState("BTC");
    const [expandedCoin, setExpandedCoin] = useState(null);
    const [coinChartData, setCoinChartData] = useState([]);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [now, setNow] = useState(new Date());
    const [selectedMemeImage, setSelectedMemeImage] = useState("");
    const [selectedVotes, setSelectedVotes] = useState({});
    const isHourlyCadence = dashboardData?.chartUpdateCadence === "hourly";

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const memePool = ["/memes/meme1.png", "/memes/meme2.png", "/memes/meme3.png"];
        const rawIndex = localStorage.getItem("memeRotationIndex");
        const currentIndex = Number.isFinite(Number(rawIndex)) ? Number(rawIndex) : 0;
        const safeIndex = ((currentIndex % memePool.length) + memePool.length) % memePool.length;
        setSelectedMemeImage(memePool[safeIndex]);
        localStorage.setItem("memeRotationIndex", String((safeIndex + 1) % memePool.length));
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
            if (!selectedCoin || !expandedCoin) {
                return;
            }

            setIsChartLoading(true);
            try {
                const chartData = await getCoinWeeklyChart(selectedCoin);
                if (chartData.length >= 2) {
                    setCoinChartData(chartData);
                    return;
                }

                const fallbackPrice = extractCurrentPrice(dashboardData?.coinPrices, selectedCoin);
                setCoinChartData(buildFallbackChartData(fallbackPrice, isHourlyCadence));
            } catch (error) {
                const fallbackPrice = extractCurrentPrice(dashboardData?.coinPrices, selectedCoin);
                setCoinChartData(buildFallbackChartData(fallbackPrice, isHourlyCadence));
            } finally {
                setIsChartLoading(false);
            }
        }

        loadCoinChart();
    }, [selectedCoin, expandedCoin, dashboardData, isHourlyCadence]);

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
        }, 6000);

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

    if (!dashboardData) {
        return <div className="page">Loading...</div>;
    }

    const enabled = new Set(dashboardData.contentTypes ?? []);
    const showAll = enabled.size === 0;

    const showCoinPrices = showAll || enabled.has("Charts") || enabled.has("Coin Prices");
    const showNews = showAll || enabled.has("Market News");
    const showAi = showAll || enabled.has("AI Insight");
    const showMeme = showAll || enabled.has("Fun") || enabled.has("Fun Crypto Meme");

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
    const marketNews = buildNewsFeed(dashboardData.marketNews);
    const currentNews = marketNews[currentNewsIndex] ?? null;
    const coinChartTitle = isHourlyCadence
        ? "Coin Prices (updates every hour)"
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
                    <p>
                        Personalized insights, market updates, and fun crypto content based on your
                        onboarding preferences.
                    </p>
                </div>
                <img
                    src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80"
                    alt="Crypto market visualization"
                />
            </section>

            <div className="dashboard-grid">
                {showCoinPrices && (
                    <section className="card">
                        <h2>{coinChartTitle}</h2>
                        {coinCards.length > 0 ? (
                            <div className="coin-cards-grid">
                                {coinCards.map((coin) => {
                                    const isActive = expandedCoin === coin.symbol;
                                    return (
                                        <article key={coin.symbol} className="coin-price-card">
                                            <div className="coin-card-top">
                                                <p className="coin-price-symbol">{coin.symbol}</p>
                                                <button
                                                    type="button"
                                                    className={`coin-open-chart-button ${
                                                        isActive ? "is-active" : ""
                                                    }`}
                                                    onClick={() => {
                                                        if (isActive) {
                                                            setExpandedCoin(null);
                                                            return;
                                                        }
                                                        setSelectedCoin(coin.symbol);
                                                        setExpandedCoin(coin.symbol);
                                                    }}
                                                    aria-label={`Open ${coin.symbol} chart`}
                                                >
                                                    ⤢
                                                </button>
                                            </div>
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

                        {expandedCoin && (
                            <>
                                <p className="coin-selected-label">Chart: {expandedCoin}</p>
                                {isChartLoading ? (
                                    <p className="chart-empty">
                                        {isHourlyCadence ? "Loading 12-hour chart..." : "Loading 7-day chart..."}
                                    </p>
                                ) : (
                                    <CoinLineChart points={coinChartData} />
                                )}
                            </>
                        )}
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
                                        const likeKey = getVoteKey("MARKET_NEWS", `news:${currentNews.title}`);
                                        const selected = selectedVotes[likeKey];
                                        return (
                                            <>
                                    <button
                                        className={`vote-button ${selected === "LIKE" ? "is-selected" : ""}`}
                                        onClick={() =>
                                            handleVote(
                                                "MARKET_NEWS",
                                                "LIKE",
                                                `news:${currentNews.title}`,
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
                                                `news:${currentNews.title}`,
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

                {showAi && (
                    <section className="card">
                        <h2>AI Insight</h2>
                        <p>
                            {dashboardData.aiInsight ?? "No insight available."}{" "}
                            {(() => {
                                const likeKey = getVoteKey("AI_INSIGHT", "ai:insight-of-day");
                                const selected = selectedVotes[likeKey];
                                return (
                                    <>
                            <button
                                className={`vote-button ${selected === "LIKE" ? "is-selected" : ""}`}
                                onClick={() =>
                                    handleVote(
                                        "AI_INSIGHT",
                                        "LIKE",
                                        "ai:insight-of-day",
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
                                        "ai:insight-of-day",
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
                        </p>
                    </section>
                )}

                {showMeme && (
                    <section className="card">
                        <h2>Fun Crypto Meme</h2>
                        {selectedMemeImage ? (
                            <img className="meme-image" src={selectedMemeImage} alt="Crypto meme" />
                        ) : (
                            <p>{dashboardData.meme ?? "No meme available."}</p>
                        )}
                        <p>
                            Meme of the moment{" "}
                            {(() => {
                                const likeKey = getVoteKey("MEME", `meme:${selectedMemeImage}`);
                                const selected = selectedVotes[likeKey];
                                return (
                                    <>
                            <button
                                className={`vote-button ${selected === "LIKE" ? "is-selected" : ""}`}
                                onClick={() =>
                                    handleVote("MEME", "LIKE", `meme:${selectedMemeImage}`, selectedMemeImage)
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
                                        `meme:${selectedMemeImage}`,
                                        selectedMemeImage
                                    )
                                }
                                aria-pressed={selected === "DISLIKE"}
                            >
                                👎
                            </button>
                                    </>
                                );
                            })()}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Dashboard;