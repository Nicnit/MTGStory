import { CardInstance, PlacedCardInstance, removeCardFromHand } from "./card";
import { Position2D, BoardBounds, isValidPosition, clampBoardPosition } from "./geometry";

const BOARD_ID_PREPEND = "board-"; // what to prepend before the board ID, in createBoardID

export interface Board {
  id: string,
  placedCards: PlacedCardInstance[],
  bounds: BoardBounds
}

export interface LocalBoardPosition extends Position2D {
  boardID: string
}


// Operations and such

/**
 * Adds a card to a board, with a position
 * @param card card to be added
 * @param board board to adad card to
 * @param pos position of card in board
 * @returns new board
 */
export function addCardToBoard(card: CardInstance, board: Board, pos: Position2D): Board {
  if (!isValidPosition(pos, board.bounds)) pos = clampBoardPosition(pos, board.bounds)

  return {
    id: board.id,
    bounds: board.bounds,
    placedCards: [...board.placedCards, { ...card, position: { ...pos, boardID: board.id } }]
  }
}


/**
 * Changes position of card in a board, if the new position is valid.
 * @param cardID ID of card to move
 * @param board board containing card to move
 * @param pos new Position of the board
 * @returns null if position invalid, otherwise new Board with updated position
 */
export function moveCardInBoard(
  cardID: string,
  board: Board,
  pos: Position2D
): Board | null {
  const i = board.placedCards.findIndex(
    card => card.instanceID === cardID
  )
  if (i === -1) return null

  if (!isValidPosition(pos, board.bounds))
    pos = clampBoardPosition(pos, board.bounds)

  return {
    id: board.id,
    placedCards: board.placedCards.map(
      (card, j) =>
        j === i ? { ...card, position: { ...card.position, x: pos.x, y: pos.y } } : card
    ),
    bounds: board.bounds
  }
}

/**
 * Removes a card from a board by card ID
 * @param board board with card to remove
 * @param cardID card to remove
 * @returns a new board without the card
 */
export function removeCardFromBoard(cardID: string, board: Board): Board {
  let ind;
  ind = board.placedCards.findIndex(card => card.instanceID === cardID)
  if (ind === -1) return { ...board } // Card already not on board

  return {
    ...board,
    placedCards: board.placedCards.toSpliced(ind, 1)
  }
}


/**
 * prepend the board ID
 * @param IDnumber the number to apppend
 */
export function createBoardID(IDnumber: number) {
  return BOARD_ID_PREPEND + IDnumber.toString();
}
