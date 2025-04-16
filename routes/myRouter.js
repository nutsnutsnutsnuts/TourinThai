//จัดการ routing จัดการการรับส่งข้อมูล
const express = require('express')
const router = express.Router() //รับผิดชอบเรื่องการรับส่งข้อมูลโดยให้ express ทำงานฝั่ง web server และเรียกใช้ class router อีกที 
const path = require('path')
const { Review, MergedPlace, Rating} = require('../models/attractions')



// //อ้างอิงตำแหน่งไฟล์ 
// const indexPage = path.join(__dirname,"../public/index.html")// "../" คือ การถอยออกจาก folder routes เพื่อไปเรียกใช้ folder template เนื่องจาก folder template ไม่ได้อยู่ใน folder routes
// const recommendationPage = path.join(__dirname,"../public/recommendation.html")
// const comparePage = path.join(__dirname,"../public/compare.html")
// const placeInformation = path.join(__dirname,"../public/place_info.html")


// //ต้องเขียน app.use() ก่อน app.listen เพื่อตอบกลับบน browser เมื่อรัน server เป็นการใช้งาน path เริ่มต้นซึ่งจำกัดการใช้แค่ 1-2 paths 
// //กรณีที่มีหลาย path จะเปลี่ยนไปใช้ get แทน
// router.get("/",(req,res)=>{
//     res.status(200)
//     res.type('text/html')
//     res.sendFile(indexPage)
// })

// router.get("/pages/:id",(req,res)=>{ //มีการส่ง parameter id จาก /:id
//     //res.sendFile(product1)
//     const pages = req.params.id //เก็บค่าที่ส่งมาพร้อมกับ path product ก็คืิอ id .id คือชื่อ parameter 
//     //const myhtml = `<h1>Product ${productID}</h1>`
//     //res.send(myhtml)
//     if(pages === "1"){
//         res.sendFile(indexPage)
//     }
//     else if(pages === "2"){
//         res.sendFile(recommendationPage)
//     }
//     else if(pages === "3"){
//         res.sendFile(comparePage)
//     }
//     else if(pages === "4"){
//         res.sendFile(placeInformation)
//     }

//     else{
//         res.redirect('/') //กรณีผู้ใช้งานใส่ path ผิดจะทำการ redireact กลับมาที่หน้าแรก
//     }
// })

//การส่งข้อมูลแบบ array
router.get('/', async (req, res) => {
    try {
        // Fetch 3 unique places
        const reviews = await Review.aggregate([
            {
                $group: {
                    _id: "$place", // Group by place to get unique values
                    reviewId: { $first: "$_id" },
                    Username: { $first: "$Username" },
                    Rating: { $first: "$Rating" },
                    Review: { $first: "$Review" },
                    province: { $first: "$province" },
                    place: { $first: "$place" },
                    cleaned_text: { $first: "$cleaned_text" },
                    xgboost_predicted_sentiment: { $first: "$xgboost_predicted_sentiment" },
                    xgboost_predicted_sentiment_label: { $first: "$xgboost_predicted_sentiment_label" },
                    Negative: { $first: "$Negative" },
                    Neutral: { $first: "$Neutral" },
                    Positive: { $first: "$Positive" }
                }
            },
            { $sample: { size: 3 } }, // Randomly select 3 unique places
            {
                $lookup: {
                    from: 'Merged_places',          // Collection to join
                    localField: 'place',            // Field from Review
                    foreignField: 'place',          // Field from Merged_places
                    as: 'mergedPlace'               // Output field
                }
            },
            {
                $addFields: {
                    Image1: { $arrayElemAt: ["$mergedPlace.Image1", 0] } // Get the first Image1
                }
            },
            {
                $project: {
                    mergedPlace: 0 // Exclude the full mergedPlace array
                }
            }
        ]);

        //console.log('Fetched reviews with images:', reviews);
        res.render('index.ejs', { reviews });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/recommendation', async (req, res) => {
    try {
        // Pagination setup
        const page = parseInt(req.query.page) || 1; // Get the current page from query, default to 1
        const limit = 30; // Items per page
        const skip = (page - 1) * limit;

        // Define the list of keywords you want to search for
        const keywords = ['Dam', 'park', 'garden', 'waterfall', 'wat', 'cafe', 'hotel'];
        let keywordCounts = {};

        // Count places for each keyword
        for (let kw of keywords) {
            const count = await MergedPlace.countDocuments({
                place: { $regex: kw, $options: 'i' } // Case-insensitive match for places
            });
            keywordCounts[kw] = count; // Store the count for each keyword
        }

        // Get the total count of unique places
        const totalReviews = await Review.aggregate([
            { $group: { _id: "$place" } },
            { $count: "total" }
        ]);

        const totalItems = totalReviews[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        // Fetch paginated unique places
        const reviews = await Review.aggregate([
            {
                $group: {
                    _id: "$place",
                    reviewId: { $first: "$_id" },
                    Username: { $first: "$Username" },
                    Rating: { $first: "$Rating" },
                    Review: { $first: "$Review" },
                    province: { $first: "$province" },
                    place: { $first: "$place" },
                    cleaned_text: { $first: "$cleaned_text" },
                    xgboost_predicted_sentiment: { $first: "$xgboost_predicted_sentiment" },
                    xgboost_predicted_sentiment_label: { $first: "$xgboost_predicted_sentiment_label" },
                    Negative: { $first: "$Negative" },
                    Neutral: { $first: "$Neutral" },
                    Positive: { $first: "$Positive" }
                }
            },
            { $sort: { _id: 1 } }, // Ensure consistent ordering
            { $skip: skip },       // Skip items for pagination
            { $limit: limit },     // Limit items per page
            {
                $lookup: {
                    from: 'Merged_places',
                    localField: 'place',
                    foreignField: 'place',
                    as: 'mergedPlace'
                }
            },
            {
                $addFields: {
                    Image1: { $arrayElemAt: ["$mergedPlace.Image1", 0] }
                }
            },
            { $project: { mergedPlace: 0 } }
        ]);

        // Render the recommendation template with reviews, pagination data, and keyword counts
        res.render('recommendation.ejs', {
            reviews,
            currentPage: page,
            totalPages,
            keywordCounts // Pass the keywordCounts to the EJS template
        });

    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/rate-us',(req,res)=>{
    res.render('rating.ejs')
})

// Route for submitting a rating
router.post('/rate-us', async (req, res) => {
    console.log('Request Body:', req.body);

    // Create a new Rating object from the request body
    let data = {
        Username: req.body.Username,
        Rating: req.body.Rating,
        Comment: req.body.Comment,
    };

    // Save the rating
    try {
        const rating = new Rating(data); // Create a new Rating document
        await rating.save(); // Wait for the save to complete

        console.log('Rating saved successfully');
        
        // Send a success message back to the frontend
        res.status(200).json({ message: 'Rating submitted successfully!' });
      
    } catch (err) {
        console.error('Error saving rating:', err);
        // Handle the error if saving fails
        res.status(500).json({ message: 'Error submitting rating', error: err.message });
    }
});



router.get('/search', async (req, res) => {
    const keyword = req.query.keyword || '';
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 9; // Set the number of items per page
    const skip = (page - 1) * limit; // Calculate how many items to skip for pagination

    try {
        let query = {};

        if (keyword.trim().split(' ').length === 1) {
            // If the keyword contains just one word, perform a partial match on both fields
            query = {
                $or: [
                    { place: { $regex: keyword, $options: 'i' } }, // Case-insensitive partial match for place
                    { province: { $regex: keyword, $options: 'i' } }, // Case-insensitive partial match for province
                    { cleaned_text: { $regex: keyword, $options: 'i' } }
                ]
            };
        } else {
            // If the keyword contains more than one word, perform an exact match on both fields
            query = {
                $or: [
                    { place: keyword }, // Exact match for place
                    { province: keyword }, // Exact match for province
                    { cleaned_text: keyword } 
                ]
            };
        }



        // Get the total count of matching documents for pagination
        const totalResults = await MergedPlace.aggregate([
            {
                $match: query // Apply the query based on the keyword
            },
            { $count: 'total' }
        ]);

        const totalItems = totalResults[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);


        
        // Fetch paginated search results
        const results = await MergedPlace.aggregate([
            {
                $match: query // Apply the query based on the keyword
            },
            { $skip: skip }, // Skip documents for pagination
            { $limit: limit }, // Limit the number of documents per page
            {
                $lookup: {
                    from: 'Review',  // Join with the Review collection
                    localField: 'place', // Match 'place' field in MergedPlace
                    foreignField: 'place', // Match 'place' field in Review
                    as: 'reviewData' // Alias for the joined data
                }
            },
            {
                $unwind: "$reviewData" // Unwind the reviewData array to get a single review per place
            },
            {
                $group: {
                    _id: "$place", // Group by place
                    place: { $first: "$place" }, // Get the first place name
                    province: { $first: "$province" },
                    Image1: { $first: "$Image1" },
                    xgboost_predicted_sentiment_label: { $first: "$reviewData.xgboost_predicted_sentiment_label" },
                    Positive: { $first: "$reviewData.Positive" },
                    cleaned_text: { $first: "$reviewData.cleaned_text" },
                    reviewId: { $first: "$reviewData._id" } // Get the reviewId for routing
                }
            },
            { $sort: { _id: 1 } } // Sort by place
        ]);

        // Render EJS template and pass the results, keyword, and pagination data
        res.render('search.ejs', {
            results,
            keyword,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).send('Error performing search');
    }
});

router.get('/compare',(req,res)=>{
    res.render('compare.ejs', { place1: null, place2: null });
})

  

router.get('/search_compare', async (req, res) => {
    const { search1, search2 } = req.query;

    try {
        const searchQuery = async (keyword) => {
            return await MergedPlace.aggregate([
                {
                    $match: {
                        $or: [
                            { place: { $regex: keyword, $options: 'i' } },
                            { province: { $regex: keyword, $options: 'i' } },
                            { cleaned_text: { $regex: keyword, $options: 'i' } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'Review',
                        localField: 'place',
                        foreignField: 'place',
                        as: 'reviewData'
                    }
                },
                { $unwind: "$reviewData" },
                {
                    $group: {
                        _id: "$place",
                        place: { $first: "$place" },
                        province: { $first: "$province" },
                        Image1: { $first: "$Image1" },
                        xgboost_predicted_sentiment_label: { $first: "$reviewData.xgboost_predicted_sentiment_label" },
                        Positive: { $first: "$reviewData.Positive" },
                        Negative: { $first: "$reviewData.Negative" },
                        Neutral: { $first: "$reviewData.Neutral" },
                        cleaned_text: { $first: "$reviewData.cleaned_text" }
                    }
                }
            ]);
        };

        const [result1, result2] = await Promise.all([
            searchQuery(search1),
            searchQuery(search2)
        ]);

        res.render('compare.ejs', {
            place1: result1.length ? result1[0] : null,
            place2: result2.length ? result2[0] : null
        });

    } catch (err) {
        console.error('Compare Error:', err);
        res.status(500).send('Error performing comparison');
    }
});

router.get('/search-suggestions', async (req, res) => {
    const { query } = req.query;

    try {
        const suggestions = await MergedPlace.aggregate([
            {
                $match: {
                    $or: [
                        { place: { $regex: query, $options: 'i' } },
                        { province: { $regex: query, $options: 'i' } },
                        { cleaned_text: { $regex: query, $options: 'i' } }
                    ]
                }
            },
            {
                $limit: 5 // Limit to top 5 suggestions
            },
            {
                $project: {
                    place: 1, // Only return the place field
                }
            }
        ]);

        const suggestionNames = suggestions.map(s => s.place);
        res.json({ suggestions: suggestionNames });
    } catch (err) {
        console.error('Error fetching suggestions:', err);
        res.status(500).send('Error fetching suggestions');
    }
});


router.get('/about_us',(req,res)=>{
    res.render('about_us.ejs')
})








//ส่วน reviews ที่สไลด์ได้ เพิ่มข้อมูลได้แต่ใข้ การสไลด์ของ js ไม่ได้
//ลบไป

const mongoose = require('mongoose');

router.get('/:id', async (req, res) => {
    try {
        const attraction_id = req.params.id;
        //console.log("Attraction ID from URL:", attraction_id);

        // Validate if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(attraction_id)) {
            return res.status(400).send("Invalid attraction ID");
        }

        // Fetch the attraction (review) by ID
        const attraction = await Review.findOne({ _id: attraction_id }).exec();

        if (!attraction) {
            return res.status(404).send("Attraction not found");
        }

        // Fetch matching merged place based on the 'place' field
        const mergedPlace = await MergedPlace.findOne({ place: attraction.place }).exec();

        if (!mergedPlace) {
            return res.status(404).send("Merged place not found for the attraction");
        }

        // Render the page with both the attraction and mergedPlace (images and reviews)
        res.render('place_info.ejs', { attraction, mergedPlace });
    } catch (err) {
        console.error("Error finding attraction:", err);
        res.status(500).send("Error finding attraction");
    }
});




module.exports = router

