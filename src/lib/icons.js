import {
  MessageCircle, Wind, Utensils, Baby, PawPrint, Droplet, Users, Trees,
  Zap, Waves, CircleDot, Cog, Radio, Music, ChefHat, Car, Hammer,
  GitCompare, Volume1, BookOpen, Volume2,
} from 'lucide-react';

const RULES = [
  [/vocal|speech/i, MessageCircle],
  [/respiratory|breathing/i, Wind],
  [/digestive|body|contact/i, Utensils],
  [/baby|infant/i, Baby],
  [/animal/i, PawPrint],
  [/liquid|fluid/i, Droplet],
  [/crowd|social/i, Users],
  [/nature|environmental/i, Trees],
  [/impact|collision/i, Zap],
  [/friction|texture/i, Waves],
  [/metallic|resonant/i, CircleDot],
  [/mechanical|appliance|industrial/i, Cog],
  [/air|pressure/i, Wind],
  [/electronic|alert|interface/i, Radio],
  [/music|tonal/i, Music],
  [/food|cooking/i, ChefHat],
  [/transport|vehicle/i, Car],
  [/construction|tool/i, Hammer],
  [/confusable/i, GitCompare],
  [/background|silence|ambience/i, Volume1],
  [/guideline|quality/i, BookOpen],
];

export function getCategoryIcon(name) {
  for (const [pattern, Icon] of RULES) {
    if (pattern.test(name)) return Icon;
  }
  return Volume2;
}
