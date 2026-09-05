import { useState } from 'react';
import Card from './Card';
import { HandCardInstance, LocalCard, PlacedCardInstance } from '../../model/card';
import { SortableContext, useSortable } from '@dnd-kit/sortable';

interface HandProps {
  cards: HandCardInstance[] // Track the "position" of just x to find the order
}
/**
  * Handles cards in the hand and editing of their text
  *
  * @param cards - 
  */
function Hand({ cards }: HandProps) {
  const [selectedCard, setSelectedCard] = useState<LocalCard | null>(null);

  // atm obsolete
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
        {
          // sort the cards here according ot current position
          [...cards]
            .sort((a, b) => a.xPosition - b.xPosition)
            .map((card) => (
              <Card
                key={card.instanceID}
                id={card.instanceID}
                name={card.name}
                image={card.image}
                onClick={() => handleCardClick(card)}
              />
            ))
        }
      </div>
    </SortableContext>
  );
}

export default Hand;
