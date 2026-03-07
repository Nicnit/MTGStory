import type { Game } from 'boardgame.io';
import { getRandomCard } from '../data/card-data';

type PlayerState = {
  secretCards: string[];
  cardTexts: Record<string, string>;
}

export const StoryGame: Game = {
  setup: () => ({
    sharedBoard: [],
    players: {
      '0': { secretCards: [], cardTexts: {} },
      '1': { secretCards: [], cardTexts: {} },
      '2': { secretCards: [], cardTexts: {} },
      '3': { secretCards: [], cardTexts: {} },
    } as Record<string, PlayerState>
  }),

  phases: {
    storymaking: {
      start: true,
      moves: {
        drawCard: () => {
          getRandomCard();
        },
        setCardText: ({ G, playerID }, cardId: string, text: string) => {
          if (playerID && G.players[playerID]) {
            G.players[playerID].cardTexts[cardId] = text;
          }
        },
        playCard: () => { }
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
