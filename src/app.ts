import Buyer from "./interface/buyer";
import "dotenv/config";
import { insertBuyers } from "./repository/buyer";
import { generateBuyer } from "./sevice/buyer";

async function run() {
  // Generate and insert random buyers every 200 milliseconds
  setInterval(() => {
    const batchCount = Math.floor(Math.random() * 10) + 1;
    const buyers: Buyer[] = [];

    for (let i = 0; i < batchCount; i++) {
      buyers.push(generateBuyer());
    }

    insertBuyers(buyers);
  }, 200);
}

run().catch(console.dir);
