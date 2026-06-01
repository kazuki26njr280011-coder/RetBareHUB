(function () {
  "use strict";

  const page = document.documentElement.dataset.page || "home";

  const TURTLES = {
    normal: {
      label: "普通の亀",
      points: 5,
      limit: 10,
      img: "turtle_normal.png",
      fragment: "#6FA86B"
    },
    gold: {
      label: "黄金の亀",
      points: 10,
      limit: 10,
      img: "turtle_gold.png",
      fragment: "#E0AB4B"
    },
    diamond: {
      label: "ダイヤの亀",
      points: 50,
      limit: 1,
      img: "turtle_diamond.png",
      fragment: "#5D8BB0"
    },
    god: {
      label: "神の亀",
      points: 60,
      limit: 10,
      img: "turtle_god.png",
      fragment: "#E08A4B"
    }
  };

  const SHOP_ITEMS = [
    {
      id: "effect_leaf",
      kind: "effect",
      value: "leafConfetti",
      label: "木の葉クラッカー",
      desc: "開封時にやわらかい葉っぱが舞います。",
      cost: 20
    },
    {
      id: "effect_stars",
      kind: "effect",
      value: "softStars",
      label: "控えめ星屑",
      desc: "プロフィール背景に小さな星がきらめきます。",
      cost: 25
    },
    {
      id: "song_morning",
      kind: "song",
      value: "music/retbare_morning.mp3",
      label: "朝のretbare",
      desc: "Storageに置いたmp3をプロフィール曲にします。",
      cost: 35
    },
    {
      id: "song_campfire",
      kind: "song",
      value: "music/campfire_chorus.mp3",
      label: "焚き火のサビ",
      desc: "サビだけに切ったmp3を入れて使ってください。",
      cost: 45
    },
    {
      id: "color_green",
      kind: "color",
      color: "green",
      label: "森の緑カラー",
      desc: "プロフィールをやさしい緑にします。",
      cost: 12
    },
    {
      id: "color_orange",
      kind: "color",
      color: "orange",
      label: "夕焼けオレンジ",
      desc: "プロフィールにあたたかいオレンジを足します。",
      cost: 18
    },
    {
      id: "color_blue",
      kind: "color",
      color: "blue",
      label: "月夜の青",
      desc: "青いプロフィールカラーを解放します。",
      cost: 50
    }
  ];

  const INITIAL_PLAYERS = {
    Retaru46: {
      points: 300,
      bio: "retbareHUBの管理人。コマンドブロック風の紫装飾を持っています。",
      color: "purple",
      activeEffect: "commandFrame",
      music: "",
      titles: ["Admin"],
      unlockedEffects: ["commandFrame"],
      unlockedSongs: [],
      unlockedColors: ["cream", "green", "purple"]
    },
    Mukisukino: {
      points: 120,
      bio: "UHC KING。金リンゴクラッカーと王冠演出を最初から解放済み。",
      color: "gold",
      activeEffect: "goldenAppleConfetti",
      music: "",
      titles: ["UHC KING"],
      unlockedEffects: ["goldenAppleConfetti", "kingCrown"],
      unlockedSongs: [],
      unlockedColors: ["cream", "green", "gold"]
    },
    "4y44": {
      points: 120,
      bio: "PVP crown。サイト内にダイヤ剣を1日2個まで設置できます。",
      color: "green",
      activeEffect: "slashLight",
      music: "",
      titles: ["PVP crown"],
      unlockedEffects: ["slashLight"],
      unlockedSongs: [],
      unlockedColors: ["cream", "green"]
    },
    "386ede": {
      points: 120,
      bio: "Sword God。青いプロフィールカラーとエンチャント風オーラを持っています。",
      color: "blue",
      activeEffect: "blueEnchantAura",
      music: "",
      titles: ["Sword God"],
      unlockedEffects: ["blueEnchantAura"],
      unlockedSongs: [],
      unlockedColors: ["cream", "green", "blue"]
    }
  };

  const FALLBACK_NEWS = [
    {
      title: "retbareHUBができました",
      body: "プロフィール、Point、亀システムをまとめたファンサイトです。",
      category: "site",
      createdAt: Date.now() - 1000 * 60 * 60 * 8
    },
    {
      title: "亀を見つけたらクリック",
      body: "ページに出現する亀をクリックするとRetbareHubPointが手に入ります。",
      category: "point",
      createdAt: Date.now() - 1000 * 60 * 60 * 24
    },
    {
      title: "プロフィール曲はStorageから再生",
      body: "mp3をFirebase Storageにアップロードして、Firestoreのmusicにパスを入れます。",
      category: "music",
      createdAt: Date.now() - 1000 * 60 * 60 * 48
    }
  ];

  const FALLBACK_QUESTS = [
    {
      title: "拠点まわりを散歩する",
      body: "いい景色を見つけて、あとでみんなに教えよう。",
      reward: "5P",
      status: "daily"
    },
    {
      title: "誰かの建築をほめる",
      body: "看板やチャットで、いいところを一つ伝えてみよう。",
      reward: "8P",
      status: "warm"
    },
    {
      title: "ネザー素材を少し集める",
      body: "無理せず安全に。帰るまでがクエストです。",
      reward: "12P",
      status: "adventure"
    },
    {
      title: "スクショを1枚残す",
      body: "今日のretbareらしい場面を記録しよう。",
      reward: "6P",
      status: "memory"
    }
  ];

  let pointUnsub = null;
  let turtleUnsub = null;
  let swordUnsub = null;
  let turtleEls = new Map();
  let swordEls = new Map();
  let currentProfile = null;
  let pendingTurtleType = null;
  let pendingSwordOwner = null;
  let placementCursor = null;
  let cursorDustLast = 0;
  let admin = {};
  const pressedKeys = {};

  document.addEventListener("DOMContentLoaded", init);
  window.retbareSeedInitialData = seedInitialData;

  function init() {
    markActiveNav();
    createToastArea();
    setupProfileJumpButtons();
    setupPlacementMode();
    setupCursorDust();
    initAdminConsole();
    refreshUserStatus();

    if (isFirebaseReady()) {
      listenTurtles();
      listenSwords();
      setupSwordPowerButton();
    } else {
      toast("firebase.js に firebaseConfig を貼ると、FirestoreとStorage機能が動きます。", "note", 6500);
    }

    if (page === "home") initHomePage();
    if (page === "news") initNewsPage();
    if (page === "quest") initQuestPage();
    if (page === "profile") initProfilePage();
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function isFirebaseReady() {
    return Boolean(window.RH && window.RH.firebaseReady && window.RH.db);
  }

  function db() {
    return window.RH.db;
  }

  function storage() {
    return window.RH.storage;
  }

  function serverTimestamp() {
    return window.RH.serverTimestamp();
  }

  function increment(value) {
    return window.RH.increment(value);
  }

  function arrayUnion(value) {
    return window.RH.arrayUnion(value);
  }

  function playersRef() {
    return db().collection("players");
  }

  function turtlesRef() {
    return db().collection("config").doc("turtles").collection("active");
  }

  function swordsRef() {
    return db().collection("config").doc("swords").collection("active");
  }

  function newsRef() {
    return db().collection("news");
  }

  function questsRef() {
    return db().collection("quests");
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

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeMcid(value) {
    return String(value || "").trim().replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
  }

  function getLocalMcid() {
    return normalizeMcid(localStorage.getItem("retbare_mcid") || "");
  }

  function setLocalMcid(mcid) {
    const clean = normalizeMcid(mcid);
    if (!clean) return;
    localStorage.setItem("retbare_mcid", clean);
    refreshUserStatus();
    restartTurtleListener();
  }

  function basePlayer(mcid) {
    return {
      mcid,
      points: 0,
      bio: "よろしくね。まだ一言コメントはありません。",
      color: "cream",
      music: "",
      activeEffect: "",
      titles: [],
      unlockedEffects: [],
      unlockedSongs: [],
      unlockedColors: ["cream", "green"]
    };
  }

  function makeDefaultPlayer(mcid) {
    const clean = normalizeMcid(mcid);
    return Object.assign({}, basePlayer(clean), INITIAL_PLAYERS[clean] || {}, { mcid: clean });
  }

  function hasTitle(player, title) {
    return asArray(player.titles).includes(title);
  }

  function formatDate(value) {
    if (!value) return "";
    const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ja-JP", {
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function truncate(text, length) {
    const value = String(text || "");
    return value.length > length ? value.slice(0, length) + "…" : value;
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

    window.setTimeout(function () {
      item.style.opacity = "0";
      item.style.transform = "translateY(10px)";
      window.setTimeout(function () {
        item.remove();
      }, 250);
    }, ms || 3600);
  }

  function refreshUserStatus() {
    const mcid = getLocalMcid();
    const mcidPill = $("#currentMcidPill");
    const pointPill = $("#pointPill");

    if (mcidPill) {
      mcidPill.textContent = mcid ? `MCID: ${mcid}` : "MCID未設定";
    }

    if (pointUnsub) {
      pointUnsub();
      pointUnsub = null;
    }

    if (!pointPill) return;

    if (!mcid || !isFirebaseReady()) {
      pointPill.textContent = "0P";
      refreshSwordPowerButton();
      return;
    }

    pointUnsub = playersRef().doc(mcid).onSnapshot(function (snap) {
      const points = snap.exists ? Number(snap.data().points || 0) : 0;
      pointPill.textContent = `${points}P`;
      refreshSwordPowerButton();
    });
  }

  function restartTurtleListener() {
    if (!isFirebaseReady() || !turtleUnsub) return;
    turtleUnsub();
    turtleUnsub = null;
    turtleEls.forEach(function (el) {
      el.remove();
    });
    turtleEls.clear();
    listenTurtles();
  }

  function setupProfileJumpButtons() {

    $$("[data-profile-jump]").forEach(function (button) {
      button.addEventListener("click", function () {
        const current = getLocalMcid();
        const input = current || prompt("開きたいMCIDを入力してね");
        const mcid = normalizeMcid(input);
        if (!mcid) return;
        location.href = `./profile.html?mcid=${encodeURIComponent(mcid)}`;
      });
    });
  }

  function initHomePage() {
    loadHomeNews();
    loadHomePlayers();
    renderHomeSummary();
  }

  async function loadHomeNews() {
    const container = $("#homeNews");
    if (!container) return;

    if (!isFirebaseReady()) {
      renderNewsCards(container, FALLBACK_NEWS.slice(0, 3));
      return;
    }

    try {
      const snap = await newsRef().orderBy("createdAt", "desc").limit(3).get();
      const items = snap.docs.map(function (doc) {
        return Object.assign({ id: doc.id }, doc.data());
      });
      renderNewsCards(container, items.length ? items : FALLBACK_NEWS.slice(0, 3));
    } catch (error) {
      console.error(error);
      renderNewsCards(container, FALLBACK_NEWS.slice(0, 3));
    }
  }

  async function loadHomePlayers() {
    const container = $("#homePlayers");
    if (!container) return;

    if (!isFirebaseReady()) {
      renderPlayerCards(container, Object.values(INITIAL_PLAYERS).slice(0, 4));
      return;
    }

    try {
      const snap = await playersRef().orderBy("createdAt", "desc").limit(4).get();
      const players = snap.docs.map(function (doc) {
        return Object.assign({ mcid: doc.id }, doc.data());
      });
      renderPlayerCards(container, players.length ? players : Object.values(INITIAL_PLAYERS));
    } catch (error) {
      console.error(error);
      renderPlayerCards(container, Object.values(INITIAL_PLAYERS));
    }
  }

  function renderHomeSummary() {
    const container = $("#homeSummary");
    if (!container) return;

    container.innerHTML = `
      <p>retbareHUBでは、プロフィールを開いた時の演出、Pointショップ、Admin設置の亀、タイトル別オーラを楽しめます。</p>
      <ul class="summary-list">
        <li><span class="summary-dot"></span><span>亀クリックでRetbareHubPointを獲得</span></li>
        <li><span class="summary-dot"></span><span>Pointで曲・色・エフェクトを解放</span></li>
        <li><span class="summary-dot"></span><span>タイトル持ちは特別なプロフィール演出</span></li>
      </ul>
    `;
  }

  function initNewsPage() {
    loadNewsList();
  }

  async function loadNewsList() {
    const container = $("#newsList");
    if (!container) return;

    if (!isFirebaseReady()) {
      renderNewsStack(container, FALLBACK_NEWS);
      return;
    }

    try {
      const snap = await newsRef().orderBy("createdAt", "desc").limit(30).get();
      const items = snap.docs.map(function (doc) {
        return Object.assign({ id: doc.id }, doc.data());
      });
      renderNewsStack(container, items.length ? items : FALLBACK_NEWS);
    } catch (error) {
      console.error(error);
      renderNewsStack(container, FALLBACK_NEWS);
    }
  }

  function initQuestPage() {
    loadQuestList();
  }

  async function loadQuestList() {
    const container = $("#questList");
    if (!container) return;

    if (!isFirebaseReady()) {
      renderQuestCards(container, FALLBACK_QUESTS);
      return;
    }

    try {
      const snap = await questsRef().orderBy("createdAt", "desc").limit(30).get();
      const items = snap.docs.map(function (doc) {
        return Object.assign({ id: doc.id }, doc.data());
      });
      renderQuestCards(container, items.length ? items : FALLBACK_QUESTS);
    } catch (error) {
      console.error(error);
      renderQuestCards(container, FALLBACK_QUESTS);
    }
  }

  function renderNewsCards(container, items) {
    container.innerHTML = items.map(function (item) {
      return `
        <article class="news-card">
          <span class="category-chip">${esc(item.category || "news")}</span>
          <h3>${esc(item.title || "無題のお知らせ")}</h3>
          <time>${esc(formatDate(item.createdAt))}</time>
          <p>${esc(truncate(item.body || "", 90))}</p>
        </article>
      `;
    }).join("");
  }

  function renderNewsStack(container, items) {
    container.innerHTML = items.map(function (item) {
      return `
        <article class="stack-item">
          <span class="category-chip">${esc(item.category || "news")}</span>
          <h2>${esc(item.title || "無題のお知らせ")}</h2>
          <time>${esc(formatDate(item.createdAt))}</time>
          <p>${esc(item.body || "")}</p>
        </article>
      `;
    }).join("");
  }

  function renderPlayerCards(container, players) {
    container.innerHTML = players.map(function (player) {
      const mcid = normalizeMcid(player.mcid || "");
      return `
        <a class="player-card" href="./profile.html?mcid=${encodeURIComponent(mcid)}">
          <img src="https://mc-heads.net/avatar/${encodeURIComponent(mcid)}/96" alt="${esc(mcid)}">
          <span>
            <strong>${esc(mcid)}</strong>
            <small>${esc(asArray(player.titles)[0] || "member")}</small>
          </span>
        </a>
      `;
    }).join("");
  }

  function renderQuestCards(container, items) {
    container.innerHTML = items.map(function (item) {
      return `
        <article class="quest-card">
          <span class="status-chip">${esc(item.status || "quest")}</span>
          <h3>${esc(item.title || "無題クエスト")}</h3>
          <p>${esc(item.body || "")}</p>
          <div class="quest-meta">
            <span class="category-chip">Reward ${esc(item.reward || "?" )}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  function initProfilePage() {
    const input = $("#mcidInput");
    const button = $("#loadProfileBtn");

    const params = new URLSearchParams(location.search);
    const queryMcid = normalizeMcid(params.get("mcid"));
    const saved = getLocalMcid();

    if (input) input.value = queryMcid || saved || "";

    if (button) {
      button.addEventListener("click", function () {
        loadProfile(input ? input.value : "");
      });
    }

    if (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          loadProfile(input.value);
        }
      });
    }

    if (queryMcid) {
      loadProfile(queryMcid);
    } else {
      renderShop(null);
    }
  }

  async function ensurePlayer(mcid) {
    const clean = normalizeMcid(mcid);
    if (!clean) throw new Error("MCIDを入力してください。");

    const fallback = makeDefaultPlayer(clean);

    if (!isFirebaseReady()) return fallback;

    const ref = playersRef().doc(clean);
    const snap = await ref.get();

    if (snap.exists) {
      return Object.assign({}, fallback, snap.data(), { mcid: clean });
    }

    await ref.set(Object.assign({}, fallback, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), { merge: true });

    return fallback;
  }

  async function loadProfile(mcid, options) {
    const clean = normalizeMcid(mcid);
    if (!clean) {
      toast("MCIDを入力してね。", "error");
      return;
    }

    try {
      setLocalMcid(clean);

      const player = await ensurePlayer(clean);
      currentProfile = player;

      renderProfile(player);
      renderProfileEditor(player);
      renderShop(player);

      if (!options || !options.skipOpening) {
        playProfileOpening(player);
        playProfileMusic(player);
      }
    } catch (error) {
      console.error(error);
      toast(error.message || "プロフィールを開けませんでした。", "error");
    }
  }

  function profileColorClass(color) {
    const safe = String(color || "cream").replace(/[^a-z-]/g, "");
    return `profile-color-${safe}`;
  }

  function getTitleEffects(player) {
    const effects = [];
    if (hasTitle(player, "Admin")) effects.push("commandFrame");
    if (hasTitle(player, "UHC KING")) effects.push("goldenAppleConfetti", "kingCrown");
    if (hasTitle(player, "PVP crown")) effects.push("slashLight");
    if (hasTitle(player, "Sword God")) effects.push("blueEnchantAura");
    return effects;
  }

  function profileEffectMarkup(player) {
    const effects = unique([
      player.activeEffect,
      ...asArray(player.unlockedEffects),
      ...getTitleEffects(player)
    ]);

    let html = "";

    if (effects.includes("commandFrame")) {
      html += `<div class="command-frame" aria-hidden="true"></div>`;
    }

    if (effects.includes("blueEnchantAura")) {
      html += `<div class="enchant-aura" aria-hidden="true"></div>`;
    }

    if (effects.includes("slashLight")) {
      html += `<div class="slash-aura" aria-hidden="true"></div>`;
    }

    if (effects.includes("softStars")) {
      html += `<div class="soft-star-field" aria-hidden="true"></div>`;
    }

    if (effects.includes("kingCrown") || hasTitle(player, "UHC KING")) {
      html += `
        <div class="crown-mark" aria-hidden="true">${crownSvg()}</div>
        <div class="apple-orbit" aria-hidden="true">
          ${appleSvg()}
          ${appleSvg()}
          ${appleSvg()}
        </div>
      `;
    }

    return html;
  }

  function renderProfile(player) {
    const card = $("#profileCard");
    if (!card) return;

    const titles = asArray(player.titles);
    const effects = unique([
      player.activeEffect,
      ...asArray(player.unlockedEffects),
      ...getTitleEffects(player)
    ]);

    card.className = "profile-card opened";
    card.innerHTML = `
      <div class="profile-top ${profileColorClass(player.color)}">
        ${profileEffectMarkup(player)}
        <div class="skin-frame">
          <img class="profile-skin-img" src="https://mc-heads.net/avatar/${encodeURIComponent(player.mcid)}/128" alt="${esc(player.mcid)}">
        </div>

        <div class="profile-main">
          <div class="profile-name-line">
            <h2>${esc(player.mcid)}</h2>
            <span class="points-badge">${Number(player.points || 0)}P</span>
          </div>

          <div class="title-row">
            ${
              titles.length
                ? titles.map(function (title) {
                    return `<span class="title-chip">${esc(title)}</span>`;
                  }).join("")
                : `<span class="title-chip">member</span>`
            }
          </div>

          <p class="profile-bio">${esc(player.bio || "よろしくね。")}</p>
        </div>
      </div>

      <div class="profile-body">
        <div class="profile-stat">
          <small>カラー</small>
          <strong>${esc(player.color || "cream")}</strong>
        </div>
        <div class="profile-stat">
          <small>曲</small>
          <strong>${player.music ? esc(player.music) : "未設定"}</strong>
        </div>
        <div class="profile-stat">
          <small>エフェクト</small>
          <strong>${effects.length ? esc(effects.join(", ")) : "なし"}</strong>
        </div>
      </div>
    `;
  }

  function renderProfileEditor(player) {
    const editor = $("#profileEditor");
    if (!editor || !player) return;

    const effects = unique([
      "",
      player.activeEffect,
      ...asArray(player.unlockedEffects),
      ...getTitleEffects(player)
    ]);

    const songs = unique([
      "",
      player.music,
      ...asArray(player.unlockedSongs)
    ]);

    const colorOptions = makeColorOptions(player);

    editor.hidden = false;
    editor.innerHTML = `
      <h2>プロフィール編集</h2>
      <p class="hint">身内専用なので、本人確認なしで編集できます。</p>

      <div class="editor-grid">
        <label>
          一言コメント
          <textarea id="editBio" maxlength="140">${esc(player.bio || "")}</textarea>
        </label>

        <label>
          カラー
          <select id="editColor">
            ${colorOptions.map(function (item) {
              return `<option value="${esc(item.value)}" ${item.value === player.color ? "selected" : ""} ${item.disabled ? "disabled" : ""}>${esc(item.label)}</option>`;
            }).join("")}
          </select>
        </label>

        <label>
          エフェクト
          <select id="editEffect">
            ${effects.map(function (effect) {
              return `<option value="${esc(effect)}" ${effect === player.activeEffect ? "selected" : ""}>${esc(effectLabel(effect))}</option>`;
            }).join("")}
          </select>
        </label>

        <label>
          曲
          <select id="editMusic">
            ${songs.map(function (song) {
              return `<option value="${esc(song)}" ${song === player.music ? "selected" : ""}>${esc(songLabel(song))}</option>`;
            }).join("")}
          </select>
        </label>
      </div>

      <button id="saveProfileBtn" class="hub-button">保存する</button>
    `;

    $("#saveProfileBtn").addEventListener("click", function () {
      saveProfileSettings(player.mcid);
    });
  }

  function makeColorOptions(player) {
    const all = [
      { value: "cream", label: "クリーム" },
      { value: "green", label: "森の緑" },
      { value: "orange", label: "夕焼けオレンジ" },
      { value: "blue", label: "月夜の青" },
      { value: "purple", label: "コマンド紫" },
      { value: "gold", label: "金リンゴゴールド" }
    ];

    const owned = new Set(["cream", "green", ...asArray(player.unlockedColors)]);
    if (hasTitle(player, "Admin")) owned.add("purple");
    if (hasTitle(player, "UHC KING")) owned.add("gold");
    if (hasTitle(player, "Sword God")) owned.add("blue");
    if (player.color) owned.add(player.color);

    return all.map(function (item) {
      return Object.assign({}, item, {
        disabled: !owned.has(item.value)
      });
    });
  }

  async function saveProfileSettings(mcid) {
    if (!isFirebaseReady()) {
      toast("Firebase設定後に保存できます。", "error");
      return;
    }

    const clean = normalizeMcid(mcid);
    const bio = $("#editBio") ? $("#editBio").value.slice(0, 140) : "";
    const color = $("#editColor") ? $("#editColor").value : "cream";
    const effect = $("#editEffect") ? $("#editEffect").value : "";
    const music = $("#editMusic") ? $("#editMusic").value : "";

    try {
      await playersRef().doc(clean).set({
        mcid: clean,
        bio,
        color,
        activeEffect: effect,
        music,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast("プロフィールを保存しました。", "ok");
      await loadProfile(clean, { skipOpening: true });
    } catch (error) {
      console.error(error);
      toast("保存に失敗しました。", "error");
    }
  }

  function renderShop(player) {
    const container = $("#profileShop");
    if (!container) return;

    if (!player) {
      container.innerHTML = `
        <article class="shop-card">
          <h3>プロフィールを開いてね</h3>
          <p>MCIDを開くと、Pointショップが使えます。</p>
        </article>
      `;
      return;
    }

    container.innerHTML = SHOP_ITEMS.map(function (item) {
      const owned = playerOwnsItem(player, item);
      return `
        <article class="shop-card">
          <header>
            <span class="shop-icon ${esc(item.kind)}"></span>
            <div>
              <h3>${esc(item.label)}</h3>
              <span class="shop-price">${item.cost}P</span>
            </div>
          </header>
          <p>${esc(item.desc)}</p>
          <button class="hub-button" data-buy="${esc(item.id)}">
            ${owned ? "装備する" : "購入して装備"}
          </button>
        </article>
      `;
    }).join("");

    container.onclick = function (event) {
      const button = event.target.closest("[data-buy]");
      if (!button) return;
      buyItem(player.mcid, button.dataset.buy);
    };
  }

  function playerOwnsItem(player, item) {
    if (item.kind === "effect") {
      return asArray(player.unlockedEffects).includes(item.value) || getTitleEffects(player).includes(item.value);
    }
    if (item.kind === "song") {
      return asArray(player.unlockedSongs).includes(item.value) || player.music === item.value;
    }
    if (item.kind === "color") {
      return asArray(player.unlockedColors).includes(item.color) || player.color === item.color;
    }
    return false;
  }

  function equipUpdateForItem(item) {
    if (item.kind === "effect") return { activeEffect: item.value };
    if (item.kind === "song") return { music: item.value };
    if (item.kind === "color") return { color: item.color };
    return {};
  }

  async function buyItem(mcid, itemId) {
    if (!isFirebaseReady()) {
      toast("Firebase設定後に購入できます。", "error");
      return;
    }

    const item = SHOP_ITEMS.find(function (entry) {
      return entry.id === itemId;
    });

    if (!item) return;

    const clean = normalizeMcid(mcid);

    try {
      let alreadyOwned = false;

      await db().runTransaction(async function (tx) {
        const ref = playersRef().doc(clean);
        const snap = await tx.get(ref);
        const player = snap.exists
          ? Object.assign({}, makeDefaultPlayer(clean), snap.data(), { mcid: clean })
          : makeDefaultPlayer(clean);

        alreadyOwned = playerOwnsItem(player, item);

        const update = Object.assign({
          mcid: clean,
          updatedAt: serverTimestamp()
        }, equipUpdateForItem(item));

        if (alreadyOwned) {
          tx.set(ref, update, { merge: true });
          return;
        }

        const points = Number(player.points || 0);
        if (points < item.cost) {
          throw new Error("POINT_SHORT");
        }

        update.points = increment(-item.cost);

        if (item.kind === "effect") {
          update.unlockedEffects = arrayUnion(item.value);
        }

        if (item.kind === "song") {
          update.unlockedSongs = arrayUnion(item.value);
        }

        if (item.kind === "color") {
          update.unlockedColors = arrayUnion(item.color);
        }

        if (!snap.exists) {
          update.createdAt = serverTimestamp();
        }

        tx.set(ref, update, { merge: true });
      });

      toast(alreadyOwned ? "装備しました。" : "購入して装備しました。", "ok");
      await loadProfile(clean, { skipOpening: true });
    } catch (error) {
      if (error.message === "POINT_SHORT") {
        toast("Pointが足りません。亀を探してみよう。", "error");
      } else {
        console.error(error);
        toast("購入に失敗しました。", "error");
      }
    }
  }

  function effectLabel(effect) {
    const labels = {
      "": "なし",
      leafConfetti: "木の葉クラッカー",
      softStars: "控えめ星屑",
      commandFrame: "コマンドブロック枠",
      goldenAppleConfetti: "金リンゴクラッカー",
      kingCrown: "王冠演出",
      slashLight: "斬撃の光",
      blueEnchantAura: "青エンチャントオーラ"
    };
    return labels[effect] || effect;
  }

  function songLabel(song) {
    if (!song) return "曲なし";
    const found = SHOP_ITEMS.find(function (item) {
      return item.kind === "song" && item.value === song;
    });
    return found ? found.label : song;
  }

  function playProfileOpening(player) {
    const card = $("#profileCard");
    const skin = $(".profile-skin-img", card);
    const effects = unique([
      player.activeEffect,
      ...asArray(player.unlockedEffects),
      ...getTitleEffects(player)
    ]);

    makeConfetti({
      gold: effects.includes("goldenAppleConfetti"),
      apples: effects.includes("goldenAppleConfetti") || hasTitle(player, "UHC KING"),
      leaves: effects.includes("leafConfetti")
    });

    makeXpOrbs(skin || card);

    if (effects.includes("blueEnchantAura")) {
      fullScreenSparkle("#5D8BB0", 22);
    }
  }

  async function playProfileMusic(player) {
    const audio = $("#profileAudio");
    if (!audio || !player.music) return;

    try {
      let url = player.music;

      if (!/^https?:\/\//.test(url)) {
        if (!isFirebaseReady()) return;
        url = await storage().ref(player.music).getDownloadURL();
      }

      audio.src = url;
      audio.volume = 0.46;
      audio.currentTime = 0;

      const result = audio.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showMusicUnlockButton(url);
        });
      }
    } catch (error) {
      console.error(error);
      toast("曲を再生できませんでした。Storageのパスを確認してね。", "error");
    }
  }

  function showMusicUnlockButton(url) {
    const card = $("#profileCard");
    if (!card || $(".music-unlock", card)) return;

    const button = document.createElement("button");
    button.className = "hub-button music-unlock";
    button.textContent = "曲を再生する";
    button.addEventListener("click", function () {
      const audio = $("#profileAudio");
      if (!audio) return;
      audio.src = url;
      audio.volume = 0.46;
      audio.play();
      button.remove();
    });

    card.appendChild(button);
  }

  function makeConfetti(options) {
    const layer = document.createElement("div");
    layer.className = "particle-layer";
    document.body.appendChild(layer);

    const colors = options.gold
      ? ["#E0AB4B", "#FFFDF7", "#E08A4B", "#cfa143"]
      : ["#6FA86B", "#3E6B43", "#E08A4B", "#FFFDF7"];

    const amount = options.apples ? 72 : 58;

    for (let i = 0; i < amount; i++) {
      const piece = document.createElement("span");
      piece.className = options.leaves ? "leaf-piece" : "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty("--dx", (Math.random() * 180 - 90) + "px");
      piece.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      piece.style.setProperty("--dur", (2.0 + Math.random() * 1.8) + "s");
      piece.style.setProperty("--delay", (Math.random() * 0.25) + "s");
      layer.appendChild(piece);
    }

    if (options.apples) {
      for (let i = 0; i < 10; i++) {
        const apple = document.createElement("span");
        apple.className = "confetti-apple";
        apple.innerHTML = appleSvg();
        apple.style.left = Math.random() * 100 + "vw";
        apple.style.setProperty("--dx", (Math.random() * 220 - 110) + "px");
        apple.style.setProperty("--rot", (Math.random() * 680 - 340) + "deg");
        apple.style.setProperty("--dur", (2.4 + Math.random() * 1.8) + "s");
        apple.style.setProperty("--delay", (Math.random() * 0.35) + "s");
        layer.appendChild(apple);
      }
    }

    window.setTimeout(function () {
      layer.remove();
    }, 4200);
  }

  function makeXpOrbs(target) {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    for (let i = 0; i < 22; i++) {
      const orb = document.createElement("span");
      orb.className = "xp-orb";
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight + 30 + Math.random() * 120;

      orb.style.left = startX + "px";
      orb.style.top = startY + "px";
      document.body.appendChild(orb);

      const duration = 700 + Math.random() * 900;

      orb.animate([
        { transform: "translate(0, 0) scale(0.8)", opacity: 0 },
        { transform: "translate(0, -80px) scale(1)", opacity: 1, offset: 0.22 },
        { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.25)`, opacity: 0.15 }
      ], {
        duration,
        easing: "cubic-bezier(.2,.7,.2,1)",
        fill: "forwards"
      });

      window.setTimeout(function () {
        orb.remove();
      }, duration + 80);
    }
  }

  function setupCursorDust() {
    document.addEventListener("pointermove", function (event) {
      const now = Date.now();
      if (now - cursorDustLast < 55) return;
      cursorDustLast = now;

      if (event.pointerType && event.pointerType !== "mouse") return;
      if (event.target.closest && event.target.closest(".admin-console")) return;

      const star = document.createElement("span");
      star.className = "cursor-star";
      star.style.left = event.clientX + "px";
      star.style.top = event.clientY + "px";
      document.body.appendChild(star);

      window.setTimeout(function () {
        star.remove();
      }, 760);
    });
  }

  function floatingScore(x, y, text) {
    const item = document.createElement("span");
    item.className = "floating-score";
    item.textContent = text;
    item.style.left = x + "px";
    item.style.top = y + "px";
    document.body.appendChild(item);

    window.setTimeout(function () {
      item.remove();
    }, 1100);
  }

  function breakElementIntoSvg(el, type) {
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const color = TURTLES[type] ? TURTLES[type].fragment : "#6FA86B";
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    el.style.opacity = "0";
    window.setTimeout(function () {
      el.remove();
    }, 40);

    for (let i = 0; i < 16; i++) {
      const frag = document.createElement("span");
      frag.className = "svg-fragment";
      frag.style.left = centerX + "px";
      frag.style.top = centerY + "px";
      frag.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M${4 + Math.random() * 5} ${3 + Math.random() * 5} L${19 - Math.random() * 4} ${5 + Math.random() * 5} L${16 - Math.random() * 5} ${20 - Math.random() * 5} L${5 + Math.random() * 4} ${17 - Math.random() * 5} Z"
            fill="${color}" opacity="0.85"/>
        </svg>
      `;
      document.body.appendChild(frag);

      const dx = Math.cos(i / 16 * Math.PI * 2) * (50 + Math.random() * 80);
      const dy = Math.sin(i / 16 * Math.PI * 2) * (50 + Math.random() * 80);
      const rot = Math.random() * 320 - 160;

      frag.animate([
        { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.3) rotate(${rot}deg)`, opacity: 0 }
      ], {
        duration: 780 + Math.random() * 320,
        easing: "cubic-bezier(.2,.7,.2,1)",
        fill: "forwards"
      });

      window.setTimeout(function () {
        frag.remove();
      }, 1200);
    }
  }

  function fullScreenSparkle(color, amount) {
    for (let i = 0; i < amount; i++) {
      const star = document.createElement("span");
      star.className = "screen-sparkle";
      star.style.left = Math.random() * 100 + "vw";
      star.style.top = Math.random() * 100 + "vh";
      star.style.background = color || "#FFFDF7";
      star.style.animationDelay = Math.random() * 0.35 + "s";
      document.body.appendChild(star);

      window.setTimeout(function () {
        star.remove();
      }, 1600);
    }
  }

  function listenTurtles() {
    if (!isFirebaseReady()) return;

    turtleUnsub = turtlesRef().where("page", "==", page).onSnapshot(function (snap) {
      const visible = new Set();
      let godVisible = false;
      const localMcid = getLocalMcid();

      snap.forEach(function (docSnap) {
        const data = Object.assign({ id: docSnap.id }, docSnap.data());
        const meta = TURTLES[data.type] || TURTLES.normal;
        const claimed = asArray(data.claimedBy);
        const limit = Number(data.limit || meta.limit);
        const expired = data.expiresAtMs && Date.now() > Number(data.expiresAtMs);
        const full = claimed.length >= limit;
        const already = localMcid && claimed.includes(localMcid);

        if ((expired || full) && data.active) {
          docSnap.ref.set({
            active: false,
            endedAt: serverTimestamp()
          }, { merge: true }).catch(console.error);
        }

        if (data.active && !expired && !full && !already) {
          renderTurtle(docSnap.id, data);
          visible.add(docSnap.id);
          if (data.type === "god") godVisible = true;
        } else {
          removeTurtle(docSnap.id, !already && (expired || full || data.active === false));
        }
      });

      Array.from(turtleEls.keys()).forEach(function (id) {
        if (!visible.has(id)) {
          removeTurtle(id, false);
        }
      });

      setGodNavGlow(godVisible);
    }, function (error) {
      console.error(error);
      toast("亀データの読み込みに失敗しました。", "error");
    });
  }

  function renderTurtle(id, data) {
    const meta = TURTLES[data.type] || TURTLES.normal;
    let el = turtleEls.get(id);

    if (!el) {
      el = document.createElement("img");
      el.draggable = false;
      el.alt = meta.label;
      document.body.appendChild(el);
      turtleEls.set(id, el);
    }

    el.src = meta.img;
    el.dataset.turtleType = data.type;
    el.className = `turtle-sprite turtle-${esc(data.type)}`;
    el.style.left = clamp(Number(data.xPct) || 50, 3, 97) + "vw";
    el.style.top = clamp(Number(data.yPct) || 50, 8, 92) + "vh";

    el.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      claimTurtle(id);
    };

    if (data.type === "god") {
      el.onpointermove = function (event) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const fleeX = event.clientX < cx ? 42 : -42;
        const fleeY = event.clientY < cy ? 34 : -34;
        el.style.setProperty("--flee-x", `${fleeX + Math.random() * 16 - 8}px`);
        el.style.setProperty("--flee-y", `${fleeY + Math.random() * 14 - 7}px`);
      };

      el.onpointerleave = function () {
        el.style.setProperty("--flee-x", "0px");
        el.style.setProperty("--flee-y", "0px");
      };
    } else {
      el.onpointermove = null;
      el.onpointerleave = null;
    }
  }

  function removeTurtle(id, burst) {
    const el = turtleEls.get(id);
    if (!el) return;

    turtleEls.delete(id);

    if (burst) {
      breakElementIntoSvg(el, el.dataset.turtleType || "normal");
    } else {
      el.remove();
    }
  }

  function setGodNavGlow(on) {
    const nav = $(`.site-nav a[data-page="${page}"]`);
    if (nav) nav.classList.toggle("god-glow", Boolean(on));
  }

  async function requestMcidForPoint() {
    let mcid = getLocalMcid();
    if (!mcid) {
      mcid = normalizeMcid(prompt("Pointを受け取るMCIDを入力してね"));
      if (mcid) setLocalMcid(mcid);
    }
    return mcid;
  }

  async function claimTurtle(id) {
    if (!isFirebaseReady()) {
      toast("Firebase設定後に亀を取れます。", "error");
      return;
    }

    const mcid = await requestMcidForPoint();
    if (!mcid) return;

    const el = turtleEls.get(id);
    const rect = el ? el.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    let result = { status: "unknown" };

    try {
      await db().runTransaction(async function (tx) {
        const turtleRef = turtlesRef().doc(id);
        const playerRef = playersRef().doc(mcid);

        const turtleSnap = await tx.get(turtleRef);
        const playerSnap = await tx.get(playerRef);

        if (!turtleSnap.exists) {
          result = { status: "gone" };
          return;
        }

        const turtle = turtleSnap.data();
        const meta = TURTLES[turtle.type] || TURTLES.normal;
        const claimed = asArray(turtle.claimedBy);
        const limit = Number(turtle.limit || meta.limit);
        const pointValue = Number(turtle.points || meta.points);
        const expired = turtle.expiresAtMs && Date.now() > Number(turtle.expiresAtMs);

        if (!turtle.active || expired || claimed.length >= limit) {
          tx.set(turtleRef, {
            active: false,
            endedAt: serverTimestamp()
          }, { merge: true });
          result = { status: "gone" };
          return;
        }

        if (claimed.includes(mcid)) {
          result = { status: "already" };
          return;
        }

        const nextClaimed = claimed.concat(mcid);
        const turtleUpdate = {
          claimedBy: nextClaimed,
          updatedAt: serverTimestamp()
        };

        if (nextClaimed.length >= limit) {
          turtleUpdate.active = false;
          turtleUpdate.endedAt = serverTimestamp();
        }

        tx.update(turtleRef, turtleUpdate);

        if (playerSnap.exists) {
          tx.set(playerRef, {
            mcid,
            points: increment(pointValue),
            updatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          const player = makeDefaultPlayer(mcid);
          tx.set(playerRef, Object.assign({}, player, {
            points: pointValue,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }), { merge: true });
        }

        result = {
          status: "claimed",
          points: pointValue,
          type: turtle.type
        };
      });

      if (result.status === "claimed") {
        floatingScore(x, y, `+${result.points}`);
        removeTurtle(id, true);

        if (result.type === "diamond" || result.type === "god") {
          fullScreenSparkle(result.type === "diamond" ? "#5D8BB0" : "#E08A4B", 42);
        }

        toast(`${result.points}Pを手に入れました。`, "ok");
      } else if (result.status === "already") {
        toast("この亀はもう取っています。", "note");
      } else {
        toast("この亀はもう消えました。", "note");
      }
    } catch (error) {
      console.error(error);
      toast("亀を取れませんでした。もう一度試してね。", "error");
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
      if (event.target.closest && event.target.closest(".admin-console")) return;

      event.preventDefault();
      event.stopPropagation();

      const xPct = clamp(event.clientX / window.innerWidth * 100, 3, 97);
      const yPct = clamp(event.clientY / window.innerHeight * 100, 8, 92);

      if (pendingTurtleType) {
        const type = pendingTurtleType;
        pendingTurtleType = null;
        hidePlacementCursor();
        await saveTurtlePlacement(type, xPct, yPct);
        return;
      }

      if (pendingSwordOwner) {
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
    if (placementCursor) {
      placementCursor.remove();
      placementCursor = null;
    }
    document.body.classList.remove("placement-mode");
  }

  function startTurtlePlacement(type) {
    if (!isFirebaseReady()) {
      toast("Firebase設定後に亀を設置できます。", "error");
      return;
    }

    const meta = TURTLES[type];
    if (!meta) {
      toast("亀タイプが違います。", "error");
      return;
    }

    pendingTurtleType = type;
    pendingSwordOwner = null;
    showPlacementCursor(`<img src="${esc(meta.img)}" alt="">`);
    closeAdminConsole();
    toast(`${meta.label}を置きたい場所でクリックしてね。`, "ok", 5200);
  }

  async function saveTurtlePlacement(type, xPct, yPct) {
    const meta = TURTLES[type];
    const ref = turtlesRef().doc();
    const now = Date.now();

    await ref.set({
      id: ref.id,
      type,
      page,
      xPct,
      yPct,
      points: meta.points,
      limit: meta.limit,
      claimedBy: [],
      active: true,
      createdBy: getLocalMcid() || "admin",
      createdAt: serverTimestamp(),
      createdAtMs: now,
      expiresAtMs: type === "god" ? now + 60 * 60 * 1000 : null
    });

    toast(`${meta.label}を設置しました。`, "ok");
  }

  function listenSwords() {
    if (!isFirebaseReady()) return;

    swordUnsub = swordsRef().where("page", "==", page).onSnapshot(function (snap) {
      const visible = new Set();

      snap.forEach(function (docSnap) {
        const data = Object.assign({ id: docSnap.id }, docSnap.data());
        const expired = data.expiresAtMs && Date.now() > Number(data.expiresAtMs);

        if (expired && data.active) {
          docSnap.ref.set({
            active: false,
            endedAt: serverTimestamp()
          }, { merge: true }).catch(console.error);
        }

        if (data.active && !expired) {
          renderSword(docSnap.id, data);
          visible.add(docSnap.id);
        } else {
          removeSword(docSnap.id);
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

    button.style.left = clamp(Number(data.xPct) || 50, 3, 97) + "vw";
    button.style.top = clamp(Number(data.yPct) || 50, 8, 92) + "vh";
    button.innerHTML = `
      ${diamondSwordSvg()}
      <span class="sword-tooltip">${esc(data.owner || "4y44")}が設置!</span>
    `;
    button.onclick = function (event) {
      event.stopPropagation();
      location.href = `./profile.html?mcid=${encodeURIComponent(data.owner || "4y44")}`;
    };
  }

  function removeSword(id) {
    const el = swordEls.get(id);
    if (!el) return;
    swordEls.delete(id);
    el.remove();
  }

  function setupSwordPowerButton() {
    if ($("#swordPowerButton")) return;

    const button = document.createElement("button");
    button.id = "swordPowerButton";
    button.className = "hub-button floating-action";
    button.textContent = "ダイヤ剣を置く";
    button.hidden = true;
    document.body.appendChild(button);

    button.addEventListener("click", startSwordPlacementForCurrentUser);
    refreshSwordPowerButton();
  }

  async function refreshSwordPowerButton() {
    const button = $("#swordPowerButton");
    if (!button || !isFirebaseReady()) return;

    const mcid = getLocalMcid();
    if (!mcid) {
      button.hidden = true;
      return;
    }

    try {
      const allowed = await userCanPlaceSword(mcid);
      button.hidden = !allowed;
    } catch {
      button.hidden = true;
    }
  }

  async function userCanPlaceSword(mcid) {
    if (mcid === "4y44") return true;

    const snap = await playersRef().doc(mcid).get();
    if (!snap.exists) return false;

    return asArray(snap.data().titles).includes("PVP crown");
  }

  function todayKey() {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  }

  async function startSwordPlacementForCurrentUser() {
    if (!isFirebaseReady()) return;

    const mcid = getLocalMcid();
    if (!mcid) {
      toast("先にプロフィールでMCIDを設定してね。", "error");
      return;
    }

    const allowed = await userCanPlaceSword(mcid);
    if (!allowed) {
      toast("PVP crownの人だけが剣を置けます。", "error");
      return;
    }

    const snap = await swordsRef().where("owner", "==", mcid).get();
    const today = todayKey();
    const count = snap.docs.filter(function (doc) {
      const data = doc.data();
      return data.dayKey === today &&
        data.active &&
        (!data.expiresAtMs || Date.now() < Number(data.expiresAtMs));
    }).length;

    if (count >= 2) {
      toast("今日はもう2個置きました。", "error");
      return;
    }

    pendingSwordOwner = mcid;
    pendingTurtleType = null;
    showPlacementCursor(diamondSwordSvg());
    toast("剣を置きたい場所でクリックしてね。", "ok", 5200);
  }

  async function saveSwordPlacement(owner, xPct, yPct) {
    const ref = swordsRef().doc();
    const now = Date.now();

    await ref.set({
      id: ref.id,
      page,
      xPct,
      yPct,
      owner,
      active: true,
      dayKey: todayKey(),
      createdAt: serverTimestamp(),
      createdAtMs: now,
      expiresAtMs: now + 24 * 60 * 60 * 1000
    });

    toast("ダイヤ剣を設置しました。", "ok");
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
        <button class="console-close" type="button">×</button>

        <div class="login-panel">
          <h2>RETBARE ADMIN CONSOLE</h2>
          <p>password required</p>
          <input id="adminPassword" type="password" autocomplete="off" placeholder="password">
          <button id="adminLoginBtn" class="hub-button">ENTER</button>
        </div>

        <div class="access-panel" hidden>
          <h2 id="accessText"></h2>
        </div>

        <div class="terminal-body" hidden>
          <div id="terminalOutput" class="terminal-output"></div>
          <div class="terminal-input-row">
            <span>retbare@hub:~$</span>
            <input id="terminalInput" class="terminal-input" autocomplete="off">
          </div>
        </div>

        <div id="titleGui" class="title-gui" hidden>
          <h2>TITLE GRANT GUI</h2>
          <div class="title-gui-grid">
            <label>対象MCID<input id="titleTarget" placeholder="Retaru46"></label>
            <label>タイトル名<input id="titleName" placeholder="Admin / UHC KING など"></label>
            <label>
              プロフィールカラー
              <select id="titleColor">
                <option value="cream">cream</option>
                <option value="green">green</option>
                <option value="orange">orange</option>
                <option value="blue">blue</option>
                <option value="purple">purple</option>
                <option value="gold">gold</option>
              </select>
            </label>
            <label>
              付与エフェクト
              <select id="titleEffect">
                <option value="">なし</option>
                <option value="commandFrame">commandFrame</option>
                <option value="goldenAppleConfetti">goldenAppleConfetti</option>
                <option value="kingCrown">kingCrown</option>
                <option value="slashLight">slashLight</option>
                <option value="blueEnchantAura">blueEnchantAura</option>
                <option value="leafConfetti">leafConfetti</option>
                <option value="softStars">softStars</option>
              </select>
            </label>
          </div>
          <div class="title-gui-actions">
            <button id="grantTitleBtn" class="hub-button">付与する</button>
            <button id="closeTitleGuiBtn" class="hub-button secondary">戻る</button>
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
      input: $("#terminalInput", overlay),
      titleGui: $("#titleGui", overlay)
    };

    admin.closeButton.addEventListener("click", closeAdminConsole);
    admin.loginButton.addEventListener("click", tryAdminLogin);

    admin.password.addEventListener("keydown", function (event) {
      if (event.key === "Enter") tryAdminLogin();
    });

    admin.input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const raw = admin.input.value;
        admin.input.value = "";
        handleAdminCommand(raw);
      }
    });

    $("#grantTitleBtn", overlay).addEventListener("click", grantTitleFromGui);
    $("#closeTitleGuiBtn", overlay).addEventListener("click", function () {
      admin.titleGui.hidden = true;
      admin.body.hidden = false;
      admin.input.focus();
    });
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
    admin.titleGui.hidden = true;
    admin.password.value = "";
    window.setTimeout(function () {
      admin.password.focus();
    }, 80);
  }

  function closeAdminConsole() {
    admin.overlay.hidden = true;
  }

  function tryAdminLogin() {
    if (admin.password.value !== "12345") {
      admin.password.value = "";
      toast("PASSWORD DENIED", "error");
      return;
    }

    admin.authenticated = true;
    admin.login.hidden = true;
    admin.access.hidden = false;
    admin.accessText.textContent = "";

    typeWriter("ACCESS GRANTED", admin.accessText, function () {
      window.setTimeout(showTerminal, 700);
    });
  }

  function typeWriter(text, target, done) {
    let index = 0;
    const timer = window.setInterval(function () {
      target.textContent += text[index];
      index += 1;
      if (index >= text.length) {
        window.clearInterval(timer);
        if (done) done();
      }
    }, 70);
  }

  function showTerminal() {
    admin.login.hidden = true;
    admin.access.hidden = true;
    admin.titleGui.hidden = true;
    admin.body.hidden = false;

    if (!admin.output.dataset.ready) {
      admin.output.dataset.ready = "true";
      writeTerminal("retbareHUB admin console ready.");
      writeTerminal("type help for command list.");
    }

    window.setTimeout(function () {
      admin.input.focus();
    }, 60);
  }

  function writeTerminal(text, className) {
    const line = document.createElement("div");
    line.className = `terminal-line ${className || ""}`;
    line.textContent = text;
    admin.output.appendChild(line);
    admin.output.scrollTop = admin.output.scrollHeight;
  }

  async function handleAdminCommand(raw) {
    const command = String(raw || "").trim();
    if (!command) return;

    writeTerminal(`retbare@hub:~$ ${command}`, "echo");

    const parts = command.split(/\s+/);
    const main = parts[0];

    try {
      if (main === "help") {
        writeTerminal("money add [User名 or me] [金額]");
        writeTerminal("money take [User名 or me] [金額]");
        writeTerminal("came [normal/gold/diamond/god]");
        writeTerminal("title gui");
        writeTerminal("seed init");
        writeTerminal("clear");
        return;
      }

      if (main === "clear") {
        admin.output.innerHTML = "";
        return;
      }

      if (main === "money") {
        await adminMoney(parts[1], parts[2], parts[3]);
        return;
      }

      if (main === "came") {
        const type = parts[1];
        if (!TURTLES[type]) {
          writeTerminal("ERR: came normal/gold/diamond/god", "error");
          return;
        }
        writeTerminal(`${TURTLES[type].label} placement mode.`);
        startTurtlePlacement(type);
        return;
      }

      if (main === "title" && parts[1] === "gui") {
        admin.body.hidden = true;
        admin.titleGui.hidden = false;
        return;
      }

      if (main === "seed" && parts[1] === "init") {
        await seedInitialData();
        writeTerminal("initial data seeded.");
        return;
      }

      writeTerminal("command not found. type help.", "error");
    } catch (error) {
      console.error(error);
      writeTerminal(`ERR: ${error.message}`, "error");
    }
  }

  async function adminMoney(action, target, amountText) {
    if (!isFirebaseReady()) throw new Error("Firebase is not ready.");

    if (action !== "add" && action !== "take") {
      throw new Error("money add/take を使ってください。");
    }

    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("金額が正しくありません。");
    }

    const targetMcid = target === "me" ? getLocalMcid() : normalizeMcid(target);
    if (!targetMcid) {
      throw new Error("対象MCIDがありません。");
    }

    const delta = action === "add" ? amount : -amount;

    await playersRef().doc(targetMcid).set({
      mcid: targetMcid,
      points: increment(delta),
      updatedAt: serverTimestamp()
    }, { merge: true });

    writeTerminal(`${targetMcid}: ${delta > 0 ? "+" : ""}${delta}P`);
    toast(`${targetMcid} のPointを変更しました。`, "ok");
  }

  async function grantTitleFromGui() {
    if (!isFirebaseReady()) {
      toast("Firebase設定後に使えます。", "error");
      return;
    }

    const target = normalizeMcid($("#titleTarget").value);
    const title = $("#titleName").value.trim();
    const color = $("#titleColor").value;
    const effect = $("#titleEffect").value;

    if (!target || !title) {
      toast("対象MCIDとタイトル名を入れてね。", "error");
      return;
    }

    const update = {
      mcid: target,
      titles: arrayUnion(title),
      color,
      unlockedColors: arrayUnion(color),
      updatedAt: serverTimestamp()
    };

    if (effect) {
      update.activeEffect = effect;
      update.unlockedEffects = arrayUnion(effect);
    }

    await playersRef().doc(target).set(update, { merge: true });

    toast(`${target} に ${title} を付与しました。`, "ok");
    writeTerminal(`title granted: ${target} -> ${title}`);
    admin.titleGui.hidden = true;
    admin.body.hidden = false;
    admin.input.focus();
  }

  async function seedInitialData() {
    if (!isFirebaseReady()) {
      toast("Firebase設定後に seed init できます。", "error");
      return;
    }

    const batch = db().batch();

    Object.keys(INITIAL_PLAYERS).forEach(function (mcid) {
      const data = makeDefaultPlayer(mcid);
      batch.set(playersRef().doc(mcid), Object.assign({}, data, {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }), { merge: true });
    });

    FALLBACK_NEWS.forEach(function (item, index) {
      batch.set(newsRef().doc(`sample-${index + 1}`), Object.assign({}, item, {
        createdAt: serverTimestamp()
      }), { merge: true });
    });

    FALLBACK_QUESTS.forEach(function (item, index) {
      batch.set(questsRef().doc(`sample-${index + 1}`), Object.assign({}, item, {
        createdAt: serverTimestamp()
      }), { merge: true });
    });

    await batch.commit();
    toast("初期データをFirestoreに登録しました。", "ok", 5200);
  }

  function crownSvg() {
    return `
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <path d="M17 67 L24 30 L43 53 L51 24 L66 53 L80 30 L82 67 Z"
          fill="#E0AB4B" stroke="#3A332B" stroke-width="4" stroke-linejoin="round"/>
        <path d="M21 67 H78 V78 H21 Z" fill="#E08A4B" stroke="#3A332B" stroke-width="4" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function appleSvg() {
    return `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M25 13 C28 7 34 6 38 9 C34 10 30 13 28 17 Z" fill="#6FA86B"/>
        <path d="M22 15 C14 10 7 16 7 26 C7 37 15 43 22 38 C27 43 40 38 41 26 C42 16 33 10 26 15 Z"
          fill="#E0AB4B" stroke="#3A332B" stroke-width="3" stroke-linejoin="round"/>
        <path d="M23 9 C24 12 24 14 24 17" stroke="#3A332B" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
  }

  function diamondSwordSvg() {
    return `
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <path d="M66 8 L82 14 L38 58 L28 48 Z" fill="#7fb7d6" stroke="#3A332B" stroke-width="4" stroke-linejoin="round"/>
        <path d="M56 18 L68 24 L32 60 L26 54 Z" fill="#c9edf7" opacity="0.8"/>
        <path d="M25 54 L42 71" stroke="#3A332B" stroke-width="8" stroke-linecap="round"/>
        <path d="M18 63 L33 48" stroke="#E08A4B" stroke-width="9" stroke-linecap="round"/>
        <path d="M13 76 L24 87 L38 73 L27 62 Z" fill="#6FA86B" stroke="#3A332B" stroke-width="4" stroke-linejoin="round"/>
      </svg>
    `;
  }
})();
