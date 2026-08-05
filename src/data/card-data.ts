import { LocalCard } from '../model/card';
import { CardType } from '../model/card-types';
import cardPool from './card-pool.json';

const cards = cardPool as LocalCard[];

export function getRandomCard(type?: CardType): LocalCard {
  let pool = cards;

  if (type)
    pool = cards.filter((card) => card.card_types.includes(type))

  if (pool.length === 0) {
    throw new Error(`No cards found for type: ${type}`);
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export default cards;
