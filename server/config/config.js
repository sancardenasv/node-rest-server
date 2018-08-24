/**
 * PORT
 */
process.env.PORT = process.env.PORT || 3000;
/**
 * Profile
 */
process.env.PROFILE = process.env.PROFILE || 'dev';
/**
 * DB
 */
let mongoDBUrl;
if (process.env.PROFILE === 'dev') {
    mongoDBUrl = 'mongodb://localhost:27017/cafe';
} else {
    mongoDBUrl = process.env.MONGO_URI;
}
process.env.MONGO_DB_URL = mongoDBUrl;

/**
 * Token Expiration time
 */
process.env.TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 30;
/**
 * Token Seed
 */
process.env.SEED = process.env.SEED || 'this-is-a-test-in-dev';
/** Google client ID */
process.env.CLIENT_ID = process.env.CLIENT_ID || '273873931711-jmtf9dff3gnne6mlh6cpee0j5ad0uek8.apps.googleusercontent.com';