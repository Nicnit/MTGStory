import { LocalCard } from '../model/card';
import { CardType } from '../model/card-types';
import cardPool from './card-pool.json';

export const CARD_POOL = cardPool as LocalCard[];

export function getRandomCard(type?: CardType): LocalCard {
  let pool = CARD_POOL;

  if (type)
    pool = CARD_POOL.filter((card) => card.card_types.includes(type))

  if (pool.length === 0) {
    throw new Error(`No CARD_POOL found for type: ${type}`);
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export default CARD_POOL;
