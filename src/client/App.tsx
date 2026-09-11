import { Client } from 'boardgame.io/react';
import { StoryGame, GameState } from '../game/Game';
import { Local } from 'boardgame.io/multiplayer';
import { UICard, LocalCard, CardInstance, HandCardInstance } from '../model/card'
import Hand from './components/Hand';
import cardData from '../data/card-pool.json';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDroppable,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core'
import BoardDropZone from './components/Board-Drop-Zone';
import { pixelPosToLocal } from '@/model/geometry';
import { useState, useRef } from 'react';
import { PlacedCardInstance } from '../model/card';
import Card from './components/Card';
import { PlayerState } from '../game/Game';

// Global Variables and Constants

const DRAG_DISTANCE_MIN = 1;
export const DROP_TRAVEL_MS = 250 // ms of drop animation duration travelling back to spot

const cardPool = cardData as LocalCard[];

interface ActiveCardState {
  activeCard: UICard, // Only track UICard, only for displaying
  sourceState: 'hand' | 'board' // where it is coming from
}

// Boards


const GlobalBoard = ({ G, playerID, moves }: any) => {
  const [activeCardData, setActiveCard] = useState<ActiveCardState | null>(null); // for putting card in overlay, can then drag longer
  const overlayClearTimer = useRef<number | null>(null)

  // Dnd-kit sensors, run hooks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_DISTANCE_MIN,
      }
    }),
  )

  const playerState = G.players[playerID];
  if (!playerState) return <p>invalid playerState (playerID of {playerID})</p>// invalid ID
  const handCards: HandCardInstance[] = playerState.secretHand.cards

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const foundCardInHand = handCards.find((c: UICard) => event.active.id === c.instanceID)
    const foundCardInBoard: PlacedCardInstance = G.sharedBoard.placedCards.find(
      (c: PlacedCardInstance) => c.instanceID === active.id)

    if (!foundCardInHand && !foundCardInBoard) return; // can't find the card

    if (overlayClearTimer.current !== null) {
      window.clearTimeout(overlayClearTimer.current)
      overlayClearTimer.current = null
    }

    // let any plater lift cared, not necessarily chasnge position
    if (foundCardInBoard) {
      setActiveCard({ activeCard: foundCardInBoard, sourceState: 'board' });
      return;
    } else if (foundCardInHand) {
      // implicit ownership in hand
      // if (foundCardInHand.playerOwnerID !== playerID) return // not owned by this player 
      setActiveCard({ activeCard: foundCardInHand, sourceState: 'hand' })
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    let wroteToG = false;
    const { active: cardInfo, over } = event

    if (!activeCardData) { setActiveCard(null); return }
    let source;
    if (activeCardData.activeCard.instanceID !== cardInfo.id) {
      // independently find source if not already known via ActiveCardState. for edge cases. a bit sloppy
      source = G.sharedBoard.placedCards.find((c: PlacedCardInstance) => c.instanceID === activeCardData.activeCard.instanceID)
        ? 'board' : 'hand' // set src to board if card found in board, otherwise set to hand.
    } else {
      source = activeCardData.sourceState
    }
    console.log('drag end', { over: over?.id, source, active: cardInfo.id })

    // card pixel location
    const cardRect = cardInfo.rect.current.translated;
    if (over && cardRect) {
      const cardCenter = {
        x: cardRect.left + cardRect.width / 2,
        y: cardRect.top + cardRect.height / 2
      }

      if (over.id === "board") {
        //handle if from board
        const boardPos = pixelPosToLocal(cardCenter, over.rect, G.sharedBoard.bounds)
        if (source === 'board') {
          // Check player ownership before updating location
          const placed = G.sharedBoard.placedCards.find((c: PlacedCardInstance) => c.instanceID === cardInfo.id)
          if (placed?.playerOwnerID === playerID) {
            moves.moveCard(cardInfo.id as string, boardPos)
            wroteToG = true;
          } else {
            // Doesn't move card due ot permissions
            // set timeout
          }
        } else if (source === 'hand') {
          moves.playCard(cardInfo.id as string, boardPos)
          wroteToG = true
        }
      } else if (
        over.id === "hand" ||
        handCards.some((c) => c.instanceID === over.id)
      ) {
        let xPos: number
        if (over.id === 'hand') {
          const mid = over.rect.left + over.rect.width / 2
          const xs = handCards.map((c) => c.xPosition)
          xPos = cardCenter.x < mid ? Math.min(-1, ...xs) : Math.max(-1, ...xs) + 1
        } else {
          // over a specific card, not hand
          const target = handCards.find((c) => c.instanceID === over.id)
          const mid = over.rect.left + over.rect.width / 2
          const base = target?.xPosition ?? 0;
          xPos = cardCenter.x < mid ? base - 0.5 : base + 0.5
        }


        // get position to sort within hand. position should be consistent enough to not require recalculations of older positions
        if (source === 'board') {
          const placed = G.sharedBoard.placedCards.find((c: PlacedCardInstance) => c.instanceID === cardInfo.id)
          if (placed?.playerOwnerID === playerID) {
            moves.pickUpCard(cardInfo.id as string, xPos)
            wroteToG = true
          } else {
            // doesn't move card due to permissions
          }
        } else if (source === 'hand') {
          // do nothing, reorder?
        }
      }
    }

    scheduleOverlayClear()
  }


  function handleDragCancel() {
    scheduleOverlayClear()
  }


  // delay setting the active card to null until after the animation
  function scheduleOverlayClear() {
    if (overlayClearTimer.current !== null) {
      window.clearTimeout(overlayClearTimer.current)
    }
    overlayClearTimer.current = window.setTimeout(() => {
      overlayClearTimer.current = null
      setActiveCard(null)
    }, DROP_TRAVEL_MS)
  }




  return (

    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div>

        <h2>Main Phase</h2>
        <pre>{JSON.stringify(G, null, 2)}</pre>

        <BoardDropZone
          id="board"
          bounds={G.sharedBoard.bounds}
          placedCards={G.sharedBoard.placedCards}
          activeCardData={activeCardData ? activeCardData.activeCard : null} />
        <Hand cards={handCards} activeCardData={activeCardData?.activeCard ? activeCardData.activeCard : null} />

      </div >
      <DragOverlay dropAnimation={{
        duration: DROP_TRAVEL_MS,
        easing: 'ease',
        sideEffects: null,
      }}>
        {activeCardData?.activeCard ? (<Card name={activeCardData.activeCard.name} image={activeCardData.activeCard.image} />)
          // Show the actively dragged card in drag overlay to extend drag distance. can add drag drop etc effect
          // Use raw Card to only show Image- not use hooks unnecessarily
          : null}
      </DragOverlay>
    </DndContext>
  )


  // Helpers

}


/**
 * Handles switching between boards (if there are any to switch between)
 */
const DynamicBoard = (props: any) => {
  // if (props.ctx.phase === PHASES.MAIN) {
  //   return <PresentingBoard {...props} />;
  // }
  return (
    <GlobalBoard{...props} />
  )
};

// Running
const App = Client({
  game: StoryGame,
  board: DynamicBoard,
  multiplayer: Local(), // TODO change off Local towards end of development
});

export default App;



// Other Helpers ---

//
// Obsolete given UICard and CardInstance extendability
//
// /**
//   * Adaption layer between GameState { instanceID, scryfallID } and LocalCard from Scryfall
//   *
//   * @param gamestate - gamestate
//   * @param playerID - player who's hand to update
//   * @return Cards in hand as UICards[]
//   */
// function getHandFromGameState(G: GameState, playerID: string | null): UICard[] {
//   if (!playerID || !G.players[playerID]) {
//     return [];
//   }
//
//   const cardsInstances = G.players[playerID].secretHand.cards;
//   // Return the cards as UICards given teh data from the hand.
//   return cardsInstances.map(
//     instance => resolveUICard(instance)
//   ).filter((c): c is UICard => c !== null)
// }
