/**
 * PORT
 */
process.env.PORT = process.env.PORT || 3000;
/**
 * Profile
 */
process.env.PROFILE = process.env.PROFILE || 'prod';
/**
 * DB
 */
let mongoDBUrl;
if (process.env.PROFILE === 'dev') {
    mongoDBUrl = 'mongodb://localhost:27017/cafe'
} else {
    mongoDBUrl = 'mongodb://cafe-user:cafe-user123456*@ds119652.mlab.com:19652/cafe'
}

process.env.MONGO_DB_URL = mongoDBUrl;