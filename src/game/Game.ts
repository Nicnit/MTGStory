import type { Game } from 'boardgame.io';
import { getRandomCard } from '../data/card-data';
import { CardInstance } from '@/global-types/card';

const INITIAL_HAND_SIZE = 7;

/**
 * used in Game.ts to track hands of players that others can't see.
 */
export interface SecretHand { // TODO combine cardText as ? into cards array
  cards: CardInstance[];
}

type PlayerState = {
  secretHand: SecretHand;
  turnsTaken: number;
  // Other player stats
}

export type GameState = {
  nextCardID: number;
  sharedBoard: CardInstance[];
  players: Record<string, PlayerState>;
}

function makeCardInstanceID(instanceID: number): string {
  return (`card-${instanceID}`)
}

function drawCards(hand: SecretHand, numCards: number, startID: number, playerID: string): { retHand: SecretHand, nextID: number } {
  const cards: CardInstance[] = [...hand.cards];
  for (let i = 0; i < numCards; i++) {
    cards.push({
      instanceID: makeCardInstanceID(startID++),
      scryfallID: getRandomCard().id,
      playerOwnerID: playerID,
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
    const players: Record<number, PlayerState> = {};
    // Initialize players
    for (let i = 0; i < ctx.numPlayers; i++) {
      const { retHand, nextID } = drawCards({ cards: [] }, INITIAL_HAND_SIZE, curNextID, i.toString())
      curNextID = nextID;

      players[i] = {
        secretHand: retHand,
        turnsTaken: 0
      }
    }
    return {
      nextCardID: curNextID,
      sharedBoard: [], // Empty board
      players: players
    }
  },

  phases: {

    upkeep: {
      start: false, // Set to true once done developing Main
      turn: {
        activePlayers: { all: 'ANY' },
      },
      // endIf condition is met
      moves: {
      },
    },

    main: {
      start: true,
      turn: {
        activePlayers: { all: 'ANY' },
      },
      moves: {
        /**
        * Draws a number of random cards
        * @param state - gamestate and playerID of who to draw cards
        * @returns updates state's next card ID and player's hand 
        */
        drawCard: ({ G, playerID }) => {
          // getRandomCard();
          if (playerID && G.players[playerID]) {
            const { retHand, nextID } = drawCards(G.players[playerID].secretHand, 1, G.nextCardID, playerID)
            G.players[playerID].secretHand = retHand;
            G.nextCardID = nextID;
          }
        },
        /*
         * Play a card on the board for all to see, with its story text
        */
        playCard: () => {
          return;
        }
      },
    },
  },
  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
}
