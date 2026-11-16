// The Wisteria scene: one SVG, drawn from a seed, so it is the same garden every time.
// buildScene(mode, isStill) returns the whole document as a string.

const W = 1600
const H = 1000

const DAY = {
  s0: '#d3c5f1', s1: '#e4d9f6', s2: '#f1e8fa', s3: '#fbeef3',
  h1: '#ddd3f4', h2: '#d1c4ef', h3: '#c5b6ea',
  mist: '#ffffff', mo: '.6',
  orb: '#fffaf3', halo: '#fff1e4', ring: '#ffffff',
  w1: '#b79ce8', w2: '#9577d6', w3: '#e6d7f8', w4: '#d6a9e6',
  vine: '#8c769c', leaf: '#a8c8a6', leaf2: '#8db793',
  petal: '#bea4ec', mote: '#ffffff', glow: '#ffffff',
  lav: '#9a80d6', lav2: '#b49be6', stem: '#93b097',
  ink: '#8a78bb', win: '#efe6fa',
  b1: '#f4c6e4', b2: '#b9c4f7', b3: '#ffe2cc', cloud: '#ffffff', co: '.5',
  dd: 'inline', nd: 'none',
}

const NIGHT = {
  s0: '#0f0b1c', s1: '#171128', s2: '#211939', s3: '#30244f',
  h1: '#2a2046', h2: '#211939', h3: '#19122b',
  mist: '#8f7cc8', mo: '.22',
  orb: '#f6f0ff', halo: '#a892ee', ring: '#cdbcff',
  w1: '#8b72cf', w2: '#6850ad', w3: '#c5b3f1', w4: '#a678c5',
  vine: '#3b2e4f', leaf: '#35524b', leaf2: '#2a4440',
  petal: '#9a83d8', mote: '#ffe9a6', glow: '#ffd978',
  lav: '#6d57b5', lav2: '#8a73cf', stem: '#2f4a45',
  ink: '#0c0815', win: '#ffd98a',
  b1: '#4b2a6c', b2: '#22306c', b3: '#3c2562', cloud: '#b7a6ee', co: '.07',
  dd: 'none', nd: 'inline',
}

function vars(palette) {
  return Object.entries(palette)
    .map(([key, value]) => `--${key}:${value}`)
    .join(';')
}

function random(seed) {
  let state = seed

  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = value => String(Math.round(value * 10) / 10)
const i = value => String(Math.round(value))

// ---------------------------------------------------------------- the land

function ridge(base, waves) {
  return x => base + waves.reduce((sum, [amp, freq, phase]) => sum + amp * Math.sin(x * freq + phase), 0)
}

const FAR = ridge(796, [[26, 0.0041, 0.6], [11, 0.0113, 2.1], [4, 0.031, 0.3]])
const MID = ridge(852, [[22, 0.0052, 3.4], [9, 0.0147, 1.2], [3, 0.037, 2.2]])
const NEAR = ridge(912, [[18, 0.0046, 5.1], [8, 0.0121, 0.4], [2.5, 0.041, 1.7]])

function hill(at, cls) {
  let d = `M0,${H}L0,${f(at(0))}`

  for (let x = 32; x <= W; x += 32) {
    d += `L${x},${f(at(x))}`
  }

  return `<path class="${cls}" d="${d}L${W},${H}Z"/>`
}

function cabin() {
  const x = 262
  const y = MID(x) + 3

  return (
    `<g transform="translate(${x},${f(y)})">` +
    // the lone tree beside it
    `<path class="ik" d="M-41,0L-40,-22L-38,-22L-37,0Z"/>` +
    `<circle class="ik" cx="-39" cy="-30" r="11"/><circle class="ik" cx="-47" cy="-24" r="8"/><circle class="ik" cx="-31" cy="-23" r="8.5"/>` +
    // smoke, three puffs that rise and thin out
    `<g class="ik" opacity=".5" transform="translate(9,-27)"><circle class="sm" r="2.4" opacity="0"/><circle class="sm" r="2.4" opacity="0" style="animation-delay:-3s"/><circle class="sm" r="2.4" opacity="0" style="animation-delay:-6s"/></g>` +
    // the cabin
    `<path class="ik" d="M-13,0V-13L0,-23L13,-13V0Z"/><path class="ik" d="M-16,-12L0,-25L16,-12L14,-10L0,-21L-14,-10Z"/><rect class="ik" x="7" y="-25" width="4" height="9"/>` +
    `<circle class="nt" cx="-1" cy="-8" r="15" fill="url(#lamp)"/>` +
    `<rect class="wn" x="-5" y="-11" width="7" height="6" rx=".8"/>` +
    `<path d="M-1.5,-11V-5M-5,-8H2" fill="none" stroke-width=".7" stroke="var(--ink)"/>` +
    `</g>`
  )
}

function cat() {
  const x = 1316
  const y = NEAR(x) + 2

  return (
    `<g class="ik" transform="translate(${x},${f(y)}) scale(1.25)">` +
    `<g transform="translate(5,-3)"><g class="tl"><path d="M0,0q11,3 12,-8" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/></g></g>` +
    `<ellipse cx="0" cy="-9" rx="7" ry="9.5"/><circle cx="-1.5" cy="-21" r="5.6"/>` +
    `<path d="M-6.6,-23L-6,-30.5L-2,-26Z"/><path d="M-0.5,-26L3,-30.5L4,-23Z"/>` +
    `</g>`
  )
}

function birds() {
  const bird = (x, y, s) =>
    `<path transform="translate(${x},${y}) scale(${s})" d="M-7,0q3.5,-5 7,0q3.5,-5 7,0"/>`

  return (
    `<g class="d"><g class="bd" fill="none" stroke="var(--ink)" stroke-width="1.3" stroke-linecap="round">` +
    `<g class="bb">${bird(0, 300, 1)}${bird(26, 288, 0.8)}${bird(-22, 314, 0.7)}${bird(48, 306, 0.6)}</g>` +
    `</g></g>`
  )
}

// ---------------------------------------------------------------- the sky

function stars(rand) {
  let out = ''

  for (let k = 0; k < 90; k++) {
    const x = rand() * W
    const y = rand() ** 1.4 * 640
    const r = 0.5 + rand() ** 3 * 1.5
    const o = 0.35 + rand() * 0.6
    const twinkle = rand() < 0.45 ? ` class="t${1 + Math.floor(rand() * 3)}" style="animation-delay:-${f(rand() * 8)}s"` : ''

    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" opacity="${f(o)}"${twinkle}/>`
  }

  // four that glint, drawn as tiny crosses
  for (const [x, y, s] of [[214, 148, 1], [742, 96, 0.8], [1012, 232, 0.7], [1478, 402, 0.9]]) {
    out += `<path class="t2" transform="translate(${x},${y}) scale(${s})" d="M0,-7Q.6,-.6 7,0Q.6,.6 0,7Q-.6,.6 -7,0Q-.6,-.6 0,-7Z" opacity=".9"/>`
  }

  return `<g class="nt" fill="#fff">${out}</g>`
}

function orb() {
  const x = 1292
  const y = 226

  return (
    `<g transform="translate(${x},${y})">` +
    `<circle class="hb" r="270" fill="url(#halo)"/>` +
    `<circle r="112" fill="none" stroke="var(--ring)" stroke-width="1" opacity=".22"/>` +
    `<circle r="78" fill="none" stroke="var(--ring)" stroke-width="1" opacity=".34"/>` +
    `<circle class="d" r="48" fill="var(--orb)" opacity=".96"/>` +
    `<g class="nt"><circle r="42" fill="var(--orb)" mask="url(#crescent)"/>` +
    `<circle r="42" fill="var(--orb)" opacity=".07"/></g>` +
    `</g>`
  )
}

function clouds() {
  const streak = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#cloud)"/>`

  return (
    `<g class="cl">${streak(520, 470, 330, 26)}${streak(700, 498, 240, 18)}${streak(1210, 560, 300, 22)}</g>` +
    `<g class="cl" style="animation-delay:-70s">${streak(250, 610, 280, 20)}${streak(990, 650, 360, 24)}</g>`
  )
}

function motes(rand) {
  let out = ''

  for (let k = 0; k < 18; k++) {
    const side = rand() < 0.5
    const x = side ? rand() * 420 : W - rand() * 420
    const y = 560 + rand() * 380
    const s = 0.7 + rand() * 0.9

    out +=
      `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">` +
      `<g class="mt" style="animation-duration:${f(9 + rand() * 9)}s;animation-delay:-${f(rand() * 18)}s">` +
      `<circle r="7" fill="url(#mote)"/><circle r="1.6" fill="var(--mote)"/>` +
      `</g></g>`
  }

  // a few that wander through the open middle, kept faint
  for (let k = 0; k < 6; k++) {
    out +=
      `<g transform="translate(${f(480 + rand() * 640)},${f(380 + rand() * 420)}) scale(.6)" opacity=".6">` +
      `<g class="mt" style="animation-duration:${f(12 + rand() * 8)}s;animation-delay:-${f(rand() * 20)}s">` +
      `<circle r="7" fill="url(#mote)"/><circle r="1.4" fill="var(--mote)"/>` +
      `</g></g>`
  }

  return out
}

// ---------------------------------------------------------------- the wisteria

const branchY = x => 30 + 9 * Math.sin(x / 83) + 5 * Math.sin(x / 31 + 1)

function branch(from, to, width) {
  const step = from < to ? 20 : -20
  let d = `M${from},${f(branchY(from))}`

  for (let x = from + step; step > 0 ? x <= to : x >= to; x += step) {
    d += `L${x},${f(branchY(x))}`
  }

  return `<path d="${d}" fill="none" stroke="var(--vine)" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
}

function raceme(rand, x, length) {
  const rows = Math.round(length / 13)
  const widest = Math.max(12, Math.min(34, length * 0.125))
  const bend = (rand() - 0.5) * length * 0.16
  let out = `<path d="M0,0q${f(bend)},${f(length / 2)} 0,${f(length)}" fill="none" stroke="var(--vine)" stroke-width="1.1"/>`

  for (let row = 0; row <= rows; row++) {
    const t = row / rows
    const y = 9 + t * (length - 9)
    const lean = bend * 2 * t * (1 - t)
    const profile = t < 0.14 ? 0.55 + (t / 0.14) * 0.45 : 1 - ((t - 0.14) / 0.86) ** 1.25
    const half = widest * profile
    const count = Math.max(1, Math.round(half / 7.6))

    for (let k = 0; k < count; k++) {
      const across = count === 1 ? 0 : (k / (count - 1)) * 2 - 1
      const cx = lean + across * half + (rand() - 0.5) * 4.5
      const cy = y + (rand() - 0.5) * 6 + Math.abs(across) * -3
      const size = (1 - t * 0.5) * (6.3 + rand() * 2.4)
      const pick = rand()
      const cls = t > 0.78 ? (pick < 0.75 ? 'b' : 'a') : pick < 0.52 ? 'a' : pick < 0.72 ? 'c' : pick < 0.88 ? 'b' : 'e'

      out += `<ellipse class="${cls}" cx="${i(cx)}" cy="${i(cy)}" rx="${f(size * 0.82)}" ry="${f(size)}"/>`

      if (t < 0.7 && rand() < 0.22) {
        out += `<circle class="e" cx="${i(cx - 1)}" cy="${i(cy - 1.6)}" r="${f(size * 0.36)}"/>`
      }
    }
  }

  const sway = length > 200 ? 'r1' : 'r2'

  return (
    `<g transform="translate(${x},${f(branchY(x))})">` +
    `<g class="${sway}" style="animation-duration:${f(6.5 + rand() * 5)}s;animation-delay:-${f(rand() * 10)}s">${out}</g></g>`
  )
}

function leaf(rand, x, angle, length) {
  let out = `<path d="M0,0H${f(length)}" stroke="var(--vine)" stroke-width="1" fill="none"/>`
  const pairs = Math.round(length / 9)

  for (let pair = 1; pair <= pairs; pair++) {
    const at = (pair / pairs) * length
    const size = 7.5 - Math.abs(pair - pairs * 0.4) * 0.5
    const cls = rand() < 0.5 ? 'l1' : 'l2'

    const dx = at + size * 0.669
    const dy = size * 0.743

    out += `<ellipse class="${cls}" rx="${f(size)}" ry="${f(size * 0.4)}" transform="translate(${i(dx)},${i(dy)})rotate(48)"/>`
    out += `<ellipse class="${cls}" rx="${f(size)}" ry="${f(size * 0.4)}" transform="translate(${i(dx)},${i(-dy)})rotate(-48)"/>`
  }

  out += `<ellipse class="l1" rx="7" ry="2.9" transform="translate(${f(length + 6)},0)"/>`

  return `<g transform="translate(${x},${f(branchY(x))}) rotate(${f(angle)})">${out}</g>`
}

function tendril(x, flip) {
  return (
    `<path transform="translate(${x},${f(branchY(x))}) scale(${flip},1)" fill="none" stroke="var(--vine)" stroke-width="1.1" stroke-linecap="round" ` +
    `d="M0,0c9,18 -13,30 -6,46c6,12 19,7 15,-3c-3,-7 -11,-3 -8,2"/>`
  )
}

function wisteria(rand) {
  const hang = [
    [38, 372], [104, 298], [176, 244], [246, 330], [318, 206], [388, 150], [452, 188], [522, 112], [584, 72], [640, 44],
    [1562, 384], [1494, 300], [1422, 226], [1352, 128], [1286, 84], [1216, 96], [1146, 146], [1078, 78], [1016, 48],
  ]
  const leaves = [
    [70, 62, 44], [150, 118, 50], [214, -24, 38], [292, 74, 46], [360, 128, 40], [424, 36, 42], [496, 96, 36], [560, -18, 30], [616, 70, 28],
    [1530, 118, 46], [1456, 60, 50], [1388, 204, 36], [1322, 110, 40], [1250, 56, 34], [1182, 132, 38], [1110, -160, 30], [1044, 100, 28],
  ]
  let out = branch(-10, 700, 6) + branch(1610, 960, 6)

  out += `<path d="M-10,${f(branchY(-10) + 3)}L330,${f(branchY(330) + 1)}" fill="none" stroke="var(--vine)" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>`
  out += `<path d="M1610,${f(branchY(1610) + 3)}L1300,${f(branchY(1300) + 1)}" fill="none" stroke="var(--vine)" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>`
  out += tendril(700, 1) + tendril(668, -1) + tendril(960, -1) + tendril(996, 1) + tendril(486, 1) + tendril(1178, -1)

  for (const [x, angle, length] of leaves) {
    out += leaf(rand, x, angle, length)
  }

  // back to front: the short ones first, so the long ones hang over them
  for (const [x, length] of [...hang].sort((p, q) => p[1] - q[1])) {
    out += raceme(rand, x, length)
  }

  return out
}

function petals(rand) {
  let out = ''

  for (let k = 0; k < 20; k++) {
    const edge = rand() < 0.62
    const x = edge ? (rand() < 0.5 ? rand() * 460 : W - rand() * 460) : 460 + rand() * 680
    const fall = 20 + rand() * 18
    const size = 3.6 + rand() * 2.6
    const cls = rand() < 0.3 ? 'e' : 'pt'

    out +=
      `<g class="pf" style="animation-duration:${f(fall)}s;animation-delay:-${f(rand() * fall)}s">` +
      `<g transform="translate(${f(x)},0)">` +
      `<g class="pw" style="animation-duration:${f(3.6 + rand() * 3.4)}s;animation-delay:-${f(rand() * 6)}s">` +
      `<path class="${cls}" opacity="${f(edge ? 0.85 : 0.5)}" d="M0,${f(-size)}C${f(size * 0.9)},${f(-size * 0.5)} ${f(size * 0.7)},${f(size * 0.8)} 0,${f(size)}C${f(-size * 0.7)},${f(size * 0.8)} ${f(-size * 0.9)},${f(-size * 0.5)} 0,${f(-size)}Z"/>` +
      `</g></g></g>`
  }

  return out
}

// ---------------------------------------------------------------- the lavender at the foot

function sprig(rand, x) {
  const fromEdge = Math.min(x, W - x)
  const height = 60 + (1 - fromEdge / 360) * 90 + rand() * 40
  const lean = (rand() - 0.5) * 16 + (x < W / 2 ? 5 : -5)
  let out = `<path d="M0,0V${f(-height)}" stroke="var(--stem)" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
  const buds = 6 + Math.floor(rand() * 4)

  out += `<ellipse class="sl" rx="9" ry="1.8" transform="translate(5,${i(-height * 0.3 - 8)})rotate(-58)"/>`
  out += `<ellipse class="sl" rx="8" ry="1.7" transform="translate(-4,${i(-height * 0.42 - 7)})rotate(58)"/>`

  for (let k = 0; k < buds; k++) {
    const y = -height - 3 + k * 6.2
    const size = 2.3 + (k / buds) * 1.8

    out += `<ellipse class="${k % 2 ? 'v1' : 'v2'}" cx="${k % 2 ? 2.4 : -2.4}" cy="${i(y)}" rx="${f(size)}" ry="${f(size * 1.25)}"/>`
  }

  return (
    `<g transform="translate(${f(x)},${H + 4}) rotate(${f(lean)})">` +
    `<g class="lv" style="animation-duration:${f(4.5 + rand() * 3.5)}s;animation-delay:-${f(rand() * 6)}s">${out}</g></g>`
  )
}

function lavender(rand) {
  let out = ''

  for (let k = 0; k < 11; k++) {
    out += sprig(rand, 8 + k * 29 + rand() * 16)
    out += sprig(rand, W - 8 - k * 29 - rand() * 16)
  }

  return out
}

// ---------------------------------------------------------------- the fireworks

const SHELLS = [[430, 300], [820, 215], [1150, 330], [620, 440], [1010, 425], [300, 480]]
const SPARKS = ['c1', 'c2', 'c3', 'c4', 'c5']

// By night: six shells climb and burst, each in two colors, and glitter after.
function fireworks(rand) {
  let out = ''

  SHELLS.forEach(([nearX, nearY], index) => {
    const x = nearX + (rand() - 0.5) * 120
    const y = nearY + (rand() - 0.5) * 80
    const at = 0.9 + index * 0.62 + rand() * 0.25
    const reach = 150 + rand() * 85
    const first = Math.floor(rand() * SPARKS.length)
    const outer = SPARKS[first]
    const inner = SPARKS[(first + 1 + Math.floor(rand() * (SPARKS.length - 1))) % SPARKS.length]
    const turn = rand() * 360
    let ring = ''
    let core = ''
    let glitter = ''

    for (let k = 0; k < 18; k++) {
      ring += `<use href="#sp" style="--a:${i(turn + k * 20 + (rand() - 0.5) * 8)}deg;--r:${i(reach * (0.86 + rand() * 0.28))}px"/>`
    }

    for (let k = 0; k < 9; k++) {
      core += `<use href="#sp" style="--a:${i(turn + 10 + k * 40 + (rand() - 0.5) * 12)}deg;--r:${i(reach * (0.4 + rand() * 0.2))}px"/>`
    }

    for (let k = 0; k < 8; k++) {
      const angle = rand() * Math.PI * 2
      const far = reach * (0.3 + rand() * 0.75)

      glitter += `<circle cx="${i(Math.cos(angle) * far)}" cy="${i(Math.sin(angle) * far + 34)}" r="${f(1.1 + rand() * 1.3)}" style="--g:${f(rand() * 0.6)}s"/>`
    }

    const sparks = `<g class="${outer}">${ring}</g><g class="${inner}">${core}</g><g class="c4">${glitter}</g>`

    out +=
      `<g transform="translate(${i(x)},${i(y)})" style="--t:${f(at)}s;--h:${i(H - y + 70)}px">` +
      `<rect class="rk" x="-1.3" width="2.6" height="58" rx="1.3" fill="url(#rocket)"/>` +
      `<circle class="fl" r="74" fill="url(#flash)"/>` +
      `<g class="fg">${sparks}</g></g>`
  })

  return `<g class="nt">${out}</g>`
}

// By day: one gust of petals across the whole sky.
function shower(rand) {
  let out = ''

  for (let k = 0; k < 54; k++) {
    out += `<use href="#pl" style="--x:${i(rand() * W)}px;--w:${i((rand() - 0.5) * 300)}px;--z:${f(0.8 + rand() * 1.4)};--d:${f(3.4 + rand() * 3.2)}s;--t:${f(rand() * 2.8)}s"/>`
  }

  return `<g class="d"><g class="sh">${out}</g></g>`
}

const FIRE = `
.c1{fill:#b99cff}.c2{fill:#ffd766}.c3{fill:#ff8fd0}.c4{fill:#fff}.c5{fill:#8ff0cc}
.fg use{opacity:0;animation:fx 1.7s cubic-bezier(.12,.72,.25,1) both;animation-delay:var(--t)}
.fg{animation:fg 2s ease-in both;animation-delay:var(--t)}
.fl{opacity:0;animation:fl .8s ease-out both;animation-delay:var(--t)}
.rk{opacity:0;animation:rk .8s ease-out both;animation-delay:calc(var(--t) - .8s)}
.fg circle{opacity:0;animation:gl .45s ease-in-out 4 alternate both;animation-delay:calc(var(--t) + .9s + var(--g))}
.sh use{fill:var(--petal);transform:translateY(-80px);animation:ps var(--d) cubic-bezier(.35,.1,.75,.95) both;animation-delay:var(--t)}
.sh use:nth-child(4n){fill:var(--w3)}.sh use:nth-child(4n+1){fill:var(--w4)}.sh use:nth-child(5n+2){fill:var(--w2)}
@keyframes fx{0%{transform:rotate(var(--a)) translateX(0);opacity:0}5%{opacity:1}55%{opacity:1}100%{transform:rotate(var(--a)) translateX(var(--r));opacity:0}}
@keyframes fg{to{transform:translateY(54px)}}
@keyframes fl{0%{transform:scale(.1);opacity:0}15%{opacity:.95}100%{transform:scale(1.7);opacity:0}}
@keyframes rk{from{transform:translateY(var(--h));opacity:.95}80%{opacity:.8}to{transform:translateY(0);opacity:0}}
@keyframes gl{from{opacity:0}to{opacity:1}}
@keyframes ps{from{transform:translate(var(--x),-50px) rotate(0deg) scale(var(--z))}to{transform:translate(calc(var(--x) + var(--w)),1070px) rotate(620deg) scale(var(--z))}}
@media (prefers-reduced-motion:reduce){.fg,.fg *,.fl,.rk,.sh use{animation:none!important}}
`

const FIRE_DEFS =
  `<rect id="sp" x="-17" y="-1.5" width="20" height="3" rx="1.5"/>` +
  `<path id="pl" opacity=".9" d="M0,-7C6,-3.5 5,5.5 0,7C-5,5.5 -6,-3.5 0,-7Z"/>` +
  `<linearGradient id="rocket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></linearGradient>` +
  `<radialGradient id="flash"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="#ffe9b0" stop-opacity=".4"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient>`

// ---------------------------------------------------------------- the whole

const MOTION = `
.r1{animation:r1 9s ease-in-out infinite alternate}
.r2{animation:r2 7s ease-in-out infinite alternate}
.lv{animation:lv 5s ease-in-out infinite alternate}
.pf{animation:pf 28s linear infinite}
.pw{animation:pw 5s ease-in-out infinite alternate}
.mt{animation:mt 12s ease-in-out infinite}
.t1{animation:tw 3.1s ease-in-out infinite alternate}
.t2{animation:tw 4.7s ease-in-out infinite alternate}
.t3{animation:tw 6.3s ease-in-out infinite alternate}
.hb{animation:hb 9s ease-in-out infinite alternate}
.sm{animation:sm 9s linear infinite}
.tl{animation:tl 7s ease-in-out infinite}
.bd{animation:bd 95s linear infinite}
.bb{animation:bb 6s ease-in-out infinite alternate}
.cl{animation:cl 140s ease-in-out infinite alternate}
.ss{animation:ss 19s linear infinite}
@keyframes r1{from{transform:rotate(-1.3deg)}to{transform:rotate(1.6deg)}}
@keyframes r2{from{transform:rotate(-2.6deg)}to{transform:rotate(2.9deg)}}
@keyframes lv{from{transform:rotate(-2.2deg)}to{transform:rotate(2.6deg)}}
@keyframes pf{from{transform:translateY(-40px)}to{transform:translateY(1050px)}}
@keyframes pw{from{transform:translateX(-30px) rotate(-70deg)}to{transform:translateX(30px) rotate(80deg)}}
@keyframes mt{0%{transform:translate(0,0);opacity:0}25%{opacity:.95}50%{transform:translate(14px,-46px);opacity:.35}75%{opacity:.9}100%{transform:translate(-8px,-96px);opacity:0}}
@keyframes tw{from{opacity:.15}}
@keyframes hb{from{opacity:.75;transform:scale(.96)}to{opacity:1;transform:scale(1.05)}}
@keyframes sm{0%{transform:translate(0,0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translate(16px,-42px) scale(2.4);opacity:0}}
@keyframes tl{0%,70%,100%{transform:rotate(0)}78%{transform:rotate(-16deg)}86%{transform:rotate(9deg)}93%{transform:rotate(-6deg)}}
@keyframes bd{from{transform:translateX(-120px)}to{transform:translateX(1760px)}}
@keyframes bb{from{transform:translateY(-10px)}to{transform:translateY(14px)}}
@keyframes cl{from{transform:translateX(-50px)}to{transform:translateX(70px)}}
@keyframes ss{0%,90%{transform:translate(1130px,90px);opacity:0}91%{opacity:1}96%{opacity:.9}100%{transform:translate(770px,236px);opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.ss{opacity:0}}
`

const STILL = `.ss{opacity:0}`

const PAINT = `
.g0{stop-color:var(--s0)}.g1{stop-color:var(--s1)}.g2{stop-color:var(--s2)}.g3{stop-color:var(--s3)}
.q1{stop-color:var(--b1)}.q2{stop-color:var(--b2)}.q3{stop-color:var(--b3)}
.qh{stop-color:var(--halo)}.qm{stop-color:var(--glow)}.qc{stop-color:var(--cloud)}.qw{stop-color:var(--win)}
.ms{stop-color:var(--mist)}.mo{stop-color:var(--mist);stop-opacity:var(--mo)}
.h1{fill:var(--h1)}.h2{fill:var(--h2)}.h3{fill:var(--h3)}
.a{fill:var(--w1)}.b{fill:var(--w2)}.c{fill:var(--w4)}.e{fill:var(--w3)}
.l1{fill:var(--leaf)}.l2{fill:var(--leaf2)}.sl{fill:var(--stem)}
.v1{fill:var(--lav)}.v2{fill:var(--lav2)}
.pt{fill:var(--petal)}.ik{fill:var(--ink)}.wn{fill:var(--win)}
.d{display:var(--dd)}.nt{display:var(--nd)}
.cl{opacity:var(--co)}
`

const DEFS =
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop class="g0" offset="0"/><stop class="g1" offset=".38"/><stop class="g2" offset=".7"/><stop class="g3" offset="1"/></linearGradient>` +
  `<radialGradient id="bl1"><stop class="q1" offset="0" stop-opacity=".6"/><stop class="q1" offset="1" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="bl2"><stop class="q2" offset="0" stop-opacity=".55"/><stop class="q2" offset="1" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="bl3"><stop class="q3" offset="0" stop-opacity=".7"/><stop class="q3" offset="1" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="halo"><stop class="qh" offset="0" stop-opacity=".85"/><stop class="qh" offset=".3" stop-opacity=".34"/><stop class="qh" offset="1" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="mote"><stop class="qm" offset="0" stop-opacity=".55"/><stop class="qm" offset="1" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="lamp"><stop class="qw" offset="0" stop-opacity=".55"/><stop class="qw" offset="1" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="cloud"><stop class="qc" offset="0" stop-opacity="1"/><stop class="qc" offset="1" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop class="ms" offset="0" stop-opacity="0"/><stop class="mo" offset="1"/></linearGradient>` +
  `<linearGradient id="tail"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
  `<mask id="crescent"><rect x="-60" y="-60" width="120" height="120" fill="#fff"/><circle cx="19" cy="-11" r="37" fill="#000"/></mask>`

let body

function draw() {
  const rand = random(20261115)

  return (
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
    `<circle cx="280" cy="330" r="540" fill="url(#bl1)"/>` +
    `<circle cx="1180" cy="560" r="620" fill="url(#bl2)"/>` +
    `<ellipse cx="800" cy="900" rx="900" ry="300" fill="url(#bl3)"/>` +
    stars(rand) +
    `<g class="nt"><g class="ss"><path d="M0,0L118,-46L118,-48.4Z" fill="url(#tail)"/><circle r="1.8" fill="#fff"/></g></g>` +
    orb() +
    clouds() +
    birds() +
    hill(FAR, 'h1') +
    `<rect y="770" width="${W}" height="110" fill="url(#mist)"/>` +
    hill(MID, 'h2') +
    cabin() +
    `<rect y="830" width="${W}" height="100" fill="url(#mist)"/>` +
    hill(NEAR, 'h3') +
    cat() +
    `<rect y="880" width="${W}" height="120" fill="url(#mist)"/>` +
    lavender(rand) +
    motes(rand) +
    wisteria(rand) +
    petals(rand)
  )
}

/**
 * The scene as one SVG document.
 * mode: 'auto' follows the screen's light or dark, 'day' and 'night' hold one.
 * burst: a seed; given, one show plays over the scene as it loads: fireworks
 * by night, a gust of petals by day.
 */
export function buildScene(mode, isStill, burst) {
  body ??= draw()

  const show = burst === undefined ? '' : fireworks(random(burst)) + shower(random(burst + 7))

  const palette =
    mode === 'day'
      ? `svg{${vars(DAY)}}`
      : mode === 'night'
        ? `svg{${vars(NIGHT)}}`
        : `svg{${vars(DAY)}}@media (prefers-color-scheme:dark){svg{${vars(NIGHT)}}}`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<style>${palette}${PAINT}${isStill ? STILL : MOTION}${burst === undefined ? '' : FIRE}</style>` +
    `<defs>${DEFS}${burst === undefined ? '' : FIRE_DEFS}</defs>${body}${show}</svg>`
  )
}
