import mongoose from "mongoose";

export async function initDb(uri: string): Promise<void> {
  await mongoose.connect(uri);
}
