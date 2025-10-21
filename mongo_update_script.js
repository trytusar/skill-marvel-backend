// MongoDB Shell Script to Update Course Image URLs
// Run this script in MongoDB shell or MongoDB Compass

// Step 1: Check current courses with old URLs
print("=== Checking courses with old image URLs ===");
db.courses.find(
    { image: { $regex: "http://3.7.149.39:4000/uploads/" } },
    { title: 1, image: 1 }
).forEach(function(course) {
    print("Course: " + course.title);
    print("Image: " + course.image);
    print("---");
});

// Step 2: Count courses that need updating
var oldUrlCount = db.courses.countDocuments({
    image: { $regex: "http://3.7.149.39:4000/uploads/" }
});
print("Total courses with old URLs: " + oldUrlCount);

// Step 3: Update all courses with old base URL
print("\n=== Updating course image URLs ===");
var updateResult = db.courses.updateMany(
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

print("Matched documents: " + updateResult.matchedCount);
print("Modified documents: " + updateResult.modifiedCount);

// Step 4: Verify the update
print("\n=== Verification ===");
var newUrlCount = db.courses.countDocuments({
    image: { $regex: "https://backend.skillmarvel.com/uploads/" }
});
print("Courses with new URLs: " + newUrlCount);

// Step 5: Show sample updated courses
print("\n=== Sample updated courses ===");
db.courses.find(
    { image: { $regex: "https://backend.skillmarvel.com/uploads/" } },
    { title: 1, image: 1 }
).limit(5).forEach(function(course) {
    print("Course: " + course.title);
    print("Image: " + course.image);
    print("---");
});

// Step 6: Check for any remaining old URLs
var remainingOldUrls = db.courses.countDocuments({
    image: { $regex: "http://3.7.149.39:4000/uploads/" }
});
print("Remaining courses with old URLs: " + remainingOldUrls);

if (remainingOldUrls === 0) {
    print("✅ All course image URLs updated successfully!");
} else {
    print("⚠️ Some courses still have old URLs. Please check manually.");
}
