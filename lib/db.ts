import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Simpan koneksi di globalThis supaya hot reload di development
// tidak membuat koneksi baru terus-menerus.
const globalForMongoose = globalThis as unknown as { _mongoose?: MongooseCache };
const cache: MongooseCache = (globalForMongoose._mongoose ??= { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI belum diisi di .env.local");

  cache.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB,
    bufferCommands: false,
  });

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}