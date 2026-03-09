Techstack:
Vite
React
boardgame.io
DnD-kit

MTG game where players play in a lobby, making a story out of MTG cards assigned to them, and presenting that story and then voting on the best story.

---
storymaking phase:
- [x] assign text to cards
- [ ] players can assign text at any time on the dnd-kit cards
- [ ] Drag around cards in hand to rearrange visual order

presenting phase:
- [ ] locked to active player
- [ ] clear board for presentation player
- [ ] others cant see cards until they are on board
- [ ] drag/drop card onto board, singaling played
- [ ] text graphics on card being dropped on board
    etb animation/graphic
    text appears near the card on  board
    cards on board can be dragged and moved, with their text being moved as well.
- [ ] other players can vote at end

closing phase:
compare scores and declare winner
good grahics
- [ ] winner's cards get autoplayed from left to right on board with animations.
- [ ] new game or close lobby option.

How Click vs Drag Works 
- dnd-kit has default activationConstraint: { distance: 10 }
- If pointer moves < Xpx -> onClick fires
- If pointer moves >= Xpx -> drag handles reorder


---
Low concern potential TODOs and considerations

- Allow playing the card in storymaking onto a secret board for planning?
- Allow filters by sets, year, UB, whatever scryfall offers really.
- Allow reusing same cards in presenting + multiple text boxes in storymaking phase
