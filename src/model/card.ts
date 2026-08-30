import { CardType } from '../model/card-types';
import { LocalBoardPosition } from './board';
import { getRandomCard } from '@/data/card-data';
import CARD_POOL from '@/data/card-data';

// For board-related operations or types see ./board.ts

// LocalCard (Information) -> UICard(Unique ID) -> CardInstance(Ownership ID) -> PlacedCardInstance(Board Position)

export interface LocalCard {
  id: string;
  name: string;
  type_line: string;
  card_types: CardType[];
  flavor: string;
  image: string;
  scryfallID: string;
}

/**
  * A card that will show in the UI via hand or board.
  *
  * instanceID distinguishes from other identical card copies.
  */
export interface UICard extends LocalCard {
  instanceID: string;
}

// Could probably rename but too much work
/**
 * Used in Game.ts to track instances of cards in hands.
 */
export interface CardInstance extends UICard {
  // instanceID: string; // Differentite between instances of the same card. Doesn't depend on scryfallID.
  // scryfallID: string;
  playerOwnerID: string;
}

export interface PlacedCardInstance extends CardInstance {
  position: LocalBoardPosition
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
 * used in Game.ts to track hands of players that others can't see.
 * TODO integrate with boardgame.io secret cards feature
 */
export interface Hand {
  cards: CardInstance[]
}

export interface SecretHand extends Hand {
  playerID: string
}



// Methods and such

/**
 * Convenient prepending
 * @param instanceID id
 * @returns full id string
 */
function makeCardInstanceID(instanceID: number): string {
  return (`card-${instanceID}`)
}

/**
 * Draws cards into a player's hand. 
 * Must use startID, and update startID with return value to have unique cardIDs
 * @param hand Hand to draw cards into
 * @param numCards How many cards to draw
 * @param startID number tracking ID to give new cards
 * @param playerID player to assign ownership of cards to
 * @returns new cardInstances array for a Hand, and next card ID MUST be passed to startID
 */
export function drawCards(hand: Hand, numCards: number, startID: number, playerID: string): { cards: CardInstance[], nextID: number } {
  // playerID as argument probly not necessary, could just use SecretHand
  // but might have different hand types in future
  let nextHand: Hand = { cards: [...hand.cards] }
  for (let i = 0; i < numCards; i++) {
    nextHand = addCardToHand({
      ...getRandomCard(),
      instanceID: makeCardInstanceID(startID++),
      playerOwnerID: playerID,
    }, nextHand)
  }

  return ({
    cards: nextHand.cards,
    nextID: startID
  })
}

/**
 * Removes a card from a hand by card ID
 * @param hand Hand with card to remove
 * @param cardID card to remove
 * @returns a new hand without the card
 */
export function removeCardFromHand(hand: Hand, cardID: string): Hand {
  let ind;
  ind = hand.cards.findIndex(card => card.instanceID === cardID)
  if (ind === -1) return { ...hand } // Card already not in hand

  return {
    cards: hand.cards.toSpliced(ind, 1)
  }
}

/**
 * Returns a new hand with the added card
 * @param card Card to be added
 * @param hand Hand to base off of
 * @returns new hand with new card
 */
export function addCardToHand(card: CardInstance, hand: Hand): Hand {
  // CHeck for matching playerID for continuity?
  // Handsize check?

  // Immutable addition
  return { cards: hand.cards.toSpliced(hand.cards.length, 0, card) }
}



// --- Obsolete

//
// /**
//  * Obsolete now, given UICard and CardInstance extension
//  * Gets UICard given CardInstance
//  * @param cardInstance card instance to use scryfall id of
//  * @returns associated UICard, opr null if not associated scryfallID
//  */
// export function resolveUICard(cardInstance: CardInstance): UICard | null {
//   const localCard = CARD_POOL.find(c => c.id === cardInstance.scryfallID)
//   if (!localCard) return null;
//   const uiCard: UICard = { ...localCard, instanceID: cardInstance.instanceID }
//
//   return uiCard;
// }

