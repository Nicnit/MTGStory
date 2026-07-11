import { useState } from 'react';
import Card from './Card';
import { LocalCard } from '../../global-types/card';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { UICard } from '../../global-types/card';
import { useDraggable } from '@dnd-kit/core'

interface HandProps {
  cards: UICard[];
}
/**
  * Handles cards in the hand and editing of their text
  *
  * @param cards - 
  */
function Hand({ cards }: HandProps) {
  const [selectedCard, setSelectedCard] = useState<LocalCard | null>(null);

  const handleCardClick = (card: LocalCard) => {
    if (selectedCard?.id === card.id) { // Deselects the card
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  // TODO make cards in hand draggable, reorderable by dragging.
  // TODO make cards in hand drop on baord when draged enough

  return (
    <SortableContext
      items={cards.map((c) => c.instanceID)}
    >
      <div className="hand">
        {cards.map((card) => (
          <Card
            key={card.instanceID}
            id={card.instanceID}
            name={card.name}
            image={card.image}
            onClick={() => handleCardClick(card)}
          />
        ))}
      </div>
    </SortableContext>
  );
}

export default Hand;
