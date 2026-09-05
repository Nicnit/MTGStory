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
import { useState } from 'react';
import { PlacedCardInstance } from '../model/card';
import Card from './components/Card';

// Global Variables and Constants

const DRAG_DISTANCE_MIN = 1;

const cardPool = cardData as LocalCard[];

interface ActiveCardState {
  activeCard: UICard, // Only track UICard, only for displaying
  sourceState: 'hand' | 'board' // where it is coming from
}

// Boards


const GlobalBoard = ({ G, playerID, moves }: any) => {
  const [activeCardData, setActiveCard] = useState<ActiveCardState | null>(null); // for putting card in overlay, can then drag longer
  const handCards: HandCardInstance[] = G.players[playerID].secretHand.cards

  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_DISTANCE_MIN,
      }
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const foundCardInHand = handCards.find((c: UICard) => event.active.id === c.id)
    const foundCardInBoard: PlacedCardInstance = G.sharedBoard.placedCards.find((c: PlacedCardInstance) => c.instanceID === active.id)

    if (!foundCardInHand && !foundCardInBoard) return; // can't find the card

    if (foundCardInBoard) {
      if (foundCardInBoard.playerOwnerID !== playerID) return // not owned by this player, do not drag (DRAGSETTING)
      setActiveCard({ activeCard: foundCardInBoard, sourceState: 'board' });
      return;
    } else if (foundCardInHand) {
      // implicit ownership in hand
      // if (foundCardInHand.playerOwnerID !== playerID) return // not owned by this player 
      setActiveCard({ activeCard: foundCardInHand, sourceState: 'hand' })
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active: cardInfo, over } = event
    if (!cardInfo || !over || !activeCardData) return;
    let source;
    if (activeCardData.activeCard.instanceID !== cardInfo.id) {
      // independently find source if not already known via ActiveCardState. for edge cases. a bit sloppy
      source = G.sharedBoard.placedCards.find((c: PlacedCardInstance) => c.instanceID === activeCardData.activeCard.instanceID)
        ? 'board' : 'hand' // set src to board if card found in board, otherwise set to hand.
    } else {
      source = activeCardData.sourceState
    }

    // Card pixel location
    const cardRect = cardInfo.rect.current.translated;
    if (!cardRect) return
    const cardCenter = {
      x: cardRect.left + cardRect.width / 2,
      y: cardRect.top + cardRect.height / 2
    }



    if (over.id === "board") {
      //handle if from board
      const boardPos = pixelPosToLocal(cardCenter, over.rect, G.sharedBoard.bounds)
      if (source === 'board') {
        moves.moveCard(cardInfo.id as string, boardPos)
      }
      //handle if from hand
      else if (source === 'hand') {
        moves.playCard(cardInfo.id as string, boardPos)
      }
    }
    else if (over.id === "hand") {
      // get position to sort within hand. position should be consistent enough to not require recalculations of older positions
      const screenPos = cardCenter
      if (source === 'board') {
        moves.pickUpCard(cardInfo.id as string, screenPos.x)
      }
      else if (source === 'hand') {
        // do nothing, reorder?
      }
    }

    setActiveCard(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div>

        <h2>Main Phase</h2>
        <pre>{JSON.stringify(G, null, 2)}</pre>

        <BoardDropZone id="board" bounds={G.sharedBoard.bounds} placedCards={G.sharedBoard.placedCards} />
        <Hand cards={handCards} />

      </div >
      <DragOverlay>
        {activeCardData?.activeCard ? (<Card id={activeCardData.activeCard.instanceID} name={activeCardData.activeCard.name} image={activeCardData.activeCard.image} />)
          // Show the actively dragged card in drag overlay to extend drag distance. can add drag drop etc effect
          : null}
      </DragOverlay>
    </DndContext>
  )
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





// Other Helpers
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
