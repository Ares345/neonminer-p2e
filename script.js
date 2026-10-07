// ESTADO DEL JUEGO
let state = {
  coins: 0,
  clickPower: 1,
  autoPower: 0,
  clickCost: 10,
  autoCost: 50,
  lastSync: Date.now()
};

// JUGADORES SIMULADOS EN RANKING (MOCK LEADERBOARD)
let leaderboard = [
  { rank: 1, alias: "CryptoKing_VZLA", coins: 125400 },
  { rank: 2, alias: "SatoshiMiner", coins: 98200 },
  { rank: 3, alias: "NeonMaster99", coins: 75400 },
  { rank: 4, alias: "ProClicker", coins: 43100 },
  { rank: 5, alias: "MinerBot_X", coins: 29000 },
  { rank: 6, alias: "ZinliWinner", coins: 18500 },
  { rank: 7, alias: "BinanceBoy", coins: 12000 },
  { rank: 8, alias: "GamerPro2026", coins: 8400 },
  { rank: 9, alias: "Pedro_Miner", coins: 5100 }
];

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  loadLocalState();
  renderPaymentFields();
  updateUI();
  updateRankingUI();
  
  // Bucle de minería automática (1 seg)
  setInterval(() => {
    if (state.autoPower > 0) {
      state.coins += state.autoPower;
      updateUI();
      updateRankingUI();
    }
  }, 1000);

  // Sincronización periódica con el servidor cada 10 segs
  setInterval(syncWithServer, 10000);
});

// CLIC EN EL CRISTAL
document.getElementById("mine-btn").addEventListener("click", () => {
  state.coins += state.clickPower;
  updateUI();
  updateRankingUI();
});

// COMPRAR MEJORA CLIC
document.getElementById("upgrade-click-btn").addEventListener("click", () => {
  if (state.coins >= state.clickCost) {
    state.coins -= state.clickCost;
    state.clickPower += 1;
    state.clickCost = Math.floor(state.clickCost * 1.5);
    updateUI();
    saveLocalState();
  }
});

// COMPRAR MEJORA AUTO
document.getElementById("upgrade-auto-btn").addEventListener("click", () => {
  if (state.coins >= state.autoCost) {
    state.coins -= state.autoCost;
    state.autoPower += 1;
    state.autoCost = Math.floor(state.autoCost * 1.6);
    updateUI();
    saveLocalState();
  }
});

// ACTUALIZAR INTERFAZ VISUAL DEL JUEGO
function updateUI() {
  document.getElementById("coin-count").innerText = Math.floor(state.coins);
  document.getElementById("cps-display").innerText = state.autoPower;
  document.getElementById("upgrade-click-cost").innerText = `Costo: ${state.clickCost} Monedas`;
  document.getElementById("upgrade-auto-cost").innerText = `Costo: ${state.autoCost} Monedas`;
  document.getElementById("click-power").innerText = `Nvl ${state.clickPower}`;
  document.getElementById("auto-power").innerText = `Nvl ${state.autoPower}`;
}

// ACTUALIZAR TABLA DE RANKING DENTRO DEL DOM
function updateRankingUI() {
  const profile = JSON.parse(localStorage.getItem("neon_user_profile") || "{}");
  const myAlias = profile.alias || "Tú (Sin Alias)";
  
  // Clonar leaderboard y meter la puntuación actual del jugador
  let fullList = [...leaderboard, { rank: 0, alias: myAlias, coins: Math.floor(state.coins) }];
  
  // Ordenar de mayor a menor saldo
  fullList.sort((a, b) => b.coins - a.coins);

  const tbody = document.getElementById("ranking-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  // Mostrar Top 10
  fullList.slice(0, 10).forEach((item, index) => {
    const isUser = item.alias === myAlias;
    let rankBadge = `${index + 1}°`;
    if (index === 0) rankBadge = "🥇 1°";
    if (index === 1) rankBadge = "🥈 2°";
    if (index === 2) rankBadge = "🥉 3°";

    const tr = document.createElement("tr");
    tr.className = isUser ? "bg-cyan-950/60 font-bold text-cyan-300" : "hover:bg-slate-800/40 text-slate-300";
    tr.innerHTML = `
      <td class="py-2">${rankBadge}</td>
      <td class="py-2">${item.alias} ${isUser ? '<span class="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded ml-1">TÚ</span>' : ''}</td>
      <td class="py-2 text-right font-mono text-cyan-400">${item.coins.toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

// RENDERIZADO DINÁMICO DE CAMPOS DE PAGO
function renderPaymentFields() {
  const method = document.getElementById("payment-method").value;
  const container = document.getElementById("dynamic-payment-fields");
  container.innerHTML = "";

  if (method === "pago_movil") {
    container.innerHTML = `
      <div>
        <label class="block text-xs text-slate-300">Banco Receptor</label>
        <input type="text" id="pm-banco" required placeholder="Ej: Banesco / Banco de Venezuela" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
      </div>
      <div>
        <label class="block text-xs text-slate-300">Cédula de Identidad (V/E/J)</label>
        <input type="text" id="pm-cedula" required placeholder="Ej: V-12345678" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
      </div>
      <div>
        <label class="block text-xs text-slate-300">Teléfono Registrado</label>
        <input type="tel" id="pm-telefono" required placeholder="Ej: 04141234567" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
      </div>
    `;
  } else if (method === "zinli") {
    container.innerHTML = `
      <div>
        <label class="block text-xs text-slate-300">Correo o Usuario Zinli</label>
        <input type="text" id="zinli-id" required placeholder="ejemplo@email.com o @usuario" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
      </div>
    `;
  } else if (method === "binance") {
    container.innerHTML = `
      <div>
        <label class="block text-xs text-slate-300">Binance Pay ID o Correo</label>
        <input type="text" id="binance-id" required placeholder="ID de Pay o correo registrado" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
      </div>
    `;
  } else if (method === "paypal") {
    container.innerHTML = `
      <div>
        <label class="block text-xs text-slate-300">Correo Electrónico PayPal</label>
        <input type="email" id="paypal-email" required placeholder="tu-correo@paypal.com" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
      </div>
    `;
  }
}

// GUARDAR PERFIL EN SERVIDOR Y LOCAL
function saveProfile(event) {
  event.preventDefault();
  const alias = document.getElementById("player-alias").value;
  const method = document.getElementById("payment-method").value;
  
  let details = {};
  if (method === "pago_movil") {
    details = {
      banco: document.getElementById("pm-banco").value,
      cedula: document.getElementById("pm-cedula").value,
      telefono: document.getElementById("pm-telefono").value
    };
  } else if (method === "zinli") {
    details = { id: document.getElementById("zinli-id").value };
  } else if (method === "binance") {
    details = { id: document.getElementById("binance-id").value };
  } else if (method === "paypal") {
    details = { email: document.getElementById("paypal-email").value };
  }

  const payload = { alias, method, details };
  localStorage.setItem("neon_user_profile", JSON.stringify(payload));
  alert("¡Datos de cobro guardados correctamente!");
  updateRankingUI();
  syncWithServer();
}

// LÓGICA DE ANUNCIOS ADSENSE (WATCH AD)
function watchAd() {
  if (typeof adBreak === "function") {
    adBreak({
      type: 'reward',
      name: 'rewarded_ad',
      beforeAd: () => console.log("Iniciando anuncio..."),
      afterAd: () => console.log("Anuncio finalizado."),
      adDismissed: () => alert("Debes ver el anuncio completo para recibir la recompensa."),
      adViewed: () => {
        state.coins += 100;
        updateUI();
        updateRankingUI();
        saveLocalState();
        alert("¡Recompensa entregada: +100 Neon Coins!");
      }
    });
  } else {
    state.coins += 100;
    updateUI();
    updateRankingUI();
    saveLocalState();
    alert("Modo Prueba: +100 Neon Coins entregadas.");
  }
}

// ALMACENAMIENTO LOCAL Y SINCRONIZACIÓN
function saveLocalState() {
  localStorage.setItem("neon_game_state", JSON.stringify(state));
}

function loadLocalState() {
  const saved = localStorage.getItem("neon_game_state");
  if (saved) {
    state = { ...state, ...JSON.parse(saved) };
  }
}

function syncWithServer() {
  fetch("/.netlify/functions/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state: state,
      profile: JSON.parse(localStorage.getItem("neon_user_profile") || "{}")
    })
  }).catch(err => console.log("Sincronización local activa"));
}
