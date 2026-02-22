import fs from 'fs';
import path from 'path';
import { CardType, CARD_TYPES } from '../src/global-types/card-types';

interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  flavor_text?: string;
  image_uris?: {
    normal?: string;
  };
}

interface LocalCard {
  id: string;
  name: string;
  type_line: string;
  card_type: CardType;
  flavor: string;
  image: string;
}

function extractCardType(typeLine: string): CardType | null {
  for (const type of CARD_TYPES) {
    if (typeLine.includes(type)) {
      return type;
    }
  }
  return null;
}

function processCards(): void {
  const inputPath = path.resolve(process.cwd(), 'scripts/scryfall-raw.json');
  const outputPath = path.resolve(process.cwd(), 'src/data/card-pool.json');

  console.log('Reading scryfall data from:', inputPath);
  const scryfallData: ScryfallCard[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  const processedCards: LocalCard[] = scryfallData
    .filter((card) => card.image_uris?.normal)
    .map((card) => {
      const cardType = extractCardType(card.type_line);
      return {
        id: card.id,
        name: card.name,
        type_line: card.type_line,
        card_type: cardType || CardType.CREATURE,
        flavor: card.flavor_text || '',
        image: card.image_uris?.normal || '',
      };
    })
    .filter((card) => card.image);

  console.log(`Processed ${processedCards.length} cards from ${scryfallData.length} raw cards`);

  fs.writeFileSync(outputPath, JSON.stringify(processedCards, null, 2));
  console.log('Written to:', outputPath);
}

processCards();
