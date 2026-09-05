import { Hand, removeCardFromHand, addCardToHand } from "./card"
import { Board, addCardToBoard, removeCardFromBoard } from "./board"
import { Position2D, isValidPosition, clampBoardPosition } from "./geometry"
import { HandCardInstance } from "./card"

/**
 * Return new board and hand after removing the card by ID from the hand and adding it to board at a position
 * @param cardID card to move by ID
 * @param hand hand to add card to
 * @param board board to remove card from
 * @param position position to add the card at
 * @returns an updated new board and hand, or null if card is missing
 */
export function cardHandToBoard(cardID: string, hand: Hand, board: Board, pos: Position2D): { hand: Hand, board: Board } | null {
  const card = hand.cards.find(card => card.instanceID === cardID)
  if (card === undefined) return null
  if (!isValidPosition(pos, board.bounds)) pos = clampBoardPosition(pos, board.bounds)

  const newBoard: Board = addCardToBoard(card, board, pos)
  const newHand: Hand = removeCardFromHand(hand, cardID)
  return { board: newBoard, hand: newHand }
}

/**
 * Return new board and hand after removing the card by ID from the board and adding it to hand
 * @param cardID card to move by ID
 * @param board board to remove card from
 * @param xPosition for determining order in hand via x coord
 * @param hand hand to add card to
 * @returns an updated new board and hand, or null if no placed card found by ID
 */
export function cardBoardToHand(cardID: string, board: Board, xPosition: number, hand: Hand): { board: Board, hand: Hand } | null {
  const placedCard = board.placedCards.find(card => card.instanceID === cardID)
  if (placedCard === undefined) return null
  const { position: pos, ...card } = placedCard // Destructure out the position. Explicitly make into cardInstance
  const handCard: HandCardInstance = { ...placedCard, xPosition }

  const newHand: Hand = addCardToHand(handCard, hand)
  const newBoard: Board = removeCardFromBoard(cardID, board)
  return { board: newBoard, hand: newHand }
}
