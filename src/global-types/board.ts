import { errors } from "playwright";
import { CardInstance, PlacedCardInstance, removeCardFromHand } from "./card";
import { Hand } from "./card";
import Card from "@/client/components/Card";
import { addCardToHand } from "./card";

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
 * @returns null if invalid position, otherwise new board
 */
export function addCardToBoard(card: CardInstance, board: Board, pos: Position2D): Board {
  if (!isValidPosition(pos, board.bounds)) pos = clampBoardPosition(pos, board.bounds)

  return {
    id: board.id,
    bounds: board.bounds,
    placedCards: [...board.placedCards, { ...card, position: { ...pos, board: board } }]
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

  if (!isValidPosition(board.placedCards[i].position, board.bounds))
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
 * Return new board and hand after removing the card by ID from the hand and adding it to board at a position
 * @param cardID card to move by ID
 * @param hand hand to add card to
 * @param board board to remove card from
 * @param position position to add the card at
 * @returns an updated new board and hand
 */
export function handToBoard(cardID: string, hand: Hand, board: Board, pos: Position2D): { hand: Hand, board: Board } | null {
  if (!isValidPosition(pos, board.bounds)) return null // Consider clamping if incorrect

  const card = hand.cards.find(card => card.instanceID === cardID)
  if (card === undefined) return null

  const newBoard: Board = addCardToBoard(card, board, pos)
  const newHand: Hand = removeCardFromHand(hand, cardID)
  return { board: newBoard, hand: newHand }
}

/**
 * Return new board and hand after removing the card by ID from the board and adding it to hand
 * @param cardID card to move by ID
 * @param board board to remove card from
 * @param hand hand to add card to
 * @returns an updated new board and hand
 */
export function boardToHand(cardID: string, board: Board, hand: Hand): { board: Board, hand: Hand } | null {
  const card = board.placedCards.find(card => card.instanceID === cardID)
  if (card === undefined) return null

  const newHand: Hand = addCardToHand(card, hand)
  const newBoard: Board = removeCardFromBoard(cardID, board)
  return { board: newBoard, hand: newHand }
}
