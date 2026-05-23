// Partido inaugural: México, 11 jun 2026 14:00 hora Ecuador (UTC-5) = 19:00 UTC
export const MUNDIAL_START = new Date('2026-06-11T19:00:00Z');

export function isMundialStarted(): boolean {
  return Date.now() >= MUNDIAL_START.getTime();
}
