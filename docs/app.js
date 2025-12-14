const parseBtn = document.getElementById("parseBtn");
const fileInput = document.getElementById("fileInput");

const results = document.getElementById("results");
const leaderboardDiv = document.getElementById("leaderboard");
const uploadTab = document.getElementById("upload");

const API_BASE = "https://kye5-replay-bot.onrender.com";

// --------------------
// Upload & Parse
// --------------------
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

    // refresh leaderboard after upload
    await loadLeaderboard();

  } catch (err) {
    results.innerHTML = `<div class="card">❌ Error: ${err.message}</div>`;
  }
});

// --------------------
// Results Rendering
// --------------------
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
    ${row("Player", stats.killer)}
    ${row("Weapon", stats.weapon)}
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

// --------------------
// Leaderboard
// --------------------
async function loadLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  const data = await res.json();

  leaderboardDiv.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Distance (m)</th>
          <th>Player</th>
          <th>Weapon</th>
        </tr>
      </thead>
      <tbody>
        ${data.leaderboard.map((e, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${e.distance}</td>
            <td>${e.player}</td>
            <td>${e.weapon}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// --------------------
// Tabs
// --------------------
function showTab(tab) {
  uploadTab.classList.remove("active");
  results.classList.remove("active");
  leaderboardDiv.classList.remove("active");

  if (tab === "upload") uploadTab.classList.add("active");
  if (tab === "results") results.classList.add("active");
  if (tab === "leaderboard") {
    leaderboardDiv.classList.add("active");
    loadLeaderboard();
  }
}

window.showTab = showTab;
