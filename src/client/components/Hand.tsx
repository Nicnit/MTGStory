import { useState } from 'react';
import Card from './Card';
import { LocalCard } from '../../global-types/card';

interface HandProps {
  cards: LocalCard[];
  onCardSelect: (card: LocalCard, text: string) => void;
}

function Hand({ cards, onCardSelect }: HandProps) {
  const [selectedCard, setSelectedCard] = useState<LocalCard | null>(null);
  const [inputText, setInputText] = useState('');

  const handleCardClick = (card: LocalCard) => {
    if (selectedCard?.id === card.id) { // Deselects the card
      setSelectedCard(null);
      setInputText('');
    } else {
      setSelectedCard(card);
      setInputText('');
    }
  };

  const handleSubmit = () => {
    if (selectedCard && inputText.trim()) {
      onCardSelect(selectedCard, inputText);
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
    <div className="hand">
      {cards.map((card) => (
        <Card
          key={card.id}
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
  );
}

export default Hand;
