import Buyer from "./interface/buyer";
import "dotenv/config";
import { getBuyersStream, saveAnonymizedBuyers } from "./repository/buyer";
import Database from "./db/Database";
import {
  anonymizeBuyer,
  copyFromOriginalToCopyCollection,
} from "./sevice/buyer";
import { saveResumeTokenToDatabase } from "./repository/resumeToken";
import { WithId } from "mongodb";

function getInterval(buyers: WithId<Buyer>[]) {
  return setInterval(() => {
    saveAnonymizedBuyers(buyers);
  }, 1000);
}

async function run() {
  if (process.argv[2] === "--full-reindex") {
    await copyFromOriginalToCopyCollection();
    await Database.client.close();
    process.exit(0);
  }

  const buyers: WithId<Buyer>[] = [];
  const changeStream = await getBuyersStream();
  let oneSecInterval: NodeJS.Timer = getInterval(buyers);

  for await (const change of changeStream) {
    saveResumeTokenToDatabase(changeStream.resumeToken);
    if (change.operationType == "insert") {
      const buyer = change.fullDocument;
      anonymizeBuyer(buyer);
      buyers.push(buyer);
      // console.log(buyers.length);
      if (buyers.length >= 1000) {
        clearInterval(oneSecInterval);
        saveAnonymizedBuyers(buyers);
        oneSecInterval = getInterval(buyers);
      }
    }
  }
}

run().catch(console.dir);
