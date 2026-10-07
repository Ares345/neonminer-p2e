// ESTADO DEL JUEGO
let state = {
  coins: 0,
  clickPower: 1,
  autoPower: 0,
  clickCost: 10,
  autoCost: 50,
  lastSync: Date.now()
};

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  loadLocalState();
  renderPaymentFields();
  updateUI();
  
  // Bucle de minería automática (1 seg)
  setInterval(() => {
    if (state.autoPower > 0) {
      state.coins += state.autoPower;
      updateUI();
    }
  }, 1000);

  // Sincronización periódica con el servidor cada 10 segs
  setInterval(syncWithServer, 10000);
});

// CLIC EN EL CRISTAL
document.getElementById("mine-btn").addEventListener("click", () => {
  state.coins += state.clickPower;
  updateUI();
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

// ACTUALIZAR INTERFAZ VISUAL
function updateUI() {
  document.getElementById("coin-count").innerText = Math.floor(state.coins);
  document.getElementById("cps-display").innerText = state.autoPower;
  document.getElementById("upgrade-click-cost").innerText = `Costo: ${state.clickCost} Monedas`;
  document.getElementById("upgrade-auto-cost").innerText = `Costo: ${state.autoCost} Monedas`;
  document.getElementById("click-power").innerText = `Nvl ${state.clickPower}`;
  document.getElementById("auto-power").innerText = `Nvl ${state.autoPower}`;
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
        saveLocalState();
        alert("¡Recompensa entregada: +100 Neon Coins!");
      }
    });
  } else {
    // Fallback en desarrollo si no hay AdSense activo aún
    state.coins += 100;
    updateUI();
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
