// MongoDB Script to Update Course Image URLs
// This script updates all course image URLs from old base URL to new base URL

// Connect to your MongoDB database
// Replace with your actual connection string
const connectionString = "mongodb://localhost:27017/your_database_name";
// Or use: "mongodb+srv://username:password@cluster.mongodb.net/database_name"

// Old and new base URLs
const OLD_BASE_URL = "http://3.7.149.39:4000/uploads/";
const NEW_BASE_URL = "https://backend.skillmarvel.com/uploads/";

// Function to update course images
async function updateCourseImages() {
    try {
        // Connect to MongoDB
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(connectionString);
        await client.connect();
        
        console.log('Connected to MongoDB');
        
        const db = client.db(); // Use your database name here
        const coursesCollection = db.collection('courses');
        
        // Find all courses with the old base URL
        const courses = await coursesCollection.find({
            image: { $regex: OLD_BASE_URL }
        }).toArray();
        
        console.log(`Found ${courses.length} courses with old image URLs`);
        
        // Update each course
        let updatedCount = 0;
        for (const course of courses) {
            const newImageUrl = course.image.replace(OLD_BASE_URL, NEW_BASE_URL);
            
            const result = await coursesCollection.updateOne(
                { _id: course._id },
                { $set: { image: newImageUrl } }
            );
            
            if (result.modifiedCount > 0) {
                updatedCount++;
                console.log(`Updated course: ${course.title}`);
                console.log(`  Old URL: ${course.image}`);
                console.log(`  New URL: ${newImageUrl}`);
                console.log('---');
            }
        }
        
        console.log(`\nUpdate completed! ${updatedCount} courses updated successfully.`);
        
        // Verify the update
        const remainingOldUrls = await coursesCollection.countDocuments({
            image: { $regex: OLD_BASE_URL }
        });
        
        console.log(`Remaining courses with old URLs: ${remainingOldUrls}`);
        
        await client.close();
        console.log('Connection closed');
        
    } catch (error) {
        console.error('Error updating course images:', error);
    }
}

// Alternative: Direct MongoDB query (run in MongoDB shell)
const directMongoQuery = `
// Run this in MongoDB shell or MongoDB Compass

// Update all courses with old base URL
db.courses.updateMany(
    { image: { $regex: "http://3.7.149.39:4000/uploads/" } },
    [
        {
            $set: {
                image: {
                    $replaceAll: {
                        input: "$image",
                        find: "http://3.7.149.39:4000/uploads/",
                        replacement: "https://backend.skillmarvel.com/uploads/"
                    }
                }
            }
        }
    ]
);

// Check the results
db.courses.find(
    { image: { $regex: "https://backend.skillmarvel.com/uploads/" } },
    { title: 1, image: 1 }
).limit(5);
`;

// Export the function
module.exports = { updateCourseImages, directMongoQuery };

// Run the script if called directly
if (require.main === module) {
    updateCourseImages();
}
