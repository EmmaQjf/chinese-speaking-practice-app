import mongoose from "mongoose";

// “My cache object has:
// conn: the actual database connection (or null)
// promise: a connection-in-progress (or null)”
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var -- reuse connection across HMR in dev
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
if (process.env.NODE_ENV !== "production") {
  global.mongooseCache = cache;
}

/**
 * Reuses one Mongoose connection in development (avoids opening too many connections).
 */
export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Add it to .env.local (see .env.example).");
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
