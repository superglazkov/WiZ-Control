const SCENE_BACKGROUNDS: Record<number, string> = {
  1: 'linear-gradient(135deg, #033b72 0%, #087fba 45%, #16c7d9 100%)', // Ocean
  2: 'linear-gradient(135deg, #6d123f 0%, #d13c74 52%, #ff9ab5 100%)', // Romance
  3: 'linear-gradient(135deg, #79283e 0%, #f0643b 48%, #ffb23f 100%)', // Sunset
  4: 'linear-gradient(135deg, #6d20c7 0%, #e22bd5 45%, #19c9ff 100%)', // Party
  5: 'linear-gradient(135deg, #5a1809 0%, #d54a13 48%, #ffb02e 100%)', // Fireplace
  6: 'linear-gradient(135deg, #6b3517 0%, #c87832 50%, #ffd38d 100%)', // Cozy
  7: 'linear-gradient(135deg, #103d23 0%, #237d45 48%, #8bc34a 100%)', // Forest
  8: 'linear-gradient(135deg, #8d7bd8 0%, #f4a7cf 48%, #8ed9e8 100%)', // Pastel Colors
  9: 'linear-gradient(135deg, #ff8a4a 0%, #ffd36a 55%, #fff0b5 100%)', // Wake Up
  10: 'linear-gradient(135deg, #19254d 0%, #4d4384 55%, #9a6da6 100%)', // Bedtime
  11: 'linear-gradient(135deg, #cc7a30 0%, #f2b65d 55%, #ffe5b0 100%)', // Warm White
  12: 'linear-gradient(135deg, #b9d9ff 0%, #eef7ff 55%, #ffffff 100%)', // Daylight
  13: 'linear-gradient(135deg, #8dbfea 0%, #cce8ff 55%, #f6fbff 100%)', // Cool White
  14: 'linear-gradient(135deg, #2b143e 0%, #6a2854 55%, #b45863 100%)', // Night Light
  15: 'linear-gradient(135deg, #b8d8ff 0%, #f4fbff 55%, #ffffff 100%)', // Focus
  16: 'linear-gradient(135deg, #4e3559 0%, #a16d78 50%, #e7b49b 100%)', // Relax
  17: 'linear-gradient(135deg, #d52a2a 0%, #f4c542 33%, #31a85b 66%, #2585d8 100%)', // True Colors
  18: 'linear-gradient(135deg, #15192d 0%, #3b3769 55%, #7567a8 100%)', // TV Time
  19: 'linear-gradient(135deg, #541975 0%, #b42fb3 48%, #ff6aa5 100%)', // Plant Growth
  20: 'linear-gradient(135deg, #51a84c 0%, #f1df66 50%, #f7a7c7 100%)', // Spring
  21: 'linear-gradient(135deg, #1aa6d8 0%, #60d3c0 45%, #ffd85a 100%)', // Summer
  22: 'linear-gradient(135deg, #73351f 0%, #c65d2c 48%, #e8a53d 100%)', // Fall
  23: 'linear-gradient(135deg, #061c4d 0%, #063b78 50%, #00a7c8 100%)', // Deep Dive
  24: 'linear-gradient(135deg, #153a1d 0%, #287839 45%, #8cae32 100%)', // Jungle
  25: 'linear-gradient(135deg, #176b47 0%, #4fc572 48%, #d5ef6d 100%)', // Mojito
  26: 'linear-gradient(135deg, #321166 0%, #8d1bb2 45%, #ef2b95 100%)', // Club
  27: 'linear-gradient(135deg, #146b3a 0%, #146b3a 34%, #bb2528 66%, #f8e7b0 100%)', // Christmas
  28: 'linear-gradient(135deg, #17111d 0%, #72258a 50%, #f47b20 100%)', // Halloween
  29: 'linear-gradient(135deg, #5a2b12 0%, #ce7427 50%, #ffd36b 100%)', // Candlelight
  30: 'linear-gradient(135deg, #c18832 0%, #f0cf78 50%, #fff1bc 100%)', // Golden White
  31: 'linear-gradient(135deg, #52107a 0%, #e929a1 50%, #55d8ff 100%)', // Pulse
  32: 'linear-gradient(135deg, #3f3026 0%, #8b6241 50%, #d69a52 100%)' // Steampunk
}

export function getSceneBackground(sceneId: number): string {
  return SCENE_BACKGROUNDS[sceneId] ?? 'linear-gradient(135deg, #303038 0%, #4a4a56 100%)'
}
