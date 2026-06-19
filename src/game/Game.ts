import type { Game } from 'boardgame.io';
import { getRandomCard } from '../data/card-data';

const INITIAL_HAND_SIZE = 7;

interface CardInstance {
  instanceID: string; // Differentite between instances of the same card. Doesn't depend on scryfallID.
  scryfallID: string;
}

export interface SecretHand { // TODO combine cardText as ? into cards array
  cards: CardInstance[];
  cardTexts: string[];
}

type PlayerState = {
  secretHand: SecretHand;
  // cardTexts: Record<string, string>; // ID to text
}

export type GameState = {
  nextCardID: number;
  sharedBoard: CardInstance[];
  players: Record<string, PlayerState>;
}

function makeCardInstanceID(instanceID: number): string {
  return (`card-${instanceID}`)
}

function drawCards(hand: SecretHand, numCards: number, startID: number): { retHand: SecretHand, nextID: number } {
  const cards: CardInstance[] = [...hand.cards];
  for (let i = 0; i < numCards; i++) {
    cards.push({
      instanceID: makeCardInstanceID(startID++),
      scryfallID: getRandomCard().id
    })
  }
  return ({
    retHand: { cards },
    nextID: startID
  })
}

export const StoryGame: Game<GameState> = {
  setup: ({ ctx }) => {
    let curNextID = 0;
    const players: Record<string, PlayerState> = {};
    // Initialize players
    for (let i = 0; i < ctx.numPlayers; i++) {
      const { retHand, nextID } = drawCards({ cards: [] }, INITIAL_HAND_SIZE, curNextID)
      curNextID = nextID;

      players[i.toString()] = {
        secretHand: retHand,
        cardTexts: {}
      }
    }
    return {
      nextCardID: curNextID,
      sharedBoard: [], // Empty board 
      players: players
    }
  },

  phases: {

    storymaking: {
      start: true,
      turn: {
        activePlayers: { all: 'ANY' },
      },
      // endIf condition is met
      moves: {
        /**
         * Draws a number of random cards
         * @param state - gamestate and playerID of who to draw cards
         * @returns updates state's next card ID and player's hand 
         */
        drawCard: ({ G, playerID }) => {
          // getRandomCard();
          if (playerID && G.players[playerID]) {
            const { retHand, nextID } = drawCards(G.players[playerID].secretHand, 1, G.nextCardID)
            G.players[playerID].secretHand = retHand;
            G.nextCardID = nextID;
          }
        },
        /**
        * Sets the player's story text for a card in their hand.
        * @param state - game state and player ID
        * @param cardID - cardID's text to be changed
        * @param text - text to set to
        * @returns null, immutably changes the player's hand.
        */
        setCardText: ({ G, playerID }, cardID: string, text: string) => {
          if (playerID && G.players[playerID]) {
            G.players[playerID].cardTexts[cardID] = text; // Immer makes this immutable
          }
        },
        /*
         * Play a card on the board for all to see, with its story text
        */
        playCard: () => {
          return; // Allow playing the card on secret board for planning?
        }
      },
    },

    presenting: {
      moves: {
        // playCard: ({ G, ctx }, cardID: string) => {
        //   // find card in hand's index, then return that card?
        // },
      },
    },
  },
  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
}
