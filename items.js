/* items.js
   RetBareHUB アイテム・称号・初期データ完全版
   SVGは全部インライン表示。imgで潰さないので「変な四角」にならない。
*/

(function () {
  const SERVER_IP = "110.67.56.168:25565";

  const S = {};

  S.darkPenguin = `
<svg class="svg-art svg-dark-penguin" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .px{shape-rendering:crispEdges}
      @keyframes dpRun{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
      @keyframes dpLegA{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-18deg)}}
      @keyframes dpLegB{0%,100%{transform:rotate(0deg)}50%{transform:rotate(18deg)}}
      @keyframes dpAura{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}
      @keyframes dpWind{0%{transform:translateX(80px);opacity:.85}100%{transform:translateX(-160px);opacity:0}}
      @keyframes dpEye{0%,100%{opacity:.65}50%{opacity:1}}
      .body{animation:dpRun .42s infinite ease-in-out;transform-origin:220px 160px}
      .legA{animation:dpLegA .42s infinite ease-in-out;transform-origin:180px 230px}
      .legB{animation:dpLegB .42s infinite ease-in-out;transform-origin:235px 230px}
      .aura{animation:dpAura 2s infinite ease-in-out;transform-origin:220px 150px}
      .wind{animation:dpWind .7s infinite linear}
      .eye{animation:dpEye 1s infinite}
    </style>
    <radialGradient id="dpG" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#7d20ff" stop-opacity=".75"/>
      <stop offset="55%" stop-color="#210033" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g class="aura">
    <ellipse cx="225" cy="158" rx="135" ry="108" fill="url(#dpG)"/>
    <ellipse cx="225" cy="158" rx="82" ry="62" fill="#120018" opacity=".55"/>
  </g>
  <g opacity=".55">
    <rect class="wind" x="340" y="72" width="110" height="5" rx="3" fill="#28212c"/>
    <rect class="wind" x="380" y="124" width="100" height="4" rx="3" fill="#3d3342" style="animation-delay:.14s"/>
    <rect class="wind" x="350" y="205" width="130" height="6" rx="3" fill="#15121a" style="animation-delay:.28s"/>
    <rect class="wind" x="390" y="260" width="110" height="5" rx="3" fill="#28212c" style="animation-delay:.42s"/>
  </g>
  <g class="body">
    <polygon points="165,125 90,245 180,218" fill="#12001f" class="px"/>
    <polygon points="165,125 112,230 174,208" fill="#2d0750" class="px"/>
    <g class="legA">
      <rect x="165" y="210" width="24" height="42" fill="#080813" class="px"/>
      <rect x="158" y="247" width="38" height="12" fill="#17172c" class="px"/>
    </g>
    <g class="legB">
      <rect x="222" y="210" width="28" height="44" fill="#101026" class="px"/>
      <rect x="214" y="250" width="44" height="13" fill="#1c1c35" class="px"/>
    </g>
    <rect x="155" y="108" width="120" height="118" rx="10" fill="#090913" class="px"/>
    <rect x="174" y="126" width="82" height="95" rx="9" fill="#303044" class="px"/>
    <rect x="197" y="148" width="36" height="32" fill="#1b0033" opacity=".9" class="px"/>
    <polygon points="215,151 230,174 199,174" fill="#8f25ff" opacity=".65" class="px"/>
    <rect x="270" y="140" width="40" height="70" rx="8" fill="#17172c" class="px"/>
    <rect x="125" y="142" width="34" height="65" rx="8" fill="#070711" class="px"/>
    <rect x="184" y="82" width="56" height="38" fill="#090913" class="px"/>
    <rect x="168" y="46" width="92" height="58" rx="10" fill="#090913" class="px"/>
    <rect x="180" y="62" width="66" height="34" rx="8" fill="#3a3a50" class="px"/>
    <rect x="176" y="74" width="76" height="18" rx="5" fill="#210033" class="px"/>
    <rect x="193" y="67" width="12" height="12" fill="#fff" class="px"/>
    <rect x="196" y="70" width="7" height="7" fill="#e60020" class="px"/>
    <rect class="eye" x="198" y="71" width="3" height="3" fill="#fff" class="px"/>
    <rect x="216" y="66" width="16" height="14" fill="#fff" class="px"/>
    <rect x="219" y="69" width="11" height="8" fill="#ff001e" class="px"/>
    <rect class="eye" x="222" y="70" width="4" height="3" fill="#fff" class="px"/>
    <polygon points="235,84 270,81 240,99" fill="#d36b00" class="px"/>
    <rect x="164" y="37" width="15" height="21" fill="#210033" class="px"/>
    <rect x="248" y="38" width="15" height="22" fill="#210033" class="px"/>
  </g>
  <g opacity=".8">
    <circle cx="150" cy="90" r="8" fill="#7d20ff">
      <animate attributeName="cy" values="90;55;90" dur="1.7s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values=".8;0;.8" dur="1.7s" repeatCount="indefinite"/>
    </circle>
    <circle cx="290" cy="205" r="11" fill="#3d006b">
      <animate attributeName="cy" values="205;160;205" dur="1.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values=".7;0;.7" dur="1.4s" repeatCount="indefinite"/>
    </circle>
  </g>
</svg>`;

  S.blazeSurfer = `
<svg class="svg-art svg-blaze-surfer" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .px{shape-rendering:crispEdges}
      @keyframes bsApproach{0%{transform:translate(-130px,65px) scale(.55);opacity:.75}55%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(120px,-45px) scale(1.65);opacity:.25}}
      @keyframes bsBoard{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(4deg)}}
      @keyframes bsFlame{0%,100%{transform:skewX(-4deg) scaleY(1)}50%{transform:skewX(5deg) scaleY(1.15)}}
      @keyframes bsPulse{0%,100%{opacity:.65;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
      @keyframes bsLine{0%{transform:translateX(-170px);opacity:0}40%{opacity:.8}100%{transform:translateX(180px);opacity:0}}
      .unit{animation:bsApproach 2.5s infinite ease-in}
      .board{animation:bsBoard .45s infinite ease-in-out;transform-origin:250px 285px}
      .flame{animation:bsFlame .6s infinite ease-in-out;transform-origin:center bottom}
      .pulse{animation:bsPulse .7s infinite ease-in-out;transform-origin:center}
      .line{animation:bsLine .6s infinite linear}
    </style>
    <radialGradient id="bsMagma" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="25%" stop-color="#ffe600"/>
      <stop offset="58%" stop-color="#ff5a00"/>
      <stop offset="100%" stop-color="#260000"/>
    </radialGradient>
  </defs>
  <g opacity=".75">
    <rect class="line" x="20" y="70" width="180" height="4" rx="2" fill="#ff4a00"/>
    <rect class="line" x="0" y="150" width="230" height="5" rx="3" fill="#ff8a00" style="animation-delay:.18s"/>
    <rect class="line" x="50" y="265" width="210" height="4" rx="2" fill="#ff2200" style="animation-delay:.36s"/>
  </g>
  <g class="unit">
    <g class="flame">
      <polygon points="205,270 40,335 100,240" fill="#ff7a00" opacity=".85"/>
      <polygon points="295,270 460,335 400,238" fill="#ff3a00" opacity=".85"/>
      <polygon points="250,275 150,360 350,360" fill="#ffd000" opacity=".35"/>
    </g>
    <g class="board">
      <ellipse cx="250" cy="286" rx="113" ry="28" fill="#210000" opacity=".65"/>
      <ellipse cx="250" cy="278" rx="105" ry="24" fill="url(#bsMagma)"/>
      <ellipse class="pulse" cx="250" cy="278" rx="72" ry="13" fill="#fff176" opacity=".75"/>
    </g>
    <rect x="197" y="238" width="28" height="46" fill="#180200" class="px"/>
    <rect x="272" y="238" width="31" height="49" fill="#130100" class="px"/>
    <ellipse class="pulse" cx="250" cy="184" rx="70" ry="90" fill="#ff2600" opacity=".24"/>
    <rect x="194" y="118" width="112" height="132" rx="13" fill="#1a0000" class="px"/>
    <rect x="205" y="132" width="90" height="103" rx="10" fill="#250000" class="px"/>
    <rect x="215" y="148" width="70" height="9" fill="#ff4d00" class="px"/>
    <rect x="220" y="172" width="60" height="10" fill="#ff8800" class="px"/>
    <ellipse class="pulse" cx="250" cy="166" rx="28" ry="34" fill="url(#bsMagma)"/>
    <rect x="225" y="92" width="50" height="35" fill="#1a0000" class="px"/>
    <rect x="214" y="55" width="74" height="58" rx="10" fill="#150000" class="px"/>
    <rect x="209" y="45" width="84" height="17" fill="#ff2600" class="px"/>
    <polygon points="209,51 190,28 200,58" fill="#ffb000"/>
    <polygon points="292,51 312,28 301,58" fill="#ffb000"/>
    <rect x="228" y="75" width="17" height="11" fill="#fff000" class="px"/>
    <rect x="258" y="75" width="17" height="11" fill="#fff000" class="px"/>
    <rect x="240" y="92" width="22" height="8" fill="#ff0000" class="px"/>
    <rect x="145" y="150" width="42" height="82" rx="11" fill="#200000" transform="rotate(-18 166 191)"/>
    <rect x="306" y="145" width="50" height="92" rx="12" fill="#170000" transform="rotate(16 331 191)"/>
    <ellipse cx="363" cy="203" rx="21" ry="25" fill="#ff3c00"/>
  </g>
</svg>`;

  S.fusionLegend = `
<svg class="svg-art svg-fusion-legend" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .px{shape-rendering:crispEdges}
      @keyframes flRush{0%{transform:translate(-300px,150px) scale(.35) rotate(-4deg);opacity:.65}55%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(260px,-100px) scale(1.8) rotate(5deg);opacity:.1}}
      @keyframes flAura{0%,100%{transform:scale(1);opacity:.45}50%{transform:scale(1.12);opacity:.85}}
      @keyframes flBoard{0%,100%{transform:rotate(-4deg) translateY(2px)}50%{transform:rotate(4deg) translateY(-3px)}}
      @keyframes flEye{0%,100%{filter:drop-shadow(0 0 5px #f00)}50%{filter:drop-shadow(0 0 22px #ff8a00)}}
      @keyframes flLine{0%{transform:translateX(170px);opacity:0}20%{opacity:1}100%{transform:translateX(-600px);opacity:0}}
      .unit{animation:flRush 3s infinite cubic-bezier(.4,0,.2,1)}
      .aura{animation:flAura 1.8s infinite ease-in-out;transform-origin:400px 300px}
      .board{animation:flBoard .5s infinite ease-in-out;transform-origin:400px 430px}
      .eye{animation:flEye .45s infinite ease-in-out}
      .line{animation:flLine .55s infinite linear}
    </style>
    <radialGradient id="flG" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="18%" stop-color="#ffff80"/>
      <stop offset="45%" stop-color="#ff3a00"/>
      <stop offset="72%" stop-color="#620071"/>
      <stop offset="100%" stop-color="#03000a"/>
    </radialGradient>
  </defs>
  <g opacity=".8">
    <rect class="line" x="620" y="70" width="230" height="4" fill="#ff9a00"/>
    <rect class="line" x="650" y="170" width="210" height="5" fill="#ff3a00" style="animation-delay:.12s"/>
    <rect class="line" x="600" y="330" width="250" height="4" fill="#8f25ff" style="animation-delay:.25s"/>
    <rect class="line" x="660" y="500" width="190" height="6" fill="#ff003d" style="animation-delay:.38s"/>
  </g>
  <g class="unit">
    <ellipse class="aura" cx="400" cy="300" rx="190" ry="225" fill="url(#flG)" opacity=".42"/>
    <ellipse class="aura" cx="400" cy="300" rx="125" ry="155" fill="#ff2600" opacity=".28" style="animation-delay:.25s"/>
    <g class="board">
      <ellipse cx="405" cy="438" rx="135" ry="37" fill="#110000" opacity=".7"/>
      <ellipse cx="400" cy="428" rx="128" ry="31" fill="url(#flG)"/>
      <ellipse cx="400" cy="428" rx="82" ry="16" fill="#fff176" opacity=".7"/>
    </g>
    <rect x="328" y="360" width="40" height="78" fill="#0c0018" class="px"/>
    <rect x="430" y="356" width="43" height="83" fill="#090011" class="px"/>
    <polygon points="305,278 170,430 222,445 285,385" fill="#100018" opacity=".92"/>
    <polygon points="500,270 635,420 580,440 520,380" fill="#1b0038" opacity=".92"/>
    <rect x="310" y="180" width="182" height="203" rx="17" fill="#050008" class="px"/>
    <rect x="323" y="195" width="156" height="171" rx="14" fill="#0b0018" class="px"/>
    <rect x="335" y="215" width="130" height="11" fill="#ff0000" class="px"/>
    <rect x="345" y="250" width="112" height="10" fill="#ff7a00" class="px"/>
    <rect x="350" y="320" width="100" height="10" fill="#8f25ff" class="px"/>
    <ellipse cx="400" cy="252" rx="45" ry="56" fill="url(#flG)"/>
    <rect x="364" y="145" width="72" height="52" fill="#090011" class="px"/>
    <rect x="339" y="80" width="123" height="77" rx="11" fill="#050008" class="px"/>
    <rect x="335" y="72" width="132" height="18" fill="#ff2500" class="px"/>
    <polygon points="340,86 296,42 315,92" fill="#30005c"/>
    <polygon points="460,86 505,40 486,92" fill="#ff4800"/>
    <rect x="358" y="102" width="86" height="46" fill="#1b0038" class="px"/>
    <rect x="369" y="106" width="24" height="17" fill="#ff0000" class="px"/>
    <rect x="407" y="106" width="24" height="17" fill="#ff0000" class="px"/>
    <rect class="eye" x="376" y="110" width="10" height="7" fill="#fff"/>
    <rect class="eye" x="414" y="110" width="10" height="7" fill="#fff"/>
    <rect x="386" y="136" width="31" height="12" fill="#ff0000" class="px"/>
    <rect x="452" y="214" width="67" height="122" rx="15" fill="#100000" transform="rotate(20 485 275)"/>
    <ellipse cx="540" cy="270" rx="31" ry="36" fill="#ff3a00"/>
    <g transform="rotate(15 560 240)">
      <rect x="555" y="98" width="21" height="182" fill="#ff0000" class="px"/>
      <rect x="561" y="108" width="9" height="162" fill="#fff" class="px"/>
      <rect x="558" y="280" width="15" height="52" fill="#270056" class="px"/>
      <rect x="546" y="274" width="39" height="9" fill="#ffb000" class="px"/>
    </g>
  </g>
</svg>`;

  S.tofuMental = `
<svg class="svg-art svg-tofu" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .px{shape-rendering:crispEdges}
      @keyframes tfAppear{0%{transform:translateY(70px) scale(.7);opacity:0}70%{transform:translateY(-5px) scale(1.03);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
      @keyframes tfWobble{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
      @keyframes tfSweat{0%{transform:translateY(0);opacity:.9}100%{transform:translateY(20px);opacity:0}}
      .tofu{animation:tfAppear 1.4s ease-out forwards,tfWobble 3s 1.4s infinite ease-in-out;transform-origin:250px 240px}
      .sweat{animation:tfSweat 1.4s infinite linear}
    </style>
  </defs>
  <rect width="500" height="400" fill="#fff8f0"/>
  <ellipse cx="250" cy="220" rx="185" ry="140" fill="#ffe7c9" opacity=".42"/>
  <g class="tofu">
    <ellipse cx="255" cy="300" rx="92" ry="27" fill="#e8dcc8" opacity=".7"/>
    <rect x="162" y="220" width="176" height="76" fill="#f0e6d2" class="px"/>
    <rect x="160" y="170" width="180" height="75" rx="10" fill="#fffdfa" class="px"/>
    <rect x="172" y="182" width="156" height="12" fill="#fff" opacity=".8" class="px"/>
    <rect x="205" y="205" width="12" height="14" rx="2" fill="#5c4033"/>
    <rect x="285" y="205" width="12" height="14" rx="2" fill="#5c4033"/>
    <rect x="201" y="198" width="16" height="4" fill="#8b7355" transform="rotate(15 209 200)"/>
    <rect x="286" y="198" width="16" height="4" fill="#8b7355" transform="rotate(-15 294 200)"/>
    <rect x="242" y="226" width="16" height="6" rx="3" fill="#d4a5a5"/>
    <ellipse cx="195" cy="220" rx="13" ry="8" fill="#ffd2b8" opacity=".7"/>
    <ellipse cx="307" cy="220" rx="13" ry="8" fill="#ffd2b8" opacity=".7"/>
    <g class="sweat">
      <rect x="333" y="193" width="9" height="13" rx="4" fill="#86d7ff"/>
    </g>
    <g class="sweat" style="animation-delay:.45s">
      <rect x="158" y="190" width="7" height="11" rx="3" fill="#86d7ff"/>
    </g>
  </g>
  <rect x="112" y="320" width="276" height="52" rx="15" fill="#fff" stroke="#e8dcc8" stroke-width="3"/>
  <text x="250" y="353" text-anchor="middle" font-size="19" font-weight="700" fill="#5c4033" font-family="Meiryo,sans-serif">お豆腐メンタルなんです・・</text>
</svg>`;

  S.mukiMaid = `
<svg class="svg-art svg-muki-maid" viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .px{shape-rendering:crispEdges}
      @keyframes mmSwitch{0%,38%{opacity:1}48%,100%{opacity:0}}
      @keyframes mmSwitch2{0%,42%{opacity:0}55%,100%{opacity:1}}
      @keyframes mmPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
      @keyframes mmFlash{0%,38%,72%,100%{opacity:0}48%{opacity:.9}58%{opacity:.35}}
      @keyframes mmRibbon{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(5deg)}}
      .cute{animation:mmSwitch 6s infinite}
      .muki{animation:mmSwitch2 6s infinite,mmPulse 1.5s infinite ease-in-out;transform-origin:300px 280px}
      .flash{animation:mmFlash 6s infinite}
      .ribbon{animation:mmRibbon 1s infinite ease-in-out;transform-origin:center}
    </style>
    <linearGradient id="skin" x1="0%" x2="100%">
      <stop offset="0%" stop-color="#d4a574"/>
      <stop offset="50%" stop-color="#f2c8a7"/>
      <stop offset="100%" stop-color="#bd875c"/>
    </linearGradient>
  </defs>
  <rect width="600" height="500" fill="#fff0f5"/>
  <ellipse cx="300" cy="250" rx="210" ry="185" fill="#ffe0ea" opacity=".6"/>
  <g class="flash">
    <rect width="600" height="500" fill="#fff"/>
    <circle cx="300" cy="250" r="250" fill="#ff4477" opacity=".35"/>
  </g>

  <g class="cute">
    <ellipse cx="300" cy="430" rx="78" ry="20" fill="#d8b8c8" opacity=".45"/>
    <path d="M240 320 Q220 382 198 405 Q255 416 300 410 Q345 416 402 405 Q380 382 360 320Z" fill="#ff69b4"/>
    <path d="M255 285 L245 385 L300 397 L355 385 L345 285Z" fill="#fff"/>
    <rect x="257" y="220" width="86" height="112" rx="14" fill="#ff8abf"/>
    <rect x="286" y="195" width="30" height="34" fill="#ffe0d0"/>
    <ellipse cx="300" cy="160" rx="55" ry="50" fill="#fff0e8"/>
    <path d="M260 120 Q280 145 300 130 Q320 145 340 120 Q330 96 300 92 Q270 96 260 120" fill="#8b4513"/>
    <path d="M245 142 Q205 210 207 280 Q226 292 238 270 Q248 205 260 150" fill="#8b4513"/>
    <path d="M355 142 Q395 210 393 280 Q374 292 362 270 Q352 205 340 150" fill="#8b4513"/>
    <ellipse cx="275" cy="156" rx="14" ry="17" fill="#fff"/>
    <ellipse cx="275" cy="156" rx="8" ry="11" fill="#4169e1"/>
    <ellipse cx="325" cy="156" rx="14" ry="17" fill="#fff"/>
    <ellipse cx="325" cy="156" rx="8" ry="11" fill="#4169e1"/>
    <path d="M290 181 Q300 189 310 181" fill="none" stroke="#d48484" stroke-width="3" stroke-linecap="round"/>
    <rect x="246" y="106" width="108" height="12" rx="4" fill="#111827"/>
    <rect x="252" y="109" width="96" height="6" rx="2" fill="#fff"/>
    <g class="ribbon">
      <rect x="285" y="96" width="30" height="16" rx="3" fill="#ff1493"/>
      <polygon points="275,101 285,98 285,111" fill="#ff1493"/>
      <polygon points="325,101 315,98 315,111" fill="#ff1493"/>
    </g>
    <rect x="225" y="242" width="23" height="92" rx="8" fill="#ffe0d0" transform="rotate(8 236 285)"/>
    <rect x="352" y="242" width="23" height="92" rx="8" fill="#ffd5c5" transform="rotate(-8 363 285)"/>
  </g>

  <g class="muki">
    <ellipse cx="300" cy="430" rx="126" ry="32" fill="#2a0808" opacity=".45"/>
    <ellipse cx="300" cy="255" rx="185" ry="220" fill="#ff0000" opacity=".12"/>
    <path d="M220 340 Q178 404 158 424 Q250 440 300 432 Q350 440 442 424 Q422 404 380 340Z" fill="#d0004d"/>
    <path d="M250 300 L220 405 L300 420 L380 405 L350 300Z" fill="#eee"/>
    <ellipse cx="230" cy="230" rx="56" ry="42" fill="#d4a574"/>
    <ellipse cx="372" cy="225" rx="65" ry="48" fill="#c4956a"/>
    <ellipse cx="270" cy="272" rx="56" ry="52" fill="url(#skin)"/>
    <ellipse cx="330" cy="272" rx="56" ry="52" fill="url(#skin)"/>
    <rect x="275" y="315" width="52" height="70" rx="6" fill="#e8c4a0"/>
    <line x1="301" y1="318" x2="301" y2="382" stroke="#b47b55" stroke-width="3"/>
    <line x1="280" y1="338" x2="322" y2="338" stroke="#b47b55" stroke-width="3"/>
    <line x1="280" y1="362" x2="322" y2="362" stroke="#b47b55" stroke-width="3"/>
    <ellipse cx="170" cy="286" rx="47" ry="78" fill="url(#skin)" transform="rotate(-15 170 286)"/>
    <ellipse cx="430" cy="276" rx="58" ry="88" fill="url(#skin)" transform="rotate(20 430 276)"/>
    <ellipse cx="155" cy="360" rx="36" ry="42" fill="#d4a574"/>
    <ellipse cx="445" cy="370" rx="46" ry="52" fill="#d4a574"/>
    <rect x="280" y="180" width="42" height="54" rx="8" fill="url(#skin)"/>
    <ellipse cx="300" cy="145" rx="62" ry="56" fill="#f5d0c0"/>
    <path d="M245 120 Q200 98 180 78 Q190 120 215 145 Q230 160 245 150" fill="#5d2f0d"/>
    <path d="M355 120 Q400 96 423 72 Q413 112 388 145 Q370 160 355 150" fill="#5d2f0d"/>
    <polygon points="270,135 292,146 270,158" fill="#fff"/>
    <polygon points="330,135 308,146 330,158" fill="#fff"/>
    <polygon points="273,141 286,146 273,151" fill="#ff0000"/>
    <polygon points="327,141 314,146 327,151" fill="#ff0000"/>
    <rect x="285" y="165" width="32" height="18" rx="3" fill="#330000"/>
    <rect x="236" y="86" width="128" height="15" rx="5" fill="#111827"/>
    <rect x="242" y="90" width="116" height="7" rx="3" fill="#fff"/>
    <path d="M360 80 L370 100 L380 85 L375 105 L390 95" fill="none" stroke="#ff0000" stroke-width="5" stroke-linecap="round"/>
  </g>
  <rect x="142" y="28" width="316" height="48" rx="16" fill="#fff" stroke="#ff69b4" stroke-width="3"/>
  <text x="300" y="61" text-anchor="middle" font-size="22" font-weight="900" fill="#cc0044" font-family="Meiryo,sans-serif">ムキムキに変身しました…</text>
</svg>`;

  S.maidAndMuki = `
<svg class="svg-art svg-maid-muki" viewBox="0 0 700 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @keyframes idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
      .maid{animation:idle 2s infinite ease-in-out;transform-origin:220px 260px}
      .muki{animation:breathe 1.5s infinite ease-in-out;transform-origin:480px 270px}
    </style>
    <linearGradient id="mSkin" x1="0%" x2="100%">
      <stop offset="0%" stop-color="#c4956a"/><stop offset="50%" stop-color="#e8c4a0"/><stop offset="100%" stop-color="#a67b5b"/>
    </linearGradient>
  </defs>
  <g class="maid">
    <ellipse cx="220" cy="462" rx="65" ry="16" fill="#000" opacity=".18"/>
    <path d="M170 340 Q150 420 130 450 Q180 460 220 455 Q260 460 310 450 Q290 420 270 340Z" fill="#ff69b4"/>
    <path d="M195 280 L180 420 L220 430 L260 420 L245 280Z" fill="#fff"/>
    <rect x="185" y="240" width="70" height="110" rx="12" fill="#ffb6c1"/>
    <ellipse cx="220" cy="180" rx="45" ry="42" fill="#fff0e8"/>
    <path d="M180 145 Q200 165 220 150 Q240 165 260 145 Q245 128 220 124 Q195 128 180 145" fill="#5d2f0d"/>
    <ellipse cx="200" cy="176" rx="12" ry="14" fill="#fff"/><ellipse cx="200" cy="176" rx="7" ry="10" fill="#4169e1"/>
    <ellipse cx="240" cy="176" rx="12" ry="14" fill="#fff"/><ellipse cx="240" cy="176" rx="7" ry="10" fill="#4169e1"/>
    <path d="M215 200 Q220 206 225 200" fill="none" stroke="#d48484" stroke-width="3" stroke-linecap="round"/>
    <rect x="185" y="135" width="70" height="10" rx="3" fill="#111827"/><rect x="190" y="138" width="60" height="5" rx="2" fill="#fff"/>
  </g>
  <g class="muki">
    <ellipse cx="480" cy="470" rx="106" ry="25" fill="#000" opacity=".25"/>
    <polygon points="380,280 320,420 360,440 400,400" fill="#1a0033"/>
    <polygon points="580,270 640,410 600,430 560,390" fill="#1a0033"/>
    <ellipse cx="410" cy="240" rx="55" ry="45" fill="#d4a574"/>
    <ellipse cx="550" cy="235" rx="65" ry="50" fill="#c4956a"/>
    <ellipse cx="435" cy="285" rx="60" ry="55" fill="url(#mSkin)"/>
    <ellipse cx="525" cy="285" rx="60" ry="55" fill="url(#mSkin)"/>
    <rect x="445" y="330" width="70" height="85" rx="6" fill="#e8c4a0"/>
    <ellipse cx="370" cy="290" rx="45" ry="75" fill="url(#mSkin)" transform="rotate(-20 370 290)"/>
    <ellipse cx="590" cy="280" rx="55" ry="85" fill="url(#mSkin)" transform="rotate(20 590 280)"/>
    <ellipse cx="335" cy="375" rx="32" ry="38" fill="#d4a574"/>
    <ellipse cx="625" cy="375" rx="42" ry="48" fill="#d4a574"/>
    <rect x="455" y="185" width="50" height="55" rx="10" fill="url(#mSkin)"/>
    <ellipse cx="480" cy="155" rx="55" ry="50" fill="#e8c4a0"/>
    <path d="M425 130 Q440 100 480 95 Q520 100 535 130 Q525 115 480 110 Q435 115 425 130" fill="#1a0a05"/>
    <polygon points="455,145 475,152 455,160" fill="#fff"/><polygon points="458,148 470,152 458,156" fill="#f00"/>
    <polygon points="505,145 485,152 505,160" fill="#fff"/><polygon points="502,148 490,152 502,156" fill="#f00"/>
    <rect x="465" y="178" width="30" height="8" rx="2" fill="#111"/>
  </g>
</svg>`;

  S.supreme386 = `
<svg class="svg-art svg-supreme386" viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @keyframes ssGlow{0%,100%{filter:drop-shadow(0 0 12px #84ffff)}50%{filter:drop-shadow(0 0 32px #fff) drop-shadow(0 0 45px #ffd700)}}
      @keyframes ssStar{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.25)}}
      .sword{animation:ssGlow 1.2s infinite ease-in-out;transform-origin:300px 210px}
      .star{animation:ssStar 1.5s infinite ease-in-out;transform-origin:center}
    </style>
    <linearGradient id="blade" x1="0%" x2="100%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#9dffff"/><stop offset="70%" stop-color="#fff176"/><stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="600" height="420" rx="28" fill="#090b18"/>
  <ellipse cx="300" cy="210" rx="230" ry="150" fill="#1f2a66" opacity=".55"/>
  <g class="star">
    <circle cx="100" cy="90" r="7" fill="#fff"/><circle cx="500" cy="120" r="9" fill="#ffd700"/>
    <circle cx="470" cy="330" r="6" fill="#8fffff"/><circle cx="145" cy="320" r="8" fill="#fff"/>
  </g>
  <g class="sword" transform="rotate(-38 300 210)">
    <rect x="286" y="56" width="28" height="235" rx="8" fill="url(#blade)"/>
    <polygon points="300,28 322,68 278,68" fill="#fff"/>
    <rect x="244" y="292" width="112" height="18" rx="5" fill="#ffd700"/>
    <rect x="288" y="310" width="24" height="70" rx="7" fill="#334155"/>
    <circle cx="300" cy="302" r="19" fill="#00e5ff"/>
  </g>
  <text x="300" y="70" text-anchor="middle" font-size="34" font-weight="900" fill="#fff" font-family="Meiryo,sans-serif">386ede 最高SS</text>
  <text x="300" y="380" text-anchor="middle" font-size="22" font-weight="800" fill="#ffd700" font-family="Meiryo,sans-serif">Sword God Relic</text>
</svg>`;

  const particles = [
    ["particle_leaf", "若葉スパーク", "N", 10, ["#6FA86B", "#B7E4A8"], "leaf"],
    ["particle_orange", "夕焼けぽん", "N", 10, ["#E08A4B", "#FFD2A6"], "dot"],
    ["particle_star", "星くず", "R", 18, ["#FFD166", "#FFF3B0"], "star"],
    ["particle_sakura", "さくら吹雪", "R", 18, ["#FF8FB3", "#FFD1DC"], "petal"],
    ["particle_aqua", "水しぶき", "R", 18, ["#4CC9F0", "#BDEFFF"], "drop"],
    ["particle_emerald", "エメラルド粒子", "SR", 30, ["#00C853", "#A5FFD6"], "diamond"],
    ["particle_lapis", "ラピス魔力", "SR", 30, ["#2563EB", "#93C5FD"], "rune"],
    ["particle_nether", "ネザー火花", "SR", 32, ["#FF3D00", "#FFAB40"], "flame"],
    ["particle_end", "エンドの欠片", "SR", 34, ["#A855F7", "#F0ABFC"], "shard"],
    ["particle_honey", "はちみつぽとぽと", "R", 20, ["#F59E0B", "#FDE68A"], "drop"],
    ["particle_snow", "粉雪", "N", 12, ["#DFF7FF", "#FFFFFF"], "snow"],
    ["particle_rainbow", "虹色きらり", "SSR", 55, ["#FF006E", "#3A86FF", "#FFBE0B"], "rainbow"],
    ["particle_black", "闇もや", "SSR", 60, ["#1A0033", "#6600CC"], "smoke"],
    ["particle_magma", "マグマ噴火", "SSR", 65, ["#FF2200", "#FFFF00"], "flame"],
    ["particle_moon", "月光しずく", "SR", 36, ["#C4B5FD", "#EEF2FF"], "moon"],
    ["particle_sun", "太陽フレア", "SR", 36, ["#FFB703", "#FFF3B0"], "sun"],
    ["particle_heart", "ハートぽわ", "R", 22, ["#FF5C8A", "#FFC2D1"], "heart"],
    ["particle_cookie", "クッキー粉", "R", 22, ["#B45309", "#FCD9A6"], "dot"],
    ["particle_slime", "スライムぷる", "R", 22, ["#84CC16", "#D9F99D"], "slime"],
    ["particle_dragon", "ドラゴン息吹", "SSR", 70, ["#7C3AED", "#22D3EE"], "shard"],
    ["particle_crown", "王冠きらめき", "SSR", 70, ["#FFD700", "#FFF6A6"], "crown"],
    ["particle_glitch", "グリッチノイズ", "SSR", 72, ["#00FF88", "#FF00AA"], "square"],
    ["particle_meido", "メイドピンク", "SR", 38, ["#FF69B4", "#FFFFFF"], "heart"],
    ["particle_pvp", "PVPクラッシュ", "SR", 40, ["#EF4444", "#111827"], "slash"],
    ["particle_uhc", "UHC金リンゴ", "SSR", 75, ["#FBBF24", "#F97316"], "apple"],
    ["particle_retbare", "Retbareオーブ", "SSR", 80, ["#6FA86B", "#E08A4B"], "orb"]
  ];

  const frames = [
    ["frame_leaf", "若葉フレーム", "N", 12, ["#6FA86B", "#CFE8B8"]],
    ["frame_wood", "木のぬくもり", "N", 12, ["#8B5E34", "#D6B27C"]],
    ["frame_honey", "はちみつ枠", "R", 22, ["#F59E0B", "#FDE68A"]],
    ["frame_sakura", "さくら枠", "R", 22, ["#FF8FB3", "#FFD1DC"]],
    ["frame_aqua", "水色ガラス", "R", 24, ["#38BDF8", "#E0F2FE"]],
    ["frame_emerald", "エメラルド枠", "SR", 40, ["#10B981", "#A7F3D0"]],
    ["frame_lapis", "ラピス枠", "SR", 40, ["#2563EB", "#93C5FD"]],
    ["frame_nether", "ネザー枠", "SR", 45, ["#EF4444", "#FDBA74"]],
    ["frame_amethyst", "アメジスト枠", "SR", 45, ["#A855F7", "#E9D5FF"]],
    ["frame_sun", "太陽王冠枠", "SSR", 75, ["#FBBF24", "#FFF7AD"]],
    ["frame_moon", "月影枠", "SSR", 75, ["#818CF8", "#E0E7FF"]],
    ["frame_dragon", "ドラゴン枠", "SSR", 90, ["#7C3AED", "#22D3EE"]],
    ["frame_cyber", "サイバー枠", "SSR", 95, ["#00FF88", "#111827"]],
    ["frame_retbare", "Retbare公式枠", "SS", 120, ["#6FA86B", "#E08A4B"]]
  ];

  const backgrounds = [
    ["bg_cream", "クリーム広場", "N", 0, ["#FAF6EC", "#FFFDF7", "#E8F4DF"]],
    ["bg_forest", "やさしい森", "N", 12, ["#E8F4DF", "#CFE8B8", "#6FA86B"]],
    ["bg_sunset", "夕焼けサーバー", "R", 22, ["#FFF0D6", "#FFD0A6", "#E08A4B"]],
    ["bg_sakura", "桜ロビー", "R", 22, ["#FFF1F5", "#FFD1DC", "#FF8FB3"]],
    ["bg_ocean", "水中神殿", "R", 24, ["#E0F2FE", "#7DD3FC", "#0EA5E9"]],
    ["bg_mountain", "山の朝", "R", 24, ["#F0FDF4", "#BBF7D0", "#86EFAC"]],
    ["bg_nether", "ネザー進軍", "SR", 40, ["#2A0808", "#7F1D1D", "#F97316"]],
    ["bg_end", "エンド空間", "SR", 40, ["#13051F", "#4C1D95", "#C084FC"]],
    ["bg_gold", "金リンゴ祭り", "SR", 45, ["#FFF7AD", "#FBBF24", "#F97316"]],
    ["bg_lapis", "ラピス鉱脈", "SR", 45, ["#0B1F55", "#2563EB", "#93C5FD"]],
    ["bg_dark", "闇の祭壇", "SSR", 70, ["#050008", "#1A0033", "#6600CC"]],
    ["bg_magma", "マグマサーフ", "SSR", 70, ["#260000", "#FF2200", "#FFB703"]],
    ["bg_cyber", "管理者回路", "SSR", 75, ["#020617", "#064E3B", "#00FF88"]],
    ["bg_meido", "メイドカフェ", "SSR", 75, ["#FFF0F5", "#FFB6C1", "#FF69B4"]],
    ["bg_pvp", "PVPアリーナ", "SSR", 80, ["#111827", "#7F1D1D", "#EF4444"]],
    ["bg_legend", "伝説の空", "SS", 130, ["#090B18", "#6D28D9", "#FFD700"]]
  ];

  const genericEffects = [
    ["effect_confetti", "紙吹雪", "N", 0, ["#6FA86B", "#E08A4B"], "confetti"],
    ["effect_cracker", "クラッカー開封", "R", 20, ["#FFB703", "#FB7185"], "cracker"],
    ["effect_orb_suck", "経験値オーブ吸い込み", "R", 22, ["#84CC16", "#D9F99D"], "orb"],
    ["effect_gapple", "金リンゴ紙吹雪", "SR", 42, ["#FBBF24", "#F97316"], "apple"],
    ["effect_aura_green", "緑オーラ", "SR", 45, ["#22C55E", "#BBF7D0"], "aura"],
    ["effect_aura_blue", "青オーラ", "SR", 45, ["#3B82F6", "#BFDBFE"], "aura"],
    ["effect_aura_purple", "紫オーラ", "SR", 45, ["#A855F7", "#E9D5FF"], "aura"],
    ["effect_pvp_slash", "PVP斬撃", "SSR", 78, ["#EF4444", "#111827"], "slash"],
    ["effect_uhc_apple", "UHC金リンゴ神", "SSR", 88, ["#FFD700", "#FF3D00"], "apple"],
    ["effect_retbare_light", "Retbareライト", "SSR", 90, ["#6FA86B", "#E08A4B"], "aura"]
  ];

  const specialItems = [
    {
      id: "effect_dark_penguin",
      name: "闇のペンギン",
      type: "effect",
      rarity: "SS",
      price: 0,
      shop: false,
      gacha: true,
      desc: "ガチャ限定。闇オーラで走るペンギン。",
      palette: ["#1A0033", "#6600CC", "#000011"],
      svg: S.darkPenguin
    },
    {
      id: "effect_blaze_surfer",
      name: "炎走サーファー",
      type: "effect",
      rarity: "SS",
      price: 0,
      shop: false,
      gacha: true,
      desc: "ガチャ限定。炎とマグマで突っ込んでくる。",
      palette: ["#FF2200", "#FF8800", "#260000"],
      svg: S.blazeSurfer
    },
    {
      id: "effect_dark_magma_legend",
      name: "伝説レア・闇炎融合",
      type: "effect",
      rarity: "LEGEND",
      price: 0,
      shop: false,
      gacha: false,
      fusionOnly: true,
      fusionOf: ["effect_dark_penguin", "effect_blaze_surfer"],
      desc: "闇のペンギン + 炎走サーファー を融合すると入手。",
      palette: ["#FF2200", "#6600CC", "#FFD700"],
      svg: S.fusionLegend
    },
    {
      id: "effect_tofu_mental",
      name: "お豆腐メンタルなんです・・",
      type: "effect",
      rarity: "SR",
      price: 0,
      shop: false,
      gacha: false,
      initialOwners: ["4y44"],
      desc: "4y44 初期所持。やわらかくてレア。",
      palette: ["#FFF8F0", "#E8DCC8", "#5C4033"],
      svg: S.tofuMental
    },
    {
      id: "effect_muki_maid",
      name: "むきメイド",
      type: "effect",
      rarity: "SS",
      price: 0,
      shop: false,
      gacha: false,
      initialOwners: ["Mukisukino"],
      desc: "Mukisukino 初期所持。変身演出つき。",
      palette: ["#FF69B4", "#FFFFFF", "#CC0044"],
      svg: S.mukiMaid
    },
    {
      id: "effect_maid_and_muki",
      name: "メイドとムキムキ",
      type: "effect",
      rarity: "SSR",
      price: 95,
      shop: true,
      gacha: true,
      desc: "かわいいメイドと圧のあるムキムキ。",
      palette: ["#FF69B4", "#330066", "#E8C4A0"],
      svg: S.maidAndMuki
    },
    {
      id: "effect_386ede_supreme_ss",
      name: "386ede 最高SS",
      type: "effect",
      rarity: "SS",
      price: 0,
      shop: false,
      gacha: false,
      initialOwners: ["386ede"],
      desc: "386ede が最初から所持する最高SSアイテム。",
      palette: ["#090B18", "#00E5FF", "#FFD700"],
      svg: S.supreme386
    }
  ];

  function makeParticle(x) {
    return {
      id: x[0],
      name: x[1],
      type: "particle",
      rarity: x[2],
      price: x[3],
      shop: x[3] > 0,
      gacha: true,
      palette: x[4],
      shape: x[5],
      desc: "プロフィール画面に出るSVGパーティクル。"
    };
  }

  function makeFrame(x) {
    return {
      id: x[0],
      name: x[1],
      type: "frame",
      rarity: x[2],
      price: x[3],
      shop: x[3] > 0,
      gacha: true,
      palette: x[4],
      desc: "MCIDアイコンを飾るSVGフレーム。"
    };
  }

  function makeBg(x) {
    return {
      id: x[0],
      name: x[1],
      type: "background",
      rarity: x[2],
      price: x[3],
      shop: x[3] > 0,
      gacha: true,
      palette: x[4],
      desc: "プロフィールカード背景。"
    };
  }

  function makeEffect(x) {
    return {
      id: x[0],
      name: x[1],
      type: "effect",
      rarity: x[2],
      price: x[3],
      shop: x[3] > 0,
      gacha: true,
      palette: x[4],
      shape: x[5],
      desc: "プロフィール演出。"
    };
  }

  window.RH = {
    version: "complete-css-gacha-title-v20",
    serverIp: SERVER_IP,
    starterItems: ["bg_cream", "frame_leaf", "particle_leaf", "effect_confetti"],
    items: [
      ...backgrounds.map(makeBg),
      ...frames.map(makeFrame),
      ...particles.map(makeParticle),
      ...genericEffects.map(makeEffect),
      ...specialItems
    ],
    titles: {
      admin: {
        id: "admin",
        name: "Admin",
        type: "only",
        color: "#00FF88",
        desc: "RetBareHUB管理者称号"
      },
      uhc_king: {
        id: "uhc_king",
        name: "UHC KING",
        type: "only",
        color: "#FBBF24",
        desc: "Mukisukino 初期称号"
      },
      pvp_crown: {
        id: "pvp_crown",
        name: "PVP crown",
        type: "only",
        color: "#EF4444",
        desc: "4y44 初期称号"
      },
      sword_god: {
        id: "sword_god",
        name: "Sword God",
        type: "only",
        color: "#60A5FA",
        desc: "386ede 初期称号"
      },
      retbare_member: {
        id: "retbare_member",
        name: "Retbare Member",
        type: "many",
        color: "#6FA86B",
        desc: "Retbareサーバーメンバー"
      },
      gacha_lucky: {
        id: "gacha_lucky",
        name: "Gacha Lucky",
        type: "many",
        color: "#E08A4B",
        desc: "ガチャ運がいい人"
      }
    },
    seedNews: [
      {
        id: "welcome",
        title: "RetBareHUB 完全版へようこそ",
        body: "プロフィール、ショップ、ガチャ、称号、RetBareChatを復活しました。サーバーIP: 110.67.56.168:25565",
        tag: "INFO"
      },
      {
        id: "seed-success",
        title: "seed init 成功おめでとう",
        body: "初期プレイヤー、称号、ショップ、特殊アイテムを復元できます。",
        tag: "FIREBASE"
      }
    ],
    seedQuests: [
      {
        id: "quest-first-login",
        title: "はじめてのログイン",
        body: "Minecraft IDとパスワードでアカウント作成して、自分のプロフィールを編集しよう。",
        reward: 10
      },
      {
        id: "quest-retbare-ip",
        title: "Retbareサーバーへ入ろう",
        body: "IP: 110.67.56.168:25565",
        reward: 15
      },
      {
        id: "quest-gacha-fusion",
        title: "伝説レア融合",
        body: "闇のペンギンと炎走サーファーをガチャで入手して、融合ボタンを押そう。",
        reward: 60
      }
    ]
  };
})();
