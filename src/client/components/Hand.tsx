import Card from './Card';
import { LocalCard } from '../../global-types/card';

interface HandProps {
  cards: LocalCard[];
  getAction: (card: LocalCard) => () => void | undefined;
}

function Hand({ cards, getAction }: HandProps) {
  return (
    <div className="hand">
      {cards.map((card) => (
        <Card
          key={card.id}
          name={card.name}
          image={card.image}
          onClick={getAction(card)}
        />
      ))}
    </div>
  );
}

export default Hand;
