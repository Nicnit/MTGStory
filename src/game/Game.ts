import type { Game } from 'boardgame.io';
import { getRandomCard } from '../data/card-data';
import { CardInstance } from '@/global-types/card';
import { INVALID_MOVE } from 'boardgame.io/dist/types/src/core/constants';
import { PlacedCardInstance } from '@/global-types/card';

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
  sharedBoard: PlacedCardInstance[];
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
        activePlayers: { all: 'ANY' }, // TODO change ANY to make specific players active
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
        * Draws a number of random cards for the passed playerID (must be active player)
        * @param state - gamestate of active player
        * @returns updates state's next card ID and player's hand 
        */
        drawCard: ({ G, playerID },) => {
          // getRandomCard();
          if (playerID && G.players[playerID]) {
            const { retHand, nextID } = drawCards(
              G.players[playerID].secretHand,
              1,
              G.nextCardID,
              playerID)
            G.players[playerID].secretHand = retHand;
            G.nextCardID = nextID;
          } else { return INVALID_MOVE }
        },
        /**
        * Play a card on the board for all to see, with its story text
        * @param gamestate - state, and ID of player playing card (must be active)
        * @param cardIDToPlay - which card to play
        * @param boardCards - boardcards to use when returning new boardstate?
        * @returns new board cards
        */
        playCard: (
          { G, playerID },
          cardIDToPlay: string
        ) => {
          // Move card from that hand into new zone
          if (!playerID || !G.players[playerID]) return INVALID_MOVE

          const hand = G.players[playerID].secretHand.cards;
          const cardIndex = hand.findIndex(card =>
            card.instanceID === cardIDToPlay)
          if (cardIndex === -1) return INVALID_MOVE

          // Remove the card from hand
          const [removedCard] = hand.splice(cardIndex, 1)

          // TODONOW work on coordinates
          // Add card to new zone
          const newCard: PlacedCardInstance = { ...removedCard, }
          G.sharedBoard.push(removedCard)

          return;
        },

        moveCard: (
          { G },
          cardIDToMove: string
        ) => {
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
