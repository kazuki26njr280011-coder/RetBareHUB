/* app.js
   RetBareHUB 完全版
   - プロフィールを見るだけでログインしない
   - ログイン欄は常に動く
   - 自分のプロフィール編集、ショップ、ガチャ、融合、称号
   - RetBareChat
   - retaru46専用ニュース/クエスト追加
   - titleコマンド保持
*/

(function () {
  "use strict";

  const RH = window.RH || {};
  const ITEMS = RH.items || [];
  const ITEM_MAP = new Map(ITEMS.map((i) => [i.id, i]));
  const TITLES = RH.titles || {};
  const SESSION_KEY = "retbarehub_session_v20";

  let currentUser = null;
  let currentPassHash = "";
  let activeEditorTab = "deco";
  let activeThreadId = null;
  let unsubThreads = null;
  let unsubMessages = null;
  let adminOpen = false;
  let adminUnlocked = sessionStorage.getItem("rh_admin_unlocked") === "1";

  const page = document.body?.dataset?.page || "index";

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    removeOldBuggySessions();
    bindGlobalEvents();
    installAdminHotkey();

    await restoreSession();
    renderMiniAccount();
    renderAccountStatus();

    renderHeroVisuals();
    await renderRecentProfiles();
    await renderTurtle();

    if (page === "profile") {
      await renderProfileEditor();
    }
    if (page === "news") {
      await initNews();
    }
    if (page === "quest") {
      await initQuest();
    }
    if (page === "chat") {
      await initChat();
    }
  }

  function removeOldBuggySessions() {
    localStorage.removeItem("retbare_mcid");
    localStorage.removeItem("retbare_login_mcid");
    localStorage.removeItem("retbare_current_mcid");
  }

  function hasDb() {
    return !!window.db && !window.RH_FIREBASE_ERROR;
  }

  function db() {
    return window.db;
  }

  function fv() {
    return firebase.firestore.FieldValue;
  }

  function serverTime() {
    return hasDb() ? fv().serverTimestamp() : new Date();
  }

  function cleanMcid(value) {
    return String(value || "")
      .trim()
      .replace(/[^A-Za-z0-9_]/g, "")
      .slice(0, 16);
  }

  function keyOf(mcid) {
    return cleanMcid(mcid).toLowerCase();
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(ts) {
    if (!ts) return "まだ日付なし";
    let d = ts;
    if (typeof ts.toDate === "function") d = ts.toDate();
    if (!(d instanceof Date)) d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "日付なし";
    return d.toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  async function sha256(text) {
    const source = new TextEncoder().encode(text);
    if (crypto?.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", source);
      return [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return `fallback-${Math.abs(hash)}`;
  }

  async function hashPassword(mcidLower, password) {
    return sha256(`RetBareHUB::${mcidLower}::${password}`);
  }

  function avatarUrl(mcid) {
    return `https://mc-heads.net/avatar/${encodeURIComponent(cleanMcid(mcid) || "Steve")}`;
  }

  function toast(message, type = "") {
    const root = document.getElementById("toastRoot");
    if (!root) return;
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  function openModal(html, extraClass = "") {
    const root = document.getElementById("modalRoot");
    if (!root) return;
    root.innerHTML = `
      <div class="modal-backdrop" data-modal-close>
        <div class="modal-card ${extraClass}" role="dialog" aria-modal="true">
          <button class="modal-close" type="button" data-modal-close>×</button>
          ${html}
        </div>
      </div>
    `;
    document.body.classList.add("is-modal-open");
  }

  function closeModal() {
    const root = document.getElementById("modalRoot");
    if (root) root.innerHTML = "";
    document.body.classList.remove("is-modal-open");
  }

  function bindGlobalEvents() {
    document.addEventListener("click", async (event) => {
      const close = event.target.closest("[data-modal-close]");
      if (close && (event.target === close || event.target.classList.contains("modal-close"))) {
        closeModal();
        return;
      }

      if (event.target.closest("[data-copy-ip]")) {
        await navigator.clipboard?.writeText(RH.serverIp || "110.67.56.168:25565");
        toast("IPをコピーしたよ", "good");
        return;
      }

      if (event.target.closest("#btnLogin")) {
        await loginAccount();
        return;
      }

      if (event.target.closest("#btnCreate")) {
        await createAccount();
        return;
      }

      if (event.target.closest("#btnLogout")) {
        logout();
        return;
      }

      if (event.target.closest("#btnOpenOwnProfile")) {
        if (!currentUser) {
          toast("先にログインしてね", "bad");
          return;
        }
        await openProfileModal(currentUser.mcId);
        return;
      }

      const viewEl = event.target.closest("[data-view-profile]");
      if (viewEl) {
        event.preventDefault();
        await openProfileModal(viewEl.dataset.viewProfile);
        return;
      }

      const addEl = event.target.closest("[data-add-profile]");
      if (addEl) {
        await addProfileToAccount(addEl.dataset.addProfile);
        return;
      }

      const tabEl = event.target.closest("[data-editor-tab]");
      if (tabEl) {
        activeEditorTab = tabEl.dataset.editorTab;
        await renderProfileEditor();
        return;
      }

      const equipEl = event.target.closest("[data-equip-item]");
      if (equipEl) {
        await equipItem(equipEl.dataset.equipItem);
        return;
      }

      const buyEl = event.target.closest("[data-buy-item]");
      if (buyEl) {
        await buyItem(buyEl.dataset.buyItem);
        return;
      }

      const gachaEl = event.target.closest("[data-gacha-roll]");
      if (gachaEl) {
        await runGacha();
        return;
      }

      const fusionEl = event.target.closest("[data-fusion]");
      if (fusionEl) {
        await runFusion();
        return;
      }

      const claimQuestEl = event.target.closest("[data-claim-quest]");
      if (claimQuestEl) {
        await claimQuest(claimQuestEl.dataset.claimQuest);
        return;
      }

      const threadEl = event.target.closest("[data-thread-id]");
      if (threadEl) {
        await selectThread(threadEl.dataset.threadId);
        return;
      }

      const turtleEl = event.target.closest("[data-claim-turtle]");
      if (turtleEl) {
        await claimTurtle(turtleEl);
        return;
      }

      const adminTitleGrant = event.target.closest("[data-admin-title-grant]");
      if (adminTitleGrant) {
        await adminGrantTitleFromGui();
        return;
      }

      const adminTitleTake = event.target.closest("[data-admin-title-take]");
      if (adminTitleTake) {
        await adminTakeTitleFromGui();
        return;
      }
    });

    document.addEventListener("submit", async (event) => {
      if (event.target.id === "profileSearchForm") {
        event.preventDefault();
        const input = document.getElementById("profileSearchInput");
        await openProfileModal(input?.value || "");
      }

      if (event.target.id === "profileSaveForm") {
        event.preventDefault();
        await saveProfile();
      }

      if (event.target.id === "newsForm") {
        event.preventDefault();
        await addNews();
      }

      if (event.target.id === "questForm") {
        event.preventDefault();
        await addQuest();
      }

      if (event.target.id === "threadForm") {
        event.preventDefault();
        await createThread();
      }

      if (event.target.id === "messageForm") {
        event.preventDefault();
        await sendMessage();
      }
    });
  }

  function getAccountInput() {
    return {
      mcid: cleanMcid(document.getElementById("accountMcid")?.value),
      password: String(document.getElementById("accountPassword")?.value || "")
    };
  }

  async function restoreSession() {
    const params = new URLSearchParams(location.search);
    if (params.has("logout")) {
      localStorage.removeItem(SESSION_KEY);
      currentUser = null;
      currentPassHash = "";
      return;
    }

    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;

    try {
      const session = JSON.parse(raw);
      const mcidLower = keyOf(session.mcid);
      if (!mcidLower || !session.passHash) return;
      const player = await getPlayer(mcidLower);
      if (!player || player.passHash !== session.passHash) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }
      currentUser = player;
      currentPassHash = session.passHash;
      await ensureStarterItemsForCurrentUser();
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  async function setSession(player, passHash) {
    currentUser = player;
    currentPassHash = passHash;
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ mcid: player.mcId, passHash, savedAt: Date.now() })
    );
    renderMiniAccount();
    renderAccountStatus();
    await afterAuthChanged();
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    currentUser = null;
    currentPassHash = "";
    renderMiniAccount();
    renderAccountStatus();
    afterAuthChanged();
    toast("ログアウトしたよ", "good");
  }

  async function loginAccount() {
    if (!hasDb()) {
      toast("Firebase設定を確認してね", "bad");
      return;
    }

    const { mcid, password } = getAccountInput();
    const mcidLower = keyOf(mcid);

    if (!mcidLower || password.length < 1) {
      toast("MCIDとパスワードを入れてね", "bad");
      return;
    }

    const player = await getPlayer(mcidLower);
    if (!player) {
      toast("まだアカウントがないよ。作成してね", "bad");
      return;
    }

    const passHash = await hashPassword(mcidLower, password);

    if (!player.passHash) {
      toast("古いデータです。アカウント作成ボタンでパスワード登録してね", "bad");
      return;
    }

    if (player.passHash !== passHash) {
      toast("パスワードが違うよ", "bad");
      return;
    }

    await setSession(player, passHash);
    toast(`${player.mcId} でログインしたよ`, "good");
  }

  async function createAccount() {
    if (!hasDb()) {
      toast("Firebase設定を確認してね", "bad");
      return;
    }

    const { mcid, password } = getAccountInput();
    const mcidLower = keyOf(mcid);

    if (mcid.length < 3) {
      toast("MCIDは3文字以上にしてね", "bad");
      return;
    }

    if (password.length < 3) {
      toast("パスワードは3文字以上にしてね", "bad");
      return;
    }

    const ref = db().collection("players").doc(mcidLower);
    const snap = await ref.get();
    const passHash = await hashPassword(mcidLower, password);

    if (snap.exists && snap.data().passHash) {
      toast("そのMCIDはもう作成済み。ログインしてね", "bad");
      return;
    }

    const base = makeBasePlayer(mcid);
    const existing = snap.exists ? snap.data() : {};
    const starter = getStarterItemsFor(mcidLower, existing.ownedItems || []);

    await ref.set(
      {
        ...base,
        ...existing,
        mcId: existing.mcId || mcid,
        mcIdLower,
        passHash,
        ownedItems: starter,
        addedProfiles: Array.from(new Set([...(existing.addedProfiles || []), mcidLower])),
        updatedAt: serverTime(),
        createdAt: existing.createdAt || serverTime()
      },
      { merge: true }
    );

    const player = await getPlayer(mcidLower);
    await setSession(player, passHash);
    toast(`${player.mcId} のアカウントを作ったよ`, "good");
  }

  function makeBasePlayer(mcid) {
    const mcidLower = keyOf(mcid);
    return {
      mcId: cleanMcid(mcid),
      mcIdLower,
      points: 50,
      bio: "よろしく！RetBareHUBでプロフィールを編集してね。",
      color: "#6FA86B",
      activeBackground: "bg_cream",
      activeFrame: "frame_leaf",
      activeParticle: "particle_leaf",
      activeEffect: "effect_confetti",
      ownedItems: getStarterItemsFor(mcidLower, []),
      titles: ["retbare_member"],
      activeTitle: "retbare_member",
      addedProfiles: [mcidLower],
      unlockedSongs: [],
      musicPath: "",
      visible: true,
      createdAt: serverTime(),
      updatedAt: serverTime()
    };
  }

  function getStarterItemsFor(mcidLower, existing) {
    const set = new Set([...(existing || []), ...(RH.starterItems || [])]);
    for (const item of ITEMS) {
      const owners = (item.initialOwners || []).map((x) => keyOf(x));
      if (owners.includes(mcidLower)) set.add(item.id);
    }
    return Array.from(set);
  }

  async function ensureStarterItemsForCurrentUser() {
    if (!currentUser || !hasDb()) return;
    const id = keyOf(currentUser.mcId);
    const starter = getStarterItemsFor(id, currentUser.ownedItems || []);
    if (starter.length !== (currentUser.ownedItems || []).length) {
      await db().collection("players").doc(id).set({ ownedItems: starter }, { merge: true });
      currentUser = await getPlayer(id);
    }
  }

  async function getPlayer(mcid) {
    if (!hasDb()) return null;
    const id = keyOf(mcid);
    if (!id) return null;
    const snap = await db().collection("players").doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  }

  async function updateCurrentUser(data) {
    if (!currentUser || !hasDb()) return;
    const id = keyOf(currentUser.mcId);
    await db().collection("players").doc(id).set({ ...data, updatedAt: serverTime() }, { merge: true });
    currentUser = await getPlayer(id);
    renderMiniAccount();
    renderAccountStatus();
  }

  function renderMiniAccount() {
    const root = document.getElementById("miniAccount");
    if (!root) return;

    if (!currentUser) {
      root.innerHTML = `<a class="btn small secondary" href="./profile.html">ログイン</a>`;
      return;
    }

    root.innerHTML = `
      <button class="mini-user" type="button" data-view-profile="${esc(currentUser.mcId)}">
        <img src="${avatarUrl(currentUser.mcId)}" alt="" />
        <span>
          <strong>${esc(currentUser.mcId)}</strong>
          <span>${Number(currentUser.points || 0)} P</span>
        </span>
      </button>
    `;
  }

  function renderAccountStatus() {
    const el = document.getElementById("accountStatus");
    if (!el) return;

    if (!currentUser) {
      el.textContent = "未ログイン。プロフィール編集・チャット投稿・ショップ購入にはログインが必要です。";
      return;
    }

    el.innerHTML = `
      ログイン中: <strong>${esc(currentUser.mcId)}</strong>
      / RetbareHubPoint: <strong>${Number(currentUser.points || 0)}P</strong>
    `;
  }

  async function afterAuthChanged() {
    await renderRecentProfiles();
    await renderTurtle();

    if (page === "profile") await renderProfileEditor();
    if (page === "news") await initNews();
    if (page === "quest") await initQuest();
    if (page === "chat") await initChat();
  }

  function renderHeroVisuals() {
    const hero = document.getElementById("heroVisual");
    if (hero) {
      const item = ITEM_MAP.get("effect_dark_magma_legend");
      hero.innerHTML = item?.svg || genericItemSvg({ palette: ["#6FA86B", "#E08A4B"], type: "effect" });
    }

    const profileHero = document.getElementById("profileHeroVisual");
    if (profileHero) {
      const item = ITEM_MAP.get("effect_muki_maid");
      profileHero.innerHTML = item?.svg || "";
    }
  }

  async function renderRecentProfiles() {
    const roots = [...document.querySelectorAll("#recentProfiles")];
    if (!roots.length) return;

    if (!hasDb()) {
      roots.forEach((root) => {
        root.innerHTML = `<div class="editor-empty">Firebase設定後にプロフィールランが表示されます。</div>`;
      });
      return;
    }

    try {
      const snap = await db()
        .collection("players")
        .orderBy("updatedAt", "desc")
        .limit(12)
        .get();

      const html = snap.docs
        .map((doc) => {
          const p = { id: doc.id, ...doc.data() };
          return `
            <div class="runner-card" data-view-profile="${esc(p.mcId || doc.id)}">
              <img src="${avatarUrl(p.mcId || doc.id)}" alt="" />
              <div>
                <strong>${esc(p.mcId || doc.id)}</strong>
                <small>${formatDate(p.updatedAt)} / ${Number(p.points || 0)}P</small>
              </div>
            </div>
          `;
        })
        .join("");

      roots.forEach((root) => {
        root.innerHTML = html || `<div class="editor-empty">まだプロフィールがありません。</div>`;
      });
    } catch {
      roots.forEach((root) => {
        root.innerHTML = `<div class="editor-empty">プロフィールランを読み込めませんでした。</div>`;
      });
    }
  }

  function canViewProfile(target) {
    if (!currentUser) return false;
    const targetId = keyOf(target.mcId || target.id);
    const meId = keyOf(currentUser.mcId);
    if (targetId === meId) return true;
    return (currentUser.addedProfiles || []).includes(targetId);
  }

  async function openProfileModal(mcid) {
    const clean = cleanMcid(mcid);

    if (!clean) {
      toast("MCIDを入れてね", "bad");
      return;
    }

    const player = await getPlayer(clean);
    if (!player) {
      openModal(`
        <div class="lock-card">
          <div class="lock-icon">?</div>
          <h2>${esc(clean)} はまだプロフィール未作成</h2>
          <p>本人がMCIDでアカウント作成すると見られるようになります。</p>
        </div>
      `);
      return;
    }

    if (!canViewProfile(player)) {
      openModal(`
        <div class="lock-card">
          <div class="lock-icon">🔒</div>
          <h2>${esc(player.mcId)} のプロフィールはロック中</h2>
          <p>
            アカウントに追加されていないため、本文やデコは見られません。<br>
            追加しても、ログインユーザーは変わりません。
          </p>
          <div class="hero-actions" style="justify-content:center">
            <button class="btn" type="button" data-add-profile="${esc(player.mcId)}">アカウントに追加して見る</button>
            <button class="btn ghost" type="button" data-modal-close>閉じる</button>
          </div>
        </div>
      `);
      return;
    }

    const own = currentUser && keyOf(currentUser.mcId) === keyOf(player.mcId);
    openModal(`
      ${profileCardHtml(player, { modal: true })}
      ${
        own
          ? `<div class="hero-actions" style="margin-top:16px">
               <a class="btn orange" href="./profile.html#editor" data-modal-close>編集画面へ</a>
             </div>`
          : ""
      }
    `);
  }

  async function addProfileToAccount(mcid) {
    if (!currentUser) {
      toast("先にログインしてね", "bad");
      return;
    }

    const id = keyOf(mcid);
    if (!id) return;

    await updateCurrentUser({
      addedProfiles: fv().arrayUnion(id)
    });

    toast(`${cleanMcid(mcid)} をアカウントに追加したよ`, "good");
    await openProfileModal(mcid);
  }

  function profileVars(player) {
    const bg = ITEM_MAP.get(player.activeBackground || "bg_cream") || ITEM_MAP.get("bg_cream");
    const frame = ITEM_MAP.get(player.activeFrame || "frame_leaf") || ITEM_MAP.get("frame_leaf");
    const b = bg?.palette || ["#fffdf7", "#faf6ec", "#e8f4df"];
    const f = frame?.palette || ["#6FA86B", "#CFE8B8"];
    const color = player.color || "#6FA86B";

    return `
      --profile-bg:
        radial-gradient(circle at 20% 10%, ${b[2] || b[1]}66, transparent 26%),
        radial-gradient(circle at 86% 22%, ${b[1] || b[0]}77, transparent 30%),
        linear-gradient(135deg, ${b[0]}, ${b[1] || b[0]}, ${b[2] || b[1] || b[0]});
      --profile-accent:${color};
      --frame-a:${f[0]};
      --frame-b:${f[1] || f[0]};
    `;
  }

  function profileCardHtml(player) {
    const effect = ITEM_MAP.get(player.activeEffect || "effect_confetti");
    return `
      <article class="profile-card" style="${profileVars(player)}">
        ${particleLayerHtml(player.activeParticle)}
        <div class="profile-head">
          <div class="avatar-wrap">
            <img src="${avatarUrl(player.mcId)}" alt="${esc(player.mcId)}" />
          </div>
          <div class="profile-name">
            <h2>${esc(player.mcId)}</h2>
            <p>${Number(player.points || 0)} RetbareHubPoint</p>
            ${titleBadgesHtml(player)}
          </div>
        </div>

        <div class="profile-bio">${esc(player.bio || "一言がまだありません。")}</div>

        <div class="effect-stage">
          ${effectSvg(effect)}
        </div>
      </article>
    `;
  }

  function titleBadgesHtml(player) {
    const ids = Array.from(new Set([player.activeTitle, ...(player.titles || [])].filter(Boolean)));
    if (!ids.length) return "";
    return `
      <div class="title-row">
        ${ids
          .map((id) => {
            const t = TITLES[id] || { name: id, color: "#6FA86B" };
            return `<span class="title-badge" style="--title-color:${esc(t.color || "#6FA86B")}">✦ ${esc(t.name)}</span>`;
          })
          .join("")}
      </div>
    `;
  }

  function particleLayerHtml(itemId) {
    const item = ITEM_MAP.get(itemId || "particle_leaf") || ITEM_MAP.get("particle_leaf");
    const colors = item?.palette || ["#6FA86B", "#CFE8B8"];
    let html = `<div class="profile-particles">`;

    for (let i = 0; i < 22; i++) {
      const x = 4 + ((i * 37) % 92);
      const y = 4 + ((i * 53) % 88);
      const s = 10 + ((i * 7) % 20);
      const c = colors[i % colors.length];
      const d = 2.4 + (i % 5) * 0.45;
      const delay = -((i % 8) * 0.25);
      html += `
        <span class="p" style="--x:${x}%;--y:${y}%;--s:${s}px;--c:${c};--d:${d}s;--delay:${delay}s">
          ${particleShapeSvg(item?.shape || "dot")}
        </span>
      `;
    }

    html += `</div>`;
    return html;
  }

  function particleShapeSvg(shape) {
    const fill = "currentColor";
    const map = {
      star: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M12 1.8l2.7 6.4 6.9.6-5.2 4.5 1.6 6.7-6-3.5-5.9 3.5 1.6-6.7-5.2-4.5 6.9-.6z"/></svg>`,
      heart: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M12 21s-8-4.8-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6.2-8 11-8 11z"/></svg>`,
      leaf: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M20 3C11 3 5 8 5 15c0 3 2 5 5 5 7 0 10-8 10-17z"/><path d="M7 17c4-4 7-6 11-9" stroke="#fff" stroke-opacity=".55" stroke-width="2"/></svg>`,
      drop: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M12 2s7 8 7 13a7 7 0 11-14 0c0-5 7-13 7-13z"/></svg>`,
      flame: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M13 2c1 5-4 6-4 11 0 2 1 4 3 5-1-4 4-5 3-10 3 2 5 5 5 8a8 8 0 11-16 0c0-6 6-8 9-14z"/></svg>`,
      crown: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M3 18h18l-2-11-5 5-2-7-2 7-5-5z"/></svg>`,
      slash: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M20 2L4 14l7 1-4 7 14-13-7-1z"/></svg>`,
      diamond: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M12 2l9 7-9 13L3 9z"/></svg>`,
      square: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="${fill}"/></svg>`,
      moon: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M16 2a9 9 0 106 14A8 8 0 0116 2z"/></svg>`,
      sun: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="${fill}"/><path stroke="${fill}" stroke-width="2" d="M12 1v4M12 19v4M1 12h4M19 12h4M4 4l3 3M17 17l3 3M20 4l-3 3M7 17l-3 3"/></svg>`,
      apple: `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M12 7c4-4 9 0 7 7-1 5-4 7-7 5-3 2-6 0-7-5-2-7 3-11 7-7z"/><path d="M12 7c0-3 2-5 5-5" stroke="${fill}" stroke-width="2" fill="none"/></svg>`
    };
    return map[shape] || `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${fill}"/></svg>`;
  }

  function effectSvg(item) {
    if (!item) return genericItemSvg({ type: "effect", palette: ["#6FA86B", "#E08A4B"] });
    if (item.svg) return item.svg;
    return genericItemSvg(item);
  }

  function genericItemSvg(item) {
    const p = item.palette || ["#6FA86B", "#E08A4B", "#FFFDF7"];
    const type = item.type || "effect";
    const shape = item.shape || "orb";
    const id = `g${Math.random().toString(36).slice(2)}`;

    if (type === "background") {
      return `
        <svg class="svg-preview-generic" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${id}" x1="0%" x2="100%">
              <stop offset="0%" stop-color="${p[0]}"/>
              <stop offset="55%" stop-color="${p[1] || p[0]}"/>
              <stop offset="100%" stop-color="${p[2] || p[1] || p[0]}"/>
            </linearGradient>
          </defs>
          <rect width="400" height="260" rx="28" fill="url(#${id})"/>
          <circle cx="80" cy="70" r="38" fill="#fff" opacity=".35"/>
          <circle cx="330" cy="70" r="58" fill="#fff" opacity=".2"/>
          <path d="M0 220 Q120 155 230 210 T400 200 V260 H0Z" fill="#fff" opacity=".38"/>
        </svg>
      `;
    }

    if (type === "frame") {
      return `
        <svg class="svg-preview-generic" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="220" rx="28" fill="#fff" opacity=".32"/>
          <rect x="82" y="42" width="136" height="136" rx="38" fill="${p[0]}"/>
          <rect x="95" y="55" width="110" height="110" rx="30" fill="#fffdf7"/>
          <rect x="108" y="68" width="84" height="84" rx="24" fill="${p[1] || p[0]}" opacity=".65"/>
          <circle cx="92" cy="52" r="14" fill="${p[1] || p[0]}"/>
          <circle cx="208" cy="168" r="18" fill="${p[0]}"/>
        </svg>
      `;
    }

    if (type === "particle") {
      let bits = "";
      for (let i = 0; i < 18; i++) {
        const x = 30 + ((i * 47) % 340);
        const y = 25 + ((i * 31) % 210);
        const c = p[i % p.length];
        bits += `<circle cx="${x}" cy="${y}" r="${5 + (i % 5)}" fill="${c}" opacity=".8"/>`;
      }
      return `<svg class="svg-preview-generic" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="260" rx="28" fill="#fff" opacity=".2"/>${bits}<text x="200" y="138" text-anchor="middle" font-size="26" font-weight="900" fill="${p[0]}" font-family="sans-serif">${esc(shape)}</text></svg>`;
    }

    return `
      <svg class="svg-preview-generic" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="${id}" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stop-color="#fff"/>
            <stop offset="45%" stop-color="${p[0]}"/>
            <stop offset="100%" stop-color="${p[1] || p[0]}" stop-opacity=".15"/>
          </radialGradient>
        </defs>
        <rect width="400" height="260" rx="28" fill="#fff" opacity=".15"/>
        <ellipse cx="200" cy="130" rx="120" ry="75" fill="url(#${id})"/>
        <circle cx="160" cy="115" r="28" fill="${p[0]}" opacity=".85"/>
        <circle cx="240" cy="150" r="38" fill="${p[1] || p[0]}" opacity=".8"/>
        <path d="M105 190 Q200 90 295 190" fill="none" stroke="${p[0]}" stroke-width="12" stroke-linecap="round" opacity=".75"/>
      </svg>
    `;
  }

  async function renderProfileEditor() {
    const root = document.getElementById("profileEditor");
    if (!root) return;

    if (!currentUser) {
      root.innerHTML = `<div class="editor-empty"><h3>ログインすると編集できます</h3><p>MCIDとパスワードでログインまたはアカウント作成してね。</p></div>`;
      return;
    }

    const tabs = [
      ["deco", "デコ"],
      ["shop", "ショップ"],
      ["gacha", "ガチャ"],
      ["titles", "称号"],
      ["friends", "追加済み"]
    ];

    root.innerHTML = `
      <div class="profile-editor">
        <div class="profile-preview-grid">
          ${profileCardHtml(currentUser)}
          <form id="profileSaveForm" class="form">
            <h3>基本設定</h3>
            <label>
              一言
              <textarea id="editBio" class="textarea" maxlength="240">${esc(currentUser.bio || "")}</textarea>
            </label>
            <label>
              テーマ色
              <input id="editColor" class="input" type="color" value="${esc(currentUser.color || "#6FA86B")}" />
            </label>
            <label>
              アクティブ称号
              <select id="editActiveTitle" class="select">
                ${(currentUser.titles || [])
                  .map((id) => {
                    const t = TITLES[id] || { name: id };
                    return `<option value="${esc(id)}" ${currentUser.activeTitle === id ? "selected" : ""}>${esc(t.name)}</option>`;
                  })
                  .join("")}
              </select>
            </label>
            <button class="btn" type="submit">保存</button>
            <button class="btn ghost" type="button" data-view-profile="${esc(currentUser.mcId)}">自分のプロフィールを画面中央で見る</button>
          </form>
        </div>

        <div class="editor-tabs">
          ${tabs
            .map(
              ([id, label]) =>
                `<button type="button" class="tab-pill ${activeEditorTab === id ? "active" : ""}" data-editor-tab="${id}">${label}</button>`
            )
            .join("")}
        </div>

        <div id="editorTabBody">
          ${editorTabHtml(activeEditorTab)}
        </div>
      </div>
    `;
  }

  function editorTabHtml(tab) {
    if (!currentUser) return "";

    if (tab === "shop") return shopHtml();
    if (tab === "gacha") return gachaHtml();
    if (tab === "titles") return titlesHtml();
    if (tab === "friends") return friendsHtml();
    return decoHtml();
  }

  function decoHtml() {
    const owned = new Set(currentUser.ownedItems || []);
    const ownedItems = ITEMS.filter((item) => owned.has(item.id));

    const groups = [
      ["background", "背景"],
      ["frame", "アイコンフレーム"],
      ["particle", "パーティクル"],
      ["effect", "演出"]
    ];

    return groups
      .map((group) => {
        const list = ownedItems.filter((item) => item.type === group[0]);
        return `
          <section class="panel" style="margin-top:0;margin-bottom:18px">
            <div class="panel-title"><div><h2>${group[1]}</h2><p>所持アイテムから装備</p></div></div>
            <div class="inventory-grid">
              ${list.map((item) => itemCardHtml(item, "equip")).join("") || `<div class="editor-empty">まだ所持していません。</div>`}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function shopHtml() {
    const owned = new Set(currentUser.ownedItems || []);
    const buyable = ITEMS.filter((item) => item.shop && !owned.has(item.id));
    return `
      <div class="panel" style="margin-top:0">
        <div class="panel-title">
          <div>
            <h2>Shop</h2>
            <p>未所持アイテムだけ表示。背景だけじゃなくパーティクル・フレーム・演出も大量追加。</p>
          </div>
          <span class="points-pill">${Number(currentUser.points || 0)}P</span>
        </div>
        <div class="shop-grid">
          ${buyable.map((item) => itemCardHtml(item, "buy")).join("") || `<div class="editor-empty">買えるアイテムは全部持っています。</div>`}
        </div>
      </div>
    `;
  }

  function gachaHtml() {
    const owned = new Set(currentUser.ownedItems || []);
    const hasA = owned.has("effect_dark_penguin");
    const hasB = owned.has("effect_blaze_surfer");
    const hasLegend = owned.has("effect_dark_magma_legend");

    return `
      <div class="grid-2">
        <section class="gacha-machine">
          <div class="gacha-title">にゃんこ風 Retbareガチャ</div>
          <p>35Pで1回。SSの「闇のペンギン」「炎走サーファー」を引くと融合できます。</p>
          <div class="gacha-cat">${gachaCatSvg()}</div>
          <button class="btn orange" type="button" data-gacha-roll>35Pで回す</button>
        </section>

        <section class="fusion-box">
          <h2>伝説レア融合</h2>
          <p>必要: 闇のペンギン + 炎走サーファー</p>
          <p>闇のペンギン: <strong>${hasA ? "所持" : "未所持"}</strong></p>
          <p>炎走サーファー: <strong>${hasB ? "所持" : "未所持"}</strong></p>
          <p>伝説レア: <strong>${hasLegend ? "入手済み" : "未入手"}</strong></p>
          <button class="btn dark" type="button" data-fusion ${hasA && hasB && !hasLegend ? "" : "disabled"}>融合する</button>
          <div class="effect-stage small" style="margin-top:14px">${effectSvg(ITEM_MAP.get("effect_dark_magma_legend"))}</div>
        </section>
      </div>
    `;
  }

  function titlesHtml() {
    return `
      <div class="panel" style="margin-top:0">
        <div class="panel-title">
          <div><h2>称号</h2><p>title要素は保持。Admin / UHC KING / PVP crown / Sword God も消していません。</p></div>
        </div>
        <div class="inventory-grid">
          ${(currentUser.titles || [])
            .map((id) => {
              const t = TITLES[id] || { name: id, color: "#6FA86B", desc: "" };
              return `
                <div class="item-card">
                  <div class="item-art" style="--item-a:${esc(t.color)};--item-b:#fff">
                    <svg viewBox="0 0 300 180"><rect width="300" height="180" rx="26" fill="${esc(t.color)}" opacity=".88"/><text x="150" y="100" text-anchor="middle" font-size="28" font-weight="900" fill="#fff">${esc(t.name)}</text></svg>
                  </div>
                  <div class="item-body">
                    <div class="item-title">${esc(t.name)}</div>
                    <div class="item-desc">${esc(t.desc || "")}</div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function friendsHtml() {
    const list = currentUser.addedProfiles || [];
    return `
      <div class="panel" style="margin-top:0">
        <div class="panel-title">
          <div><h2>アカウントに追加済み</h2><p>ここに入っている人だけプロフィール本文を見られます。</p></div>
        </div>
        <div class="runner-list">
          ${list
            .map(
              (id) => `
            <div class="runner-card" data-view-profile="${esc(id)}">
              <img src="${avatarUrl(id)}" alt="">
              <div><strong>${esc(id)}</strong><small>クリックして見る</small></div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function itemCardHtml(item, mode) {
    const colors = item.palette || ["#6FA86B", "#E08A4B"];
    const rarityClass = `rarity-${String(item.rarity || "N").toLowerCase()}`;
    const active =
      currentUser?.activeBackground === item.id ||
      currentUser?.activeFrame === item.id ||
      currentUser?.activeParticle === item.id ||
      currentUser?.activeEffect === item.id;

    return `
      <article class="item-card">
        <div class="item-art" style="--item-a:${esc(colors[0])};--item-b:${esc(colors[1] || colors[0])}">
          ${effectSvg(item)}
        </div>
        <div class="item-body">
          <span class="rarity ${rarityClass}">${esc(item.rarity || "N")}</span>
          <div class="item-title">${esc(item.name)}</div>
          <div class="item-desc">${esc(item.desc || "")}</div>
          ${
            mode === "buy"
              ? `<button class="btn small" type="button" data-buy-item="${esc(item.id)}">${Number(item.price || 0)}Pで買う</button>`
              : `<button class="btn small ${active ? "secondary" : ""}" type="button" data-equip-item="${esc(item.id)}">${active ? "装備中" : "装備する"}</button>`
          }
        </div>
      </article>
    `;
  }

  async function saveProfile() {
    if (!currentUser) return;

    const bio = document.getElementById("editBio")?.value || "";
    const color = document.getElementById("editColor")?.value || "#6FA86B";
    const activeTitle = document.getElementById("editActiveTitle")?.value || currentUser.activeTitle || "";

    await updateCurrentUser({
      bio: bio.slice(0, 240),
      color,
      activeTitle
    });

    toast("プロフィールを保存したよ", "good");
    await renderProfileEditor();
    await renderRecentProfiles();
  }

  async function equipItem(itemId) {
    if (!currentUser) return;
    const item = ITEM_MAP.get(itemId);
    if (!item) return;

    if (!(currentUser.ownedItems || []).includes(itemId)) {
      toast("そのアイテムは未所持です", "bad");
      return;
    }

    const fieldByType = {
      background: "activeBackground",
      frame: "activeFrame",
      particle: "activeParticle",
      effect: "activeEffect"
    };

    const field = fieldByType[item.type];
    if (!field) return;

    await updateCurrentUser({ [field]: itemId });
    toast(`${item.name} を装備したよ`, "good");
    await renderProfileEditor();
  }

  async function buyItem(itemId) {
    if (!currentUser) return;
    const item = ITEM_MAP.get(itemId);
    if (!item || !item.shop) return;

    const price = Number(item.price || 0);
    const points = Number(currentUser.points || 0);

    if (points < price) {
      toast("ポイントが足りません", "bad");
      return;
    }

    await db()
      .collection("players")
      .doc(keyOf(currentUser.mcId))
      .update({
        points: points - price,
        ownedItems: fv().arrayUnion(itemId),
        updatedAt: serverTime()
      });

    currentUser = await getPlayer(currentUser.mcId);
    toast(`${item.name} を購入したよ`, "good");
    await renderProfileEditor();
    renderMiniAccount();
    renderAccountStatus();
  }

  function weightedGachaPool() {
    const owned = new Set(currentUser.ownedItems || []);
    const weights = { N: 45, R: 30, SR: 18, SSR: 8, SS: 3, LEGEND: 0 };
    const pool = [];

    for (const item of ITEMS) {
      if (!item.gacha || item.fusionOnly || owned.has(item.id)) continue;
      const w = weights[item.rarity] ?? 10;
      for (let i = 0; i < w; i++) pool.push(item);
    }

    return pool;
  }

  async function runGacha() {
    if (!currentUser) {
      toast("先にログインしてね", "bad");
      return;
    }

    const cost = 35;
    if (Number(currentUser.points || 0) < cost) {
      toast("35P必要です", "bad");
      return;
    }

    const pool = weightedGachaPool();
    if (!pool.length) {
      toast("ガチャ対象を全部持っています", "good");
      return;
    }

    const item = pool[Math.floor(Math.random() * pool.length)];

    await db()
      .collection("players")
      .doc(keyOf(currentUser.mcId))
      .update({
        points: Number(currentUser.points || 0) - cost,
        ownedItems: fv().arrayUnion(item.id),
        updatedAt: serverTime()
      });

    currentUser = await getPlayer(currentUser.mcId);

    openModal(`
      <div class="gacha-result">
        <h2>ガチャ結果！</h2>
        <div class="item-art" style="--item-a:${esc(item.palette?.[0] || "#6FA86B")};--item-b:${esc(item.palette?.[1] || "#E08A4B")}">
          ${effectSvg(item)}
        </div>
        <span class="rarity rarity-${String(item.rarity).toLowerCase()}">${esc(item.rarity)}</span>
        <h2>${esc(item.name)}</h2>
        <p>${esc(item.desc || "")}</p>
        <button class="btn" type="button" data-modal-close>OK</button>
      </div>
    `);

    await renderProfileEditor();
    renderMiniAccount();
    renderAccountStatus();
  }

  async function runFusion() {
    if (!currentUser) return;

    const owned = new Set(currentUser.ownedItems || []);
    if (!owned.has("effect_dark_penguin") || !owned.has("effect_blaze_surfer")) {
      toast("素材が足りません", "bad");
      return;
    }

    if (owned.has("effect_dark_magma_legend")) {
      toast("もう持っています", "good");
      return;
    }

    await db()
      .collection("players")
      .doc(keyOf(currentUser.mcId))
      .update({
        ownedItems: fv().arrayUnion("effect_dark_magma_legend"),
        activeEffect: "effect_dark_magma_legend",
        updatedAt: serverTime()
      });

    currentUser = await getPlayer(currentUser.mcId);
    const item = ITEM_MAP.get("effect_dark_magma_legend");

    openModal(`
      <div class="gacha-result">
        <h2>融合成功！伝説レア入手！</h2>
        <div class="item-art" style="--item-a:#FF2200;--item-b:#6600CC">${effectSvg(item)}</div>
        <h2>${esc(item.name)}</h2>
        <button class="btn" type="button" data-modal-close>OK</button>
      </div>
    `);

    await renderProfileEditor();
  }

  function gachaCatSvg() {
    return `
      <svg viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @keyframes roll{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
            .cap{animation:roll .6s infinite ease-in-out;transform-origin:110px 95px}
          </style>
        </defs>
        <rect x="40" y="30" width="140" height="110" rx="28" fill="#fff"/>
        <polygon points="60,36 78,10 95,38" fill="#fff"/>
        <polygon points="160,36 142,10 125,38" fill="#fff"/>
        <circle cx="85" cy="78" r="10" fill="#111"/>
        <circle cx="135" cy="78" r="10" fill="#111"/>
        <path d="M100 102 Q110 112 120 102" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/>
        <g class="cap">
          <circle cx="110" cy="125" r="34" fill="#ffbe0b"/>
          <path d="M76 125h68" stroke="#111" stroke-width="5"/>
          <circle cx="110" cy="125" r="8" fill="#fff"/>
        </g>
      </svg>
    `;
  }

  async function initNews() {
    const adminPanel = document.getElementById("newsAdminPanel");
    if (adminPanel) adminPanel.hidden = !isRetaru();

    const list = document.getElementById("newsList");
    if (!list) return;

    if (!hasDb()) {
      list.innerHTML = (RH.seedNews || []).map(newsCardHtml).join("");
      return;
    }

    try {
      const snap = await db().collection("news").orderBy("createdAt", "desc").limit(30).get();
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.innerHTML = arr.map(newsCardHtml).join("") || `<div class="editor-empty">ニュースはまだありません。</div>`;
    } catch {
      list.innerHTML = `<div class="editor-empty">ニュースを読み込めませんでした。</div>`;
    }
  }

  function newsCardHtml(n) {
    return `
      <article class="news-card">
        <div class="news-meta">
          <span class="tag">${esc(n.tag || "NEWS")}</span>
          <span class="tag">${formatDate(n.createdAt)}</span>
        </div>
        <h3>${esc(n.title || "No title")}</h3>
        <p>${esc(n.body || "")}</p>
      </article>
    `;
  }

  async function addNews() {
    if (!isRetaru()) {
      toast("ニュース追加はretaru46専用です", "bad");
      return;
    }

    const title = document.getElementById("newsTitle")?.value.trim();
    const tag = document.getElementById("newsTag")?.value.trim() || "NEWS";
    const body = document.getElementById("newsBody")?.value.trim();

    if (!title || !body) {
      toast("タイトルと本文を入れてね", "bad");
      return;
    }

    await db().collection("news").add({
      title,
      tag,
      body,
      author: currentUser.mcId,
      createdAt: serverTime(),
      updatedAt: serverTime()
    });

    document.getElementById("newsForm")?.reset();
    toast("ニュースを追加したよ", "good");
    await initNews();
  }

  async function initQuest() {
    const adminPanel = document.getElementById("questAdminPanel");
    if (adminPanel) adminPanel.hidden = !isRetaru();

    const list = document.getElementById("questList");
    if (!list) return;

    if (!hasDb()) {
      list.innerHTML = (RH.seedQuests || []).map(questCardHtml).join("");
      return;
    }

    try {
      const snap = await db().collection("quests").orderBy("createdAt", "desc").limit(40).get();
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.innerHTML = arr.map(questCardHtml).join("") || `<div class="editor-empty">クエストはまだありません。</div>`;
    } catch {
      list.innerHTML = `<div class="editor-empty">クエストを読み込めませんでした。</div>`;
    }
  }

  function questCardHtml(q) {
    const done = currentUser && (currentUser.claimedQuests || []).includes(q.id);
    return `
      <article class="quest-card">
        <div class="quest-meta">
          <span class="tag">報酬 ${Number(q.reward || 0)}P</span>
          <span class="tag">${formatDate(q.createdAt)}</span>
        </div>
        <h3>${esc(q.title || "Quest")}</h3>
        <p>${esc(q.body || "")}</p>
        <button class="btn small" type="button" data-claim-quest="${esc(q.id)}" ${done ? "disabled" : ""}>${done ? "受け取り済み" : "報酬を受け取る"}</button>
      </article>
    `;
  }

  async function addQuest() {
    if (!isRetaru()) {
      toast("クエスト追加はretaru46専用です", "bad");
      return;
    }

    const title = document.getElementById("questTitle")?.value.trim();
    const reward = Number(document.getElementById("questReward")?.value || 0);
    const body = document.getElementById("questBody")?.value.trim();

    if (!title || !body) {
      toast("クエスト名と説明を入れてね", "bad");
      return;
    }

    await db().collection("quests").add({
      title,
      body,
      reward,
      author: currentUser.mcId,
      createdAt: serverTime(),
      updatedAt: serverTime()
    });

    document.getElementById("questForm")?.reset();
    toast("クエストを追加したよ", "good");
    await initQuest();
  }

  async function claimQuest(questId) {
    if (!currentUser) {
      toast("先にログインしてね", "bad");
      return;
    }

    const qSnap = await db().collection("quests").doc(questId).get();
    if (!qSnap.exists) return;
    const q = qSnap.data();

    if ((currentUser.claimedQuests || []).includes(questId)) {
      toast("もう受け取り済みです", "bad");
      return;
    }

    await db()
      .collection("players")
      .doc(keyOf(currentUser.mcId))
      .update({
        points: Number(currentUser.points || 0) + Number(q.reward || 0),
        claimedQuests: fv().arrayUnion(questId),
        updatedAt: serverTime()
      });

    currentUser = await getPlayer(currentUser.mcId);
    toast(`${Number(q.reward || 0)}P 受け取ったよ`, "good");
    renderMiniAccount();
    renderAccountStatus();
    await initQuest();
  }

  function isRetaru() {
    return currentUser && keyOf(currentUser.mcId) === "retaru46";
  }

  async function initChat() {
    if (!hasDb()) return;

    if (unsubThreads) unsubThreads();

    unsubThreads = db()
      .collection("chatThreads")
      .orderBy("updatedAt", "desc")
      .limit(30)
      .onSnapshot((snap) => {
        const root = document.getElementById("threadList");
        if (!root) return;
        const html = snap.docs
          .map((doc) => {
            const t = { id: doc.id, ...doc.data() };
            return `
              <article class="thread-card ${activeThreadId === t.id ? "active" : ""}" data-thread-id="${esc(t.id)}">
                <h3>${esc(t.title || "No title")}</h3>
                <p>${esc((t.body || "").slice(0, 80))}</p>
                <small>${esc(t.author || "")} / ${formatDate(t.updatedAt)}</small>
              </article>
            `;
          })
          .join("");
        root.innerHTML = html || `<div class="editor-empty">まだスレッドがありません。</div>`;
      });
  }

  async function createThread() {
    if (!currentUser) {
      toast("先にログインしてね", "bad");
      return;
    }

    const title = document.getElementById("threadTitle")?.value.trim();
    const body = document.getElementById("threadBody")?.value.trim();

    if (!title || !body) {
      toast("タイトルと本文を入れてね", "bad");
      return;
    }

    const ref = await db().collection("chatThreads").add({
      title,
      body,
      author: currentUser.mcId,
      createdAt: serverTime(),
      updatedAt: serverTime()
    });

    await ref.collection("messages").add({
      body,
      author: currentUser.mcId,
      authorLower: keyOf(currentUser.mcId),
      createdAt: serverTime()
    });

    document.getElementById("threadForm")?.reset();
    toast("スレッドを立てたよ", "good");
    await selectThread(ref.id);
  }

  async function selectThread(threadId) {
    activeThreadId = threadId;

    const snap = await db().collection("chatThreads").doc(threadId).get();
    if (snap.exists) {
      const t = snap.data();
      const title = document.getElementById("activeThreadTitle");
      const meta = document.getElementById("activeThreadMeta");
      if (title) title.textContent = t.title || "Thread";
      if (meta) meta.textContent = `${t.author || ""} / ${formatDate(t.createdAt)}`;
    }

    if (unsubMessages) unsubMessages();

    unsubMessages = db()
      .collection("chatThreads")
      .doc(threadId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .limit(200)
      .onSnapshot((snap2) => {
        const root = document.getElementById("messages");
        if (!root) return;
        root.innerHTML = snap2.docs
          .map((d) => {
            const m = d.data();
            const mine = currentUser && keyOf(currentUser.mcId) === keyOf(m.author);
            return `
              <div class="message ${mine ? "mine" : ""}">
                <strong>${esc(m.author || "unknown")}</strong>
                <p>${esc(m.body || "")}</p>
              </div>
            `;
          })
          .join("");
        root.scrollTop = root.scrollHeight;
      });

    await initChat();
  }

  async function sendMessage() {
    if (!currentUser) {
      toast("先にログインしてね", "bad");
      return;
    }

    if (!activeThreadId) {
      toast("スレッドを選んでね", "bad");
      return;
    }

    const input = document.getElementById("messageInput");
    const body = input?.value.trim();
    if (!body) return;

    const ref = db().collection("chatThreads").doc(activeThreadId);

    await ref.collection("messages").add({
      body,
      author: currentUser.mcId,
      authorLower: keyOf(currentUser.mcId),
      createdAt: serverTime()
    });

    await ref.update({
      updatedAt: serverTime(),
      lastMessage: body.slice(0, 80)
    });

    input.value = "";
  }

  function installAdminHotkey() {
    const pressed = new Set();

    window.addEventListener("keydown", (event) => {
      pressed.add(event.key.toLowerCase());
      if (pressed.has("c") && pressed.has("v") && pressed.has("b")) {
        openAdminConsole();
      }
    });

    window.addEventListener("keyup", (event) => {
      pressed.delete(event.key.toLowerCase());
    });
  }

  function openAdminConsole() {
    if (adminOpen) return;
    adminOpen = true;

    const el = document.createElement("div");
    el.className = "admin-console";
    el.id = "adminConsole";
    el.innerHTML = `
      <div class="admin-head">
        <span>RetBareHUB Admin Console</span>
        <button class="btn small danger" type="button" id="adminClose">×</button>
      </div>
      <div class="admin-output" id="adminOutput"></div>
      <form class="admin-input" id="adminForm">
        <input id="adminInput" autocomplete="off" placeholder="${adminUnlocked ? "command" : "password"}" />
        <button type="submit">RUN</button>
      </form>
    `;
    document.body.appendChild(el);

    document.getElementById("adminClose").addEventListener("click", () => {
      el.remove();
      adminOpen = false;
    });

    document.getElementById("adminForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = document.getElementById("adminInput");
      const value = input.value.trim();
      input.value = "";

      if (!adminUnlocked) {
        if (value === "12345") {
          adminUnlocked = true;
          sessionStorage.setItem("rh_admin_unlocked", "1");
          adminPrint("ACCESS GRANTED");
          adminPrint("help / seed init / money add User 100 / came normal / title gui");
          input.placeholder = "command";
        } else {
          adminPrint("ACCESS DENIED");
        }
        return;
      }

      await runAdminCommand(value);
    });

    adminPrint(adminUnlocked ? "READY. type help" : "PASSWORD REQUIRED");
  }

  function adminPrint(text) {
    const out = document.getElementById("adminOutput");
    if (!out) return;
    out.textContent += `> ${text}\n`;
    out.scrollTop = out.scrollHeight;
  }

  async function runAdminCommand(command) {
    const parts = command.trim().split(/\s+/);
    const base = parts[0]?.toLowerCase();

    if (!command) return;

    if (base === "help") {
      adminPrint(
        [
          "seed init",
          "money add [User|me] [amount]",
          "money take [User|me] [amount]",
          "came [normal/gold/diamond/god]",
          "title gui",
          "title grant [MCID] [titleId]",
          "title take [MCID] [titleId]",
          "item grant [MCID] [itemId]"
        ].join("\n")
      );
      return;
    }

    if (base === "seed" && parts[1] === "init") {
      await seedInit();
      return;
    }

    if (base === "money") {
      await adminMoney(parts);
      return;
    }

    if (base === "came") {
      await adminCame(parts[1] || "normal");
      return;
    }

    if (base === "title" && parts[1] === "gui") {
      openTitleGui();
      adminPrint("title gui opened");
      return;
    }

    if (base === "title" && parts[1] === "grant") {
      await grantTitle(parts[2], parts[3]);
      return;
    }

    if (base === "title" && parts[1] === "take") {
      await takeTitle(parts[2], parts[3]);
      return;
    }

    if (base === "item" && parts[1] === "grant") {
      await grantItem(parts[2], parts[3]);
      return;
    }

    adminPrint("unknown command");
  }

  async function seedInit() {
    if (!hasDb()) {
      adminPrint("Firebase not ready");
      return;
    }

    const seedPasswords = {
      retaru46: "12345",
      mukisukino: "12345",
      "4y44": "12345",
      "386ede": "12345",
      consumedpoppy16: "1234"
    };

    const players = [
      {
        mcId: "Retaru46",
        points: 999,
        bio: "RetBareHUB Admin。サーバー管理とニュース追加ができます。",
        titles: ["admin", "retbare_member"],
        activeTitle: "admin",
        addedProfiles: ["retaru46", "mukisukino", "4y44", "386ede", "consumedpoppy16"],
        activeEffect: "effect_retbare_light",
        activeFrame: "frame_retbare",
        activeParticle: "particle_retbare",
        activeBackground: "bg_cyber"
      },
      {
        mcId: "Mukisukino",
        points: 250,
        bio: "UHC KING。むきメイド所持。",
        titles: ["uhc_king", "retbare_member"],
        activeTitle: "uhc_king",
        activeEffect: "effect_muki_maid",
        activeFrame: "frame_sakura",
        activeParticle: "particle_meido",
        activeBackground: "bg_meido"
      },
      {
        mcId: "4y44",
        points: 180,
        bio: "PVP crown。お豆腐メンタルなんです・・",
        titles: ["pvp_crown", "retbare_member"],
        activeTitle: "pvp_crown",
        activeEffect: "effect_tofu_mental",
        activeFrame: "frame_nether",
        activeParticle: "particle_pvp",
        activeBackground: "bg_pvp"
      },
      {
        mcId: "386ede",
        points: 300,
        bio: "Sword God。最高SS初期所持。",
        titles: ["sword_god", "retbare_member"],
        activeTitle: "sword_god",
        activeEffect: "effect_386ede_supreme_ss",
        activeFrame: "frame_dragon",
        activeParticle: "particle_dragon",
        activeBackground: "bg_legend"
      },
      {
        mcId: "ConsumedPoppy16",
        points: 80,
        bio: "ConsumedPoppy16。alternate password test.",
        titles: ["retbare_member"],
        activeTitle: "retbare_member",
        activeEffect: "effect_confetti",
        activeFrame: "frame_leaf",
        activeParticle: "particle_leaf",
        activeBackground: "bg_cream"
      }
    ];

    const batch = db().batch();

    batch.set(
      db().collection("config").doc("meta"),
      {
        serverIp: RH.serverIp || "110.67.56.168:25565",
        version: RH.version,
        updatedAt: serverTime()
      },
      { merge: true }
    );

    batch.set(
      db().collection("config").doc("titles"),
      {
        titles: TITLES,
        updatedAt: serverTime()
      },
      { merge: true }
    );

    for (const p of players) {
      const id = keyOf(p.mcId);
      const passHash = await hashPassword(id, seedPasswords[id] || "12345");
      const ownedItems = getStarterItemsFor(id, p.ownedItems || []);
      const ref = db().collection("players").doc(id);

      batch.set(
        ref,
        {
          ...makeBasePlayer(p.mcId),
          ...p,
          mcIdLower: id,
          passHash,
          ownedItems,
          addedProfiles: Array.from(new Set([id, ...(p.addedProfiles || [])])),
          updatedAt: serverTime(),
          createdAt: serverTime()
        },
        { merge: true }
      );
    }

    for (const n of RH.seedNews || []) {
      batch.set(
        db().collection("news").doc(n.id),
        {
          ...n,
          author: "Retaru46",
          createdAt: serverTime(),
          updatedAt: serverTime()
        },
        { merge: true }
      );
    }

    for (const q of RH.seedQuests || []) {
      batch.set(
        db().collection("quests").doc(q.id),
        {
          ...q,
          author: "Retaru46",
          createdAt: serverTime(),
          updatedAt: serverTime()
        },
        { merge: true }
      );
    }

    await batch.commit();
    adminPrint("seed init complete");
    toast("seed init 完了", "good");

    if (currentUser) currentUser = await getPlayer(currentUser.mcId);
    await afterAuthChanged();
  }

  async function adminMoney(parts) {
    const action = parts[1];
    let target = parts[2];
    const amount = Number(parts[3] || 0);

    if (target === "me") target = currentUser?.mcId;
    if (!target || !amount) {
      adminPrint("usage: money add User 100");
      return;
    }

    const p = await getPlayer(target);
    if (!p) {
      adminPrint("player not found");
      return;
    }

    const next = action === "take" ? Number(p.points || 0) - amount : Number(p.points || 0) + amount;
    await db().collection("players").doc(keyOf(target)).update({ points: next, updatedAt: serverTime() });
    adminPrint(`${p.mcId} points = ${next}`);

    if (currentUser && keyOf(currentUser.mcId) === keyOf(target)) {
      currentUser = await getPlayer(target);
      renderMiniAccount();
      renderAccountStatus();
      await renderProfileEditor();
    }
  }

  async function adminCame(type) {
    const data = turtleConfig(type);
    await db()
      .collection("config")
      .doc("turtles")
      .set(
        {
          active: {
            type: data.type,
            points: data.points,
            limit: data.limit,
            claimedBy: [],
            createdAt: Date.now()
          }
        },
        { merge: true }
      );
    adminPrint(`came ${data.type} spawned`);
    await renderTurtle();
  }

  function turtleConfig(type) {
    const map = {
      normal: { type: "normal", points: 5, limit: 10 },
      gold: { type: "gold", points: 10, limit: 10 },
      diamond: { type: "diamond", points: 50, limit: 1 },
      god: { type: "god", points: 60, limit: 10 }
    };
    return map[type] || map.normal;
  }

  async function renderTurtle() {
    const root = document.getElementById("turtleRoot");
    if (!root || !hasDb()) return;

    try {
      const snap = await db().collection("config").doc("turtles").get();
      const active = snap.data()?.active;
      if (!active) {
        root.innerHTML = "";
        return;
      }

      if (active.type === "god" && Date.now() - Number(active.createdAt || 0) > 60 * 60 * 1000) {
        root.innerHTML = "";
        return;
      }

      root.innerHTML = `
        <button class="turtle-btn" type="button" data-claim-turtle>
          ${turtleSvg(active.type)}
          <span>${active.points}P 亀</span>
        </button>
      `;
    } catch {
      root.innerHTML = "";
    }
  }

  function turtleSvg(type) {
    const colors = {
      normal: ["#6FA86B", "#3E6B43"],
      gold: ["#FBBF24", "#B45309"],
      diamond: ["#67E8F9", "#2563EB"],
      god: ["#FFFFFF", "#A855F7"]
    }[type] || ["#6FA86B", "#3E6B43"];

    return `
      <svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="52" rx="38" ry="25" fill="${colors[0]}"/>
        <ellipse cx="60" cy="52" rx="25" ry="15" fill="${colors[1]}" opacity=".55"/>
        <circle cx="99" cy="48" r="14" fill="${colors[0]}"/>
        <circle cx="104" cy="45" r="3" fill="#111"/>
        <circle cx="30" cy="75" r="9" fill="${colors[1]}"/>
        <circle cx="76" cy="75" r="9" fill="${colors[1]}"/>
        <circle cx="30" cy="30" r="8" fill="${colors[1]}"/>
        <circle cx="78" cy="30" r="8" fill="${colors[1]}"/>
      </svg>
    `;
  }

  async function claimTurtle(button) {
    if (!currentUser) {
      toast("亀を取るにはログインしてね", "bad");
      return;
    }

    const configRef = db().collection("config").doc("turtles");
    const playerRef = db().collection("players").doc(keyOf(currentUser.mcId));
    let gained = 0;
    let type = "normal";

    try {
      await db().runTransaction(async (tx) => {
        const cSnap = await tx.get(configRef);
        const active = cSnap.data()?.active;
        if (!active) throw new Error("亀がいません");

        type = active.type;
        if (type === "god" && Date.now() - Number(active.createdAt || 0) > 60 * 60 * 1000) {
          throw new Error("神亀は時間切れ");
        }

        const claimed = active.claimedBy || [];
        const me = keyOf(currentUser.mcId);

        if (claimed.includes(me)) throw new Error("もう取りました");
        if (claimed.length >= Number(active.limit || 1)) throw new Error("先着終了");

        const pSnap = await tx.get(playerRef);
        const p = pSnap.data();
        gained = Number(active.points || 0);

        tx.update(configRef, {
          "active.claimedBy": [...claimed, me]
        });

        tx.update(playerRef, {
          points: Number(p.points || 0) + gained,
          updatedAt: serverTime()
        });
      });

      currentUser = await getPlayer(currentUser.mcId);
      renderMiniAccount();
      renderAccountStatus();
      await renderProfileEditor();
      await renderTurtle();

      floatingText(button, `+${gained}P`);
      toast(`亀をゲット！ +${gained}P`, "good");

      if (type === "diamond" || type === "god") {
        openModal(`
          <div class="gacha-result">
            <h2>${type === "god" ? "神亀" : "ダイヤ亀"} 獲得！</h2>
            <div class="item-art" style="--item-a:#fff;--item-b:#a855f7">${turtleSvg(type)}</div>
            <p>全画面演出！ +${gained}P</p>
            <button class="btn" type="button" data-modal-close>OK</button>
          </div>
        `);
      }
    } catch (e) {
      toast(e.message || "取得できませんでした", "bad");
    }
  }

  function floatingText(el, text) {
    const r = el.getBoundingClientRect();
    const f = document.createElement("div");
    f.className = "float-text";
    f.textContent = text;
    f.style.setProperty("--x", `${r.left + r.width / 2}px`);
    f.style.setProperty("--y", `${r.top}px`);
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1100);
  }

  async function grantTitle(mcid, titleId) {
    if (!mcid || !titleId) {
      adminPrint("usage: title grant MCID titleId");
      return;
    }

    const p = await getPlayer(mcid);
    if (!p) {
      adminPrint("player not found");
      return;
    }

    await db().collection("players").doc(keyOf(mcid)).update({
      titles: fv().arrayUnion(titleId),
      activeTitle: titleId,
      updatedAt: serverTime()
    });

    adminPrint(`granted ${titleId} to ${p.mcId}`);
  }

  async function takeTitle(mcid, titleId) {
    if (!mcid || !titleId) {
      adminPrint("usage: title take MCID titleId");
      return;
    }

    const p = await getPlayer(mcid);
    if (!p) {
      adminPrint("player not found");
      return;
    }

    const titles = (p.titles || []).filter((id) => id !== titleId);
    await db().collection("players").doc(keyOf(mcid)).update({
      titles,
      activeTitle: p.activeTitle === titleId ? titles[0] || "" : p.activeTitle,
      updatedAt: serverTime()
    });

    adminPrint(`removed ${titleId} from ${p.mcId}`);
  }

  async function grantItem(mcid, itemId) {
    if (!mcid || !ITEM_MAP.has(itemId)) {
      adminPrint("usage: item grant MCID itemId");
      return;
    }

    await db().collection("players").doc(keyOf(mcid)).update({
      ownedItems: fv().arrayUnion(itemId),
      updatedAt: serverTime()
    });

    adminPrint(`granted item ${itemId} to ${mcid}`);
  }

  function openTitleGui() {
    openModal(`
      <div class="panel" style="margin-top:0">
        <div class="panel-title">
          <div>
            <h2>title gui</h2>
            <p>称号はここから付与/削除できます。Only/many要素保持。</p>
          </div>
        </div>
        <div class="form">
          <input id="adminTitleMcid" class="input" placeholder="MCID" />
          <select id="adminTitleId" class="select">
            ${Object.values(TITLES)
              .map((t) => `<option value="${esc(t.id)}">${esc(t.name)} / ${esc(t.type)}</option>`)
              .join("")}
          </select>
          <div class="form-row">
            <button class="btn" type="button" data-admin-title-grant>付与</button>
            <button class="btn danger" type="button" data-admin-title-take>削除</button>
          </div>
        </div>
      </div>
    `);
  }

  async function adminGrantTitleFromGui() {
    const mcid = document.getElementById("adminTitleMcid")?.value;
    const titleId = document.getElementById("adminTitleId")?.value;
    await grantTitle(mcid, titleId);
    toast("称号を付与しました", "good");
  }

  async function adminTakeTitleFromGui() {
    const mcid = document.getElementById("adminTitleMcid")?.value;
    const titleId = document.getElementById("adminTitleId")?.value;
    await takeTitle(mcid, titleId);
    toast("称号を削除しました", "good");
  }

  async function getMusicUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    if (!window.storage) return "";
    return window.storage.ref(path).getDownloadURL();
  }

  window.RHApp = {
    openProfileModal,
    seedInit
  };
})();
