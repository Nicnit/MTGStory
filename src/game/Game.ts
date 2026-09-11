import type { Game } from 'boardgame.io';
import { CardInstance, drawCards, removeCardFromHand, addCardToHand, SecretHand } from '@/model/card';
import { LocalBoardPosition, Board, moveCardInBoard, addCardToBoard, createBoardID } from '@/model/board';
import { INVALID_MOVE } from 'boardgame.io/core'
import { BoardBounds, Position2D } from '@/model/geometry';
import { cardBoardToHand, cardHandToBoard } from '@/model/transfer';
import { createPlayerID } from '@/model/board';

const INITIAL_HAND_SIZE = 7;
export const BOARD_DIMENSIONS_LOGICAL = [1000, 1000] // width, height respectively

export type PlayerState = {
  secretHand: SecretHand;
  turnsTaken: number;
  playerID: string;
  // Other player stats
}

export type GameState = {
  nextCardID: number;
  sharedBoard: Board;
  players: Record<string, PlayerState>;
}


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
        turnsTaken: 0,
        playerID: createPlayerID(i)
      }
    }

    // Gives  1000 units on each axis of hypothetical logical coordinates. Screen space is mapped onto these logical bounds
    const logicalBounds: BoardBounds = { origin: { x: 0, y: 0 }, width: BOARD_DIMENSIONS_LOGICAL[0], height: BOARD_DIMENSIONS_LOGICAL[1] }
    return {
      nextCardID: nextCardID,
      sharedBoard: { id: createBoardID(0), placedCards: [], bounds: logicalBounds }, // Empty board. Shared board gets ID of 0
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
          pos: Position2D // board is the shared board (for now, might change hjere)
        ) => {
          // Move card from that hand into new zone
          if (!playerID || !G.players[playerID]) return INVALID_MOVE

          const board = G.sharedBoard // Make dynamic eventually?
          const hand = G.players[playerID].secretHand

          const newState = cardHandToBoard(cardID, hand, board, pos)
          if (newState === null) return INVALID_MOVE; // Card ID missed

          G.players[playerID].secretHand = { ...newState.hand, playerID }
          G.sharedBoard = newState.board
        },

        /**
        * Updates sharedBoard to board with an updated Card Position
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
        },

        /**
         *  Pick a card up from a board into the player's hand hand
         *  @param cardID card's ID to pick from board into hand
         */
        pickUpCard: (
          { G, playerID },
          cardID: string,
          xPos: number
        ) => {
          if (!playerID || !G.players[playerID]) return INVALID_MOVE
          const found = G.sharedBoard.placedCards.find((c) => c.instanceID === cardID)

          if (!found) return INVALID_MOVE
          if (found.playerOwnerID !== playerID) return INVALID_MOVE

          const newInfo = cardBoardToHand(cardID, G.sharedBoard, xPos, G.players[playerID].secretHand)
          if (!newInfo) return INVALID_MOVE
          //
          // G.sharedBoard = newInfo.board
          // G.players[playerID].secretHand = { ...newInfo.hand, playerID }
          //
          const sorted = [...newInfo.hand.cards].sort(
            (a, b) => a.xPosition - b.xPosition
          )
          G.sharedBoard = newInfo.board
          G.players[playerID].secretHand = {
            playerID,
            cards: sorted.map((c, xPos) => ({ ...c, xPosition: xPos }))
          }

        },

        /**
        * Update position of a card, potentially reordering it
        * @param cardID id of card to update position of. it will then reorder.
        * @param xPos cards new position
        */
        moveCardInHand: (
          { G, playerID },
          cardID: string,
          xPosition: number
        ) => {
          if (!playerID || !G.players[playerID]) return INVALID_MOVE
          const hand = G.players[playerID].secretHand
          const foundCard = hand.cards.find((c) => c.instanceID === cardID)
          if (!foundCard) return INVALID_MOVE

          // reorder position
          const newCard = { ...foundCard, xPosition }
          const without = removeCardFromHand(hand, cardID)
          const inserted = addCardToHand(newCard, without)
          const sorted = [...inserted.cards].sort((a, b) => a.xPosition - b.xPosition)
          G.players[playerID].secretHand = { playerID, cards: sorted.map((c, xPosition) => ({ ...c, xPosition })) }
        }

      },
    },
  },
  turn: {
    minMoves: 1,
    maxMoves: 10, // TODO configure correctly. 
  },
}
