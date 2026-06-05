(function () {
  "use strict";

  const SESSION_KEY = "retbare_session_mcid";
  const OLD_SESSION_KEY = "retbare_mcid";

  const INITIAL_NAMES = new Set([
    "Retaru46",
    "Mukisukino",
    "4y44",
    "386ede"
  ]);

  document.addEventListener("DOMContentLoaded", initProfileFix);

  function initProfileFix() {
    if (document.documentElement.dataset.page !== "profile") return;

    if (new URLSearchParams(location.search).get("logout") === "1") {
      hardLogout(false);
    }

    createToastArea();
    keepAuthBoxVisible();
    updateAuthStateLine();

    bindAuthButtons();
    bindPublicSearch();
    bindModalClose();
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function normalizeMcid(value) {
    return String(value || "")
      .trim()
      .replace(/[^A-Za-z0-9_]/g, "")
      .slice(0, 16);
  }

  function isFirebaseReady() {
    return Boolean(window.RH && window.RH.firebaseReady && window.RH.db);
  }

  function db() {
    return window.RH.db;
  }

  function serverTimestamp() {
    if (window.RH && typeof window.RH.serverTimestamp === "function") {
      return window.RH.serverTimestamp();
    }
    return new Date();
  }

  function playersRef() {
    return db().collection("players");
  }

  function getSessionMcid() {
    return normalizeMcid(localStorage.getItem(SESSION_KEY) || "");
  }

  function setSessionMcid(mcid) {
    localStorage.setItem(SESSION_KEY, normalizeMcid(mcid));
    localStorage.removeItem(OLD_SESSION_KEY);
  }

  function hardLogout(reload) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(OLD_SESSION_KEY);

    if (reload !== false) {
      location.href = "./profile.html";
    }
  }

  function createToastArea() {
    if ($(".toast-area")) return;
    const area = document.createElement("div");
    area.className = "toast-area";
    document.body.appendChild(area);
  }

  function toast(message, type, ms) {
    const area = $(".toast-area");
    if (!area) return;

    const item = document.createElement("div");
    item.className = `toast ${type || ""}`;
    item.textContent = message;
    area.appendChild(item);

    window.setTimeout(function () {
      item.style.opacity = "0";
      item.style.transform = "translateY(10px)";
      window.setTimeout(function () {
        item.remove();
      }, 250);
    }, ms || 3600);
  }

  function keepAuthBoxVisible() {
    const authBox = $("#authBox");
    if (!authBox) return;

    authBox.hidden = false;

    const observer = new MutationObserver(function () {
      if (authBox.hidden) {
        authBox.hidden = false;
      }
    });

    observer.observe(authBox, {
      attributes: true,
      attributeFilter: ["hidden"]
    });

    window.setInterval(function () {
      if (authBox.hidden) {
        authBox.hidden = false;
      }
    }, 700);
  }

  function updateAuthStateLine() {
    const line = $("#authStateLine");
    if (!line) return;

    const mcid = getSessionMcid();

    if (mcid) {
      line.innerHTML = `
        現在 <strong>${esc(mcid)}</strong> でログイン中です。
        別アカウントに入りたい場合は、下にMCIDとパスワードを入れてログインできます。
      `;
    } else {
      line.textContent = "未ログインです。検索は未ログインでもできます。編集やPoint受け取りはログインが必要です。";
    }
  }

  function bindAuthButtons() {
    const loginBtn = $("#loginBtn");
    const createBtn = $("#createAccountBtn");
    const forceLogoutBtn = $("#forceLogoutBtn");

    if (loginBtn) {
      loginBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        loginAccountFixed();
      }, true);
    }

    if (createBtn) {
      createBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        createAccountFixed();
      }, true);
    }

    if (forceLogoutBtn) {
      forceLogoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        hardLogout(true);
      }, true);
    }
  }

  async function loginAccountFixed() {
    if (!isFirebaseReady()) {
      toast("Firebase設定を確認してね。", "error");
      return;
    }

    const mcid = normalizeMcid($("#authMcid") && $("#authMcid").value);
    const password = String(($("#authPassword") && $("#authPassword").value) || "");

    if (!mcid || !password) {
      toast("MCIDとパスワードを入力してね。", "error");
      return;
    }

    try {
      const ref = playersRef().doc(mcid);
      const snap = await ref.get();

      if (!snap.exists) {
        toast("そのアカウントはまだ作成されていません。", "error");
        return;
      }

      const data = snap.data() || {};
      const expectedPassword = data.password || (INITIAL_NAMES.has(mcid) ? "12345" : "");

      if (!expectedPassword) {
        toast("このMCIDはまだログイン用アカウントになっていません。", "error");
        return;
      }

      if (password !== expectedPassword) {
        toast("パスワードが違います。", "error");
        return;
      }

      await ref.set({
        mcid,
        hasAccount: true,
        password: expectedPassword,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSessionMcid(mcid);
      toast(`${mcid}でログインしました。`, "ok", 1200);

      window.setTimeout(function () {
        location.href = "./profile.html";
      }, 450);
    } catch (error) {
      console.error(error);
      toast("ログインに失敗しました。", "error");
    }
  }

  async function createAccountFixed() {
    if (!isFirebaseReady()) {
      toast("Firebase設定を確認してね。", "error");
      return;
    }

    const mcid = normalizeMcid($("#authMcid") && $("#authMcid").value);
    const password = String(($("#authPassword") && $("#authPassword").value) || "");

    if (!mcid) {
      toast("MCIDを入力してね。", "error");
      return;
    }

    if (password.length < 3) {
      toast("パスワードは3文字以上にしてね。", "error");
      return;
    }

    try {
      const ref = playersRef().doc(mcid);
      const snap = await ref.get();
      const old = snap.exists ? (snap.data() || {}) : {};

      if (snap.exists && (old.hasAccount || old.password || asArray(old.titles).length)) {
        toast("そのMCIDのアカウントはすでに存在します。", "error");
        return;
      }

      const defaultEquipped = {
        background: "bg_cream",
        frame: "frame_wood",
        particle: "particle_leaf",
        aura: "aura_none",
        showcase: ""
      };

      await ref.set({
        mcid,
        hasAccount: true,
        password,
        points: typeof old.points === "number" ? old.points : 0,
        bio: old.bio || "よろしくね。まだ一言コメントはありません。",
        color: old.color || "cream",
        titles: asArray(old.titles),
        unlockedItems: unique([
          "bg_cream",
          "frame_wood",
          "particle_leaf",
          "aura_none"
        ].concat(asArray(old.unlockedItems))),
        ownedGachaItems: asArray(old.ownedGachaItems),
        equipped: Object.assign({}, defaultEquipped, old.equipped || {}),
        createdAt: old.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSessionMcid(mcid);
      toast("アカウントを作成しました。", "ok", 1200);

      window.setTimeout(function () {
        location.href = "./profile.html";
      }, 450);
    } catch (error) {
      console.error(error);
      toast("アカウント作成に失敗しました。", "error");
    }
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function bindPublicSearch() {
    const input = $("#publicProfileSearch");
    const button = $("#publicProfileSearchBtn");

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        searchProfileFixed();
      }, true);
    }

    if (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopImmediatePropagation();
          searchProfileFixed();
        }
      }, true);
    }
  }

  async function searchProfileFixed() {
    if (!isFirebaseReady()) {
      toast("Firebase設定を確認してね。", "error");
      return;
    }

    const input = $("#publicProfileSearch");
    const mcid = normalizeMcid(input && input.value);

    if (!mcid) {
      toast("見たい人のMCIDを入力してね。", "error");
      return;
    }

    try {
      const player = await fetchPublicPlayer(mcid);

      if (!player) {
        toast("その人はまだアカウントに追加されていません。", "error");
        return;
      }

      openProfileModalFixed(player);
    } catch (error) {
      console.error(error);
      toast("プロフィール検索に失敗しました。", "error");
    }
  }

  async function fetchPublicPlayer(mcid) {
    const snap = await playersRef().doc(mcid).get();

    if (!snap.exists) return null;

    const data = snap.data() || {};

    const visibleAccount =
      data.hasAccount ||
      data.password ||
      asArray(data.titles).length > 0;

    if (!visibleAccount) return null;

    return normalizePlayerForView(mcid, data);
  }

  function defaultEquipped() {
    return {
      background: "bg_cream",
      frame: "frame_wood",
      particle: "particle_leaf",
      aura: "aura_none",
      showcase: ""
    };
  }

  function normalizePlayerForView(mcid, data) {
    return {
      mcid,
      points: Number(data.points || 0),
      bio: data.bio || "よろしくね。",
      color: data.color || "cream",
      titles: asArray(data.titles),
      unlockedItems: unique([
        "bg_cream",
        "frame_wood",
        "particle_leaf",
        "aura_none"
      ].concat(asArray(data.unlockedItems))),
      ownedGachaItems: asArray(data.ownedGachaItems),
      equipped: Object.assign({}, defaultEquipped(), data.equipped || {})
    };
  }

  function getCatalogItem(id) {
    if (!window.RHItemLib || !window.RHItemLib.getItem) return null;
    return window.RHItemLib.getItem(id);
  }

  function getGachaItem(id) {
    if (!window.RHItemLib || !window.RHItemLib.getGachaItem) return null;
    return window.RHItemLib.getGachaItem(id);
  }

  function renderGachaSvg(id) {
    if (!window.RHItemLib || !window.RHItemLib.renderGachaSvg) return "";
    return window.RHItemLib.renderGachaSvg(id);
  }

  function profileCardHTML(player) {
    const equipped = Object.assign({}, defaultEquipped(), player.equipped || {});

    const bg = getCatalogItem(equipped.background) || { name: "クリーム手帳", css: "bg-cream" };
    const frame = getCatalogItem(equipped.frame) || { name: "木の額縁", css: "frame-wood" };
    const particle = getCatalogItem(equipped.particle) || { name: "若葉のこみち" };
    const aura = getCatalogItem(equipped.aura) || { name: "オーラなし", css: "aura-none" };
    const showcase = equipped.showcase ? getGachaItem(equipped.showcase) : null;

    return `
      <article class="ret-profile-card large ${esc(bg.css || "bg-cream")} ${esc(aura.css || "aura-none")}">
        <div class="profile-cover">
          <div class="profile-avatar-wrap ${esc(frame.css || "frame-wood")}">
            <img src="https://mc-heads.net/avatar/${encodeURIComponent(player.mcid)}/128" alt="${esc(player.mcid)}">
          </div>

          <div class="profile-main">
            <div class="profile-name-line">
              <h2>${esc(player.mcid)}</h2>
            </div>

            <div class="title-row">
              ${
                player.titles.length
                  ? player.titles.map(function (title) {
                      return `<span class="title-chip">${esc(title)}</span>`;
                    }).join("")
                  : `<span class="title-chip">member</span>`
              }
            </div>

            <p class="profile-bio">${esc(player.bio)}</p>
          </div>
        </div>

        <div class="profile-meta-grid">
          <div class="profile-stat">
            <small>背景</small>
            <strong>${esc(bg.name)}</strong>
          </div>
          <div class="profile-stat">
            <small>フレーム</small>
            <strong>${esc(frame.name)}</strong>
          </div>
          <div class="profile-stat">
            <small>パーティクル</small>
            <strong>${esc(particle.name)}</strong>
          </div>
          <div class="profile-stat">
            <small>展示</small>
            <strong>${esc(showcase ? showcase.name : "なし")}</strong>
          </div>
        </div>

        ${
          showcase
            ? `
              <div class="profile-showcase">
                <div class="profile-showcase-inner">
                  ${renderGachaSvg(showcase.id)}
                </div>
              </div>
            `
            : ""
        }
      </article>
    `;
  }

  function openProfileModalFixed(player) {
    const modal = $("#profileModal");
    const content = $("#profileModalContent");

    if (!modal || !content) {
      toast("プロフィール表示枠が見つかりません。", "error");
      return;
    }

    content.innerHTML = profileCardHTML(player);
    modal.hidden = false;
    document.body.classList.add("modal-open");

    spawnMiniParticles(player);
  }

  function bindModalClose() {
    const modal = $("#profileModal");

    document.addEventListener("click", function (event) {
      if (event.target.matches("[data-close-profile-modal]")) {
        closeModal();
      }

      if (modal && event.target === modal) {
        closeModal();
      }
    }, true);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeModal();
      }
    });
  }

  function closeModal() {
    const modal = $("#profileModal");
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function spawnMiniParticles(player) {
    const equipped = Object.assign({}, defaultEquipped(), player.equipped || {});
    const particle = getCatalogItem(equipped.particle);
    const color = particle && particle.color ? particle.color : "#6FA86B";
    const shape = particle && particle.shape ? particle.shape : "star";

    for (let i = 0; i < 42; i++) {
      const p = document.createElement("span");
      p.className = `rh-particle shape-${shape}`;
      p.style.setProperty("--particle-color", color);
      p.style.left = (window.innerWidth / 2 + Math.random() * 300 - 150) + "px";
      p.style.top = (window.innerHeight / 2 + Math.random() * 170 - 85) + "px";
      p.style.setProperty("--dx", (Math.random() * 420 - 210) + "px");
      p.style.setProperty("--dy", (Math.random() * 300 - 220) + "px");
      p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      p.style.setProperty("--dur", (0.9 + Math.random() * 1.1) + "s");
      document.body.appendChild(p);

      window.setTimeout(function () {
        p.remove();
      }, 2200);
    }
  }
})();
