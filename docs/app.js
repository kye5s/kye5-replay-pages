const parseBtn = document.getElementById("parseBtn");
const fileInput = document.getElementById("fileInput");
const results = document.getElementById("results");

parseBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please select a replay file");
    return;
  }

  results.innerHTML = "<div class='card'>⏳ Parsing replay...</div>";

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(
      "https://kye5-replay-bot.onrender.com/parse-replay",
      { method: "POST", body: formData }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error("Parser failed");
    }

    const parsed = JSON.parse(data.output);
    renderResults(parsed);

  } catch (err) {
    results.innerHTML = `<div class="card">❌ Error: ${err.message}</div>`;
  }
});

function renderResults(data) {
  results.innerHTML = "";

  if (data.furthest) {
    results.appendChild(createCard("🏹 Furthest Snipe", data.furthest));
  }

  if (data.final) {
    results.appendChild(createCard("🏁 Final Elimination", data.final));
  }
}

function createCard(title, stats) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h2>${title}</h2>
    ${row("Distance", `${stats.distance} m`)}
    ${row("Weapon", stats.weapon)}
    ${row("Rarity", stats.rarity)}
    ${row("Killer", `${stats.killer} (${stats.killer_platform})`)}
    ${row("Victim", `${stats.victim} (${stats.victim_platform})`)}
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
