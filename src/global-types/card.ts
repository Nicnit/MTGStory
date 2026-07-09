import { CardType } from './card-types';

export interface LocalCard {
  id: string;
  name: string;
  type_line: string;
  card_types: CardType[];
  flavor: string;
  image: string;
}

/**
  * Holding relevant data from Scryfall. Only really used in getting cards script.
  */
export interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  flavor_text?: string;
  image_uris?: {
    normal?: string;
  };
}

/*
  * A card that will show in the UI via hand or board.
  *
  * instanceID distinguishes from other identical card copies.
  */
export interface UICard extends LocalCard {
  instanceID: string;
}


