import { Db, ResumeToken } from "mongodb";
import Database from "../db/Database";

const resumeTokensCollectionName = "resume_tokens";

export async function getResumeTokenFromDatabase(): Promise<ResumeToken | null> {
  const db: Db = Database.getDatabase();
  const resumeTokenCollection = db.collection(resumeTokensCollectionName);

  try {
    const result = await resumeTokenCollection.findOne();
    if (result) {
      console.error("Found resume token:", result.resumeToken);
      return result.resumeToken;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving resume token:", error);
    return null;
  }
}

export async function saveResumeTokenToDatabase(
  resumeToken: ResumeToken,
): Promise<void> {
  // Save the current resume token to your database
  // Update the stored resume token with the new one
  // You can store the resume token in a separate collection or file

  // Example using a separate collection to store the resume token
  const db: Db = Database.getDatabase();
  const resumeTokenCollection = db.collection("resume_tokens");

  try {
    const result = await resumeTokenCollection.findOne();
    if (result) {
      await resumeTokenCollection.updateOne({}, { $set: { resumeToken } });
    } else {
      await resumeTokenCollection.insertOne({ resumeToken });
    }
  } catch (error) {
    console.error("Error saving resume token:", error);
  }
}
