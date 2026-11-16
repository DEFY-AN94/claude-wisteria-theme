/** 'auto' follows the screen's light or dark; 'day' and 'night' hold one. */
export type SceneMode = 'auto' | 'day' | 'night'

/**
 * The Wisteria scene as one SVG document, under 131,072 characters.
 * burst: a seed; given, one show plays as the scene loads: fireworks by
 * night, a gust of petals by day.
 */
export function buildScene(mode: SceneMode, isStill: boolean, burst?: number): string
