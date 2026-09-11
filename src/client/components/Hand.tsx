import { useState } from 'react';
import Card from './Card';
import { HandCardInstance, LocalCard, PlacedCardInstance, UICard } from '../../model/card';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

interface HandProps {
  cards: HandCardInstance[] // Track the "position" of just x to find the order
}
/**
  * Handles cards in the hand and editing of their text
  *
  * @param cards - 
  */
function Hand({ cards, activeCardData }: {
  cards: HandCardInstance[]
  activeCardData: UICard | null
}

) {
  const [selectedCard, setSelectedCard] = useState<LocalCard | null>(null);
  const { setNodeRef } = useDroppable({ id: 'hand' })

  // atm obsolete
  const handleCardClick = (card: LocalCard) => {
    if (selectedCard?.scryfall_id === card.scryfall_id) { // Deselects the card
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  // TODO make cards in hand reorderable by dragging.

  return (
    <SortableContext
      items={cards.map((c) => c.instanceID)}
    >
      <div ref={setNodeRef} className="hand">
        {
          // sort the cards here according ot current position
          [...cards]
            .sort((a, b) => a.xPosition - b.xPosition)
            .map((card) => (
              <SortableHandCard
                key={card.instanceID}
                id={card.instanceID}
                name={card.name}
                image={card.image}
                onClick={() => handleCardClick(card)}
                activeCardData={activeCardData}
              />
            ))
        }
      </div>
    </SortableContext>
  );
}

// Wrapper around Card
function SortableHandCard({ id, name, image, onClick, activeCardData }: {
  id: string; name: string; image: string; onClick?: () => void; activeCardData: UICard | null
}) {
  const { isDragging, attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  let hidden = false;
  if (activeCardData && id === activeCardData.instanceID) { hidden = true }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="hand-card" onClick={onClick}>
      <Card name={name} image={image} /> {/*Wrap around here*/}
    </div>
  )
}




export default Hand;
