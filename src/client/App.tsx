import { Client } from 'boardgame.io/react';
import { StoryGame, GameState } from '../game/Game';
import { Local } from 'boardgame.io/multiplayer';
import { UICard, LocalCard } from '../model/card'
import Hand from './components/Hand';
import cardData from '../data/card-pool.json';
import { PHASES } from '../game/phases';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDroppable
} from '@dnd-kit/core'

// Global Variables and Constants

const DRAG_DISTANCE_MIN = 5;

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
    const { active: cardInfo, over: boardInfo } = event
    if (!boardInfo) return;
    if (boardInfo.id === 'board') {
      if (cardInfo.data.current)
        const pos = // ?? 
          moves.playCard({ G, playerID }, cardInfo.id,);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div>
        <h2>Main Phase</h2>
        <pre>{JSON.stringify(G, null, 2)}</pre>
        <Hand
          cards={handCards}
        />
      </div >
    </DndContext>
  )
};

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
