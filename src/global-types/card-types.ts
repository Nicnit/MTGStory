export enum CardType {
  CREATURE = 'Creature',
  INSTANT = 'Instant',
  SORCERY = 'Sorcery',
  ENCHANTMENT = 'Enchantment',
  ARTIFACT = 'Artifact',
  PLANESWALKER = 'Planeswalker',
  LAND = 'Land',
  NONE = 'NOTYPE' // shouldn't match anything. symbolic
}

// Just for iterating in process-cards.ts
export const CARD_TYPES = [
  CardType.CREATURE,
  CardType.INSTANT,
  CardType.SORCERY,
  CardType.ENCHANTMENT,
  CardType.ARTIFACT,
  CardType.PLANESWALKER,
  CardType.LAND,
  CardType.NONE,
] as const;
