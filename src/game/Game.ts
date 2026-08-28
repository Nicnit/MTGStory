import type { Game } from 'boardgame.io';
import { CardInstance, drawCards, SecretHand } from '@/model/card';
import { LocalBoardPosition, Board, moveCardInBoard, addCardToBoard, createBoardID } from '@/model/board';
import { INVALID_MOVE } from 'boardgame.io/dist/types/src/core/constants';
import { BoardBounds } from '@/model/geometry';

const INITIAL_HAND_SIZE = 7;

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




export const StoryGame: Game<GameState> = {
  setup: ({ ctx }) => {
    const players: Record<string, PlayerState> = {};
    let nextCardID = 0
    for (let i = 0; i < ctx.numPlayers; i++) {
      const drawn = drawCards({ cards: [] }, INITIAL_HAND_SIZE, nextCardID, i.toString())
      nextCardID = drawn.nextID
      const hand: SecretHand = { cards: drawn.cards, playerID: i.toString() }

      players[String(i)] = {
        secretHand: hand,
        turnsTaken: 0
      }
    }

    // TODO remove placeholder buonds
    //
    const placeholderBounds: BoardBounds = { origin: { x: 0, y: 0 }, width: 1000, height: 1000 }
    return {
      nextCardID: nextCardID,
      // TODO method to get bounds of board

      sharedBoard: { id: createBoardID(0), placedCards: [], bounds: placeholderBounds }, // Empty board. Shared board gets ID of 0
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
          const { cards, nextID } = drawCards(
            G.players[playerID].secretHand,
            1,
            G.nextCardID,
            playerID
          )
          G.players[playerID].secretHand = { playerID, cards }
          G.nextCardID = nextID
        },
        /**
        * Play a card on the board for all to see, with its story text
        * @param gamestate state, and ID of player playing card (must be active)
        * @param cardID which card to play
        * @param pos position on the board to play it at
        * @returns new board cards
        */
        playCard: (
          { G, playerID },
          cardID: string,
          pos: LocalBoardPosition
        ) => {
          // Move card from that hand into new zone
          if (!playerID || !G.players[playerID]) return INVALID_MOVE

          const board = G.sharedBoard // Make dynamic eventually?
          const hand = G.players[playerID].secretHand.cards;
          const cardIndex = hand.findIndex(card =>
            card.instanceID === cardID)
          if (cardIndex === -1) return INVALID_MOVE

          const [removedCard]: CardInstance[] = hand.splice(cardIndex, 1)

          const newBoard: Board = addCardToBoard(removedCard, board, pos)

          // TODONOW work on coordinates (after workign on bounds)
          // Add card to new zone
          // package move into helper

          newBoard.

            G.sharedBoard = newBoard

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
          const newBoard: Board | null = moveCardInBoard(cardID, G.sharedBoard, pos)
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
