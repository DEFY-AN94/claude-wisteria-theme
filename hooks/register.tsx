import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { buildScene } from './scene.js'
import type { SceneMode } from './scene.js'

// 紫藤 Wisteria. Lavender paper by day, a moonlit garden by night.
const { theme, problems } = makeColors({
  label: 'Wisteria',
  roles: {
    accent: '#7c5cc4', // wisteria violet: links, keywords, the send button
    danger: '#c8405a', // rosehip
    success: '#3f8f6b', // jade leaf
    warning: '#b9822a', // honey
    pro: '#b565c9', // orchid
  },
  light: {
    gray: {
      anchors: {
        'surface-0': '#e9e1f7',
        'surface-1': '#f0eafa',
        'surface-2': '#f7f3fd',
        'text-primary': '#261d3b',
        'text-secondary': '#4a3f65',
        'text-muted': '#645981',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1a1526',
        'surface-1': '#201a2f',
        'surface-2': '#272038',
        'surface-3': '#2b243d',
        'text-primary': '#efe9fb',
        'text-secondary': '#cdc3e3',
        'text-muted': '#aba1c6',
      },
    },
  },
})

type Settings = { mode: SceneMode; isStill: boolean }

const DEFAULTS: Settings = { mode: 'auto', isStill: false }
const SCENE = /^wisteria-(auto|day|night)(-still)?(?:-fw(\d+))?$/
const ALT = '淡紫色的晨雾山谷：紫藤从枝头垂落，花瓣缓缓飘下，远山上有一间小屋，一只猫坐在山坡上望着天空。'

const scenes = new Map<string, string>()
// The one show last asked for: a show's scene is drawn once, so only it is kept.
let show: { scene: string; source: string } | undefined

// `burst` seeds one show over the scene: fireworks by night, petals by day.
function sceneName(settings: Settings, burst?: number): string {
  return `wisteria-${settings.mode}${settings.isStill ? '-still' : ''}${burst === undefined ? '' : `-fw${burst}`}`
}

async function load($: EngineInterface): Promise<Settings> {
  const kept = await $.store.get('settings')

  if (typeof kept !== 'object' || kept === null) {
    return DEFAULTS
  }

  const { mode, isStill } = kept as Partial<Settings>

  return {
    mode: mode === 'day' || mode === 'night' ? mode : 'auto',
    isStill: isStill === true,
  }
}

async function apply($: EngineInterface, settings: Settings, burst?: number) {
  const backdrop: ThemeSetArgs = {
    backdrop: { scene: sceneName(settings, burst), glass: { blur: 22, opacity: 0.55 } },
  }
  const scheme: ThemeSetArgs = {
    ...(settings.mode === 'day' && { overrideColorScheme: 'light' as const }),
    ...(settings.mode === 'night' && { overrideColorScheme: 'dark' as const }),
  }

  // A host that doesn't take an attribute refuses the whole set, so the look
  // is offered whole first and then with less: the scene alone still draws.
  try {
    return await $.theme.set({ ...backdrop, ...scheme, colors: theme })
  } catch {
    try {
      return await $.theme.set({ ...backdrop, ...scheme })
    } catch {
      return $.theme.set(backdrop)
    }
  }
}

const WORDS: Record<string, Partial<Settings>> = {
  auto: { mode: 'auto' },
  自动: { mode: 'auto' },
  day: { mode: 'day' },
  白天: { mode: 'day' },
  night: { mode: 'night' },
  夜晚: { mode: 'night' },
  still: { isStill: true },
  静止: { isStill: true },
  motion: { isStill: false },
  动态: { isStill: false },
}

const SHOW = new Set(['fireworks', 'firework', 'fw', '烟花'])

const MODE_NAMES: Record<SceneMode, string> = { auto: '自动（跟随明暗模式）', day: '白天', night: '夜晚' }

function describe(settings: Settings): string {
  return `紫藤 Wisteria · 场景：${MODE_NAMES[settings.mode]} · 动画：${settings.isStill ? '静止' : '开启'}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'wisteria',
      description: '紫藤主题：切换背景的白天/夜晚场景，或暂停动画',
      argumentHint: 'fireworks | auto | day | night | still | motion',
    })

    // While building: the one kind of line that stops Desktop painting the colors.
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    const set = await apply($, await load($))

    if (set.isDrawn && (await $.store.get('greeted')) !== true) {
      await $.store.set('greeted', true)
      $.ui.toast('紫藤 Wisteria 已开启 · 输入 /wisteria night 看看夜晚')
    }

    return next(e)
  })

  on('command.run', { command: 'wisteria' }, async ($, e) => {
    const current = await load($)
    const words = e.args.trim().toLowerCase().split(/\s+/).filter(Boolean)

    if (words.length === 0) {
      return {
        text: `${describe(current)}\n用法：/wisteria fireworks（放烟花），auto | day | night（场景），still | motion（动画）。`,
      }
    }

    if (words.length === 1 && SHOW.has(words[0] ?? '')) {
      const set = await apply($, current, Date.now() % 100_000_000)

      return {
        text: set.isDrawn
          ? '烟花升空：夜晚是烟花，白天是一阵花瓣雨。'
          : `这里画不出主题：${set.reason}`,
      }
    }

    const unknown = words.find(word => WORDS[word] === undefined)

    if (unknown !== undefined) {
      return { text: `不认识“${unknown}”。可用：fireworks、auto、day、night、still、motion。` }
    }

    const wanted = words.reduce<Settings>((settings, word) => ({ ...settings, ...WORDS[word] }), current)

    await $.store.set('settings', wanted)

    const set = await apply($, wanted)

    return { text: set.isDrawn ? describe(wanted) : `${describe(wanted)}\n（这里画不出主题：${set.reason}）` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const match = SCENE.exec(e.props.scene)

    if (match === null) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const { scene } = e.props
    const mode = match[1] as SceneMode
    const isStill = match[2] !== undefined
    let source = show?.scene === scene ? show.source : scenes.get(scene)

    if (source === undefined && match[3] !== undefined) {
      source = buildScene(mode, isStill, Number(match[3]))
      show = { scene, source }
    }

    if (source === undefined) {
      source = buildScene(mode, isStill)
      scenes.set(scene, source)
    }

    return <Svg source={source} alt={ALT} isInteractive />
  })
}
