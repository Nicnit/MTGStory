/*
 * Position related
 */

import { Board, LocalBoardPosition } from "./board";

// --- Type definitions

// origin is effectively top left, with width and height are bottom right
export interface BoardBounds {
  origin: Position2D,
  width: number,
  height: number
}

export interface Position2D {
  x: number,
  y: number,
}

// --- Function definitions

/**
 * Returns if position is within its boards bounds. uses down-y coordinates: top left is origin
 * @param pos The position with the board to be checked
 * @returns if the position is in bounds
 */
export function isValidPosition(pos: Position2D, bounds: BoardBounds): boolean {
  return (
    pos.x >= bounds.origin.x &&
    pos.x <= bounds.origin.x + bounds.width &&
    pos.y >= bounds.origin.y &&
    pos.y <= bounds.origin.y + bounds.height
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
    y: Math.min(Math.max(pos.y, bounds.origin.y), bounds.origin.y + bounds.height)
  }
}

/**
 * Convert pixel position to local logical position
 *  @param pixelPoint screen pixel point 
 *  @param zoneRect the pixel screen zone's rectangle
 *  @param bounds the logical zone's bounds
 */
export function pixelPosToLocal(
  pixelPoint: { x: number; y: number },
  zoneRect: { left: number; top: number; width: number; height: number },
  bounds: BoardBounds
): Position2D {
  const relX = (pixelPoint.x - zoneRect.left) / zoneRect.width;
  const relY = (pixelPoint.y - zoneRect.top) / zoneRect.height;
  return {
    x: bounds.origin.x + relX * bounds.width,
    y: bounds.origin.y + relY * bounds.height,
  };
}

/**
 * Converts logical local position to position on board on screen
 * 
 * @param pos logical position
 * @param bounds bounds of the logical rectangle
 * @param dims screen space's rect's dimensions
 * @returns CSS mapped variable names
 */
export function localPosToPixel(
  pos: Position2D,
  bounds: BoardBounds,
  dims: { width: number; height: number }
) {
  const relX = (pos.x - bounds.origin.x) / bounds.width;
  const relY = (pos.y - bounds.origin.y) / bounds.height;

  return {
    left: relX * dims.width,
    top: relY * dims.height
  }
}
