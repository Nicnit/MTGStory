Plan:

Story phase:
- Auto draw random hand
- Actions:
  - Select card
    - Assign text to it
  - Drag/Drop card into pre-existing container (signifying order of story)
    - Can add new containers to lengthen the story / refer back to cards?
  - Submit the story
    - Each card from the hand must have been used for the story.
      - Necessarily requires all HAND_SIZE containers be filled , with unique cards.


Separation of concerns:
App.tsx with the differen boards handles logc
Hand it dumb



1. Game.ts - Added PlayerState type with cardTexts field and setCardText move to store card text in game state
2. App.tsx - Fixed JSX syntax and changed Hand to use onCardSelect prop that calls moves.setCardText(card.id, text)
3. Hand.tsx - Rewrote to:
   - Track selectedCard state
   - Show inline text input beside cards when a card is clicked
   - Submit text to game state on button click or Enter key
4. index.css - Added .card-input styling for the inline input UI
The input appears beside the cards when clicked, and after submitting, it closes and keeps the card in hand.
