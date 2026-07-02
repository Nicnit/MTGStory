import fs from 'fs';
import path from 'path';
import { CardType, CARD_TYPES } from '../src/global-types/card-types';
import { ScryfallCard } from '../src/global-types/card'
import { LocalCard } from '../src/global-types/card'
import readline from 'readline';

// parameters, change as necessary
const checkDownloadPrompt = "Update the cardbase? Only do if necessary. Replaces entirely. Doesn't download images (gets URIs).\n Y/N: ";
const downloadType = "oracle_cards";
// For the processed cards, not the raw data
const relativeDownloadLocation = "../src/data/card-pool.json"
// The raw card data of the downloadType category
let rawDataBulkFinal: ScryfallCard[]

// Less likely to be changed
const appName = "mtg-story-app" // For identification in scryfall requests

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
  // Instead, using string variable to avoid holding unnecessary data
  // Some commented code below is old, meant for file path usage. Ignore it.
  // const inputPath = path.resolve(process.cwd(), 'scripts/scryfall-raw.json');
  const outputPath = path.resolve(process.cwd(), 'src/data/card-pool.json');
  //
  // try {
  //   // Check input file exists
  //   if (!fs.existsSync(inputPath)) {
  //     console.error(`Input file not found, expected ${inputPath}`);
  //     process.exit(1);
  //   }

  // console.log('Reading scryfall data from:', inputPath);
  // const rawData = fs.readFileSync(inputPath, 'utf-8');
  let scryfallData: ScryfallCard[];
  //
  // try {
  //   scryfallData = JSON.parse(rawData);
  // } catch {
  //   console.error(`Failed parsing data from ${inputPath}`);
  //   process.exit(1);
  // }

  const processedCards: LocalCard[] = rawDataBulkFinal
    // only checking image_uris?.normal doesn't handle MDFCs, multi faces cards.
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

  console.log(`Processed ${processedCards.length} cards from ${rawDataBulkFinal.length} raw cards`);

  // Checking output dir exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Output directory didn\`t exist, created it at ${outputDir}.`)
  }

  fs.writeFileSync(outputPath, JSON.stringify(processedCards, null, 2));
  console.log('Written to:', outputPath);

  // } catch (err) {
  //   console.error('Unexpected error:', err);
  //   process.exit(1);
  // }
}

/**
  * update the raw database to Scryfall's latest. Uses user input.
  */
async function checkAndUpdateScryfallData() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log("Data update not yet implemented.");

  await askQuestion();

  await downloadData(downloadType)

  quitQuestionFunction();

  // Local Helpers
  /**
   * https://api.scryfall.com/bulk-data
   * Where to find identifiers to download bulk from ^
   * @param oracle_cards has unique cards only, no art reprints
   * @param unique_artwork has each art without duplicate reprints
   * Download the data from Scryfall
   * storing at relativeDownloadLocation
    */
  async function downloadData(downloadType: 'oracle_cards' | 'unique_artwork') {
    const bulkString = "https://api.scryfall.com/bulk-data"
    const catalogResponse = await fetch(bulkString, {
      headers: { 'User-Agent': appName, 'Accept': 'application/json' }
    })

    if (!catalogResponse.ok) throw new Error(`Catalog fetch failed: ${catalogResponse.status}`)
    // The catalog showing where bulk data can be downloaded from
    const catalog = await catalogResponse.json();

    // Could create interface to explicitly define item structure if bugging
    const entry = catalog.data.find((item: any) => item.type === downloadType);
    if (!entry)
      throw new Error(`Bulk type ${downloadType} found no match`)
    const downloadUri = entry.download_uri

    // Downloading data, async. This uses memory, probably less that 200mb
    console.log(`Downloading ${downloadType} data from ${downloadUri}`);
    const bulkDataResponse = await fetch(downloadUri, {
      headers: { 'User-Agent': appName, 'Accept': 'application/json' }
    })

    if (!bulkDataResponse.ok) throw new Error(
      `Bulk download failed of type ${downloadType} from ${downloadUri}.
      \nOf size ${entry.size}`)
    rawDataBulkFinal = await bulkDataResponse.json();

    // The text data is then used in processCards()
  }

  async function askQuestion() {

    let userAns = await getQuestionAnswer();

    switch (userAns.toUpperCase()) {
      case "Y":
        break;
      case "N":
        quitQuestionFunction();
        return;
      default:
        console.log("Valid input is Y or N");
        await askQuestion();
    }
  }
  function getQuestionAnswer(): Promise<string> {
    return new Promise((resolve) => {
      rl.question(checkDownloadPrompt, (answer) => {
        resolve(answer);
      })
    })
  }
  function quitQuestionFunction() {
    console.log("Proceeding to process the cards.");
    rl.close();
  }
}

await checkAndUpdateScryfallData();

processCards();
