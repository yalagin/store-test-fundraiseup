import Buyer from "../interface/buyer";
import { faker } from "@faker-js/faker";
import Address from "../interface/address";
import { Collection, Db, WithId } from "mongodb";
import Database from "../db/Database";
import { collectionName, saveAnonymizedBuyers } from "../repository/buyer";

// Function to generate a random but deterministic character sequence of length 8
export function generateRandomString() {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

export function anonymizeBuyer(buyer: Buyer) {
  // Transform the object according to the rules
  buyer.firstName = generateRandomString();
  buyer.lastName = generateRandomString();
  buyer.email =
    generateRandomString() + buyer.email.substring(buyer.email.indexOf("@"));
  buyer.address.line1 = generateRandomString();
  buyer.address.line2 = generateRandomString();
  buyer.address.postcode = generateRandomString();
  return buyer;
}

export function generateBuyer(): Buyer {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email();
  const address: Address = {
    line1: faker.location.streetAddress(),
    line2: faker.location.secondaryAddress(),
    postcode: faker.location.zipCode(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    country: faker.location.countryCode(),
  };
  const createdAt = new Date();

  return {
    firstName,
    lastName,
    email,
    address,
    createdAt,
  };
}

export async function copyFromOriginalToCopyCollection() {
  const db: Db = Database.getDatabase();
  const sourceCollection: Collection<Buyer> = db.collection(collectionName);
  const batchSize = 1000;

  let skip = 0;
  let batchCount = 0;

  while (true) {
    const buyers: WithId<Buyer>[] = await sourceCollection
      .find()
      .skip(skip)
      .limit(batchSize)
      .toArray();

    if (buyers.length === 0) {
      break;
    }

    await saveAnonymizedBuyers(buyers);

    skip += batchSize;
    batchCount++;
    console.log(`Batch ${batchCount} copied successfully`);
  }
}
