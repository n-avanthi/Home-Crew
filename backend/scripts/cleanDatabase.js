// node backend/scripts/cleanDatabase.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/Review');

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('Connected to MongoDB Atlas');
    try {
        // List all databases
        const admin = mongoose.connection.db.admin();
        const dbInfo = await admin.listDatabases();
        console.log('\nAvailable databases:');
        dbInfo.databases.forEach(db => {
            console.log('- ' + db.name);
        });

        // Clear all collections in the current database
        const collections = await mongoose.connection.db.collections();
        console.log('\nClearing all collections in current database...');
        
        for (let collection of collections) {
            const deleted = await collection.deleteMany({});
            console.log(`Cleared collection ${collection.collectionName}:`, deleted.deletedCount, 'documents');
        }

        // Verify all collections are empty
        console.log('\nVerifying collections are empty:');
        for (let collection of collections) {
            const count = await collection.countDocuments();
            console.log(`${collection.collectionName}: ${count} documents remaining`);
        }

        console.log('\nDatabase cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
})
.catch((error) => {
    console.error('Connection error:', error);
}); 