import { errors } from "playwright";
import { PlacedCardInstance } from "./card";

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


// Add a card at Location
// Play Card onto Board
// MOve Card within Board


// Remove Card from Board
// Move Card from Board to Hand


