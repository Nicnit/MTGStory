import type { Game } from 'boardgame.io';
import { getRandomCard } from '../data/card-data';

export const StoryGame: Game = {
  setup: () => ({
    deck: [] as string[], // TODO work on layout: arrays of arrays of boardstates for each player?
    hand: [] as string[], // string if IDs of cards
    board: [] as string[],
  }),
  phases: {
    storymaking: {
      start: true,
      moves: {
        drawCard: ({ G }) => {
          const card = getRandomCard();
          G.hand.push(card.id);
        },
      },
    },
    presenting: {
      moves: {
        playCard: ({ G }, id: string) => {
          G.board.push(id);
        },
      },
    },
  },
  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
};
