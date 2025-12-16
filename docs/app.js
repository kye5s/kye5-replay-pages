const parseBtn = document.getElementById("parseBtn");
const fileInput = document.getElementById("fileInput");
const results = document.getElementById("results");
const leaderboardDiv = document.getElementById("leaderboard");

const API_BASE = "https://kye5-replay-bot.onrender.com";

parseBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please select a replay file");
    return;
  }

  showTab("results");
  results.innerHTML = "<div class='card'>⏳ Processing replay...</div>";

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(`${API_BASE}/parse-replay`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error("Processing failed");

    const parsed = JSON.parse(data.output);
    renderResults(parsed);
    loadLeaderboard();

  } catch (err) {
    results.innerHTML = `<div class="card">❌ Error: ${err.message}</div>`;
  }
});

function renderResults(data) {
  results.innerHTML = "";

  if (data.furthest) {
    results.appendChild(createCard("🏹 Furthest Kill", data.furthest));
  }

  if (data.final) {
    results.appendChild(createCard("🏁 Final Kill", data.final));
  }
}

function createCard(title, stats) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h2>${title}</h2>
    ${row("Distance", `${stats.distance} m`)}
    ${row("Killer", `${stats.killer} (${stats.killer_platform})`)}
    ${row("Victim", `${stats.victim} (${stats.victim_platform})`)}
    ${row("Weapon", stats.weapon)}
    ${row("Rarity", stats.rarity)}
  `;

  return card;
}

function row(label, value) {
  return `
    <div class="stat">
      <span class="label">${label}</span>
      <span>${value}</span>
    </div>
  `;
}

/* ---------- Leaderboard ---------- */
async function loadLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  const data = await res.json();

  const rows = data.leaderboard.map((e, i) => {
    let rankDisplay = i + 1;

    if (i === 0) rankDisplay = "🥇";
    else if (i === 1) rankDisplay = "🥈";
    else if (i === 2) rankDisplay = "🥉";

    return `
      <tr class="rank-${i + 1}">
        <td class="rank">${rankDisplay}</td>
        <td>${e.distance}</td>
        <td>${e.player}</td>
        <td>${e.weapon}</td>
      </tr>
    `;
  }).join("");

  leaderboardDiv.innerHTML = `
    <h2>🏆 Furthest Kill Leaderboard</h2>
    <div class="leaderboard-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Distance (m)</th>
            <th>Player</th>
            <th>Weapon</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/* ---------- Tabs ---------- */
function showTab(tab) {
  document.getElementById("upload").classList.toggle("active", tab === "upload");
  document.getElementById("leaderboard").classList.toggle("active", tab === "leaderboard");
  results.classList.toggle("active", tab === "results");

  if (tab === "leaderboard") loadLeaderboard();
}

window.showTab = showTab;
