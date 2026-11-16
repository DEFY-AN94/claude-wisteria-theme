import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'wisteria',
  component: 'Backdrop',
  props: { plugin: 'wisteria', glass: { blur: 22, opacity: 0.55 } },
} as const

test('each scene draws as one Svg within the size an Svg may be', async $ => {
  for (const scene of [
    'wisteria-auto',
    'wisteria-day',
    'wisteria-night',
    'wisteria-night-still',
    'wisteria-auto-fw4242',
    'wisteria-night-still-fw99999999',
  ]) {
    for (const surface of ['desktop', 'mobile'] as const) {
      const ui = await $.ui.mount({ ...BACKDROP, surface, props: { ...BACKDROP.props, scene } })
      const svg = await ui.find({ type: 'Svg' })

      expect(svg === undefined).toBe(false)
      await ui.unmount()
    }
  }
})

test("another plugin's scene is left to the engine", async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })

  const ui = await $.ui.mount({
    ...BACKDROP,
    surface: 'desktop',
    props: { ...BACKDROP.props, scene: 'lagoon' },
  })

  expect((await ui.find({ type: 'Text', text: /engine/ }))?.text).toBe('engine')
  await ui.unmount()
})

test('the session starts with the look set, and the command changes the scene', async ($, on) => {
  const scenes: string[] = []
  const kept = new Map<string, unknown>()

  on('store.get', (_, e) => ({ value: kept.get(e.key) }))
  on('store.set', (_, e) => {
    kept.set(e.key, e.value)

    return { value: undefined }
  })
  on('ui.toast', () => ({ value: undefined }))
  on('command.register', () => ({ value: { command: 'wisteria' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', (_, e) => {
    if (e.backdrop !== undefined && e.backdrop.scene !== undefined) {
      scenes.push(e.backdrop.scene)
    }

    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(scenes.at(-1)).toBe('wisteria-auto')

  const ran = await $.command.run({
    command: 'wisteria',
    args: 'night still',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  })

  expect(scenes.at(-1)).toBe('wisteria-night-still')
  expect(ran.text?.includes('夜晚')).toBe(true)

  await $.command.run({
    command: 'wisteria',
    args: 'fireworks',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  })
  expect(/^wisteria-night-still-fw\d+$/.test(scenes.at(-1) ?? '')).toBe(true)
})
