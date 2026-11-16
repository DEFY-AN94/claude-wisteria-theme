# 紫藤 Wisteria

A light lavender theme for the Claude Code desktop app, with a living backdrop: hanging wisteria, misty hills, drifting petals, a small cabin with a lit window, a cat watching the sky, and a moonlit night version with fireflies.

Claude Code 桌面版的浅紫色主题，带一幅会动的背景：垂落的紫藤、晨雾里的远山、缓缓飘下的花瓣、亮着灯的小屋、望着天空的猫，以及有月亮和萤火虫的夜晚版本。

## Install · 安装

At the prompt of a Claude Code terminal session:

```
/plugin install wisteria --marketplace DEFY-AN94/claude-wisteria-theme
```

Answer `y` to add the marketplace, then press Enter to pick the user scope, so every session loads the theme.

From a shell:

```
claude plugin install wisteria --marketplace DEFY-AN94/claude-wisteria-theme
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `DEFY-AN94/claude-wisteria-theme`, then Add plugin.

The theme draws in the desktop and mobile apps. A session shows one theme at a time: if another theme plugin is also on, the one set last wins.

## Commands · 命令

| Command | What it does |
| --- | --- |
| `/wisteria` | Show the current settings · 查看当前设置 |
| `/wisteria fireworks` (`烟花`) | Fireworks at night, a gust of petals by day · 夜晚放烟花，白天是一阵花瓣雨 |
| `/wisteria day` (`白天`) | Hold the day scene · 固定白天场景 |
| `/wisteria night` (`夜晚`) | Hold the night scene · 固定夜晚场景 |
| `/wisteria auto` (`自动`) | Follow the app's light or dark mode · 跟随明暗模式 |
| `/wisteria still` (`静止`) | Pause the animation · 暂停动画 |
| `/wisteria motion` (`动态`) | Resume the animation · 恢复动画 |

Words combine: `/wisteria night still`. The choice is remembered across sessions. The animation also stops by itself where the system asks for reduced motion.

## How it works · 原理

The whole backdrop is one SVG, generated in code (`hooks/scene.js`) from a fixed seed and animated with CSS alone: no images, no scripts, no network. `hooks/register.tsx` sets the colors and the backdrop when a session starts and answers the `/wisteria` command.

## Develop · 开发

```
claude plugin validate .
claude plugin test .
```

## License

MIT
