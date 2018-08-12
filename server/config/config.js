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