import fs from 'fs';
import path from 'path';
import { CardType, CARD_TYPES } from '../src/global-types/card-types';
import { ScryfallCard } from '../src/global-types/card'
import { LocalCard } from '../src/global-types/card'
import readline from 'readline';

function extractCardTypes(typeLine: string): CardType[] {
  const typesIncluded: CardType[] = [];
  for (const type of CARD_TYPES) {
    if (typeLine.includes(type)) {
      typesIncluded.push(type);
    }
  }
  if (typesIncluded.length === 0)
    return [CardType.NONE];
  else
    return typesIncluded;
}

function processCards(): void {
  const inputPath = path.resolve(process.cwd(), 'scripts/scryfall-raw.json');
  const outputPath = path.resolve(process.cwd(), 'src/data/card-pool.json');

  try {
    // Check input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found, expected ${inputPath}`);
      process.exit(1);
    }

    console.log('Reading scryfall data from:', inputPath);
    const rawData = fs.readFileSync(inputPath, 'utf-8');
    let scryfallData: ScryfallCard[];

    try {
      scryfallData = JSON.parse(rawData);
    } catch {
      console.error(`Failed parsing data from ${inputPath}`);
      process.exit(1);
    }

    const processedCards: LocalCard[] = scryfallData
      .filter((card) => card.image_uris?.normal)
      .map((card) => {
        const cardTypes = extractCardTypes(card.type_line);
        return {
          id: card.id,
          name: card.name,
          type_line: card.type_line,
          card_types: cardTypes || [CardType.NONE],
          flavor: card.flavor_text || '',
          image: card.image_uris?.normal || '',
        };
      })
      .filter((card) => card.image);

    console.log(`Processed ${processedCards.length} cards from ${scryfallData.length} raw cards`);

    // Checking output dir exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Output directory didn't exist, created it at ${outputDir}.`)
    }

    fs.writeFileSync(outputPath, JSON.stringify(processedCards, null, 2));
    console.log('Written to:', outputPath);

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}


// https://api.scryfall.com/bulk-data
// Where to download bulk from ^
// 'oracle_cards' has unique cards only, no art reprints
// 'unique_artwork' has each art without duplicate reprints

/**
  * update the raw database to Scryfall's latest. Uses user input.
  */
async function checkAndUpdateScryfallData() {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.write("Data update not yet implemented.");

  const question = "Update the cardbase? Only do if necessary. Replaces entirely. Doesn't download images (gets URIs).\n Y/N";

  await askQuestion(question);

  // call update to data here TODO

  quitQuestionFunction();

  // Local Helpers
  async function askQuestion(question: string) {

    let userAns = await getQuestionAnswer(question);

    switch (userAns.toUpperCase()) {
      case ("Y"):
        break;
      case "N":
        quitQuestionFunction();
        return;
      default:
        rl.write("Valid input is Y or N");
        await askQuestion(question);
    }
  }
  function getQuestionAnswer(question: string): Promise<string> {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      })
    })
  }
  function quitQuestionFunction() {
    rl.write("Proceeding to process the cards.");
    rl.close();
  }
}

await checkAndUpdateScryfallData();

processCards();
