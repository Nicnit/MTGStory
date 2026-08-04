import { CardType } from './card-types';
import { LocalBoardPosition } from './board';
import { SecretHand } from '@/game/Game';
import { Board } from './board';
import { getRandomCard } from '@/data/card-data';

// For board-related operations or types see ./board.ts

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

/**
  * A card that will show in the UI via hand or board.
  *
  * instanceID distinguishes from other identical card copies.
  */
export interface UICard extends LocalCard {
  instanceID: string;
}

// Consider: CardInstance loses information on the card, i.e. type etc. perhaps restructure
/**
 * Used in Game.ts to track instances of cards in hands.
 */
export interface CardInstance {
  instanceID: string; // Differentite between instances of the same card. Doesn't depend on scryfallID.
  scryfallID: string;
  playerOwnerID: string; // Player owner's id
}

export interface PlacedCardInstance extends CardInstance {
  position: LocalBoardPosition
}



// Methods and such

function makeCardInstanceID(instanceID: number): string {
  return (`card-${instanceID}`)
}


function drawCards(hand: SecretHand, numCards: number, startID: number, playerID: string): { hand: SecretHand, nextID: number } {
  const cards: CardInstance[] = [...hand.cards];
  for (let i = 0; i < numCards; i++) {
    cards.push({
      instanceID: makeCardInstanceID(startID++),
      scryfallID: getRandomCard().id,
      playerOwnerID: playerID,
    })
  }
  return ({
    hand: { cards },
    nextID: startID
  })
}
