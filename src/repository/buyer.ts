import {
  BulkWriteResult,
  Collection,
  Db,
  MongoBulkWriteError,
  UnorderedBulkOperation,
  WithId,
  WriteError,
} from "mongodb";
import Buyer from "../interface/buyer";
import Database from "../db/Database";
import { getResumeTokenFromDatabase } from "./resumeToken";
import { anonymizeBuyer } from "../sevice/buyer";

export const collectionName = "customers";
export const copyCollectionName = "customers_anonymised";

export async function insertBuyers(buyers: Buyer[]): Promise<void> {
  const collection: Collection<Buyer> =
    Database.getDatabase().collection(collectionName);

  if (buyers.length === 0) return;
  const result = await collection
    .insertMany(buyers, { ordered: false })
    .catch((err: MongoBulkWriteError) => {
      console.error(err);
    });
  if (result) console.log(`${result.insertedCount} documents were inserted`);
}

export async function saveAnonBuyers(buyers: Buyer[]) {
  if (buyers.length === 0) return;
  const collection: Collection<Buyer> =
    Database.getDatabase().collection(copyCollectionName);
  let copiedBuyers = JSON.parse(JSON.stringify(buyers));
  buyers.length = 0;
  const result = await collection
    .insertMany(copiedBuyers, { ordered: false })
    .catch((err: MongoBulkWriteError) => {
      console.error(err);
    });
  if (result) console.log(`${result.insertedCount} documents were inserted`);
}

export async function getBuyersStream() {
  const db: Db = Database.getDatabase();
  const collection: Collection<WithId<Buyer>> = db.collection(collectionName);
  // Get the last resume token from the database
  const resumeToken = await getResumeTokenFromDatabase();
  return collection.watch([], { resumeAfter: resumeToken });
}

export async function saveAnonymizedBuyers(originalBuyers: WithId<Buyer>[]) {
  if (originalBuyers.length === 0) return;

  let buyers = JSON.parse(JSON.stringify(originalBuyers));
  originalBuyers.length = 0;

  const destinationCollection: Collection<Buyer> =
    Database.getDatabase().collection(copyCollectionName);
  const bulk: UnorderedBulkOperation =
    destinationCollection.initializeUnorderedBulkOp();
  buyers.forEach((document: WithId<Buyer>) => {
    bulk
      .find({ _id: document._id })
      .upsert()
      .updateOne({ $set: anonymizeBuyer(document) });
  });

  const result: BulkWriteResult = await bulk.execute();
  console.log(`${result.modifiedCount} documents were modified`);
  console.log(`${result.upsertedCount} documents were inserted`);

  if (result.hasWriteErrors()) {
    const writeErrors = result.getWriteErrors();
    const duplicateErrors = writeErrors.filter(
      (error: WriteError) => error.code === 11000,
    ); // Duplicate key error code

    if (duplicateErrors.length > 0) {
      console.log(`Skipped ${duplicateErrors.length} duplicate documents`);
    }
  }
}
