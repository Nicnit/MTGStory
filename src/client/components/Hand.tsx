import { useState } from 'react';
import Card from './Card';
import { LocalCard, PlacedCardInstance } from '../../model/card';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { UICard } from '../../model/card';
import { useDraggable } from '@dnd-kit/core'

interface HandProps {
  cards: PlacedCardInstance[] // Track the "position" of just x to find the order
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
          // sort the cards here to do so in real time
          cards.map((card) => (
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
