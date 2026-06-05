(function () {
  "use strict";

  const page = document.documentElement.dataset.page || "home";
  const SESSION_KEY = "retbare_session_v7";
  const LEGACY_KEYS = ["retbare_mcid", "retbare_session_mcid"];
  const SHOP_FILTER_KEY = "retbare_shop_filter_v7";

  const TURTLES = {
    normal: { label: "普通の亀", points: 5, limit: 10, img: "turtle_normal.png", fragment: "#6FA86B" },
    gold: { label: "黄金の亀", points: 10, limit: 10, img: "turtle_gold.png", fragment: "#E0AB4B" },
    diamond: { label: "ダイヤの亀", points: 50, limit: 1, img: "turtle_diamond.png", fragment: "#5D8BB0" },
    god: { label: "神の亀", points: 60, limit: 10, img: "turtle_god.png", fragment: "#E08A4B" }
  };

  const INITIAL_PLAYERS = {
    Retaru46: {
      points: 500,
      bio: "retbareHUBの管理人。コマンドブロック風の紫装飾を持っています。",
      color: "purple",
      titles: ["Admin"],
      unlockedItems: ["bg_command", "frame_command", "aura_command", "particle_purple_smoke", "particle_redstone"],
      ownedGachaItems: ["retbare_note"],
      equipped: { background: "bg_command", frame: "frame_command", particle: "particle_purple_smoke", aura: "aura_command", showcase: "retbare_note" }
    },
    MukiSukino: {
      points: 240,
      bio: "UHC KING。金リンゴクラッカー、王冠演出、むきメイドを所持。",
      color: "gold",
      titles: ["UHC KING"],
      unlockedItems: ["bg_gold", "frame_gold", "aura_king", "particle_golden_apple", "particle_halo"],
      ownedGachaItems: ["muki_maid", "maid_and_muscle", "gold_apple_badge"],
      equipped: { background: "bg_gold", frame: "frame_gold", particle: "particle_golden_apple", aura: "aura_king", showcase: "muki_maid" }
    },
    "4y44": {
      points: 220,
      bio: "PVP crown。サイト内にダイヤ剣を1日2個まで設置できます。お豆腐メンタルなんです・・",
      color: "green",
      titles: ["PVP crown"],
      unlockedItems: ["bg_pvp", "frame_blade", "aura_slash", "particle_diamond", "particle_charcoal"],
      ownedGachaItems: ["tofu_mental", "pvp_spark"],
      equipped: { background: "bg_pvp", frame: "frame_blade", particle: "particle_diamond", aura: "aura_slash", showcase: "tofu_mental" }
    },
    "386ede": {
      points: 260,
      bio: "Sword God。青いプロフィールカラーと最高SS『闇のペンギン』を最初から所持。",
      color: "blue",
      titles: ["Sword God"],
      unlockedItems: ["bg_dark", "frame_shadow", "aura_dark", "particle_black_feather", "particle_blue_runes", "particle_lapis"],
      ownedGachaItems: ["dark_penguin", "diamond_piece"],
      equipped: { background: "bg_dark", frame: "frame_shadow", particle: "particle_black_feather", aura: "aura_dark", showcase: "dark_penguin" }
    }
  };

  const FALLBACK_NEWS = [
    { title: "retbareHUB v7", body: "ログイン、プロフィール、チャット、ガチャ、亀、Admin投稿を整理しました。", category: "site", createdAt: Date.now() },
    { title: "RetbareサーバーIP", body: "IP: 110.67.56.168:25565", category: "server", createdAt: Date.now() - 86400000 }
  ];

  const FALLBACK_QUESTS = [
    { title: "拠点まわりを散歩する", body: "いい景色を見つけて、あとでみんなに教えよう。", reward: "5P", status: "daily" },
    { title: "PVPを1戦だけする", body: "勝っても負けてもGG。", reward: "12P", status: "pvp" }
  ];

  let currentUser = null;
  let currentUserUnsub = null;
  let turtleUnsub = null;
  let swordUnsub = null;
  let chatThreadUnsub = null;
  let chatMessageUnsub = null;
  let turtleEls = new Map();
  let swordEls = new Map();
  let selectedThreadId = null;
  let pendingTurtleType = null;
  let pendingSwordOwner = null;
  let placementCursor = null;
  let shopFilter = localStorage.getItem(SHOP_FILTER_KEY) || "particle";
  let pressedKeys = {};
  let admin = {};

  document.addEventListener("DOMContentLoaded", init);
  window.retbareSeedInitialData = seedInitialData;

  function init() {
    clearLegacyLoginKeys();
    markActiveNav();
    createToastArea();
    setupCopyIp();
    setupProfileModal();
    setupPlacementMode();
    initAdminConsole();
    listenCurrentUser();

    if (isFirebaseReady()) {
      listenTurtles();
      listenSwords();
      setupSwordButton();
    } else {
      toast("firebase.jsの設定を確認してね。", "error", 6000);
    }

    if (page === "home") initHomePage();
    if (page === "news") initNewsPage();
    if (page === "quest") initQuestPage();
    if (page === "profile") initProfilePage();
    if (page === "chat") initChatPage();
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char];
    });
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function normalizeMcid(value) {
    return String(value || "").trim().replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
  }

  function lowerMcid(value) {
    return normalizeMcid(value).toLowerCase();
  }

  function isFirebaseReady() {
    return Boolean(window.RH && window.RH.firebaseReady && window.RH.db);
  }

  function db() { return window.RH.db; }
  function serverTimestamp() { return window.RH.serverTimestamp(); }
  function increment(v) { return window.RH.increment(v); }
  function arrayUnion(v) { return window.RH.arrayUnion(v); }
  function deleteField() { return window.RH.deleteField(); }

  function playersRef() { return db().collection("players"); }
  function newsRef() { return db().collection("news"); }
  function questsRef() { return db().collection("quests"); }
  function threadsRef() { return db().collection("chatThreads"); }
  function turtlesRef() { return db().collection("config").doc("turtles").collection("active"); }
  function swordsRef() { return db().collection("config").doc("swords").collection("active"); }

  function clearLegacyLoginKeys() {
    LEGACY_KEYS.forEach(function (key) {
      localStorage.removeItem(key);
    });
  }

  function getSessionMcid() {
    return normalizeMcid(localStorage.getItem(SESSION_KEY) || "");
  }

  function setSessionMcid(mcid) {
    clearLegacyLoginKeys();
    localStorage.setItem(SESSION_KEY, normalizeMcid(mcid));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    clearLegacyLoginKeys();
    currentUser = null;
    if (currentUserUnsub) currentUserUnsub();
    currentUserUnsub = null;
    refreshHeader(null);
    if (page === "profile") renderProfileLoggedOut();
    if (page === "chat") renderChatAuth();
  }

  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  async function passwordHash(mcid, password) {
    return sha256("retbareHUB:v7:" + lowerMcid(mcid) + ":" + password);
  }

  function defaultEquipped() {
    return { background: "bg_cream", frame: "frame_wood", particle: "particle_leaf", aura: "aura_none", showcase: "" };
  }

  function normalizePlayer(id, data) {
    const mcid = normalizeMcid((data && data.mcid) || id);
    return {
      docId: id,
      mcid,
      mcidLower: lowerMcid(mcid),
      hasAccount: Boolean(data && data.hasAccount),
      passwordHash: (data && data.passwordHash) || "",
      points: Number((data && data.points) || 0),
      bio: (data && data.bio) || "よろしくね。まだ一言コメントはありません。",
      color: (data && data.color) || "cream",
      titles: asArray(data && data.titles),
      unlockedItems: unique(["bg_cream", "frame_wood", "particle_leaf", "aura_none"].concat(asArray(data && data.unlockedItems))),
      ownedGachaItems: unique(asArray(data && data.ownedGachaItems)),
      equipped: Object.assign({}, defaultEquipped(), (data && data.equipped) || {}),
      createdAt: data && data.createdAt,
      updatedAt: data && data.updatedAt
    };
  }

  function visibleAccount(player) {
    return Boolean(player && (player.hasAccount || player.passwordHash || player.titles.length));
  }

  function isAdmin(player) {
    return Boolean(player && (lowerMcid(player.mcid) === "retaru46" || player.titles.includes("Admin")));
  }

  async function findPlayerDoc(mcid) {
    const clean = normalizeMcid(mcid);
    if (!clean) return null;

    const exact = await playersRef().doc(clean).get();
    if (exact.exists) {
      return { ref: exact.ref, snap: exact, player: normalizePlayer(exact.id, exact.data()) };
    }

    const q = await playersRef().where("mcidLower", "==", lowerMcid(clean)).limit(1).get();
    if (!q.empty) {
      const doc = q.docs[0];
      return { ref: doc.ref, snap: doc, player: normalizePlayer(doc.id, doc.data()) };
    }

    return null;
  }

  function markActiveNav() {
    const active = $(`.site-nav a[data-page="${page}"]`);
    if (active) active.classList.add("is-active");
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
    setTimeout(function () {
      item.style.opacity = "0";
      setTimeout(function () { item.remove(); }, 250);
    }, ms || 3600);
  }

  function setupCopyIp() {

    $$("[data-copy-ip]").forEach(function (button) {
      button.addEventListener("click", async function () {
        try {
          await navigator.clipboard.writeText("110.67.56.168:25565");
          toast("IPをコピーしました。", "ok");
        } catch {
          toast("IP: 110.67.56.168:25565", "ok");
        }
      });
    });
  }

  function listenCurrentUser() {
    if (!isFirebaseReady()) return;

    if (currentUserUnsub) currentUserUnsub();
    currentUserUnsub = null;

    const mcid = getSessionMcid();
    if (!mcid) {
      currentUser = null;
      refreshHeader(null);
      renderPageAuthDependent();
      return;
    }

    findPlayerDoc(mcid).then(function (found) {
      if (!found) {
        clearSession();
        return;
      }

      currentUserUnsub = found.ref.onSnapshot(function (snap) {
        currentUser = normalizePlayer(snap.id, snap.data());
        refreshHeader(currentUser);
        renderPageAuthDependent();
      });
    });
  }

  function refreshHeader(player) {
    const name = $("#currentMcidPill");
    const point = $("#pointPill");
    if (name) name.textContent = player ? `MCID: ${player.mcid}` : "未ログイン";
    if (point) point.textContent = player ? `${Number(player.points || 0)}P` : "0P";
  }

  function renderPageAuthDependent() {
    if (page === "profile") {
      if (currentUser) renderProfileDashboard(currentUser);
      else renderProfileLoggedOut();
    }
    if (page === "chat") renderChatAuth();
    if (page === "news") renderAdminNewsPanel();
    if (page === "quest") renderAdminQuestPanel();
    refreshSwordButton();
  }

  function initProfilePage() {
    $("#loginBtn")?.addEventListener("click", loginAccount);
    $("#createAccountBtn")?.addEventListener("click", createAccount);
    $("#forceLogoutBtn")?.addEventListener("click", function () {
      clearSession();
      location.href = "./profile.html";
    });
    $("#logoutBtn")?.addEventListener("click", function () {
      clearSession();
      toast("ログアウトしました。", "ok");
    });
    $("#publicProfileSearchBtn")?.addEventListener("click", function () {
      openPublicProfile($("#publicProfileSearch").value);
    });
    $("#publicProfileSearch")?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") openPublicProfile($("#publicProfileSearch").value);
    });
    $("#openMyProfileBtn")?.addEventListener("click", function () {
      if (currentUser) openProfileModal(currentUser, true);
    });


    $$(".shop-tab").forEach(function (button) {
      button.addEventListener("click", function () {
        shopFilter = button.dataset.shopFilter;
        localStorage.setItem(SHOP_FILTER_KEY, shopFilter);
        renderShop(currentUser);
      });
    });

    document.addEventListener("click", function (event) {
      const buy = event.target.closest("[data-buy-item]");
      if (buy) buyOrEquipItem(buy.dataset.buyItem);

      const equipGacha = event.target.closest("[data-equip-gacha]");
      if (equipGacha) equipGachaShowcase(equipGacha.dataset.equipGacha);

      if (event.target.closest("#rollGachaBtn")) rollGacha();
      if (event.target.closest("#fusionBtn")) fuseLegendItem();

      if (event.target.closest("[data-scroll-edit]")) {
        closeProfileModal();
        $("#profileEditor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (event.target.closest("[data-scroll-shop]")) {
        closeProfileModal();
        $("#shopSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (event.target.closest("[data-scroll-gacha]")) {
        closeProfileModal();
        $("#gachaSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    const params = new URLSearchParams(location.search);
    const view = params.get("view");
    if (view) setTimeout(function () { openPublicProfile(view); }, 700);

    loadRecentProfiles("#recentProfiles");
    renderPageAuthDependent();
  }

  async function loginAccount() {
    const mcid = normalizeMcid($("#authMcid")?.value);
    const password = String($("#authPassword")?.value || "");

    if (!mcid || !password) {
      toast("MCIDとパスワードを入れてね。", "error");
      return;
    }

    try {
      const found = await findPlayerDoc(mcid);
      if (!found || !visibleAccount(found.player)) {
        toast("そのアカウントはまだ作成されていません。", "error");
        return;
      }

      const data = found.snap.data() || {};
      const hash = await passwordHash(found.player.mcid, password);
      const oldPlain = data.password;

      if (data.passwordHash !== hash && oldPlain !== password) {
        toast("パスワードが違います。", "error");
        return;
      }

      const update = {
        hasAccount: true,
        mcid: found.player.mcid,
        mcidLower: lowerMcid(found.player.mcid),
        passwordHash: hash,
        updatedAt: serverTimestamp()
      };

      if (oldPlain) update.password = deleteField();

      await found.ref.set(update, { merge: true });

      setSessionMcid(found.player.mcid);
      toast(`${found.player.mcid}でログインしました。`, "ok");
      listenCurrentUser();
    } catch (error) {
      console.error(error);
      toast("ログインに失敗しました。", "error");
    }
  }

  async function createAccount() {
    const mcid = normalizeMcid($("#authMcid")?.value);
    const password = String($("#authPassword")?.value || "");

    if (!mcid || password.length < 3) {
      toast("MCIDと3文字以上のパスワードを入れてね。", "error");
      return;
    }

    try {
      const existing = await findPlayerDoc(mcid);
      if (existing && visibleAccount(existing.player)) {
        toast("そのMCIDはすでに存在します。", "error");
        return;
      }

      const hash = await passwordHash(mcid, password);
      const ref = existing ? existing.ref : playersRef().doc(mcid);
      const old = existing ? existing.player : null;

      await ref.set({
        mcid,
        mcidLower: lowerMcid(mcid),
        hasAccount: true,
        passwordHash: hash,
        password: deleteField(),
        points: old ? old.points : 0,
        bio: old ? old.bio : "よろしくね。まだ一言コメントはありません。",
        color: old ? old.color : "cream",
        titles: old ? old.titles : [],
        unlockedItems: old ? old.unlockedItems : ["bg_cream", "frame_wood", "particle_leaf", "aura_none"],
        ownedGachaItems: old ? old.ownedGachaItems : [],
        equipped: old ? old.equipped : defaultEquipped(),
        createdAt: old && old.createdAt ? old.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSessionMcid(mcid);
      toast("アカウントを作成しました。", "ok");
      listenCurrentUser();
    } catch (error) {
      console.error(error);
      toast("アカウント作成に失敗しました。", "error");
    }
  }

  function renderProfileLoggedOut() {
    const dashboard = $("#profileDashboard");
    if (dashboard) dashboard.hidden = true;

    const line = $("#authStateLine");
    if (line) line.textContent = "未ログインです。検索は未ログインでもOK。編集・Point・チャット投稿はログインが必要です。";
  }

  function renderProfileDashboard(player) {
    const dashboard = $("#profileDashboard");
    if (!dashboard || !player) return;
    dashboard.hidden = false;

    const line = $("#authStateLine");
    if (line) line.innerHTML = `現在 <strong>${esc(player.mcid)}</strong> でログイン中。別アカウントに切り替えるなら上でログインできます。`;

    const preview = $("#ownProfilePreview");
    if (preview) preview.innerHTML = profileCardHTML(player, { own: true });

    renderEditor(player);
    renderShop(player);
    renderGacha(player);
  }

  function renderEditor(player) {
    const editor = $("#profileEditor");
    if (!editor) return;

    editor.innerHTML = `
      <div class="editor-grid">
        <label>一言コメント<textarea id="editBio" maxlength="160">${esc(player.bio)}</textarea></label>
        <label>背景<select id="editBackground">${ownedOptions(player, "background", player.equipped.background)}</select></label>
        <label>フレーム<select id="editFrame">${ownedOptions(player, "frame", player.equipped.frame)}</select></label>
        <label>パーティクル<select id="editParticle">${ownedOptions(player, "particle", player.equipped.particle)}</select></label>
        <label>オーラ<select id="editAura">${ownedOptions(player, "aura", player.equipped.aura)}</select></label>
        <label>展示アイテム<select id="editShowcase">${gachaOptions(player, player.equipped.showcase)}</select></label>
        <button id="saveProfileBtn" class="hub-button">保存する</button>
      </div>
    `;

    $("#saveProfileBtn").onclick = saveProfile;
  }

  function ownedOptions(player, kind, selected) {
    return window.RHItemLib.catalog
      .filter(function (item) {
        return item.kind === kind && (item.free || player.unlockedItems.includes(item.id));
      })
      .map(function (item) {
        return `<option value="${esc(item.id)}" ${item.id === selected ? "selected" : ""}>${esc(item.name)}</option>`;
      }).join("");
  }

  function gachaOptions(player, selected) {
    return [`<option value="">なし</option>`].concat(player.ownedGachaItems.map(function (id) {
      const item = window.RHItemLib.getGachaItem(id);
      if (!item) return "";
      return `<option value="${esc(id)}" ${id === selected ? "selected" : ""}>${esc(item.name)}</option>`;
    })).join("");
  }

  async function saveProfile() {
    if (!currentUser) return;

    const equipped = {
      background: $("#editBackground").value,
      frame: $("#editFrame").value,
      particle: $("#editParticle").value,
      aura: $("#editAura").value,
      showcase: $("#editShowcase").value
    };

    await playersRef().doc(currentUser.docId).set({
      bio: $("#editBio").value.slice(0, 160),
      equipped,
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast("プロフィールを保存しました。", "ok");
    spawnEquippedParticles(Object.assign({}, currentUser, { equipped }), 40);
  }

  function profileCardHTML(player, options) {
    const opts = options || {};
    const equipped = Object.assign({}, defaultEquipped(), player.equipped || {});
    const bg = window.RHItemLib.getItem(equipped.background) || window.RHItemLib.getItem("bg_cream");
    const frame = window.RHItemLib.getItem(equipped.frame) || window.RHItemLib.getItem("frame_wood");
    const aura = window.RHItemLib.getItem(equipped.aura) || window.RHItemLib.getItem("aura_none");
    const particle = window.RHItemLib.getItem(equipped.particle) || window.RHItemLib.getItem("particle_leaf");
    const showcase = equipped.showcase ? window.RHItemLib.getGachaItem(equipped.showcase) : null;

    return `
      <article class="ret-profile-card ${bg.css} ${aura.css}">
        <div class="profile-cover">
          <div class="profile-avatar-wrap ${frame.css}">
            <img src="https://mc-heads.net/avatar/${encodeURIComponent(player.mcid)}/128" alt="${esc(player.mcid)}">
          </div>
          <div class="profile-main">
            <div class="profile-name-line">
              <h2>${esc(player.mcid)}</h2>
              ${opts.own ? `<span class="points-badge">${Number(player.points || 0)}P</span>` : ""}
            </div>
            <div class="title-row">
              ${
                player.titles.length
                  ? player.titles.map(function (t) { return `<span class="title-chip">${esc(t)}</span>`; }).join("")
                  : `<span class="title-chip">member</span>`
              }
            </div>
            <p class="profile-bio">${esc(player.bio)}</p>
          </div>
        </div>
        <div class="profile-meta-grid">
          <div class="profile-stat"><small>背景</small><strong>${esc(bg.name)}</strong></div>
          <div class="profile-stat"><small>フレーム</small><strong>${esc(frame.name)}</strong></div>
          <div class="profile-stat"><small>パーティクル</small><strong>${esc(particle.name)}</strong></div>
          <div class="profile-stat"><small>展示</small><strong>${esc(showcase ? showcase.name : "なし")}</strong></div>
        </div>
        ${
          showcase
            ? `<div class="profile-showcase"><div class="profile-showcase-inner">${window.RHItemLib.renderGachaSvg(showcase.id)}</div></div>`
            : ""
        }
        ${
          opts.own
            ? `<div class="modal-own-actions">
                 <button class="hub-button" data-scroll-edit>このプロフィールを編集</button>
                 <button class="hub-button secondary" data-scroll-shop>ショップへ</button>
                 <button class="hub-button secondary" data-scroll-gacha>ガチャへ</button>
               </div>`
            : ""
        }
      </article>
    `;
  }

  async function openPublicProfile(rawMcid) {
    const mcid = normalizeMcid(rawMcid);
    if (!mcid) {
      toast("MCIDを入力してね。", "error");
      return;
    }

    const found = await findPlayerDoc(mcid);
    if (!found || !visibleAccount(found.player)) {
      toast("その人はまだアカウントに追加されていません。", "error");
      return;
    }

    const own = currentUser && lowerMcid(currentUser.mcid) === lowerMcid(found.player.mcid);
    openProfileModal(found.player, own);
  }

  function setupProfileModal() {
    document.addEventListener("click", function (event) {
      if (event.target.matches("[data-close-profile-modal]")) closeProfileModal();
      const modal = $("#profileModal");
      if (modal && event.target === modal) closeProfileModal();

      const open = event.target.closest("[data-open-profile]");
      if (open) openPublicProfile(open.dataset.openProfile);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeProfileModal();
    });
  }

  function openProfileModal(player, own) {
    const modal = $("#profileModal");
    const content = $("#profileModalContent");
    if (!modal || !content) return;

    content.innerHTML = profileCardHTML(player, { own: Boolean(own) });
    modal.hidden = false;
    document.body.classList.add("modal-open");
    spawnEquippedParticles(player, 45);
  }

  function closeProfileModal() {
    const modal = $("#profileModal");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function renderShop(player) {
    const container = $("#profileShop");
    if (!container || !player) return;


    $$(".shop-tab").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.shopFilter === shopFilter);
    });

    const items = window.RHItemLib.catalog.filter(function (item) {
      return item.kind === shopFilter;
    });

    container.innerHTML = items.map(function (item) {
      const owned = item.free || player.unlockedItems.includes(item.id);
      const equipped = player.equipped[item.kind] === item.id;
      return `
        <article class="shop-card">
          <header>
            <span class="shop-icon" style="--item-color:${esc(item.color || "#6FA86B")}"></span>
            <div>
              <span class="rarity-chip ${window.RHItemLib.rarityClass(item.rarity)}">${esc(item.rarity)}</span>
              <h3>${esc(item.name)}</h3>
            </div>
          </header>
          <p>${esc(item.desc)}</p>
          <span class="shop-price">${Number(item.cost || 0)}P</span>
          <button class="hub-button" data-buy-item="${esc(item.id)}">${equipped ? "装備中" : owned ? "装備する" : "購入して装備"}</button>
        </article>
      `;
    }).join("");
  }

  async function buyOrEquipItem(itemId) {
    if (!currentUser) {
      toast("ログインしてね。", "error");
      return;
    }

    const item = window.RHItemLib.getItem(itemId);
    if (!item) return;

    const owned = item.free || currentUser.unlockedItems.includes(item.id);

    try {
      if (owned) {
        await playersRef().doc(currentUser.docId).set({
          equipped: { [item.kind]: item.id },
          updatedAt: serverTimestamp()
        }, { merge: true });
        toast("装備しました。", "ok");
        return;
      }

      await db().runTransaction(async function (tx) {
        const ref = playersRef().doc(currentUser.docId);
        const snap = await tx.get(ref);
        const p = normalizePlayer(snap.id, snap.data());
        if (p.points < item.cost) throw new Error("POINT_SHORT");

        tx.set(ref, {
          points: increment(-item.cost),
          unlockedItems: arrayUnion(item.id),
          equipped: { [item.kind]: item.id },
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      toast("購入して装備しました。", "ok");
    } catch (error) {
      if (error.message === "POINT_SHORT") toast("Pointが足りません。", "error");
      else {
        console.error(error);
        toast("購入に失敗しました。", "error");
      }
    }
  }

  function renderGacha(player) {
    renderGachaCollection(player);
    renderFusionPanel(player);
  }

  function renderGachaCollection(player) {
    const container = $("#gachaCollection");
    if (!container) return;

    if (!player.ownedGachaItems.length) {
      container.innerHTML = `<article class="gacha-card"><h3>まだ所持アイテムなし</h3><p>ガチャを回してみよう。</p></article>`;
      return;
    }

    container.innerHTML = player.ownedGachaItems.map(function (id) {
      const item = window.RHItemLib.getGachaItem(id);
      if (!item) return "";
      return `
        <article class="gacha-card">
          <div class="gacha-art">${window.RHItemLib.renderGachaSvg(id)}</div>
          <span class="rarity-chip ${window.RHItemLib.rarityClass(item.rarity)}">${esc(item.rarity)}</span>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.desc)}</p>
          <button class="hub-button" data-equip-gacha="${esc(id)}">プロフィールに飾る</button>
        </article>
      `;
    }).join("");
  }

  function renderFusionPanel(player) {
    const panel = $("#fusionPanel");
    if (!panel) return;
    const needs = window.RHItemLib.fusionItem.needs;
    const hasAll = needs.every(function (id) { return player.ownedGachaItems.includes(id); });
    const already = player.ownedGachaItems.includes("legend_dark_magma_penguin");

    panel.innerHTML = `
      <p class="eyebrow">Fusion</p>
      <h2>融合</h2>
      <p>闇のペンギン + 炎獄のマグマサーファーで伝説レア。</p>
      <p>闇のペンギン: ${player.ownedGachaItems.includes("dark_penguin") ? "所持" : "未所持"}</p>
      <p>炎獄のマグマサーファー: ${player.ownedGachaItems.includes("magma_surfer") ? "所持" : "未所持"}</p>
      ${
        already
          ? `<p class="hint">融合済み。</p>`
          : hasAll
            ? `<button id="fusionBtn" class="hub-button">融合する</button>`
            : `<p class="hint">素材がまだ足りません。</p>`
      }
    `;
  }

  function pickGachaItem() {
    const items = window.RHItemLib.gachaItems.filter(function (item) {
      return item.weight > 0;
    });
    const total = items.reduce(function (sum, item) { return sum + item.weight; }, 0);
    let r = Math.random() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item;
    }
    return items[0];
  }

  async function rollGacha() {
    if (!currentUser) {
      toast("ログインしてから回してね。", "error");
      return;
    }

    const cost = 30;
    const item = pickGachaItem();
    let duplicate = false;

    try {
      await db().runTransaction(async function (tx) {
        const ref = playersRef().doc(currentUser.docId);
        const snap = await tx.get(ref);
        const p = normalizePlayer(snap.id, snap.data());
        if (p.points < cost) throw new Error("POINT_SHORT");

        duplicate = p.ownedGachaItems.includes(item.id);
        tx.set(ref, {
          points: increment(duplicate ? -cost + 8 : -cost),
          ownedGachaItems: arrayUnion(item.id),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      const result = $("#lastGachaResult");
      if (result) {
        result.innerHTML = `
          <article class="gacha-card">
            <div class="gacha-art">${item.svg()}</div>
            <span class="rarity-chip ${window.RHItemLib.rarityClass(item.rarity)}">${esc(item.rarity)}</span>
            <h3>${duplicate ? "かぶり: " : ""}${esc(item.name)}</h3>
            <p>${duplicate ? "かぶりなので8P返却。" : esc(item.desc)}</p>
          </article>
        `;
      }

      spawnParticles(item.rarity === "SS" ? "#825BA0" : "#E08A4B", "star", 70);
    } catch (error) {
      if (error.message === "POINT_SHORT") toast("30P必要です。", "error");
      else {
        console.error(error);
        toast("ガチャに失敗しました。", "error");
      }
    }
  }

  async function equipGachaShowcase(id) {
    if (!currentUser || !currentUser.ownedGachaItems.includes(id)) return;
    await playersRef().doc(currentUser.docId).set({
      equipped: { showcase: id },
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast("展示アイテムを変更しました。", "ok");
  }

  async function fuseLegendItem() {
    if (!currentUser) return;
    const needs = window.RHItemLib.fusionItem.needs;
    if (!needs.every(function (id) { return currentUser.ownedGachaItems.includes(id); })) {
      toast("素材が足りません。", "error");
      return;
    }

    await playersRef().doc(currentUser.docId).set({
      ownedGachaItems: arrayUnion("legend_dark_magma_penguin"),
      unlockedItems: arrayUnion("frame_legend"),
      equipped: {
        showcase: "legend_dark_magma_penguin",
        frame: "frame_legend",
        aura: "aura_legend",
        background: "bg_dark",
        particle: "particle_nether"
      },
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast("伝説レアに融合しました！", "ok", 6000);
    spawnParticles("#FF6600", "star", 120);
  }

  function spawnEquippedParticles(player, amount) {
    const item = window.RHItemLib.getItem((player.equipped || {}).particle) || window.RHItemLib.getItem("particle_leaf");
    spawnParticles(item.color || "#6FA86B", item.shape || "dot", amount || 36);
  }

  function spawnParticles(color, shape, amount) {
    for (let i = 0; i < amount; i++) {
      const p = document.createElement("span");
      p.className = `rh-particle shape-${shape || "dot"}`;
      p.style.setProperty("--particle-color", color || "#6FA86B");
      p.style.left = (window.innerWidth / 2 + Math.random() * 300 - 150) + "px";
      p.style.top = (window.innerHeight / 2 + Math.random() * 170 - 85) + "px";
      p.style.setProperty("--dx", (Math.random() * 420 - 210) + "px");
      p.style.setProperty("--dy", (Math.random() * 300 - 220) + "px");
      p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      p.style.setProperty("--dur", (0.9 + Math.random() * 1.1) + "s");
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 2300);
    }
  }

  async function loadRecentProfiles(selector) {
    const container = $(selector);
    if (!container || !isFirebaseReady()) return;

    try {
      const snap = await playersRef().orderBy("updatedAt", "desc").limit(12).get();
      const players = snap.docs.map(function (doc) {
        return normalizePlayer(doc.id, doc.data());
      }).filter(visibleAccount);

      renderProfileList(container, players);
    } catch {
      renderProfileList(container, []);
    }
  }

  function renderProfileList(container, players) {
    if (!players.length) {
      container.innerHTML = `<article class="soft-card" style="padding:18px;">まだプロフィールがありません。</article>`;
      return;
    }

    container.innerHTML = players.map(function (p) {
      return `
        <button class="player-card" data-open-profile="${esc(p.mcid)}">
          <img src="https://mc-heads.net/avatar/${encodeURIComponent(p.mcid)}/96" alt="${esc(p.mcid)}">
          <span><strong>${esc(p.mcid)}</strong><small>${esc(p.titles[0] || "member")}</small></span>
        </button>
      `;
    }).join("");
  }

  function initHomePage() {
    loadHomeNews();
    loadRecentProfiles("#homeRecentProfiles");
    loadHomeThreads();
  }

  async function loadHomeNews() {
    const container = $("#homeNews");
    if (!container) return;

    try {
      const snap = await newsRef().orderBy("createdAt", "desc").limit(3).get();
      const items = snap.docs.map(function (doc) { return doc.data(); });
      renderNewsCards(container, items.length ? items : FALLBACK_NEWS);
    } catch {
      renderNewsCards(container, FALLBACK_NEWS);
    }
  }

  async function loadHomeThreads() {
    const container = $("#homeChatThreads");
    if (!container || !isFirebaseReady()) return;

    try {
      const snap = await threadsRef().orderBy("updatedAt", "desc").limit(4).get();
      container.innerHTML = snap.docs.map(function (doc) {
        const t = doc.data();
        return `<article class="stack-item"><h3>${esc(t.title)}</h3><p>${esc(t.lastMessage || "まだメッセージなし")}</p><a class="hub-button secondary" href="./chat.html?thread=${doc.id}">開く</a></article>`;
      }).join("") || `<article class="stack-item"><p>まだスレッドがありません。</p></article>`;
    } catch {
      container.innerHTML = `<article class="stack-item"><p>チャットを読み込めませんでした。</p></article>`;
    }
  }

  function initNewsPage() {
    renderAdminNewsPanel();
    $("#addNewsBtn")?.addEventListener("click", addNews);
    loadNewsList();
  }

  function renderAdminNewsPanel() {
    const panel = $("#adminNewsPanel");
    if (panel) panel.hidden = !isAdmin(currentUser);
  }

  async function addNews() {
    if (!isAdmin(currentUser)) return;
    const title = $("#newsTitleInput").value.trim();
    const category = $("#newsCategoryInput").value.trim() || "news";
    const body = $("#newsBodyInput").value.trim();
    if (!title || !body) {
      toast("タイトルと本文を入れてね。", "error");
      return;
    }

    await newsRef().add({
      title,
      category,
      body,
      createdBy: currentUser.mcid,
      createdAt: serverTimestamp()
    });

    $("#newsTitleInput").value = "";
    $("#newsBodyInput").value = "";
    toast("お知らせを追加しました。", "ok");
    loadNewsList();
  }

  async function loadNewsList() {
    const container = $("#newsList");
    if (!container) return;
    try {
      const snap = await newsRef().orderBy("createdAt", "desc").limit(50).get();
      const items = snap.docs.map(function (doc) { return doc.data(); });
      renderNewsStack(container, items.length ? items : FALLBACK_NEWS);
    } catch {
      renderNewsStack(container, FALLBACK_NEWS);
    }
  }

  function renderNewsCards(container, items) {
    container.innerHTML = items.map(function (item) {
      return `<article class="news-card"><span class="category-chip">${esc(item.category || "news")}</span><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></article>`;
    }).join("");
  }

  function renderNewsStack(container, items) {
    container.innerHTML = items.map(function (item) {
      return `<article class="stack-item"><span class="category-chip">${esc(item.category || "news")}</span><h2>${esc(item.title)}</h2><p>${esc(item.body)}</p></article>`;
    }).join("");
  }

  function initQuestPage() {
    renderAdminQuestPanel();
    $("#addQuestBtn")?.addEventListener("click", addQuest);
    loadQuestList();
  }

  function renderAdminQuestPanel() {
    const panel = $("#adminQuestPanel");
    if (panel) panel.hidden = !isAdmin(currentUser);
  }

  async function addQuest() {
    if (!isAdmin(currentUser)) return;
    const title = $("#questTitleInput").value.trim();
    const body = $("#questBodyInput").value.trim();
    const reward = $("#questRewardInput").value.trim() || "?P";
    const status = $("#questStatusInput").value.trim() || "quest";
    if (!title || !body) {
      toast("タイトルと説明を入れてね。", "error");
      return;
    }

    await questsRef().add({
      title,
      body,
      reward,
      status,
      createdBy: currentUser.mcid,
      createdAt: serverTimestamp()
    });

    $("#questTitleInput").value = "";
    $("#questBodyInput").value = "";
    toast("クエストを追加しました。", "ok");
    loadQuestList();
  }

  async function loadQuestList() {
    const container = $("#questList");
    if (!container) return;
    try {
      const snap = await questsRef().orderBy("createdAt", "desc").limit(50).get();
      const items = snap.docs.map(function (doc) { return doc.data(); });
      renderQuestCards(container, items.length ? items : FALLBACK_QUESTS);
    } catch {
      renderQuestCards(container, FALLBACK_QUESTS);
    }
  }

  function renderQuestCards(container, items) {
    container.innerHTML = items.map(function (item) {
      return `<article class="quest-card"><span class="status-chip">${esc(item.status || "quest")}</span><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><div class="quest-meta"><span class="category-chip">Reward ${esc(item.reward || "?")}</span></div></article>`;
    }).join("");
  }

  function initChatPage() {
    renderChatAuth();
    $("#createThreadBtn")?.addEventListener("click", createThread);
    $("#sendMessageBtn")?.addEventListener("click", sendMessage);
    $("#messageInput")?.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

    listenThreads();

    const params = new URLSearchParams(location.search);
    const thread = params.get("thread");
    if (thread) setTimeout(function () { selectThread(thread); }, 900);
  }

  function renderChatAuth() {
    const notice = $("#chatLoginNotice");
    const create = $("#chatCreatePanel");
    const input = $("#messageInputPanel");
    if (notice) notice.hidden = Boolean(currentUser);
    if (create) create.hidden = !currentUser;
    if (input) input.hidden = !currentUser || !selectedThreadId;
  }

  function listenThreads() {
    if (!isFirebaseReady()) return;
    if (chatThreadUnsub) chatThreadUnsub();

    chatThreadUnsub = threadsRef().orderBy("updatedAt", "desc").limit(50).onSnapshot(function (snap) {
      const list = $("#threadList");
      if (!list) return;

      list.innerHTML = snap.docs.map(function (doc) {
        const t = doc.data();
        return `
          <button class="thread-button ${doc.id === selectedThreadId ? "is-active" : ""}" data-thread-id="${doc.id}">
            <strong>${esc(t.title)}</strong>
            <small>${esc(t.lastMessage || "まだメッセージなし")}</small>
          </button>
        `;
      }).join("") || `<p class="hint">まだスレッドがありません。</p>`;


      $$("[data-thread-id]", list).forEach(function (button) {
        button.addEventListener("click", function () {
          selectThread(button.dataset.threadId);
        });
      });
    });
  }

  async function createThread() {
    if (!currentUser) {
      toast("ログインしてね。", "error");
      return;
    }

    const title = $("#threadTitleInput").value.trim();
    const first = $("#threadFirstMessageInput").value.trim();

    if (!title || !first) {
      toast("タイトルと最初のメッセージを入れてね。", "error");
      return;
    }

    const ref = await threadsRef().add({
      title,
      createdBy: currentUser.mcid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: first
    });

    await ref.collection("messages").add({
      mcid: currentUser.mcid,
      mcidLower: lowerMcid(currentUser.mcid),
      text: first,
      createdAt: serverTimestamp()
    });

    $("#threadTitleInput").value = "";
    $("#threadFirstMessageInput").value = "";
    selectThread(ref.id);
  }

  function selectThread(id) {
    selectedThreadId = id;
    renderChatAuth();

    if (chatMessageUnsub) chatMessageUnsub();

    const header = $("#activeThreadHeader");
    const messages = $("#messageList");

    threadsRef().doc(id).get().then(function (snap) {
      const t = snap.data();
      if (header) header.innerHTML = `<h2>${esc(t.title)}</h2><p>created by ${esc(t.createdBy || "unknown")}</p>`;
    });

    chatMessageUnsub = threadsRef().doc(id).collection("messages").orderBy("createdAt", "asc").limit(200).onSnapshot(function (snap) {
      if (!messages) return;

      messages.innerHTML = snap.docs.map(function (doc) {
        const m = doc.data();
        return `
          <div class="message">
            <img src="https://mc-heads.net/avatar/${encodeURIComponent(m.mcid || "Steve")}/64" alt="">
            <div class="message-bubble">
              <strong>${esc(m.mcid || "unknown")}</strong>
              <p>${esc(m.text || "")}</p>
            </div>
          </div>
        `;
      }).join("");
      messages.scrollTop = messages.scrollHeight;
    });
  }

  async function sendMessage() {
    if (!currentUser || !selectedThreadId) return;
    const text = $("#messageInput").value.trim();
    if (!text) return;

    $("#messageInput").value = "";

    const ref = threadsRef().doc(selectedThreadId);
    await ref.collection("messages").add({
      mcid: currentUser.mcid,
      mcidLower: lowerMcid(currentUser.mcid),
      text: text.slice(0, 500),
      createdAt: serverTimestamp()
    });

    await ref.set({
      lastMessage: text.slice(0, 80),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  function listenTurtles() {
    if (!isFirebaseReady()) return;
    if (turtleUnsub) turtleUnsub();

    turtleUnsub = turtlesRef().where("page", "==", page).onSnapshot(function (snap) {
      const visible = new Set();
      let godVisible = false;

      snap.forEach(function (doc) {
        const data = Object.assign({ id: doc.id }, doc.data());
        const meta = TURTLES[data.type] || TURTLES.normal;
        const claimed = asArray(data.claimedBy);
        const limit = Number(data.limit || meta.limit);
        const expired = data.expiresAtMs && Date.now() > Number(data.expiresAtMs);
        const full = claimed.length >= limit;
        const already = currentUser && claimed.includes(currentUser.mcid);

        if ((expired || full) && data.active) {
          doc.ref.set({ active: false, endedAt: serverTimestamp() }, { merge: true }).catch(console.error);
        }

        if (data.active && !expired && !full && !already) {
          renderTurtle(doc.id, data);
          visible.add(doc.id);
          if (data.type === "god") godVisible = true;
        } else {
          removeTurtle(doc.id);
        }
      });

      Array.from(turtleEls.keys()).forEach(function (id) {
        if (!visible.has(id)) removeTurtle(id);
      });

      const nav = $(`.site-nav a[data-page="${page}"]`);
      if (nav) nav.classList.toggle("god-glow", godVisible);
    });
  }

  function renderTurtle(id, data) {
    const meta = TURTLES[data.type] || TURTLES.normal;
    let el = turtleEls.get(id);
    if (!el) {
      el = document.createElement("img");
      document.body.appendChild(el);
      turtleEls.set(id, el);
    }

    el.src = meta.img;
    el.className = `turtle-sprite turtle-${data.type}`;
    el.style.left = Number(data.xPct || 50) + "vw";
    el.style.top = Number(data.yPct || 50) + "vh";
    el.onclick = function (event) {
      event.stopPropagation();
      claimTurtle(id);
    };

    if (data.type === "god") {
      el.onpointermove = function (event) {
        const rect = el.getBoundingClientRect();
        const fleeX = event.clientX < rect.left + rect.width / 2 ? 42 : -42;
        const fleeY = event.clientY < rect.top + rect.height / 2 ? 34 : -34;
        el.style.setProperty("--flee-x", fleeX + "px");
        el.style.setProperty("--flee-y", fleeY + "px");
      };
    }
  }

  function removeTurtle(id) {
    const el = turtleEls.get(id);
    if (!el) return;
    turtleEls.delete(id);
    el.remove();
  }

  async function claimTurtle(id) {
    if (!currentUser) {
      toast("Pointを受け取るにはログインしてね。", "error");
      return;
    }

    let result = null;

    await db().runTransaction(async function (tx) {
      const tref = turtlesRef().doc(id);
      const pref = playersRef().doc(currentUser.docId);
      const tsnap = await tx.get(tref);
      if (!tsnap.exists) return;

      const t = tsnap.data();
      const meta = TURTLES[t.type] || TURTLES.normal;
      const claimed = asArray(t.claimedBy);
      const limit = Number(t.limit || meta.limit);
      if (!t.active || claimed.includes(currentUser.mcid) || claimed.length >= limit) return;

      const next = claimed.concat(currentUser.mcid);
      tx.set(tref, {
        claimedBy: next,
        active: next.length >= limit ? false : true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      tx.set(pref, {
        points: increment(Number(t.points || meta.points)),
        updatedAt: serverTimestamp()
      }, { merge: true });

      result = { points: Number(t.points || meta.points), type: t.type };
    });

    if (result) {
      toast(`+${result.points}P`, "ok");
      spawnParticles(result.type === "diamond" ? "#5D8BB0" : "#6FA86B", "star", 30);
    }
  }

  function setupPlacementMode() {
    document.addEventListener("pointermove", function (event) {
      if (!placementCursor) return;
      placementCursor.style.left = event.clientX + "px";
      placementCursor.style.top = event.clientY + "px";
    });

    document.addEventListener("click", async function (event) {
      if (!pendingTurtleType && !pendingSwordOwner) return;
      if (event.target.closest(".admin-console")) return;

      event.preventDefault();
      event.stopPropagation();

      const xPct = event.clientX / window.innerWidth * 100;
      const yPct = event.clientY / window.innerHeight * 100;

      if (pendingTurtleType) {
        const type = pendingTurtleType;
        pendingTurtleType = null;
        hidePlacementCursor();
        await saveTurtlePlacement(type, xPct, yPct);
      } else if (pendingSwordOwner) {
        const owner = pendingSwordOwner;
        pendingSwordOwner = null;
        hidePlacementCursor();
        await saveSwordPlacement(owner, xPct, yPct);
      }
    }, true);
  }

  function showPlacementCursor(html) {
    hidePlacementCursor();
    placementCursor = document.createElement("div");
    placementCursor.id = "placementCursor";
    placementCursor.innerHTML = html;
    document.body.appendChild(placementCursor);
    document.body.classList.add("placement-mode");
  }

  function hidePlacementCursor() {
    if (placementCursor) placementCursor.remove();
    placementCursor = null;
    document.body.classList.remove("placement-mode");
  }

  function startTurtlePlacement(type) {
    const meta = TURTLES[type];
    if (!meta) return;
    pendingTurtleType = type;
    showPlacementCursor(`<img src="${meta.img}" alt="">`);
    closeAdminConsole();
    toast(`${meta.label}を置きたい場所でクリック。`, "ok", 5000);
  }

  async function saveTurtlePlacement(type, xPct, yPct) {
    const meta = TURTLES[type];
    const now = Date.now();
    await turtlesRef().add({
      type,
      page,
      xPct,
      yPct,
      points: meta.points,
      limit: meta.limit,
      claimedBy: [],
      active: true,
      createdAt: serverTimestamp(),
      createdAtMs: now,
      expiresAtMs: type === "god" ? now + 60 * 60 * 1000 : null
    });
  }

  function listenSwords() {
    if (!isFirebaseReady()) return;
    if (swordUnsub) swordUnsub();

    swordUnsub = swordsRef().where("page", "==", page).onSnapshot(function (snap) {
      const visible = new Set();

      snap.forEach(function (doc) {
        const data = Object.assign({ id: doc.id }, doc.data());
        const expired = data.expiresAtMs && Date.now() > Number(data.expiresAtMs);

        if (data.active && !expired) {
          renderSword(doc.id, data);
          visible.add(doc.id);
        } else {
          removeSword(doc.id);
        }
      });

      Array.from(swordEls.keys()).forEach(function (id) {
        if (!visible.has(id)) removeSword(id);
      });
    });
  }

  function renderSword(id, data) {
    let button = swordEls.get(id);
    if (!button) {
      button = document.createElement("button");
      button.className = "diamond-sword";
      document.body.appendChild(button);
      swordEls.set(id, button);
    }

    button.style.left = Number(data.xPct || 50) + "vw";
    button.style.top = Number(data.yPct || 50) + "vh";
    button.innerHTML = `${diamondSwordSvg()}<span class="sword-tooltip">${esc(data.owner || "4y44")}が設置!</span>`;

    button.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      openPublicProfile(data.owner || "4y44");
    };
  }

  function removeSword(id) {
    const el = swordEls.get(id);
    if (!el) return;
    swordEls.delete(id);
    el.remove();
  }

  function setupSwordButton() {
    if ($("#swordPowerButton")) return;
    const button = document.createElement("button");
    button.id = "swordPowerButton";
    button.className = "hub-button floating-action";
    button.textContent = "ダイヤ剣を置く";
    button.hidden = true;
    document.body.appendChild(button);
    button.onclick = startSwordPlacementForCurrentUser;
  }

  function refreshSwordButton() {
    const button = $("#swordPowerButton");
    if (!button) return;
    button.hidden = !(currentUser && currentUser.titles.includes("PVP crown"));
  }

  async function startSwordPlacementForCurrentUser() {
    if (!currentUser || !currentUser.titles.includes("PVP crown")) {
      toast("PVP crownの人だけが剣を置けます。", "error");
      return;
    }
    pendingSwordOwner = currentUser.mcid;
    showPlacementCursor(diamondSwordSvg());
    toast("剣を置きたい場所でクリック。", "ok", 5000);
  }

  async function saveSwordPlacement(owner, xPct, yPct) {
    const now = Date.now();
    await swordsRef().add({
      page,
      xPct,
      yPct,
      owner,
      active: true,
      createdAt: serverTimestamp(),
      createdAtMs: now,
      expiresAtMs: now + 24 * 60 * 60 * 1000
    });
  }

  function diamondSwordSvg() {
    return `
      <svg viewBox="0 0 96 96">
        <path d="M66 8 L82 14 L38 58 L28 48 Z" fill="#7fb7d6" stroke="#3A332B" stroke-width="4" stroke-linejoin="round"/>
        <path d="M56 18 L68 24 L32 60 L26 54 Z" fill="#c9edf7" opacity=".8"/>
        <path d="M25 54 L42 71" stroke="#3A332B" stroke-width="8" stroke-linecap="round"/>
        <path d="M18 63 L33 48" stroke="#E08A4B" stroke-width="9" stroke-linecap="round"/>
        <path d="M13 76 L24 87 L38 73 L27 62 Z" fill="#6FA86B" stroke="#3A332B" stroke-width="4" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function initAdminConsole() {
    createAdminConsole();

    document.addEventListener("keydown", function (event) {
      pressedKeys[event.key.toLowerCase()] = true;
      if (pressedKeys.c && pressedKeys.v && pressedKeys.b) {
        event.preventDefault();
        openAdminConsole();
      }
    });

    document.addEventListener("keyup", function (event) {
      pressedKeys[event.key.toLowerCase()] = false;
    });
  }

  function createAdminConsole() {
    const overlay = document.createElement("section");
    overlay.id = "adminConsole";
    overlay.className = "admin-console";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="terminal-window">
        <button class="console-close">×</button>
        <div class="login-panel">
          <h2>RETBARE ADMIN CONSOLE</h2>
          <p>password required</p>
          <input id="adminPassword" type="password" placeholder="password">
          <button id="adminLoginBtn" class="hub-button">ENTER</button>
        </div>
        <div class="access-panel" hidden><h2 id="accessText"></h2></div>
        <div class="terminal-body" hidden>
          <div id="terminalOutput" class="terminal-output"></div>
          <div class="terminal-input-row">
            <span>retbare@hub:~$</span>
            <input id="terminalInput" class="terminal-input" autocomplete="off">
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    admin = {
      overlay,
      authenticated: false,
      login: $(".login-panel", overlay),
      password: $("#adminPassword", overlay),
      loginButton: $("#adminLoginBtn", overlay),
      closeButton: $(".console-close", overlay),
      access: $(".access-panel", overlay),
      accessText: $("#accessText", overlay),
      body: $(".terminal-body", overlay),
      output: $("#terminalOutput", overlay),
      input: $("#terminalInput", overlay)
    };

    admin.closeButton.onclick = closeAdminConsole;
    admin.loginButton.onclick = tryAdminLogin;
    admin.password.onkeydown = function (event) {
      if (event.key === "Enter") tryAdminLogin();
    };
    admin.input.onkeydown = function (event) {
      if (event.key === "Enter") {
        const raw = admin.input.value;
        admin.input.value = "";
        handleAdminCommand(raw);
      }
    };
  }

  function openAdminConsole() {
    admin.overlay.hidden = false;
    if (admin.authenticated) {
      showTerminal();
      return;
    }
    admin.login.hidden = false;
    admin.access.hidden = true;
    admin.body.hidden = true;
    admin.password.value = "";
    setTimeout(function () { admin.password.focus(); }, 80);
  }

  function closeAdminConsole() {
    admin.overlay.hidden = true;
  }

  function tryAdminLogin() {
    if (admin.password.value !== "12345") {
      toast("PASSWORD DENIED", "error");
      return;
    }
    admin.authenticated = true;
    admin.login.hidden = true;
    admin.access.hidden = false;
    admin.accessText.textContent = "ACCESS GRANTED";
    setTimeout(showTerminal, 700);
  }

  function showTerminal() {
    admin.login.hidden = true;
    admin.access.hidden = true;
    admin.body.hidden = false;
    if (!admin.output.dataset.ready) {
      admin.output.dataset.ready = "1";
      writeTerminal("retbareHUB admin console ready.");
      writeTerminal("help / seed init / money add User 100 / came normal");
    }
    admin.input.focus();
  }

  function writeTerminal(text, className) {
    const line = document.createElement("div");
    line.className = `terminal-line ${className || ""}`;
    line.textContent = text;
    admin.output.appendChild(line);
    admin.output.scrollTop = admin.output.scrollHeight;
  }

  async function handleAdminCommand(raw) {
    const cmd = String(raw || "").trim();
    if (!cmd) return;
    writeTerminal(`retbare@hub:~$ ${cmd}`, "echo");

    const parts = cmd.split(/\s+/);

    try {
      if (parts[0] === "help") {
        writeTerminal("seed init");
        writeTerminal("money add [User名] [金額]");
        writeTerminal("money take [User名] [金額]");
        writeTerminal("came [normal/gold/diamond/god]");
        return;
      }

      if (parts[0] === "seed" && parts[1] === "init") {
        await seedInitialData();
        writeTerminal("seed completed.");
        return;
      }

      if (parts[0] === "money") {
        await adminMoney(parts[1], parts[2], parts[3]);
        return;
      }

      if (parts[0] === "came") {
        startTurtlePlacement(parts[1]);
        return;
      }

      writeTerminal("command not found", "error");
    } catch (error) {
      console.error(error);
      writeTerminal("ERR: " + error.message, "error");
    }
  }

  async function adminMoney(action, rawMcid, amountText) {
    const found = await findPlayerDoc(rawMcid);
    if (!found) throw new Error("account not found");

    const amount = Number(amountText);
    if (!Number.isFinite(amount)) throw new Error("invalid amount");

    await found.ref.set({
      points: increment(action === "take" ? -amount : amount),
      updatedAt: serverTimestamp()
    }, { merge: true });

    writeTerminal(`${found.player.mcid}: ${action === "take" ? "-" : "+"}${amount}P`);
  }

  async function seedInitialData() {
    for (const mcid of Object.keys(INITIAL_PLAYERS)) {
      const init = INITIAL_PLAYERS[mcid];
      const hash = await passwordHash(mcid, "12345");
      const found = await findPlayerDoc(mcid);
      const ref = found ? found.ref : playersRef().doc(mcid);
      const old = found ? found.player : null;

      await ref.set({
        mcid,
        mcidLower: lowerMcid(mcid),
        hasAccount: true,
        passwordHash: old && old.passwordHash ? old.passwordHash : hash,
        password: deleteField(),
        points: old ? old.points : init.points,
        bio: old && old.bio ? old.bio : init.bio,
        color: init.color,
        titles: unique((old ? old.titles : []).concat(init.titles)),
        unlockedItems: unique((old ? old.unlockedItems : []).concat(init.unlockedItems)),
        ownedGachaItems: unique((old ? old.ownedGachaItems : []).concat(init.ownedGachaItems)),
        equipped: Object.assign({}, defaultEquipped(), init.equipped, old ? old.equipped : {}),
        createdAt: old && old.createdAt ? old.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    for (const n of FALLBACK_NEWS) {
      await newsRef().add(Object.assign({}, n, { createdAt: serverTimestamp() }));
    }

    for (const q of FALLBACK_QUESTS) {
      await questsRef().add(Object.assign({}, q, { createdAt: serverTimestamp() }));
    }

    toast("初期データを登録しました。初期4人のパスワードは12345です。", "ok", 6000);
  }
})();
