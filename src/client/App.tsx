import { Client } from 'boardgame.io/react';
import { StoryGame, GameState } from '../game/Game';
import { Local } from 'boardgame.io/multiplayer';
import { UICard, LocalCard } from '../model/card'
import Hand from './components/Hand';
import cardData from '../data/card-pool.json';
import { PHASES } from '../game/phases';
import { resolveUICard } from '../model/card';
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
import Card from './components/Card';
import { PlacedCardInstance } from '../model/card';

// Global Variables and Constants

const DRAG_DISTANCE_MIN = 1;

const cardPool = cardData as LocalCard[];

interface ActiveCardState {
  activeCard: UICard, // Only track UICard, only for displaying
  sourceState: number, // 0 if from hand, 1 if from board
}

// Boards


const GlobalBoard = ({ G, playerID, moves }: any) => {
  const [activeCardData, setActiveCard] = useState<ActiveCardState | null>(null); // for putting card in overlay, can then drag longer
  const handCards = getHandFromGameState(G, playerID);

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
    const foundCardBoard = G.sharedBoard.placedCards.find((c: PlacedCardInstance) => c.instanceID === active.id)
    if (foundCardBoard !== null) {
      // From Board, set to 1
      // setActiveCard({ foundCardBoard, 1 }); TODO1
    }

    const foundCardHand = handCards.find((c) => c.instanceID === active.id)
    // setActiveCard(foundCard ?? null) TODO1
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    // handle dragging over board
    const { active: cardInfo, over } = event
    if (!over || over.id !== 'board') return;

    const cardRect = cardInfo.rect.current.translated;
    if (!cardRect) return

    const cardCenter = {
      x: cardRect.left + cardRect.width / 2,
      y: cardRect.top + cardRect.height / 2
    }

    const pos = pixelPosToLocal(cardCenter, over.rect, G.sharedBoard.bounds)
    moves.playCard(cardInfo.id as string, pos);
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
        {/* {activeCard ? (<Card id={activeCard.instanceID} name={activeCard.name} image={activeCard.image} />) */}
        {/*   // Show the actively dragged card in drag overlay to extend drag distance. can add drag drop etc effect */}
        {/*   : null} TODO1 */}
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

/**
  * Adaption layer between GameState { instanceID, scryfallID } and LocalCard from Scryfall
  *
  * @param gamestate - gamestate
  * @param playerID - player who's hand to update
  * @return Cards in hand as UICards[]
  */
function getHandFromGameState(G: GameState, playerID: string | null): UICard[] {
  if (!playerID || !G.players[playerID]) {
    return [];
  }

  const cardsInstances = G.players[playerID].secretHand.cards;
  // Return the cards as UICards given teh data from the hand.
  return cardsInstances.map(
    instance => resolveUICard(instance)
  ).filter((c): c is UICard => c !== null)
}
