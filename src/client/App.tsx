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
  DragEndEvent
} from '@dnd-kit/core'

const DRAG_DISTANCE_MIN = 5;

const cardPool = cardData as LocalCard[];
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

const StoryMakingBoard = ({ G, playerID, moves }: any) => {
  const hand = getHandFromGameState(G, playerID);
  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_DISTANCE_MIN,
      }
    })
  )

  return (
    <div>
      <h2>Story Making Phase</h2>
      <pre>{JSON.stringify(G, null, 2)}</pre>
      <Hand
        cards={hand}
        onCardSubmit={(card: LocalCard, text: string) => {
          moves.setCardText(card.id, text);
        }}
        cardTexts={G.players[playerID]?.cardTexts || {}}
      />
    </div >
  );
};

const PresentingBoard = ({ G, playerID }: any) => {
  const hand = getHandFromGameState(G, playerID);
  return (
    <div>
      <h2>Presenting Phase</h2>
      <Hand
        cards={hand}
        onCardSelect={(_card: LocalCard) => {
        }}
        cardTexts={G.players[playerID]?.cardTexts || {}}
      />
    </div>
  );
};

const DynamicBoard = (props: any) => {
  if (props.ctx.phase === PHASES.PRESENTING) {
    return <PresentingBoard {...props} />;
  }
  return <StoryMakingBoard {...props} />;
};

const App = Client({
  game: StoryGame,
  board: DynamicBoard,
  multiplayer: Local(),
});

export default App;
