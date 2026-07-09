import { useState } from 'react';
import Card from './Card';
import { LocalCard } from '../../global-types/card';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { UICard } from '../../global-types/card';

interface HandProps {
  cards: UICard[];
  onCardSubmit: (card: LocalCard, text: string) => void;
  cardTexts: Record<string, string>; // Mapping from PlayerState.cardTests
}
/**
  * Handles cards in the hand and editing of their text
  *
  * @param cards - 
  * @param onCardSubmit - function to run when submitting card with text
  */
function Hand({ cards, onCardSubmit, cardTexts }: HandProps) {
  const [selectedCard, setSelectedCard] = useState<LocalCard | null>(null);
  const [inputText, setInputText] = useState('');

  const handleCardClick = (card: LocalCard) => {
    if (selectedCard?.id === card.id) { // Deselects the card
      setSelectedCard(null);
      setInputText('');
    } else {
      setSelectedCard(card);
      setInputText(cardTexts[card.id] || '');
    }
  };

  const handleSubmit = () => {
    if (selectedCard && inputText.trim()) {
      onCardSubmit(selectedCard, inputText);
      // Reset the temporary values
      setSelectedCard(null);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

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
        {selectedCard && (
          <div className="card-input">
            <p>Write your story element for: {selectedCard.name}</p>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter story text..."
              autoFocus
            />
            <button onClick={handleSubmit}>Submit</button>
          </div>
        )}
      </div>
    </SortableContext>
  );
}

export default Hand;
