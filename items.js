(function () {
  "use strict";

  const particles = [
    ["particle_leaf", "若葉のこみち", "#6FA86B", "leaf", 0, true],
    ["particle_tanpopo", "たんぽぽ綿毛", "#FFFDF7", "dot", 8],
    ["particle_komorebi", "木漏れ日", "#E0AB4B", "sparkle", 10],
    ["particle_hotaru", "ほたる", "#C9DD7A", "dot", 12],
    ["particle_star_sand", "星砂", "#E08A4B", "star", 14],
    ["particle_sakura", "桜のかけら", "#EAA0A5", "leaf", 16],
    ["particle_snow", "初雪", "#DDECF0", "snow", 16],
    ["particle_rain", "雨粒", "#7FAAC8", "dot", 18],
    ["particle_acorn", "どんぐり", "#8A6A43", "dot", 18],
    ["particle_cloud", "ふわ雲", "#FFFDF7", "bubble", 20],
    ["particle_mikan", "みかんピール", "#E08A4B", "leaf", 22],
    ["particle_moon", "月光", "#B7C9D8", "sparkle", 22],
    ["particle_blue_runes", "青エンチャント", "#5D8BB0", "sparkle", 24],
    ["particle_purple_smoke", "紫のけむり", "#825BA0", "bubble", 26],
    ["particle_redstone", "レッドストーン粉", "#A64B45", "dot", 26],
    ["particle_golden_apple", "金リンゴ紙吹雪", "#E0AB4B", "square", 28],
    ["particle_diamond", "ダイヤ粉", "#63AFC4", "sparkle", 30],
    ["particle_nether", "ネザーフレア", "#C95E42", "flame", 30],
    ["particle_end", "エンドのこだま", "#6B4A8C", "sparkle", 32],
    ["particle_black_feather", "黒羽", "#3A332B", "leaf", 32],
    ["particle_mint", "ミント", "#7FC8A9", "leaf", 34],
    ["particle_bread", "パンくず", "#D9A76A", "square", 36],
    ["particle_lantern", "ランタン灯り", "#E08A4B", "sparkle", 38],
    ["particle_retro", "手帳紙吹雪", "#D8C7A7", "square", 38],
    ["particle_aurora", "オーロラ", "#8BC4B1", "sparkle", 40],
    ["particle_clover", "クローバー", "#6FA86B", "leaf", 42],
    ["particle_crystal", "水晶", "#B6DDE4", "diamond", 44],
    ["particle_evening", "夕焼け", "#E08A4B", "sparkle", 44],
    ["particle_frost", "霜の結晶", "#CFE4EA", "snow", 48],
    ["particle_halo", "光の輪", "#F1D98A", "bubble", 50],
    ["particle_notes", "音符", "#8A7E6E", "note", 52],
    ["particle_lapis", "ラピスの星屑", "#4D6F9F", "sparkle", 54]
  ].map(function (p, index) {
    return {
      id: p[0],
      kind: "particle",
      name: p[1],
      desc: p[1] + "がプロフィールを開いた時に舞います。",
      color: p[2],
      shape: p[3],
      cost: p[4],
      free: Boolean(p[5]),
      rarity: index > 22 ? "SR" : index > 10 ? "R" : "N"
    };
  });

  const frames = [
    ["frame_wood", "木の額縁", "frame-wood", 0, true, "N"],
    ["frame_moss", "苔むした石", "frame-moss", 18, false, "N"],
    ["frame_orange", "夕焼けレンガ", "frame-orange", 24, false, "N"],
    ["frame_gold", "金リンゴ枠", "frame-gold", 45, false, "R"],
    ["frame_diamond", "ダイヤの角丸", "frame-diamond", 50, false, "R"],
    ["frame_command", "コマンドブロック枠", "frame-command", 80, false, "SR"],
    ["frame_blade", "PVP斬撃枠", "frame-blade", 70, false, "SR"],
    ["frame_blue", "青エンチャント枠", "frame-blue", 90, false, "SR"],
    ["frame_shadow", "闇影フレーム", "frame-shadow", 120, false, "SS"],
    ["frame_tofu", "お豆腐ふわ枠", "frame-tofu", 60, false, "R"],
    ["frame_maid", "メイドリボン枠", "frame-maid", 75, false, "SR"],
    ["frame_legend", "伝説レア枠", "frame-legend", 160, false, "SS"]
  ].map(function (f) {
    return { id: f[0], kind: "frame", name: f[1], desc: f[1] + "をアイコンにつけます。", css: f[2], cost: f[3], free: f[4], rarity: f[5] };
  });

  const backgrounds = [
    ["bg_cream", "クリーム手帳", "bg-cream", 0, true, "N"],
    ["bg_meadow", "草原の朝", "bg-meadow", 20, false, "N"],
    ["bg_sunset", "夕焼け拠点", "bg-sunset", 28, false, "N"],
    ["bg_blue_moon", "月夜の青", "bg-blue-moon", 42, false, "R"],
    ["bg_command", "管理者ルーム", "bg-command", 80, false, "SR"],
    ["bg_gold", "UHCゴールド", "bg-gold", 80, false, "SR"],
    ["bg_pvp", "PVPアリーナ", "bg-pvp", 70, false, "SR"],
    ["bg_dark", "闇の森", "bg-dark", 110, false, "SS"],
    ["bg_lapis", "ラピス水晶洞", "bg-lapis", 85, false, "SR"],
    ["bg_sakura", "桜の小道", "bg-sakura", 55, false, "R"],
    ["bg_campfire", "焚き火の夜", "bg-campfire", 60, false, "R"],
    ["bg_end", "エンドの余韻", "bg-end", 95, false, "SR"]
  ].map(function (b) {
    return { id: b[0], kind: "background", name: b[1], desc: b[1] + "をプロフィール背景にします。", css: b[2], cost: b[3], free: b[4], rarity: b[5] };
  });

  const auras = [
    ["aura_none", "オーラなし", "aura-none", 0, true, "N"],
    ["aura_leaf", "木の葉オーラ", "aura-leaf", 35, false, "R"],
    ["aura_blue", "青エンチャントオーラ", "aura-blue", 90, false, "SR"],
    ["aura_king", "王冠オーラ", "aura-king", 85, false, "SR"],
    ["aura_slash", "斬撃オーラ", "aura-slash", 85, false, "SR"],
    ["aura_command", "Admin走査線", "aura-command", 95, false, "SR"],
    ["aura_dark", "闇のオーラ", "aura-dark", 120, false, "SS"],
    ["aura_fire", "炎の波乗りオーラ", "aura-fire", 120, false, "SS"],
    ["aura_heart", "メイドハート", "aura-heart", 80, false, "SR"],
    ["aura_legend", "伝説闇炎オーラ", "aura-legend", 180, false, "SS"]
  ].map(function (a) {
    return { id: a[0], kind: "aura", name: a[1], desc: a[1] + "をプロフィールに重ねます。", css: a[2], cost: a[3], free: a[4], rarity: a[5] };
  });

  const catalog = particles.concat(frames, backgrounds, auras);

  const gachaItems = [
    { id: "dark_penguin", name: "闇のペンギン", rarity: "SS", weight: 1, desc: "386edeが最初から所持する最高SS。", svg: darkPenguinSvg },
    { id: "magma_surfer", name: "炎獄のマグマサーファー", rarity: "SS", weight: 1, desc: "炎をまとって迫ってくるSS。", svg: magmaSurferSvg },
    { id: "legend_dark_magma_penguin", name: "闇炎覇王ペンギン・インフェルノ", rarity: "伝説レア", weight: 0, desc: "闇のペンギンと炎獄のマグマサーファーの融合体。", svg: legendSvg },
    { id: "tofu_mental", name: "お豆腐メンタルなんです・・", rarity: "SR", weight: 6, desc: "4y44が最初から所持。結構レア。", svg: tofuSvg },
    { id: "muki_maid", name: "むきメイド", rarity: "SR", weight: 5, desc: "Mukisukinoが所持。かわいいからムキムキへ。", svg: mukiMaidSvg },
    { id: "maid_and_muscle", name: "メイドとムキムキ", rarity: "SSR", weight: 3, desc: "メイドとムキムキが並び立つ。", svg: maidAndMuscleSvg },
    { id: "diamond_piece", name: "ダイヤの欠片", rarity: "R", weight: 12, desc: "プロフィールに飾れるダイヤの欠片。", svg: function () { return charmSvg("◇", "#7FD3E6", "#386A80"); } },
    { id: "gold_apple_badge", name: "金リンゴバッジ", rarity: "R", weight: 12, desc: "UHCっぽい金リンゴバッジ。", svg: function () { return charmSvg("🍎", "#E0AB4B", "#8A6A2A"); } },
    { id: "pvp_spark", name: "PVP火花", rarity: "R", weight: 12, desc: "剣がぶつかった火花。", svg: function () { return charmSvg("剣", "#DDECF0", "#3A332B"); } },
    { id: "retbare_note", name: "retbare手帳シール", rarity: "R", weight: 16, desc: "あたたかい手帳風シール。", svg: function () { return charmSvg("rH", "#FFFDF7", "#6FA86B"); } }
  ];

  const fusionItem = {
    id: "legend_dark_magma_penguin",
    needs: ["dark_penguin", "magma_surfer"]
  };

  function getItem(id) {
    return catalog.find(function (item) { return item.id === id; }) || null;
  }

  function getGachaItem(id) {
    return gachaItems.find(function (item) { return item.id === id; }) || null;
  }

  function renderGachaSvg(id) {
    const item = getGachaItem(id);
    return item ? item.svg() : "";
  }

  function rarityClass(rarity) {
    if (rarity === "伝説レア") return "rarity-legend";
    return "rarity-" + String(rarity || "N").toLowerCase();
  }

  function darkPenguinSvg() {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" class="special-svg">
  <defs>
    <style>
      .pixel{shape-rendering:crispEdges}
      @keyframes run-left-leg{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(5px,-12px) rotate(-20deg)}50%{transform:translate(0,0) rotate(0)}75%{transform:translate(-3px,0) rotate(0)}}
      @keyframes run-right-leg{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-3px,0) rotate(0)}50%{transform:translate(5px,-12px) rotate(20deg)}75%{transform:translate(0,0) rotate(0)}}
      @keyframes body-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes dark-aura{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.7;transform:scale(1.05)}}
      @keyframes wind-fast{0%{transform:translateX(0);opacity:.9}100%{transform:translateX(-120px);opacity:0}}
      @keyframes eye-glow{0%,100%{opacity:.6}50%{opacity:1}}
      .leg-left{animation:run-left-leg .35s infinite linear;transform-origin:180px 220px}
      .leg-right{animation:run-right-leg .35s infinite linear;transform-origin:220px 220px}
      .body-group{animation:body-bounce .35s infinite ease-in-out}
      .aura-core{animation:dark-aura 2s infinite ease-in-out;transform-origin:220px 150px}
      .wind1{animation:wind-fast .5s infinite linear}
      .wind2{animation:wind-fast .7s infinite linear;animation-delay:.15s}
      .eye-shine{animation:eye-glow 1.5s infinite ease-in-out}
    </style>
    <radialGradient id="darkGradientRh" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#220033" stop-opacity=".8"/>
      <stop offset="50%" stop-color="#110022" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#000011" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g class="aura-core">
    <ellipse cx="220" cy="150" rx="130" ry="110" fill="url(#darkGradientRh)"/>
    <ellipse cx="220" cy="150" rx="100" ry="85" fill="#1A0033" opacity=".5"/>
  </g>
  <circle cx="180" cy="120" r="8" fill="#330066" opacity=".7"/>
  <circle cx="260" cy="180" r="6" fill="#220044" opacity=".6"/>
  <circle cx="200" cy="200" r="10" fill="#440088" opacity=".5"/>
  <g opacity=".7">
    <rect class="wind1 pixel" x="350" y="100" width="60" height="4" fill="#444" rx="1"/>
    <rect class="wind2 pixel" x="380" y="140" width="50" height="3" fill="#333" rx="1"/>
    <rect class="wind1 pixel" x="360" y="180" width="55" height="5" fill="#555" rx="1"/>
  </g>
  <g class="body-group">
    <polygon points="160,130 100,240 180,220" fill="#1A0033" class="pixel"/>
    <g class="leg-left"><rect x="165" y="210" width="22" height="40" fill="#0A0A1A" class="pixel"/><rect x="160" y="245" width="32" height="10" fill="#1A1A2E" class="pixel"/></g>
    <rect x="130" y="140" width="30" height="60" fill="#0F0F1A" class="pixel"/>
    <rect x="160" y="110" width="110" height="110" rx="6" fill="#0D0D1A" class="pixel"/>
    <rect x="175" y="125" width="80" height="90" rx="5" fill="#2A2A3A" class="pixel"/>
    <rect x="200" y="145" width="30" height="30" fill="#1A0033" class="pixel" opacity=".8"/>
    <polygon points="215,150 225,165 205,165" fill="#6600CC" class="pixel" opacity=".6"/>
    <rect x="265" y="140" width="35" height="65" fill="#1A1A2E" class="pixel"/>
    <rect x="185" y="85" width="50" height="35" fill="#0D0D1A" class="pixel"/>
    <rect x="170" y="50" width="80" height="50" rx="5" fill="#0D0D1A" class="pixel"/>
    <rect x="180" y="65" width="60" height="30" rx="4" fill="#3A3A4A" class="pixel"/>
    <rect x="175" y="75" width="70" height="18" rx="3" fill="#1A0033" class="pixel"/>
    <rect x="195" y="68" width="10" height="10" fill="#FFF" class="pixel"/><rect x="197" y="70" width="6" height="6" fill="#F00" class="pixel"/><rect class="eye-shine" x="199" y="70" width="2" height="2" fill="#FFF" class="pixel"/>
    <rect x="215" y="68" width="14" height="12" fill="#FFF" class="pixel"/><rect x="218" y="70" width="10" height="8" fill="#F00" class="pixel"/><rect class="eye-shine" x="222" y="71" width="3" height="3" fill="#FFF" class="pixel"/>
    <polygon points="235,85 265,82 240,95" fill="#CC6600" class="pixel"/>
    <rect x="165" y="40" width="12" height="18" fill="#1A0033" class="pixel"/><rect x="243" y="42" width="12" height="16" fill="#1A0033" class="pixel"/>
    <g class="leg-right"><rect x="215" y="210" width="26" height="42" fill="#141428" class="pixel"/><rect x="210" y="248" width="36" height="12" fill="#1A1A2E" class="pixel"/></g>
  </g>
</svg>`;
  }

  function magmaSurferSvg() {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" class="special-svg">
  <defs>
    <style>
      .pixel{shape-rendering:crispEdges}
      @keyframes approach{0%{transform:translate(-200px,100px) scale(.3);opacity:.8}40%{transform:translate(-80px,30px) scale(.8);opacity:1}70%{transform:translate(20px,-10px) scale(1.2);opacity:1}100%{transform:translate(150px,-60px) scale(2);opacity:.3}}
      @keyframes board-rock{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
      @keyframes magma-pulse{0%,100%{opacity:.7}50%{opacity:1}}
      @keyframes flame-wave{0%,100%{transform:skewX(-5deg) scaleY(1)}50%{transform:skewX(5deg) scaleY(1.1)}}
      @keyframes speed-line{0%{transform:translate(-300px,0) scaleX(.3);opacity:0}30%{opacity:.6}100%{transform:translate(200px,0) scaleX(2);opacity:0}}
      .approach-group{animation:approach 2s infinite ease-in}
      .board{animation:board-rock .4s infinite ease-in-out;transform-origin:250px 280px}
      .magma-core{animation:magma-pulse .8s infinite ease-in-out}
      .flame{animation:flame-wave .6s infinite ease-in-out;transform-origin:center bottom}
      .speed1{animation:speed-line .5s infinite linear}
      .speed2{animation:speed-line .7s infinite linear;animation-delay:.2s}
    </style>
    <radialGradient id="magmaGradRh" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFFF00"/><stop offset="30%" stop-color="#FF6600"/><stop offset="70%" stop-color="#CC0000"/><stop offset="100%" stop-color="#330000"/></radialGradient>
    <radialGradient id="coreGradRh" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFF"/><stop offset="40%" stop-color="#FFFF00"/><stop offset="100%" stop-color="#FF4400"/></radialGradient>
  </defs>
  <g opacity=".6"><rect class="speed1" x="50" y="80" width="150" height="3" fill="#FF4400" rx="1"/><rect class="speed2" x="20" y="150" width="200" height="4" fill="#FF6600" rx="1"/><rect class="speed1" x="80" y="250" width="180" height="3" fill="#FF2200" rx="1"/></g>
  <g class="approach-group">
    <g class="flame" opacity=".8"><polygon points="180,250 80,280 100,220" fill="#CC0000"/><polygon points="220,270 40,320 80,250" fill="#FF8800"/><polygon points="320,250 420,280 400,220" fill="#CC0000"/><polygon points="280,270 460,320 420,250" fill="#FF8800"/></g>
    <g class="board"><ellipse cx="255" cy="285" rx="105" ry="25" fill="#330000" opacity=".5"/><ellipse cx="250" cy="278" rx="95" ry="19" fill="url(#magmaGradRh)"/><ellipse class="magma-core" cx="250" cy="278" rx="70" ry="12" fill="url(#coreGradRh)" opacity=".8"/></g>
    <rect x="200" y="240" width="25" height="45" fill="#1A0500"/><rect x="270" y="240" width="28" height="48" fill="#140400"/>
    <ellipse cx="250" cy="180" rx="65" ry="85" fill="#FF2200" opacity=".3"/>
    <rect x="195" y="120" width="110" height="130" rx="10" fill="#1A0000"/>
    <rect x="210" y="140" width="80" height="8" fill="#FF4400"/><rect x="220" y="180" width="60" height="10" fill="#FF8800"/>
    <ellipse class="magma-core" cx="250" cy="165" rx="25" ry="30" fill="url(#coreGradRh)"/>
    <rect x="150" y="150" width="40" height="80" rx="8" fill="#1A0000" transform="rotate(-20 170 190)"/>
    <rect x="300" y="145" width="50" height="90" rx="10" fill="#140000" transform="rotate(15 325 190)"/>
    <ellipse cx="360" cy="200" rx="18" ry="22" fill="#FF2200"/>
    <rect x="215" y="55" width="70" height="55" rx="8" fill="#140000"/>
    <rect x="210" y="45" width="80" height="15" fill="#FF2200"/>
    <polygon points="210,50 190,30 200,55" fill="#FF8800"/><polygon points="290,50 310,30 300,55" fill="#FF8800"/>
    <rect x="232" y="75" width="16" height="10" fill="#FFFF00"/><rect x="258" y="75" width="16" height="10" fill="#FFFF00"/>
    <rect x="240" y="90" width="20" height="8" fill="#FF0000"/>
  </g>
</svg>`;
  }

  function legendSvg() {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="special-svg">
  <defs>
    <style>
      .pixel{shape-rendering:crispEdges}
      @keyframes ultimate-approach{0%{transform:translate(-400px,200px) scale(.15) rotate(-5deg);filter:blur(2px);opacity:.6}45%{transform:translate(-100px,40px) scale(.7) rotate(-1deg);opacity:1}75%{transform:translate(80px,-40px) scale(1.3) rotate(2deg);opacity:1}100%{transform:translate(300px,-150px) scale(2.5) rotate(6deg);opacity:0;filter:blur(3px)}}
      @keyframes dark-magma-aura{0%,100%{transform:scale(1) rotate(0);opacity:.5}50%{transform:scale(1.15) rotate(-1deg);opacity:.85}}
      @keyframes surf-rock{0%,100%{transform:rotate(-4deg) translateY(2px)}50%{transform:rotate(5deg) translateY(0)}}
      @keyframes magma-heartbeat{0%,100%{opacity:.7;transform:scale(1)}30%{opacity:1;transform:scale(.95)}45%{opacity:1;transform:scale(1.1)}}
      @keyframes wind-slash{0%{transform:translateX(0) scaleX(.5);opacity:0}20%{opacity:.8}100%{transform:translateX(-500px) scaleX(2);opacity:0}}
      .ultimate-group{animation:ultimate-approach 3s infinite cubic-bezier(.4,0,.2,1)}
      .aura-outer{animation:dark-magma-aura 2s infinite ease-in-out;transform-origin:400px 300px}
      .surf-board{animation:surf-rock .5s infinite ease-in-out;transform-origin:400px 420px}
      .magma-core{animation:magma-heartbeat .6s infinite ease-in-out}
      .wind-a{animation:wind-slash .6s infinite linear}
      .wind-b{animation:wind-slash .8s infinite linear;animation-delay:.15s}
    </style>
    <radialGradient id="darkMagmaRh" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FF2200"/><stop offset="30%" stop-color="#880044"/><stop offset="70%" stop-color="#220044"/><stop offset="100%" stop-color="#000011"/></radialGradient>
    <radialGradient id="coreBlazeRh" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFF"/><stop offset="20%" stop-color="#FFFF88"/><stop offset="50%" stop-color="#FF4400"/><stop offset="100%" stop-color="#880000"/></radialGradient>
  </defs>
  <g opacity=".7"><rect class="wind-a" x="600" y="50" width="200" height="3" fill="#FF6600"/><rect class="wind-b" x="650" y="120" width="180" height="4" fill="#FF4400"/><rect class="wind-a" x="580" y="200" width="220" height="2" fill="#FF8800"/></g>
  <g class="ultimate-group">
    <ellipse class="aura-outer" cx="400" cy="300" rx="180" ry="220" fill="url(#darkMagmaRh)" opacity=".4"/>
    <ellipse cx="400" cy="300" rx="140" ry="170" fill="#FF2200" opacity=".25"/>
    <g class="surf-board"><ellipse cx="405" cy="435" rx="130" ry="35" fill="#110000" opacity=".6"/><ellipse cx="400" cy="428" rx="118" ry="28" fill="url(#darkMagmaRh)"/><ellipse class="magma-core" cx="400" cy="428" rx="90" ry="18" fill="url(#coreBlazeRh)"/></g>
    <polygon points="300,280 180,420 220,440 260,400" fill="#0D001A"/>
    <polygon points="500,270 620,410 580,430 540,390" fill="#0D001A"/>
    <rect x="310" y="180" width="180" height="200" rx="15" fill="#050008"/>
    <rect x="330" y="210" width="140" height="10" fill="#FF0000"/><rect x="335" y="260" width="130" height="12" fill="#FF8800"/><rect x="350" y="320" width="100" height="8" fill="#FF2200"/>
    <ellipse class="magma-core" cx="400" cy="250" rx="45" ry="55" fill="url(#coreBlazeRh)"/>
    <rect x="340" y="80" width="120" height="75" rx="10" fill="#050008"/>
    <rect x="335" y="72" width="130" height="18" fill="#FF0000"/>
    <polygon points="340,85 300,45 315,90" fill="#220044"/><polygon points="460,85 500,40 485,90" fill="#FF2200"/>
    <rect x="370" y="105" width="22" height="16" fill="#FF0000"/><rect x="376" y="110" width="10" height="6" fill="#FFF"/>
    <rect x="408" y="105" width="22" height="16" fill="#FF0000"/><rect x="414" y="110" width="10" height="6" fill="#FFF"/>
    <rect x="385" y="135" width="30" height="12" fill="#FF0000"/>
    <ellipse cx="540" cy="270" rx="30" ry="35" fill="#FF0000"/>
    <g transform="rotate(15 560 240)"><rect x="555" y="100" width="20" height="180" fill="#FF0000"/><rect x="562" y="110" width="6" height="160" fill="#FFF"/><rect x="558" y="280" width="14" height="50" fill="#1A0033"/><rect x="548" y="275" width="34" height="8" fill="#FF8800"/></g>
  </g>
</svg>`;
  }

  function tofuSvg() {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" class="special-svg">
  <defs><style>.pixel{shape-rendering:crispEdges}@keyframes appear{0%{transform:translateY(80px) scale(.6);opacity:0}80%{transform:translateY(-5px) scale(1.02);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}@keyframes wobble{0%,100%{transform:rotate(-2deg) skewX(.5deg)}50%{transform:rotate(-1deg) skewX(.3deg)}75%{transform:rotate(2deg) skewX(-.3deg)}}@keyframes sweat-drop{0%{transform:translateY(0) scale(1);opacity:.8}100%{transform:translateY(15px) scale(.5);opacity:0}}.tofu-group{animation:appear 2.5s ease-out forwards,wobble 3s 2.5s infinite ease-in-out;transform-origin:250px 220px}.sweat-1{animation:sweat-drop 1.5s 3s infinite linear}.sweat-2{animation:sweat-drop 1.2s 3.5s infinite linear}</style></defs>
  <rect width="500" height="400" fill="#FFF8F0"/>
  <ellipse cx="250" cy="220" rx="180" ry="140" fill="#FFE4C4" opacity=".3"/>
  <g class="tofu-group">
    <ellipse cx="255" cy="295" rx="85" ry="25" fill="#E8DCC8" opacity=".6"/>
    <rect x="165" y="220" width="170" height="75" fill="#F0E6D2"/>
    <rect x="160" y="170" width="180" height="70" rx="8" fill="#FFFAF0"/>
    <rect x="165" y="175" width="170" height="60" rx="6" fill="#FFF"/>
    <rect x="205" y="205" width="10" height="12" fill="#5C4033" rx="2"/><rect x="285" y="205" width="10" height="12" fill="#5C4033" rx="2"/>
    <rect x="200" y="198" width="14" height="4" fill="#8B7355" transform="rotate(15 207 200)"/><rect x="286" y="198" width="14" height="4" fill="#8B7355" transform="rotate(-15 293 200)"/>
    <rect x="243" y="225" width="14" height="6" fill="#D4A5A5" rx="2"/>
    <ellipse cx="195" cy="218" rx="12" ry="8" fill="#FFDAB9" opacity=".5"/><ellipse cx="305" cy="218" rx="12" ry="8" fill="#FFDAB9" opacity=".5"/>
    <rect class="sweat-1" x="330" y="195" width="8" height="12" fill="#87CEEB" rx="3"/><rect class="sweat-2" x="160" y="190" width="6" height="10" fill="#87CEEB" rx="2"/>
  </g>
  <rect x="120" y="320" width="260" height="50" rx="12" fill="#FFF" stroke="#E8DCC8" stroke-width="2"/>
  <text x="250" y="352" font-family="sans-serif" font-size="18" fill="#5C4033" text-anchor="middle" font-weight="500">お豆腐メンタルなんです・・</text>
</svg>`;
  }

  function mukiMaidSvg() {
    return charmSvg("むき\nメイド", "#FFB6C1", "#CC0044");
  }

  function maidAndMuscleSvg() {
    return charmSvg("メイド\nムキ", "#FFF0F5", "#330066");
  }

  function charmSvg(label, color, dark) {
    const lines = String(label).split("\n");
    return `
<svg viewBox="0 0 360 260" class="special-svg">
  <defs><style>@keyframes pop{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(2deg)}}.main{animation:pop 2.2s infinite ease-in-out;transform-origin:180px 130px}</style></defs>
  <rect width="360" height="260" rx="28" fill="#FFFDF7"/>
  <ellipse cx="180" cy="145" rx="120" ry="85" fill="${color}" opacity=".28"/>
  <g class="main">
    <rect x="85" y="48" width="190" height="158" rx="32" fill="${color}" stroke="${dark}" stroke-width="8"/>
    <rect x="112" y="78" width="136" height="98" rx="22" fill="#FFFDF7" opacity=".78"/>
    <text x="180" y="${lines.length > 1 ? 120 : 145}" font-family="sans-serif" font-size="42" fill="${dark}" text-anchor="middle" font-weight="900">${lines[0]}</text>
    ${lines[1] ? `<text x="180" y="166" font-family="sans-serif" font-size="42" fill="${dark}" text-anchor="middle" font-weight="900">${lines[1]}</text>` : ""}
  </g>
</svg>`;
  }

  window.RHItemLib = {
    catalog,
    gachaItems,
    fusionItem,
    getItem,
    getGachaItem,
    renderGachaSvg,
    rarityClass
  };
})();
