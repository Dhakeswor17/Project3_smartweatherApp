const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');

const uri = "mongodb://localhost:27017";    // MongoDB connection URI
const dbName = "Smart_Weather_Station";     // Database name

// Create a new instance of the MongoClient
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to database
function connectToDatabase() {
    try {
        // Connect the mongoClient to the server
        mongoClient.connect().then(() => console.log("Connected to the database successfully!"));

        const db = mongoClient.db(dbName);

        // Specify and return the collection object
        return db.collection('Weather_Data');
    } catch (error) {
        console.log("Error connecting to the database");
    }
}

const collection = connectToDatabase();

// Store data (one document) in MongoDB
function store(data){
    collection.insertOne(data)
        .then(() => console.log('Data inserted successfully!'))
        .catch((error) => console.error('Error inserting data:', error));
}

// Read data from MongoDB
function read(query){
    try {
        return collection.find(query).toArray();
    } catch (error) {
        console.error('Error retrieving data from MongoDB:', error);
    }
}


module.exports = {
    collection,     // Collection object
    ObjectId,       // ObjectId object

    // Functions
    store,
    read,
};
