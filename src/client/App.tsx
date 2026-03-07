import { Client } from 'boardgame.io/react';
import { StoryGame } from '../game/Game';
import { Local } from 'boardgame.io/multiplayer';
import Hand from './components/Hand';
import cardData from '../data/card-pool.json';
import { LocalCard } from '../global-types/card';
import { PHASES } from '../game/phases';

// Planning in plan.md

const cardPool = cardData as LocalCard[];
const hand = cardPool.slice(0, 5); // test example hand

const StoryMakingBoard = ({ moves }: any) => {
  return (
    <div>
      <h2>Story Making Phase</h2>
      <Hand
        cards={hand}
        onCardSelect={(card: LocalCard, text: string) => { // called by Hand.tsx when card is selected
          moves.setCardText(card.id, text);
        }}
      />
    </div >
  );
};

const PresentingBoard = ({ moves }: any) => {
  return (
    <div>
      <h2>Presenting Phase</h2>
      <Hand
        cards={hand}
        onCardSelect={(card: LocalCard) => {
          // todo
        }}
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
