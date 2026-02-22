import { Client } from 'boardgame.io/react';
import { StoryGame } from '../game/Game';
import { Local } from 'boardgame.io/multiplayer';
import Hand from './components/Hand';
import cardData from '../data/card-pool.json';
import { LocalCard } from '../global-types/card';
import { PHASES } from '../game/phases';

const cardPool = cardData as LocalCard[];

const StoryMakingBoard = ({ moves }: any) => {
  const hand = cardPool.slice(0, 5);

  return (
    <div>
      <h2>Story Making Phase</h2>
      <Hand
        cards={hand}
        getAction={(_card) => () => moves.drawCard()}
      />
    </div>
  );
};

const PresentingBoard = ({ moves }: any) => {
  const hand = cardPool.slice(0, 5);

  return (
    <div>
      <h2>Presenting Phase</h2>
      <Hand
        cards={hand}
        getAction={(card) => () => moves.playCard(card.id)}
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
