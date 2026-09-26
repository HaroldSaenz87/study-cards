import mongoose from "mongoose";

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;

};

const gloabalForMongoose = globalThis as unknown as { mongoose?: MongooseCache};
const cached = gloabalForMongoose.mongoose ?? { conn:null, promise: null};

gloabalForMongoose.mongoose = cached;

export async function connectDB(){
    if(cached.conn) return cached.conn;

    const uri = process.env.MONGODB_URI;

    if(!uri) throw new Error("Missing MONGODB_URI in env.local");

    cached.promise ??= mongoose.connect(uri);

    try{
        cached.conn = await cached.promise;

    }
    catch(err){
        cached.promise = null;
        throw err;
    }
    return cached.conn;
}