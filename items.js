(function () {
  "use strict";

  const particleSeeds = [
    ["particle_leaf", "若葉のこみち", "小さな葉っぱがふわっと舞います。", "#6FA86B", "leaf", 0, true],
    ["particle_tanpopo", "たんぽぽ綿毛", "白い綿毛がやさしく飛びます。", "#FFFDF7", "dot", 8],
    ["particle_komorebi", "木漏れ日", "淡い光の粒が落ちてきます。", "#E0AB4B", "sparkle", 10],
    ["particle_hotaru", "ほたる", "夜に似合う黄緑の光。", "#C9DD7A", "dot", 12],
    ["particle_sugar", "角砂糖", "小さな四角がころころ舞います。", "#FFFDF7", "square", 12],
    ["particle_star_sand", "星砂", "星の砂みたいな粒。", "#E08A4B", "star", 14],
    ["particle_sakura", "桜のかけら", "淡いピンクの花びら。", "#EAA0A5", "leaf", 16],
    ["particle_snow", "初雪", "小さな雪がふわふわ。", "#DDECF0", "snow", 16],
    ["particle_rain", "雨粒", "透明感のある雨粒。", "#7FAAC8", "dot", 18],
    ["particle_acorn", "どんぐり", "秋っぽい茶色の粒。", "#8A6A43", "dot", 18],
    ["particle_mushroom", "きのこ胞子", "森の奥の胞子。", "#C78D67", "dot", 20],
    ["particle_cloud", "ふわ雲", "雲のような白い丸。", "#FFFDF7", "bubble", 20],
    ["particle_tea", "お茶の湯気", "湯気っぽく立ち上がります。", "#8FAE73", "bubble", 20],
    ["particle_mikan", "みかんピール", "控えめなオレンジの皮。", "#E08A4B", "leaf", 22],
    ["particle_moon", "月光", "青白い月の粒。", "#B7C9D8", "sparkle", 22],
    ["particle_seafoam", "海の泡", "泡がぽこぽこ。", "#A9D7D3", "bubble", 24],
    ["particle_blue_runes", "青エンチャント", "青い文字のような粒。", "#5D8BB0", "sparkle", 24],
    ["particle_purple_smoke", "紫のけむり", "紫の粒が漂います。", "#825BA0", "bubble", 26],
    ["particle_redstone", "レッドストーン粉", "赤い粉がちらっと光る。", "#A64B45", "dot", 26],
    ["particle_golden_apple", "金リンゴ紙吹雪", "金色の紙吹雪。", "#E0AB4B", "square", 28],
    ["particle_diamond", "ダイヤ粉", "淡い青のきらめき。", "#63AFC4", "sparkle", 30],
    ["particle_nether", "ネザーフレア", "熱すぎない炎の粒。", "#C95E42", "flame", 30],
    ["particle_end", "エンドのこだま", "紫のふしぎな粒。", "#6B4A8C", "sparkle", 32],
    ["particle_black_feather", "黒羽", "黒い羽が静かに舞います。", "#3A332B", "leaf", 32],
    ["particle_mint", "ミント", "すっきりした青緑の粒。", "#7FC8A9", "leaf", 34],
    ["particle_walnut", "くるみ", "木の実っぽい粒。", "#9A7653", "dot", 34],
    ["particle_sheep", "ひつじ毛", "白いもこもこ。", "#F5F0E8", "bubble", 36],
    ["particle_bread", "パンくず", "焼きたて色の粒。", "#D9A76A", "square", 36],
    ["particle_lantern", "ランタン灯り", "暖かい灯り。", "#E08A4B", "sparkle", 38],
    ["particle_retro", "手帳紙吹雪", "ほぼ日っぽい紙片。", "#D8C7A7", "square", 38],
    ["particle_aurora", "オーロラ", "淡い緑と青の光。", "#8BC4B1", "sparkle", 40],
    ["particle_bell", "小さな鈴", "鈴っぽい金色の粒。", "#D8AA4C", "dot", 40],
    ["particle_windmill", "風車", "くるっと回る粒。", "#8BAF87", "star", 42],
    ["particle_clover", "クローバー", "幸運の緑。", "#6FA86B", "leaf", 42],
    ["particle_crystal", "水晶", "薄い水晶のかけら。", "#B6DDE4", "diamond", 44],
    ["particle_evening", "夕焼け", "夕方のオレンジ粒。", "#E08A4B", "sparkle", 44],
    ["particle_hourglass", "砂時計", "さらさらした砂。", "#C7AB7D", "dot", 46],
    ["particle_fish", "小魚", "水辺の小さな青。", "#5D8BB0", "leaf", 46],
    ["particle_frost", "霜の結晶", "青白い結晶。", "#CFE4EA", "snow", 48],
    ["particle_charcoal", "炭火", "黒と赤の小さな火。", "#4A3030", "flame", 48],
    ["particle_halo", "光の輪", "丸い光がぽんぽん。", "#F1D98A", "bubble", 50],
    ["particle_kodama", "森のこだま", "森にいる小さな光。", "#A5C98A", "dot", 50],
    ["particle_notes", "音符", "プロフィールに音符が舞う。", "#8A7E6E", "note", 52],
    ["particle_cherry", "チェリーピンク", "甘いピンクの星。", "#D9859A", "star", 52],
    ["particle_lapis", "ラピスの星屑", "深い青の粒。", "#4D6F9F", "sparkle", 54]
  ];

  const particles = particleSeeds.map(function (seed, index) {
    return {
      id: seed[0],
      kind: "particle",
      name: seed[1],
      desc: seed[2],
      color: seed[3],
      shape: seed[4],
      cost: seed[5],
      free: Boolean(seed[6]),
      rarity: index >= 38 ? "SR" : index >= 18 ? "R" : "N"
    };
  });

  const frames = [
    { id: "frame_wood", kind: "frame", name: "木の額縁", desc: "最初から使える木のフレーム。", cost: 0, free: true, css: "frame-wood", rarity: "N" },
    { id: "frame_moss", kind: "frame", name: "苔むした石", desc: "サバイバル感のあるフレーム。", cost: 18, css: "frame-moss", rarity: "N" },
    { id: "frame_orange", kind: "frame", name: "夕焼けレンガ", desc: "暖かいオレンジのフレーム。", cost: 24, css: "frame-orange", rarity: "N" },
    { id: "frame_gold", kind: "frame", name: "金リンゴ枠", desc: "UHC KINGっぽい金色。", cost: 45, css: "frame-gold", rarity: "R" },
    { id: "frame_diamond", kind: "frame", name: "ダイヤの角丸", desc: "淡いダイヤ色のフレーム。", cost: 50, css: "frame-diamond", rarity: "R" },
    { id: "frame_command", kind: "frame", name: "コマンドブロック枠", desc: "Admin風の紫フレーム。", cost: 80, css: "frame-command", rarity: "SR" },
    { id: "frame_blade", kind: "frame", name: "PVP斬撃枠", desc: "剣の光が走るフレーム。", cost: 70, css: "frame-blade", rarity: "SR" },
    { id: "frame_blue", kind: "frame", name: "青エンチャント枠", desc: "Sword God風の青い枠。", cost: 90, css: "frame-blue", rarity: "SR" },
    { id: "frame_shadow", kind: "frame", name: "闇影フレーム", desc: "SSアイテムに似合う闇色。", cost: 120, css: "frame-shadow", rarity: "SS" },
    { id: "frame_tofu", kind: "frame", name: "お豆腐ふわ枠", desc: "やわらかい白い枠。", cost: 60, css: "frame-tofu", rarity: "R" },
    { id: "frame_maid", kind: "frame", name: "メイドリボン枠", desc: "ピンクのリボン付き。", cost: 75, css: "frame-maid", rarity: "SR" },
    { id: "frame_legend", kind: "frame", name: "伝説レア枠", desc: "闇と炎が混ざった特別枠。", cost: 160, css: "frame-legend", rarity: "SS" }
  ];

  const backgrounds = [
    { id: "bg_cream", kind: "background", name: "クリーム手帳", desc: "最初から使える基本背景。", cost: 0, free: true, css: "bg-cream", rarity: "N" },
    { id: "bg_meadow", kind: "background", name: "草原の朝", desc: "Retbareの朝っぽい背景。", cost: 20, css: "bg-meadow", rarity: "N" },
    { id: "bg_sunset", kind: "background", name: "夕焼け拠点", desc: "オレンジがやさしい背景。", cost: 28, css: "bg-sunset", rarity: "N" },
    { id: "bg_blue_moon", kind: "background", name: "月夜の青", desc: "青い夜の背景。", cost: 42, css: "bg-blue-moon", rarity: "R" },
    { id: "bg_command", kind: "background", name: "管理者ルーム", desc: "コマンドブロック風。", cost: 80, css: "bg-command", rarity: "SR" },
    { id: "bg_gold", kind: "background", name: "UHCゴールド", desc: "金リンゴと相性抜群。", cost: 80, css: "bg-gold", rarity: "SR" },
    { id: "bg_pvp", kind: "background", name: "PVPアリーナ", desc: "斬撃が映える背景。", cost: 70, css: "bg-pvp", rarity: "SR" },
    { id: "bg_dark", kind: "background", name: "闇の森", desc: "闇のペンギン向け。", cost: 110, css: "bg-dark", rarity: "SS" },
    { id: "bg_lapis", kind: "background", name: "ラピス水晶洞", desc: "青く光る洞窟。", cost: 85, css: "bg-lapis", rarity: "SR" },
    { id: "bg_sakura", kind: "background", name: "桜の小道", desc: "淡いピンク背景。", cost: 55, css: "bg-sakura", rarity: "R" },
    { id: "bg_campfire", kind: "background", name: "焚き火の夜", desc: "キャンプ感のある背景。", cost: 60, css: "bg-campfire", rarity: "R" },
    { id: "bg_end", kind: "background", name: "エンドの余韻", desc: "紫のふしぎ背景。", cost: 95, css: "bg-end", rarity: "SR" },
    { id: "bg_ocean", kind: "background", name: "海辺の泡", desc: "海っぽい淡い背景。", cost: 50, css: "bg-ocean", rarity: "R" },
    { id: "bg_notebook", kind: "background", name: "ほぼ日ノート", desc: "手帳っぽい罫線背景。", cost: 35, css: "bg-notebook", rarity: "N" }
  ];

  const auras = [
    { id: "aura_none", kind: "aura", name: "オーラなし", desc: "落ち着いた通常表示。", cost: 0, free: true, css: "aura-none", rarity: "N" },
    { id: "aura_leaf", kind: "aura", name: "木の葉オーラ", desc: "葉っぱがふわっと漂う。", cost: 35, css: "aura-leaf", rarity: "R" },
    { id: "aura_blue", kind: "aura", name: "青エンチャントオーラ", desc: "386ede向けの青い光。", cost: 90, css: "aura-blue", rarity: "SR" },
    { id: "aura_king", kind: "aura", name: "王冠オーラ", desc: "UHC KING向け。", cost: 85, css: "aura-king", rarity: "SR" },
    { id: "aura_slash", kind: "aura", name: "斬撃オーラ", desc: "PVP crown向け。", cost: 85, css: "aura-slash", rarity: "SR" },
    { id: "aura_command", kind: "aura", name: "Admin走査線", desc: "管理者っぽい紫の走査線。", cost: 95, css: "aura-command", rarity: "SR" },
    { id: "aura_dark", kind: "aura", name: "闇のオーラ", desc: "闇の粒が漂う。", cost: 120, css: "aura-dark", rarity: "SS" },
    { id: "aura_fire", kind: "aura", name: "炎の波乗りオーラ", desc: "炎ガチャと相性抜群。", cost: 120, css: "aura-fire", rarity: "SS" },
    { id: "aura_heart", kind: "aura", name: "メイドハート", desc: "かわいいハート演出。", cost: 80, css: "aura-heart", rarity: "SR" },
    { id: "aura_rainbow", kind: "aura", name: "にじいろ薄光", desc: "控えめな虹の光。", cost: 100, css: "aura-rainbow", rarity: "SR" },
    { id: "aura_legend", kind: "aura", name: "伝説闇炎オーラ", desc: "融合アイテム向けの最上位演出。", cost: 180, css: "aura-legend", rarity: "SS" }
  ];

  const catalog = particles.concat(frames, backgrounds, auras);

  const gachaItems = [
    {
      id: "dark_penguin",
      name: "闇のペンギン",
      rarity: "SS",
      weight: 1,
      desc: "386edeが最初から所持する最高SSアイテム。",
      svg: darkPenguinSvg
    },
    {
      id: "magma_surfer",
      name: "炎獄のマグマサーファー",
      rarity: "SS",
      weight: 1,
      desc: "炎をまとって迫ってくるSSアイテム。",
      svg: magmaSurferSvg
    },
    {
      id: "tofu_mental",
      name: "お豆腐メンタルなんです・・",
      rarity: "SR",
      weight: 5,
      desc: "4y44が最初から所持する、結構レアな癒しアイテム。",
      svg: tofuSvg
    },
    {
      id: "muki_maid",
      name: "むきメイド",
      rarity: "SR",
      weight: 4,
      desc: "Mukisukinoが所持。かわいいからムキムキへ変身。",
      svg: mukiMaidSvg
    },
    {
      id: "maid_and_muscle",
      name: "メイドとムキムキ",
      rarity: "SSR",
      weight: 2,
      desc: "Mukisukinoが所持。並び立つメイドとムキムキ。",
      svg: maidAndMuscleSvg
    },
    {
      id: "grass_charm",
      name: "草ブロックのお守り",
      rarity: "R",
      weight: 12,
      desc: "ほっとする草ブロックのお守り。",
      svg: function () { return simpleCharmSvg("草", "#6FA86B", "#3E6B43"); }
    },
    {
      id: "lapis_bell",
      name: "ラピスの鈴",
      rarity: "R",
      weight: 10,
      desc: "青く小さく鳴る鈴。",
      svg: function () { return simpleCharmSvg("鈴", "#5D8BB0", "#304F7A"); }
    },
    {
      id: "pumpkin_cat",
      name: "かぼちゃ猫",
      rarity: "R",
      weight: 10,
      desc: "ハロウィンっぽい猫。",
      svg: function () { return simpleCharmSvg("猫", "#E08A4B", "#8A4A2B"); }
    },
    {
      id: "diamond_piece",
      name: "ダイヤの欠片",
      rarity: "SR",
      weight: 6,
      desc: "きらっと光るダイヤの欠片。",
      svg: function () { return simpleCharmSvg("◇", "#7FD3E6", "#386A80"); }
    },
    {
      id: "gold_apple_badge",
      name: "金リンゴバッジ",
      rarity: "SR",
      weight: 6,
      desc: "金リンゴ風のバッジ。",
      svg: function () { return simpleCharmSvg("🍎", "#E0AB4B", "#8A6A2A"); }
    },
    {
      id: "pvp_spark",
      name: "PVP火花",
      rarity: "SR",
      weight: 7,
      desc: "剣がぶつかった瞬間の火花。",
      svg: function () { return simpleCharmSvg("剣", "#C8D6DD", "#3A332B"); }
    },
    {
      id: "retbare_note",
      name: "retbare手帳シール",
      rarity: "R",
      weight: 14,
      desc: "ほぼ日手帳っぽいシール。",
      svg: function () { return simpleCharmSvg("rH", "#FFFDF7", "#6FA86B"); }
    }
  ];

  const fusionItem = {
    id: "legend_dark_magma_penguin",
    name: "闇炎覇王ペンギン・インフェルノ",
    rarity: "伝説レア",
    needs: ["dark_penguin", "magma_surfer"],
    desc: "闇のペンギンと炎獄のマグマサーファーを融合して生まれる伝説レア。",
    svg: legendaryFusionSvg
  };

  function getItem(id) {
    return catalog.find(function (item) { return item.id === id; }) || null;
  }

  function getGachaItem(id) {
    if (id === fusionItem.id) return fusionItem;
    return gachaItems.find(function (item) { return item.id === id; }) || null;
  }

  function renderGachaSvg(id) {
    const item = getGachaItem(id);
    if (!item) return "";
    return item.svg();
  }

  function rarityClass(rarity) {
    if (rarity === "伝説レア") return "rarity-legend";
    return "rarity-" + String(rarity || "N").toLowerCase();
  }

  function darkPenguinSvg() {
    return `
      <svg viewBox="0 0 500 300" class="special-svg dark-penguin-svg" aria-hidden="true">
        <defs>
          <style>
            @keyframes dp-run { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
            @keyframes dp-wing { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(9deg)} }
            @keyframes dp-aura { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:.85;transform:scale(1.08)} }
            @keyframes dp-wind { from{transform:translateX(0);opacity:.8} to{transform:translateX(-150px);opacity:0} }
            .dp-body{animation:dp-run .38s infinite ease-in-out;transform-origin:230px 180px}
            .dp-wing{animation:dp-wing .42s infinite ease-in-out;transform-origin:260px 160px}
            .dp-aura{animation:dp-aura 2s infinite ease-in-out;transform-origin:230px 150px}
            .dp-wind{animation:dp-wind .65s infinite linear}
          </style>
          <radialGradient id="dpDark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#5500AA" stop-opacity=".75"/>
            <stop offset="55%" stop-color="#1A0033" stop-opacity=".55"/>
            <stop offset="100%" stop-color="#000011" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse class="dp-aura" cx="230" cy="155" rx="145" ry="105" fill="url(#dpDark)"/>
        <g opacity=".55">
          <rect class="dp-wind" x="360" y="92" width="95" height="5" rx="2" fill="#333"/>
          <rect class="dp-wind" x="390" y="142" width="80" height="4" rx="2" fill="#555" style="animation-delay:.18s"/>
          <rect class="dp-wind" x="350" y="205" width="120" height="5" rx="2" fill="#444" style="animation-delay:.35s"/>
        </g>
        <g class="dp-body">
          <polygon points="155,130 102,245 185,220" fill="#160020"/>
          <rect x="170" y="108" width="112" height="112" rx="12" fill="#0D0D1A"/>
          <rect x="188" y="128" width="74" height="86" rx="10" fill="#30303F"/>
          <g class="dp-wing">
            <rect x="270" y="138" width="44" height="70" rx="8" fill="#17172A"/>
            <rect x="304" y="155" width="16" height="38" rx="5" fill="#0D0D1A"/>
          </g>
          <rect x="190" y="82" width="58" height="38" rx="8" fill="#0D0D1A"/>
          <rect x="172" y="48" width="92" height="55" rx="10" fill="#0D0D1A"/>
          <rect x="185" y="64" width="65" height="30" rx="6" fill="#3A3A4A"/>
          <rect x="185" y="74" width="68" height="17" rx="5" fill="#1A0033"/>
          <rect x="198" y="67" width="12" height="12" fill="#fff"/>
          <rect x="201" y="70" width="7" height="7" fill="#f00"/>
          <rect x="222" y="67" width="16" height="13" fill="#fff"/>
          <rect x="225" y="70" width="10" height="8" fill="#f00"/>
          <polygon points="242,84 275,81 247,96" fill="#CC6600"/>
          <rect x="168" y="38" width="13" height="18" fill="#220044"/>
          <rect x="252" y="39" width="13" height="18" fill="#220044"/>
          <rect x="178" y="215" width="25" height="42" fill="#080812"/>
          <rect x="225" y="215" width="28" height="46" fill="#141428"/>
          <rect x="171" y="252" width="40" height="10" rx="3" fill="#222"/>
          <rect x="218" y="256" width="45" height="10" rx="3" fill="#222"/>
        </g>
        <circle cx="175" cy="120" r="8" fill="#6600CC" opacity=".7"/>
        <circle cx="295" cy="185" r="10" fill="#330066" opacity=".65"/>
        <circle cx="150" cy="190" r="6" fill="#5500AA" opacity=".55"/>
      </svg>
    `;
  }

  function magmaSurferSvg() {
    return `
      <svg viewBox="0 0 500 400" class="special-svg magma-svg" aria-hidden="true">
        <defs>
          <style>
            @keyframes mg-approach {0%{transform:translate(-140px,70px) scale(.55);opacity:.75} 55%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(115px,-45px) scale(1.55);opacity:.35}}
            @keyframes mg-rock {0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)}}
            @keyframes mg-pulse {0%,100%{opacity:.65;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)}}
            @keyframes mg-line {from{transform:translateX(-120px);opacity:.1} to{transform:translateX(220px) scaleX(1.8);opacity:0}}
            .mg-main{animation:mg-approach 2.2s infinite ease-in-out;transform-origin:250px 230px}
            .mg-board{animation:mg-rock .45s infinite ease-in-out;transform-origin:250px 280px}
            .mg-core{animation:mg-pulse .7s infinite ease-in-out;transform-origin:center}
            .mg-line{animation:mg-line .6s infinite linear}
          </style>
          <radialGradient id="mgCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fff"/>
            <stop offset="35%" stop-color="#ffff55"/>
            <stop offset="70%" stop-color="#ff6600"/>
            <stop offset="100%" stop-color="#330000"/>
          </radialGradient>
        </defs>
        <g opacity=".45">
          <rect class="mg-line" x="30" y="80" width="180" height="5" rx="2" fill="#FF6600"/>
          <rect class="mg-line" x="5" y="180" width="220" height="4" rx="2" fill="#FF4400" style="animation-delay:.2s"/>
          <rect class="mg-line" x="55" y="300" width="170" height="5" rx="2" fill="#FFAA00" style="animation-delay:.4s"/>
        </g>
        <g class="mg-main">
          <g opacity=".8">
            <polygon points="190,250 70,315 105,225" fill="#FF4400"/>
            <polygon points="310,250 430,315 395,225" fill="#FF6600"/>
          </g>
          <g class="mg-board">
            <ellipse cx="250" cy="282" rx="105" ry="28" fill="#2A0000"/>
            <ellipse class="mg-core" cx="250" cy="278" rx="90" ry="20" fill="url(#mgCore)"/>
            <ellipse cx="250" cy="278" rx="98" ry="23" fill="none" stroke="#FFAA00" stroke-width="3"/>
          </g>
          <rect x="202" y="235" width="25" height="45" rx="5" fill="#1A0500"/>
          <rect x="272" y="235" width="28" height="48" rx="5" fill="#140400"/>
          <rect x="195" y="120" width="110" height="132" rx="14" fill="#1A0000"/>
          <rect x="208" y="138" width="84" height="12" fill="#FF4400"/>
          <rect x="216" y="168" width="70" height="10" fill="#FF8800"/>
          <rect x="225" y="200" width="52" height="9" fill="#FF4400"/>
          <ellipse class="mg-core" cx="250" cy="164" rx="30" ry="36" fill="url(#mgCore)"/>
          <rect x="220" y="58" width="65" height="55" rx="10" fill="#140000"/>
          <rect x="212" y="48" width="82" height="15" fill="#FF2200"/>
          <polygon points="212,50 190,28 201,58" fill="#FF8800"/>
          <polygon points="294,50 315,28 304,58" fill="#FF8800"/>
          <rect x="230" y="75" width="16" height="11" fill="#FFFF00"/>
          <rect x="260" y="75" width="16" height="11" fill="#FFFF00"/>
          <rect x="241" y="92" width="25" height="8" fill="#FF0000"/>
          <ellipse cx="360" cy="200" rx="22" ry="26" fill="#FF2200"/>
        </g>
      </svg>
    `;
  }

  function legendaryFusionSvg() {
    return `
      <svg viewBox="0 0 800 600" class="special-svg legend-svg" aria-hidden="true">
        <defs>
          <style>
            @keyframes lg-approach {0%{transform:translate(-350px,160px) scale(.25);opacity:.6} 45%{transform:translate(-60px,30px) scale(.85);opacity:1} 75%{transform:translate(90px,-35px) scale(1.25);opacity:1} 100%{transform:translate(280px,-120px) scale(2.1);opacity:0}}
            @keyframes lg-aura {0%,100%{transform:scale(1) rotate(0);opacity:.5}50%{transform:scale(1.12) rotate(2deg);opacity:.9}}
            @keyframes lg-board {0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
            @keyframes lg-line {from{transform:translateX(160px);opacity:1}to{transform:translateX(-650px) scaleX(2);opacity:0}}
            .lg-main{animation:lg-approach 3s infinite cubic-bezier(.35,0,.2,1);transform-origin:400px 300px}
            .lg-aura{animation:lg-aura 1.8s infinite ease-in-out;transform-origin:400px 300px}
            .lg-board{animation:lg-board .5s infinite ease-in-out;transform-origin:400px 430px}
            .lg-line{animation:lg-line .45s infinite linear}
          </style>
          <radialGradient id="lgAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FF8800"/>
            <stop offset="45%" stop-color="#880044"/>
            <stop offset="100%" stop-color="#060010"/>
          </radialGradient>
          <radialGradient id="lgCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="25%" stop-color="#FFFF88"/>
            <stop offset="70%" stop-color="#FF2200"/>
            <stop offset="100%" stop-color="#220044"/>
          </radialGradient>
        </defs>
        <g opacity=".65">
          <rect class="lg-line" x="600" y="70" width="230" height="5" rx="2" fill="#FFAA00"/>
          <rect class="lg-line" x="650" y="170" width="180" height="4" rx="2" fill="#FF4400" style="animation-delay:.1s"/>
          <rect class="lg-line" x="580" y="290" width="240" height="6" rx="2" fill="#CC0044" style="animation-delay:.2s"/>
          <rect class="lg-line" x="640" y="430" width="190" height="5" rx="2" fill="#FF6600" style="animation-delay:.3s"/>
        </g>
        <g class="lg-main">
          <ellipse class="lg-aura" cx="400" cy="300" rx="190" ry="220" fill="url(#lgAura)" opacity=".55"/>
          <ellipse class="lg-aura" cx="400" cy="300" rx="130" ry="155" fill="#FF2200" opacity=".25" style="animation-delay:.4s"/>
          <g class="lg-board">
            <ellipse cx="405" cy="438" rx="135" ry="36" fill="#100000"/>
            <ellipse cx="400" cy="430" rx="122" ry="30" fill="url(#lgAura)"/>
            <ellipse cx="400" cy="428" rx="90" ry="18" fill="url(#lgCore)"/>
            <ellipse cx="400" cy="428" rx="112" ry="25" fill="none" stroke="#FFAA00" stroke-width="4"/>
          </g>
          <polygon points="300,280 175,430 220,445 270,390" fill="#0D001A"/>
          <polygon points="500,270 625,420 580,435 530,385" fill="#220044"/>
          <rect x="312" y="182" width="176" height="200" rx="18" fill="#050008"/>
          <rect x="330" y="210" width="140" height="12" fill="#FF0000"/>
          <rect x="340" y="250" width="120" height="12" fill="#FF8800"/>
          <rect x="350" y="295" width="100" height="10" fill="#FF4400"/>
          <ellipse cx="400" cy="252" rx="47" ry="58" fill="url(#lgCore)"/>
          <ellipse cx="292" cy="215" rx="35" ry="45" fill="#FF2200"/>
          <ellipse cx="510" cy="210" rx="38" ry="48" fill="#FF6600"/>
          <rect x="340" y="82" width="120" height="76" rx="12" fill="#050008"/>
          <rect x="335" y="72" width="132" height="18" fill="#FF2200"/>
          <polygon points="340,86 300,45 315,92" fill="#330066"/>
          <polygon points="460,86 505,38 485,94" fill="#FF6600"/>
          <rect x="370" y="106" width="24" height="16" fill="#FF0000"/>
          <rect x="376" y="110" width="12" height="7" fill="#FFFFFF"/>
          <rect x="408" y="106" width="24" height="16" fill="#FF0000"/>
          <rect x="414" y="110" width="12" height="7" fill="#FFFFFF"/>
          <rect x="385" y="136" width="31" height="12" fill="#FF0000"/>
          <ellipse cx="542" cy="272" rx="32" ry="37" fill="#FF2200"/>
          <g transform="rotate(15 565 240)">
            <rect x="555" y="95" width="22" height="188" fill="#FF0000"/>
            <rect x="560" y="105" width="12" height="168" fill="#FFFFFF"/>
            <rect x="558" y="282" width="16" height="55" fill="#330066"/>
            <rect x="546" y="275" width="40" height="9" fill="#FFAA00"/>
          </g>
          <rect x="332" y="360" width="36" height="78" fill="#0D001A"/>
          <rect x="430" y="358" width="40" height="80" fill="#080012"/>
        </g>
      </svg>
    `;
  }

  function tofuSvg() {
    return `
      <svg viewBox="0 0 500 400" class="special-svg tofu-svg" aria-hidden="true">
        <defs>
          <style>
            @keyframes tf-appear{0%{transform:translateY(70px) scale(.7);opacity:0}70%{opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
            @keyframes tf-wobble{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
            @keyframes tf-sweat{from{transform:translateY(0);opacity:.8}to{transform:translateY(20px);opacity:0}}
            .tf-main{animation:tf-appear 1.6s ease-out both, tf-wobble 3s 1.6s infinite ease-in-out;transform-origin:250px 220px}
            .tf-sweat{animation:tf-sweat 1.4s infinite linear}
          </style>
        </defs>
        <rect width="500" height="400" rx="24" fill="#FFF8F0"/>
        <ellipse cx="250" cy="220" rx="180" ry="130" fill="#FFE4C4" opacity=".35"/>
        <g class="tf-main">
          <ellipse cx="255" cy="295" rx="86" ry="24" fill="#E8DCC8" opacity=".7"/>
          <rect x="165" y="218" width="170" height="76" rx="8" fill="#F0E6D2"/>
          <rect x="160" y="168" width="180" height="74" rx="14" fill="#FFFFFF"/>
          <rect x="176" y="185" width="148" height="8" fill="#FFF8F0"/>
          <rect x="205" y="205" width="11" height="13" rx="3" fill="#5C4033"/>
          <rect x="286" y="205" width="11" height="13" rx="3" fill="#5C4033"/>
          <rect x="243" y="226" width="15" height="6" rx="3" fill="#D4A5A5"/>
          <ellipse cx="195" cy="220" rx="13" ry="8" fill="#FFDAB9" opacity=".55"/>
          <ellipse cx="306" cy="220" rx="13" ry="8" fill="#FFDAB9" opacity=".55"/>
          <rect class="tf-sweat" x="332" y="194" width="8" height="13" rx="4" fill="#87CEEB"/>
          <rect class="tf-sweat" x="160" y="190" width="7" height="11" rx="3" fill="#87CEEB" style="animation-delay:.4s"/>
        </g>
        <rect x="120" y="318" width="260" height="52" rx="14" fill="#FFFFFF" stroke="#E8DCC8" stroke-width="2"/>
        <text x="250" y="351" font-family="sans-serif" font-size="18" fill="#5C4033" text-anchor="middle" font-weight="700">お豆腐メンタルなんです・・</text>
      </svg>
    `;
  }

  function mukiMaidSvg() {
    return `
      <svg viewBox="0 0 600 500" class="special-svg muki-maid-svg" aria-hidden="true">
        <defs>
          <style>
            @keyframes mm-cute{0%,38%{opacity:1}50%{opacity:.35}65%,100%{opacity:0}}
            @keyframes mm-muki{0%,42%{opacity:0}58%{opacity:.7}70%,100%{opacity:1}}
            @keyframes mm-flash{0%,38%,70%,100%{opacity:0}45%{opacity:.85}58%{opacity:.35}}
            @keyframes mm-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
            .mm-cute{animation:mm-cute 6s infinite}
            .mm-muki{animation:mm-muki 6s infinite, mm-breathe 1.5s infinite ease-in-out;transform-origin:300px 300px}
            .mm-flash{animation:mm-flash 6s infinite}
          </style>
        </defs>
        <rect width="600" height="500" fill="#FFF0F5"/>
        <ellipse cx="300" cy="250" rx="210" ry="180" fill="#FFE4E1"/>
        <rect class="mm-flash" width="600" height="500" fill="#fff"/>
        <g class="mm-cute">
          <ellipse cx="300" cy="420" rx="75" ry="20" fill="#E8D0D8"/>
          <path d="M240 320 Q220 385 200 405 Q250 415 300 410 Q350 415 400 405 Q380 385 360 320Z" fill="#FF69B4"/>
          <path d="M265 280 L250 385 L300 395 L350 385 L335 280Z" fill="#fff"/>
          <rect x="255" y="220" width="90" height="110" rx="15" fill="#FFB6C1"/>
          <ellipse cx="300" cy="160" rx="55" ry="50" fill="#FFF0E8"/>
          <path d="M260 120 Q280 145 300 130 Q320 145 340 120 Q330 100 300 95 Q270 100 260 120" fill="#8B4513"/>
          <ellipse cx="275" cy="155" rx="14" ry="16" fill="#fff"/>
          <ellipse cx="275" cy="155" rx="8" ry="10" fill="#4169E1"/>
          <ellipse cx="325" cy="155" rx="14" ry="16" fill="#fff"/>
          <ellipse cx="325" cy="155" rx="8" ry="10" fill="#4169E1"/>
          <path d="M290 180 Q300 188 310 180" fill="none" stroke="#D48484" stroke-width="3" stroke-linecap="round"/>
          <rect x="245" y="105" width="110" height="12" rx="4" fill="#1A1A2E"/>
          <rect x="285" y="95" width="30" height="15" rx="3" fill="#FF1493"/>
        </g>
        <g class="mm-muki">
          <ellipse cx="300" cy="250" rx="180" ry="220" fill="#FF0000" opacity=".18"/>
          <ellipse cx="300" cy="430" rx="125" ry="30" fill="#1A0A0A" opacity=".55"/>
          <path d="M220 340 Q180 405 160 425 Q250 440 300 435 Q350 440 440 425 Q420 405 380 340Z" fill="#CC0044"/>
          <ellipse cx="170" cy="280" rx="45" ry="75" fill="#E8C4A0" transform="rotate(-15 170 280)"/>
          <ellipse cx="430" cy="270" rx="55" ry="85" fill="#D4A574" transform="rotate(20 430 270)"/>
          <ellipse cx="270" cy="270" rx="58" ry="52" fill="#E8C4A0"/>
          <ellipse cx="330" cy="270" rx="58" ry="52" fill="#E8C4A0"/>
          <rect x="275" y="310" width="50" height="70" rx="6" fill="#E8C4A0"/>
          <rect x="285" y="180" width="35" height="50" rx="8" fill="#D4A574"/>
          <ellipse cx="300" cy="145" rx="60" ry="55" fill="#F5D0C0"/>
          <path d="M245 120 Q200 95 180 75 Q190 120 240 150" fill="#5D2F0D"/>
          <path d="M355 120 Q405 95 425 70 Q410 120 360 150" fill="#5D2F0D"/>
          <polygon points="270,135 292,145 270,155" fill="#fff"/>
          <polygon points="330,135 308,145 330,155" fill="#fff"/>
          <rect x="285" y="165" width="30" height="18" rx="3" fill="#440000"/>
          <rect x="235" y="85" width="130" height="15" rx="5" fill="#111"/>
          <rect x="280" y="70" width="40" height="18" rx="4" fill="#FF0066"/>
        </g>
        <rect x="150" y="30" width="300" height="45" rx="15" fill="#fff" stroke="#FF69B4" stroke-width="3"/>
        <text x="300" y="62" font-family="sans-serif" font-size="22" fill="#CC0044" text-anchor="middle" font-weight="900">ムキムキに変身しました…</text>
      </svg>
    `;
  }

  function maidAndMuscleSvg() {
    return `
      <svg viewBox="0 0 700 500" class="special-svg maid-muscle-svg" aria-hidden="true">
        <defs>
          <style>
            @keyframes mam-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
            @keyframes mam-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
            .mam-maid{animation:mam-idle 2s infinite ease-in-out;transform-origin:220px 250px}
            .mam-muki{animation:mam-breathe 1.4s infinite ease-in-out;transform-origin:480px 270px}
          </style>
        </defs>
        <g class="mam-maid">
          <ellipse cx="220" cy="460" rx="60" ry="15" fill="#000" opacity=".18"/>
          <path d="M170 340 Q150 420 130 450 Q180 460 220 455 Q260 460 310 450 Q290 420 270 340Z" fill="#FF69B4"/>
          <path d="M195 280 L180 420 L220 430 L260 420 L245 280Z" fill="#fff"/>
          <rect x="185" y="240" width="70" height="110" rx="12" fill="#FFB6C1"/>
          <ellipse cx="220" cy="180" rx="45" ry="42" fill="#FFF0E8"/>
          <path d="M180 145 Q200 165 220 150 Q240 165 260 145 Q245 130 220 125 Q195 130 180 145" fill="#5D2F0D"/>
          <ellipse cx="200" cy="175" rx="12" ry="14" fill="#fff"/>
          <ellipse cx="200" cy="175" rx="7" ry="9" fill="#4169E1"/>
          <ellipse cx="240" cy="175" rx="12" ry="14" fill="#fff"/>
          <ellipse cx="240" cy="175" rx="7" ry="9" fill="#4169E1"/>
          <path d="M215 200 Q220 206 225 200" fill="none" stroke="#D48484" stroke-width="3" stroke-linecap="round"/>
          <rect x="185" y="135" width="70" height="10" rx="3" fill="#1A1A2E"/>
        </g>
        <g class="mam-muki">
          <ellipse cx="480" cy="470" rx="100" ry="25" fill="#000" opacity=".22"/>
          <polygon points="380,280 320,420 360,440 400,400" fill="#1A0033"/>
          <polygon points="580,270 640,410 600,430 560,390" fill="#1A0033"/>
          <ellipse cx="370" cy="290" rx="45" ry="75" fill="#D4A574" transform="rotate(-20 370 290)"/>
          <ellipse cx="590" cy="280" rx="55" ry="85" fill="#D4A574" transform="rotate(20 590 280)"/>
          <ellipse cx="435" cy="285" rx="60" ry="55" fill="#E8C4A0"/>
          <ellipse cx="525" cy="285" rx="60" ry="55" fill="#D4A574"/>
          <rect x="445" y="330" width="70" height="85" rx="6" fill="#E8C4A0"/>
          <rect x="455" y="185" width="50" height="55" rx="10" fill="#D4A574"/>
          <ellipse cx="480" cy="155" rx="55" ry="50" fill="#E8C4A0"/>
          <path d="M425 130 Q440 100 480 95 Q520 100 535 130 Q510 110 480 110 Q450 110 425 130" fill="#1A0A05"/>
          <polygon points="455,145 475,152 455,160" fill="#fff"/>
          <polygon points="505,145 485,152 505,160" fill="#fff"/>
          <rect x="465" y="178" width="30" height="8" rx="2" fill="#8B0000"/>
        </g>
      </svg>
    `;
  }

  function simpleCharmSvg(label, color, dark) {
    return `
      <svg viewBox="0 0 360 260" class="special-svg simple-charm-svg" aria-hidden="true">
        <defs>
          <style>
            @keyframes sc-pop{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(2deg)}}
            .sc-main{animation:sc-pop 2.2s infinite ease-in-out;transform-origin:180px 130px}
          </style>
        </defs>
        <rect width="360" height="260" rx="28" fill="#FFFDF7"/>
        <ellipse cx="180" cy="145" rx="120" ry="85" fill="${color}" opacity=".18"/>
        <g class="sc-main">
          <rect x="100" y="58" width="160" height="140" rx="28" fill="${color}" stroke="${dark}" stroke-width="8"/>
          <rect x="122" y="80" width="116" height="96" rx="20" fill="#FFFDF7" opacity=".78"/>
          <text x="180" y="146" font-family="sans-serif" font-size="54" fill="${dark}" text-anchor="middle" font-weight="900">${label}</text>
        </g>
      </svg>
    `;
  }

  window.RHItemLib = {
    catalog: catalog,
    gachaItems: gachaItems,
    fusionItem: fusionItem,
    getItem: getItem,
    getGachaItem: getGachaItem,
    renderGachaSvg: renderGachaSvg,
    rarityClass: rarityClass
  };
})();
