let uploadedPosterURL = "";

// SLIDERS
const rating = document.getElementById("rating");
const cast = document.getElementById("cast");

rating.oninput = () => {
    document.getElementById("ratingValue").innerText = rating.value;
};

cast.oninput = () => {
    document.getElementById("castValue").innerText = cast.value;
};

// POSTER
document.getElementById("poster").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        uploadedPosterURL = URL.createObjectURL(file);
    }
});

let chartInstance = null;
let barInstance = null;

async function predict() {

    const movie_name = document.getElementById("movie_name").value;
    const director = document.getElementById("director").value;
    const actors = document.getElementById("actors").value;
    const budget = document.getElementById("budget").value;
    const genre = document.getElementById("genre").value;

    const warning = document.getElementById("warning");

    if (movie_name.trim() === "" || budget === "") {
        warning.innerText = "⚠️ Please enter movie name & budget";
        return;
    }

    warning.innerText = "";

    let result;

    try {
        const res = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                movie_name, director, actors, budget,
                genre,
                rating: rating.value,
                cast: cast.value
            })
        });

        result = await res.json();

    } catch (err) {

        let score = (rating.value * 10 + cast.value) / 2;

        let resultType =
            score >= 50 ? "HIT" : "FLOP";

        result = {
            result: resultType,
            hit_prob: Math.floor(score),
            flop_prob: 100 - Math.floor(score)
        };
    }

    let hit = Number(result.hit_prob);
    let flop = Number(result.flop_prob);

    if (isNaN(hit) || hit < 0) hit = 0;
    if (isNaN(flop) || flop < 0) flop = 0;
    if (hit > 100) hit = 100;
    if (flop > 100) flop = 100;

    const sum = hit + flop;
    if (sum > 0) {
        hit = Math.round((hit / sum) * 100 * 10) / 10;
        flop = Math.round((flop / sum) * 100 * 10) / 10;
    }

    const finalResult =
        result.result ||
        (hit >= flop ? "HIT" : "FLOP");

    document.getElementById("resultBox").classList.remove("hidden");

    // POSTER
    if (uploadedPosterURL) {
        const img = document.getElementById("posterPreview");
        img.src = uploadedPosterURL;
        img.classList.remove("hidden");
    }

    // RESULT TEXT
    document.getElementById("resultBadge").innerText =
        finalResult === "HIT" ? "🎉 HIT" : "❌ FLOP";

    document.getElementById("probText").innerText =
        `Hit: ${hit}% | Flop: ${flop}%`;

    // DETAILS
    document.getElementById("d_name").innerText = movie_name;
    document.getElementById("d_director").innerText = director;
    document.getElementById("d_actors").innerText = actors;
    document.getElementById("d_genre").innerText = genre;
    document.getElementById("d_budget").innerText = "$" + budget;
    document.getElementById("d_rating").innerText = rating.value;
    document.getElementById("d_cast").innerText = cast.value;

    // 🔥 UPDATED OUTCOME INDICATOR BAR (clean proportions, no overflow)
    const hitSegment = document.getElementById("hitSegment");
    const flopSegment = document.getElementById("flopSegment");
    const hitValue = document.getElementById("hitValue");
    const flopValue = document.getElementById("flopValue");

    const confidenceValue = Math.max(hit, flop);
    const confidenceCategory =
        confidenceValue >= 80 ? "Strong" :
        confidenceValue >= 60 ? "Medium" :
        "Weak";

    const normalizedHit = Math.max(0, Math.min(100, hit));
    const normalizedFlop = Math.max(0, Math.min(100, flop));

    hitSegment.style.width = normalizedHit + "%";
    flopSegment.style.width = normalizedFlop + "%";

    hitSegment.style.background = "linear-gradient(90deg, #22c55e, #4ade80)";
    hitSegment.style.boxShadow = "0 0 12px rgba(34,197,94,0.7)";
    flopSegment.style.background = "linear-gradient(90deg, #ef4444, #f87171)";
    flopSegment.style.boxShadow = "0 0 12px rgba(239,68,68,0.7)";

    hitValue.innerText = `Hit ${normalizedHit.toFixed(1)}%`;
    flopValue.innerText = `Flop ${normalizedFlop.toFixed(1)}%`;

    // Keep the progress text separate from the fill segments
    hitSegment.innerText = "";
    flopSegment.innerText = "";

    document.getElementById("confidenceText").innerText =
        confidenceCategory === "Strong"
            ? "🔥 Strong"
            : confidenceCategory === "Medium"
                ? "➖ Medium"
                : "⚠ Weak";

    // CHARTS
    const renderCharts = () => {
        const chartEl = document.getElementById("chart");
        const chart2El = document.getElementById("chart2");

        if (!chartEl || !chart2El) return;

        if (typeof Chart === 'undefined') return;

        const ctx1 = chartEl.getContext("2d");
        const ctx2 = chart2El.getContext("2d");

        if (chartInstance) chartInstance.destroy();
        if (barInstance) barInstance.destroy();

        chartInstance = new Chart(ctx1, {
            type: "doughnut",
            data: {
                labels: ["Hit", "Flop"],
                datasets: [{
                    label: "Hit vs Flop",
                    data: [hit, flop],
                    backgroundColor: ["rgba(34, 197, 94, 0.9)", "rgba(239, 68, 68, 0.9)"],
                    borderColor: ["#16a34a", "#dc2626"],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#111827' } }
                }
            }
        });

        barInstance = new Chart(ctx2, {
            type: "bar",
            data: {
                labels: ["Hit", "Flop"],
                datasets: [{
                    label: "Hit vs Flop",
                    data: [hit, flop],
                    backgroundColor: ["rgba(34, 197, 94, 0.9)", "rgba(239, 68, 68, 0.9)"],
                    borderColor: ["#16a34a", "#dc2626"],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 16, right: 16, bottom: 16, left: 16 }
                },
                scales: {
                    x: { beginAtZero: true, ticks: { color: '#111827' } },
                    y: { beginAtZero: true, max: 100, ticks: { color: '#111827' } }
                },
                plugins: {
                    legend: { labels: { color: '#111827' } },
                }
            }
        });
    };

    if (typeof Chart === 'undefined') {
        setTimeout(renderCharts, 250);
    } else {
        renderCharts();
    }

    // 🔥 RANDOM INSIGHTS
    let strongInsights = [
        `🔥 "${movie_name}" is generating strong buzz and looks promising at the box office.`,
        `🎯 "${movie_name}" has good momentum and audience interest right now.`,
        `🚀 "${movie_name}" is likely to open strong with current hype levels.`,
        `🌟 "${movie_name}" shows positive signals and could perform well.`,
        `🎬 "${movie_name}" seems to be attracting solid audience attention.`
    ];

    let mediumInsights = [
        `➖ "${movie_name}" has a balanced outlook with solid potential and room to grow.`,
        `🤝 "${movie_name}" is likely to perform steadily with decent audience interest.`,
        `⚖️ "${movie_name}" has a neutral profile and could go either way depending on release timing.`,
        `🟡 "${movie_name}" shows fair demand and may find moderate success.`,
        `📊 "${movie_name}" is positioned for a stable run with achievable box office returns.`
    ];

    let weakInsights = [
        `⚠️ "${movie_name}" might struggle to gain strong audience traction.`,
        `📉 "${movie_name}" doesn’t show strong momentum currently.`,
        `😕 "${movie_name}" may find it difficult to perform at the box office.`,
        `🚫 "${movie_name}" lacks strong hype and could have a slow start.`,
        `🎭 "${movie_name}" might not connect well with a wide audience.`
    ];

    let insight = "";

    if (confidenceCategory === "Strong") {
        insight = strongInsights[Math.floor(Math.random() * strongInsights.length)];
    } else if (confidenceCategory === "Medium") {
        insight = mediumInsights[Math.floor(Math.random() * mediumInsights.length)];
    } else {
        insight = weakInsights[Math.floor(Math.random() * weakInsights.length)];
    }

    document.getElementById("insightText").innerText = insight;
}