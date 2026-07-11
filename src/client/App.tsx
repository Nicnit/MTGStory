import { Client } from 'boardgame.io/react';
import { StoryGame } from '../game/Game';
import { Local } from 'boardgame.io/multiplayer';
import { UICard } from '../global-types/card.ts'
import Hand from './components/Hand';
import cardData from '../data/card-pool.json';
import { LocalCard } from '../global-types/card';
import { PHASES } from '../game/phases';
import { GameState } from '../game/Game';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDroppable
} from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import BoardDropZone from './components/Board-Drop-Zone.tsx';
import { BoardTypes } from '@/global-types/board-types.ts';

// Global Variables and Constants

const DRAG_DISTANCE_MIN = 100; // what is this TODO

const cardPool = cardData as LocalCard[];

// Boards


const GlobalBoard = ({ G, playerID, moves }: any) => {
  const handCards = getHandFromGameState(G, playerID);
  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_DISTANCE_MIN,
      }
    }),
  )
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return; // If not over anything
    const overID: string = over.id.toString();

    if (overID.startsWith('card-'))
      handleCardOverCard(event);
    else if (overID.startsWith('board-'))
      handleCardOverBoard(event);
  }

  let boardstate = 1 // 0 for upkeep, 1 for main, 2 for end, for development and debuggin
  switch (boardstate) {
    case 0: // UPkeep board
      return (
        <div>
          <h2>Upkeep Phase</h2>
          <pre>{JSON.stringify(G, null, 2)}</pre>
          <Hand
            cards={handCards}
          />
        </div >
      )
    case 1: // Main phase
      return (
        // <<useDroppable={}
        <div>
          <h2>Main Phase</h2>
          <pre>{JSON.stringify(G, null, 2)}</pre>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={handCards.map(c => c.instanceID)} strategy={horizontalListSortingStrategy}>
              <Hand cards={handCards} />
            </SortableContext>
            <BoardDropZone id={BoardTypes.MAIN} />
          </DndContext>
        </div >
      )
    case 2: // End phase
      return (
        <div>
          <h2>End Phase</h2>
        </div>
      )
    default:
      return (
        <div>
          <h2>Defaulted boardphase, error</h2>
        </div>
      )
  }
};

/**
 * Handles switching between boards (if there are any to switch between)
 */
const DynamicBoard = (props: any) => {
  // if (props.ctx.phase === PHASES.MAIN) {
  //   return <PresentingBoard {...props} />;
  // }
  return <GlobalBoard{...props} />;
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
  * @return 
  */
function getHandFromGameState(G: GameState, playerID: string | null): UICard[] {
  if (!playerID || !G.players[playerID]) {
    return [];
  }

  const cardsInstances = G.players[playerID].secretHand.cards;
  // Return the cards as UICards given teh data from the hand.
  return cardsInstances.map(
    cardInstance => {
      const localCards = cardPool.find(localCard => localCard.id === cardInstance.scryfallID)
      if (!localCards) return null;
      return {
        ...localCards,
        instanceID: cardInstance.instanceID
      };
    }
  ).filter(Boolean) as UICard[];
}

function handleCardOverBoard({ active, over }: DragEndEvent) {
  // Move the card to the board, out of hand into board array
  if (!over)
    return;
  switch (over.id) {
    case (BoardTypes.UPKEEP):
      // Do nothing, auto send card back to hand?
      break;
    case (BoardTypes.MAIN):
      // Transition card to belong to the board.
      console.log("placed on main phase board");
      break;
    case (BoardTypes.END):
      // unimplemented
      break;
    default:
      console.error(`incorrect board id usage. Used: ${over.id}`);
      break;
  }
}

function handleCardOverCard({ active, over }: DragEndEvent) {
  if (!over)
    return;
  // Move card ordering
}
