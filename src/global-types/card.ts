import { CardType } from './card-types';

export interface LocalCard {
  id: string;
  name: string;
  type_line: string;
  card_type: CardType;
  flavor: string;
  image: string;
}
