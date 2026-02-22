import { LocalCard } from '../global-types/card';
import { CardType } from '../global-types/card-types';
import cardPool from './card-pool.json';

const cards = cardPool as LocalCard[];

export function getRandomCard(type?: CardType): LocalCard {
  let pool = cards;
  
  if (type) {
    pool = cards.filter((card) => card.card_type === type);
  }
  
  if (pool.length === 0) {
    throw new Error(`No cards found for type: ${type}`);
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export default cards;
