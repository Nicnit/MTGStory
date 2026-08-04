import { errors } from "playwright";
import { CardInstance, PlacedCardInstance } from "./card";

// Note this system uses DOwn-y coords. Origin is Top Left

export interface Board {
  id: number,
  placedCards: PlacedCardInstance[],
  bounds: BoardBounds
}

export interface Position2D {
  x: number,
  y: number,
}

export interface LocalBoardPosition extends Position2D {
  board: Board
}

// origin is effectively top left, with width and height are bottom right
export interface BoardBounds {
  origin: Position2D,
  width: number,
  height: number
}

// Operations and such


/**
 * Returns if position is within its boards bounds. uses down-y coordinates: top left is origin
 * @param pos The position with the board to be checked
 * @returns if the position is in bounds
 */
export function isValidPosition(pos: Position2D, bounds: BoardBounds): boolean {
  return (
    pos.x > bounds.origin.x &&
    pos.x < bounds.origin.x + bounds.width &&
    pos.y > bounds.origin.y &&
    pos.y < bounds.origin.y + bounds.height
  )
}

/**
 * Returns clamped card point position within bounds. Notably doesn't consider card's height/width
 * @param pos Position of card's point
 * @param bounds Bounds to clamp point within
 * @returns clamped position
 */
export function clampBoardPosition(pos: Position2D, bounds: BoardBounds): Position2D {
  // if (isValidPosition(pos, bounds)) return pos

  return {
    x: Math.min(Math.max(pos.x, bounds.origin.x), bounds.origin.x + bounds.width),
    y: Math.min(Math.max(pos.y, bounds.origin.y), bounds.origin.y + bounds.width)
  }
}


/**
 * Adds a card to a board, with a position
 * @param card card to be added
 * @param board board to adad card to
 * @param pos position of card in board
 * @returns null if invalid parameters or position, otherwise new board
 */
export function addCardToBoard(card: CardInstance, board: Board, pos: Position2D): Board | null {
  if (
    !board.bounds ||
    !isValidPosition(pos, board.bounds)
  ) return null

  return {
    id: board.id,
    bounds: board.bounds,
    placedCards: [...board.placedCards, { ...card, position: { ...pos, board: board } }]
  }
}

// Play Card onto Board
// MOve Card within Board

/**
 * Changes position of card in a board, if the new position is valid.
 * @param cardID ID of card to move
 * @param board board containing card to move
 * @param newPos new Position of the board
 * @returns null if position invalid, otherwise new Board with updated position
 */
export function moveCardInBoard(
  cardID: string,
  board: Board,
  newPos: LocalBoardPosition
): Board | null {
  const i = board.placedCards.findIndex(
    card => card.instanceID === cardID
  )
  if (
    i === -1 ||
    !isValidPosition(board.placedCards[i].position, board.bounds)
  ) return null

  return {
    id: board.id,
    placedCards: board.placedCards.map(
      (card, j) =>
        j === i ? { ...card, position: newPos } : card
    ),
    bounds: board.bounds
  }
}



// Remove Card from Board
// Move Card from Board to Hand


