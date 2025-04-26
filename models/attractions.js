//ใช้งาน mongoose 
const mongoose = require('mongoose')
//เชื่อม mongoDB
const dbUrl = 'mongodb+srv://nut:admin@touristdb.6venq.mongodb.net/TouristDB';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,  // Timeout for server selection
    connectTimeoutMS: 30000         // Timeout for initial connection
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('Error connecting to MongoDB:', err));



//ออกแบบ schema
let reviewSchema = mongoose.Schema({
    Username:String,
    Rating:String,
    Review:String,
    province:String,
    place:String,
    cleaned_text:String,
    xgboost_predicted_sentiment:Number,
    xgboost_predicted_sentiment_label:String,
    Negative:Number,
    Neutral:Number,
    Positive:Number
})

// Merged_places Schema
const mergedPlacesSchema = mongoose.Schema({
    Description: String,
    Image1: String,
    Image2: String,
    Image3: String,
    Image4: String,
    Image5: String,
    Review: String,
    Summarized_Review: String,
    latitude: Number,
    longitude: Number,
    place: String,
    province: String,
    region: String,
    user_reviews: [mongoose.Schema.Types.Mixed] // Array of reviews (can hold any type)
});

// Rating schema for the 'Rate Us' page
const ratingSchema = mongoose.Schema({
    Username: String,
    Rating: Number,  // rating scale 1-5
    Comment: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//สร้าง model 
const Review = mongoose.model('Review', reviewSchema,'Review');//สร้าง collection โดย model เป็นตัวแทนของ collection 
const MergedPlace = mongoose.model('MergedPlace', mergedPlacesSchema, 'Merged_places');
const Rating = mongoose.model('Rating', ratingSchema, 'Ratings');  // New Ratings collection

//ส่งออก model
module.exports = { Review, MergedPlace, Rating};
module.exports.saveRating = function(model,data){
    model.save(data)
}
