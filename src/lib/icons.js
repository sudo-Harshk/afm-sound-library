const RULES = [
  [/vocal|speech/i, 'record_voice_over'],
  [/respiratory|breathing/i, 'air'],
  [/digestive|body|contact/i, 'accessibility_new'],
  [/baby|infant/i, 'child_care'],
  [/animal/i, 'pets'],
  [/liquid|fluid/i, 'water_drop'],
  [/crowd|social/i, 'groups'],
  [/nature|environmental/i, 'forest'],
  [/impact|collision/i, 'bolt'],
  [/friction|texture/i, 'texture'],
  [/metallic|resonant/i, 'graphic_eq'],
  [/mechanical|appliance|industrial/i, 'settings'],
  [/air|pressure/i, 'compress'],
  [/electronic|alert|interface/i, 'notifications'],
  [/music|tonal/i, 'music_note'],
  [/food|cooking/i, 'restaurant'],
  [/transport|vehicle/i, 'directions_car'],
  [/construction|tool/i, 'construction'],
  [/confusable/i, 'compare'],
  [/background|silence|ambience/i, 'volume_down'],
  [/guideline|quality/i, 'menu_book'],
];

export function getCategoryIcon(name) {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(name)) return icon;
  }
  return 'volume_up';
}
