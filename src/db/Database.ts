import { Db, MongoClient } from "mongodb";
import "dotenv/config";

/**
 * The Singleton class
 */
class Database {
  static get client(): MongoClient {
    return this._client;
  }
  private static instance: Database;
  private static db: Db;
  private static _client: MongoClient;

  private constructor() {}

  public static getDatabase(): Db {
    if (!Database.instance) {
      Database.instance = new Database();
      if (process.env.DB_URI === undefined) {
        throw new Error("DB_URI environment variable is not defined");
      }
      Database._client = new MongoClient(process.env.DB_URI);
      Database.db = Database._client.db();
      console.log("Connected to MongoDb");
    }

    return Database.db;
  }
}

export default Database;
