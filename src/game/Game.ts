import type { Game } from 'boardgame.io';
import { getRandomCard } from '../data/card-data';
import { CardInstance } from '@/global-types/card';
import { LocalBoardPosition } from '@/global-types/card';
import { INVALID_MOVE } from 'boardgame.io/dist/types/src/core/constants';
import { PlacedCardInstance } from '@/global-types/card';
import { Board } from '@/global-types/board';

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
  sharedBoard: Board;
  players: Record<string, PlayerState>;
}

// Helper Functions

function makeCardInstanceID(instanceID: number): string {
  return (`card-${instanceID}`)
}

function drawCardsHelper(hand: SecretHand, numCards: number, startID: number, playerID: string): { hand: SecretHand, nextID: number } {
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

function moveCardHelper(
  cardID: string,
  board: Board,
  newPos: LocalBoardPosition
): Board | null {
  const i = board.placedCards.findIndex(
    card => card.instanceID === cardID);
  if (i === -1) return null

  return {
    placedCards: board.placedCards.map(
      (card, j) =>
        j === i ? { ...card, position: newPos } : card
    ),
  }
}

export const StoryGame: Game<GameState> = {
  setup: ({ ctx }) => {
    let curNextID = 0;
    const players: Record<string, PlayerState> = {};
    // Initialize players
    for (let i = 0; i < ctx.numPlayers; i++) {
      const { hand, nextID } = drawCardsHelper({ cards: [] }, INITIAL_HAND_SIZE, curNextID, i.toString())
      curNextID = nextID;

      players[String(i)] = {
        secretHand: hand,
        turnsTaken: 0
      }
    }
    return {
      nextCardID: curNextID,
      sharedBoard: { placedCards: [] }, // Empty board
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
          if (!playerID || !G.players[playerID]) return INVALID_MOVE
          const { hand, nextID } = drawCardsHelper(
            G.players[playerID].secretHand,
            1,
            G.nextCardID,
            playerID)
          G.players[playerID].secretHand = hand;
          G.nextCardID = nextID;
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
          cardIDToPlay: string,
          position: LocalBoardPosition
        ) => {
          // Move card from that hand into new zone
          if (!playerID || !G.players[playerID]) return INVALID_MOVE

          const hand = G.players[playerID].secretHand.cards;
          const cardIndex = hand.findIndex(card =>
            card.instanceID === cardIDToPlay)
          if (cardIndex === -1) return INVALID_MOVE

          // Remove the card from hand
          const [removedCard]: CardInstance[] = hand.splice(cardIndex, 1)

          // TODONOW work on coordinates
          // Add card to new zone
          // package move into helper
          G.sharedBoard.placedCards.push({ ...removedCard, position })

          return;
        },

        /**
        * Returns a new Board with an updated Card Position
        * @param cardID - ID of card to move
        * @param board - Board with card to move
        * @param newPos - new position of the card
        */
        moveCard: (
          { G, },
          cardID: string,
          pos: LocalBoardPosition
        ) => {
          // TODO list:
          // check new position is in boudns and valid
          // check active player has permission to move the cards
          const newBoard: Board | null = moveCardHelper(cardID, G.sharedBoard, pos)
          if (newBoard === null) return INVALID_MOVE
          G.sharedBoard = newBoard
          return;
        }
      },
    },
  },
  turn: {
    minMoves: 1,
    maxMoves: 10, // TODO configure correctly. 
  },
}
