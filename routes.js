var express = require('express');
var Chart = require('chart.js');
var router = express.Router();
var bodyParser = require("body-parser");

var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');
router.use(bodyParser.urlencoded({ extended: true }))



var session = require("express-session");
router.use(
    session({
        secret: "mySecretKey",
        resave: true,
        saveUninitialized: false,
    })
);


// ------------- Connect to database ------------
const { MongoClient } = require("mongodb");
// const { join } = require('path/posix');

const url =
    "mongodb+srv://buiquanghuy742:buiquanghuy742@homefitness.2sybn.mongodb.net/test";

const client = new MongoClient(url);
async function run() {
    try {
        await client.connect();
        await client.db("HomeFitness").command({ ping: 1 }, );
        console.log("Connected successfully to server");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);

async function getMongoClient() {
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    return dbo;
}


// ------------------- HOMEPAGE -----------------
router.get('/', async function(req, res) {

    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo.collection("classes").find({}).toArray();
    let result1 = await dbo.collection("trainers").find({}).toArray();
    res.render("index", { classes: result, trainers: result1 });
});



// ---------------- Register class-----------------
router.post('/do-register/class/:id', async function(req, res) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {

        var target_id = req.params.id;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        var ObjectID = require("mongodb").ObjectID;
        // result: find class that users want to register
        let result = await dbo.collection("classes").find({ _id: ObjectID(target_id) }).toArray();
        let check = 0
        let student = await dbo.collection("check_student").find({}).toArray();
        for (var i = 0; i < student.length; i++) {
            if (cusInfo.email.toString().trim() == student[i].email.toString().trim() &
                target_id.toString().trim() == student[i].class_id.toString().trim()) {
                check += 1;
                break;
            }
        }
        if (result[0].student == 2) {
            res.render("error2");
        } else {
            if (check == 0) {
                let newStudent = {
                    email: cusInfo.email,
                    class_id: req.params.id,
                };
                let newData = {
                    name: result[0].name,
                    date: result[0].date,
                    content: result[0].content,
                    image: result[0].image,
                    student: result[0].student + 1,
                };
                await dbo.collection("check_student").insertOne(newStudent);
                await dbo
                    .collection("classes")
                    .updateOne({ _id: ObjectID(target_id) }, { $set: newData });
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'homefitness.hf.0704@gmail.com',
                        pass: 'homefitnesshf0704'
                    }
                });
                var mailOptions = {
                    from: 'homefitness.hf.0704@gmail.com',
                    to: cusInfo.email,
                    subject: "Welcome Home Fitness's online class",
                    html: "<h1 style='color: lightblue;' > Welcome! </h1> <p>You have just register successfully! And do not forget your class! </p><br><br><p>https://meet.google.com/dqq-thdh-tuf</p>",
                };

                transporter.sendMail(mailOptions, async function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                res.render("confirm");
            } else {
                res.render("error");
            }
        }
    }
});


// ------------------- COOKING TIPS --------------


router.get('/cookingtips', async function(req, res) {
    const category = "Cooking tips";
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("tips")
        .find({ category: new RegExp(category, "i") })
        .toArray();
    res.render('cookingtips', { model: result });
});

router.get('/tip-content/:id', async function(req, res) {
    const target_id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    const result = await dbo.collection("tips").findOne({ _id: ObjectID(target_id) });
    res.render("tip-content", { model: result });
});



// ------------------- NUTRITION PAGE --------------
router.get('/nutritionfacts', async function(req, res) {
    const category = "Nutrition facts";
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("tips")
        .find({ category: new RegExp(category, "i") })
        .toArray();
    res.render('nutritionfacts', { model: result });
});

router.get('/nutrition-content/:id', async function(req, res) {
    const target_id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    const result = await dbo.collection("tips").findOne({ _id: ObjectID(target_id) });
    res.render("nutrition-content", { model: result });
});


// ------------------- MEAL PLANS ------------------
router.get('/mealplans', async function(req, res) {
    const category = "Meal plans";
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("tips")
        .find({ category: new RegExp(category, "i") })
        .toArray();
    res.render('mealplans', { model: result });
});

router.get('/meal-content/:id', async function(req, res) {
    const target_id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    const result = await dbo.collection("tips").findOne({ _id: ObjectID(target_id) });
    res.render("meal-content", { model: result });
});

// ----------------- VIDEOS PAGE ----------------

// Chest

router.get('/chest', async function(req, res) {
    const category = "Chest videos";
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("videos")
        .find({ category: new RegExp(category, "i") })
        .toArray();
    res.render('chest', { model: result });
});

router.get('/chest-content/:id', async function(req, res) {
    const target_id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    const result = await dbo.collection("videos").findOne({ _id: ObjectID(target_id) });
    res.render("blog-content", { model: result });
});

// Arm

router.get('/arm', async function(req, res) {
    const category = "Arm videos";
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("videos")
        .find({ category: new RegExp(category, "i") })
        .toArray();
    res.render('arm', { model: result });
});

router.get('/arm-content/:id', async function(req, res) {
    const target_id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    const result = await dbo.collection("videos").findOne({ _id: ObjectID(target_id) });
    res.render("blog-content", { model: result });
});

// Back
router.get('/back', async function(req, res) {
    const category = "Back videos";
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("videos")
        .find({ category: new RegExp(category, "i") })
        .toArray();
    res.render('back', { model: result });
});

router.get('/back-content/:id', async function(req, res) {
    const target_id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    const result = await dbo.collection("videos").findOne({ _id: ObjectID(target_id) });
    res.render("blog-content", { model: result });
});

// Shoulder
router.get('/shoulder', async function(req, res) {
    const category = "Shoulder videos";
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("videos")
        .find({ category: new RegExp(category, "i") })
        .toArray();
    res.render('shoulder', { model: result });
});

router.get('/shoulder-content/:id', async function(req, res) {
    const target_id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    const result = await dbo.collection("videos").findOne({ _id: ObjectID(target_id) });
    res.render("blog-content", { model: result });
});

// Abs
router.get('/abs', async function(req, res) {
    const category = "Abs videos";
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("videos")
        .find({ category: new RegExp(category, "i") })
        .toArray();
    res.render('abs', { model: result });
});

router.get('/abs-content/:id', async function(req, res) {
    const target_id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    const result = await dbo.collection("videos").findOne({ _id: ObjectID(target_id) });
    res.render("blog-content", { model: result });
});

// -------------- COMMUNITY PAGE ----------------
router.get('/community', async function(req, res) {
    const client = await MongoClient.connect(url);
    await client.connect();
    const postCollection = await client.db('HomeFitness').collection('posts');
    let dbo = client.db("HomeFitness");
    let posts = await dbo.collection("posts").find({}).sort({ _id: -1 }).toArray();

    var sortedArray = posts.sort(function(a, b) {
        return ((b.num_comments + b.avg * 3) / 4) - ((a.num_comments + a.avg * 3) / 4);
    });
    let pop_posts = [];
    for (var i = 0; i < 3; i++) {
        pop_posts.push(sortedArray[i]);
    }
    const query = await postCollection.aggregate([{
            "$addFields": {
                "id": {
                    "$toString": "$_id"
                },
            }
        },
        {
            $lookup: {
                from: 'comments',
                localField: 'id',
                foreignField: 'post_id',
                as: 'comments',
            }
        }
    ]);
    const result = await query.sort({ _id: -1 }).toArray();
    res.render('community', { model: result, pop_posts: pop_posts });
});

router.post('/add-comments/post/:id', async function(req, res) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");

        // Update number of comments
        var ObjectID = require("mongodb").ObjectID;
        var target_post_id = req.params.id;
        const target_post = await dbo.collection('posts').findOne({ _id: ObjectID(target_post_id) });
        let newPost = {
            name: target_post.name,
            author: target_post.author,
            date: target_post.date,
            content: target_post.content,
            image: target_post.image,
            user_id: target_post.user_id,
            date_post: target_post.date_post,
            num_comments: target_post.num_comments + 1,
        };
        await dbo
            .collection("posts")
            .updateOne({ _id: ObjectID(target_post_id) }, { $set: newPost });

        // Add new comment   

        let newComment = {
            content: req.body.content,
            post_id: req.params.id,
            author: cusInfo.username,
            date: new Date(),
            image: cusInfo.image,
        };

        await dbo.collection("comments").insertOne(newComment);
        // let result = await dbo.collection("posts").find({}).sort({ _id: -1 }).toArray();
        const postCollection = await client.db('HomeFitness').collection('posts');
        const query = await postCollection.aggregate([{
                "$addFields": {
                    "id": {
                        "$toString": "$_id"
                    },
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'id',
                    foreignField: 'post_id',
                    as: 'comments',
                }
            }
        ]);
        const result = await query.sort({ _id: -1 }).toArray();
        let posts = await dbo.collection("posts").find({}).sort({ _id: -1 }).toArray();
        var sortedArray = posts.sort(function(a, b) {
            return (b.num_comments + b.avg * 3) / 4 - (a.num_comments + a.avg * 3) / 4;
        });
        let pop_posts = [];
        for (var i = 0; i < 3; i++) {
            pop_posts.push(sortedArray[i]);
        }
        res.render("community", { model: result, pop_posts: pop_posts });
    }
});



router.post('/update/rate-score/:id', async function(req, res) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        const target_id = req.params.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    var ObjectID = require("mongodb").ObjectID;
    const target_post = await dbo.collection('posts').findOne({ _id: ObjectID(target_id) });
    let newData = {
        name: target_post.name,
        author: target_post.author,
        date: target_post.date,
        content: target_post.content,
        image: target_post.image,
        user_id: target_post.user_id,
        date_post: target_post.date_post,
        num_comments: target_post.num_comments,
        rate_scores: target_post.rate_scores + parseInt(req.body.rate_scores),
        time_rates: target_post.time_rates + 1,
        avg: parseFloat(((target_post.rate_scores + parseInt(req.body.rate_scores)) / (target_post.time_rates + 1)).toFixed(1)),
    };
    await dbo
        .collection("posts")
        .updateOne({ _id: ObjectID(target_id) }, { $set: newData });

    const postCollection = await client.db('HomeFitness').collection('posts');

    let posts = await dbo.collection("posts").find({}).sort({ _id: -1 }).toArray();

    var sortedArray = posts.sort(function(a, b) {
        return (b.num_comments + b.avg * 3) / 4 - (a.num_comments + a.avg * 3) / 4;
    });
    let pop_posts = [];
    for (var i = 0; i < 3; i++) {
        pop_posts.push(sortedArray[i]);
    }
    const query = await postCollection.aggregate([{
            "$addFields": {
                "id": {
                    "$toString": "$_id"
                },
            }
        },
        {
            $lookup: {
                from: 'comments',
                localField: 'id',
                foreignField: 'post_id',
                as: 'comments',
            }
        }
    ]);
    const result = await query.sort({ _id: -1 }).toArray();
    res.render('community', { model: result, pop_posts: pop_posts });
    }
});

router.get('/update/rate-score', async function(req, res) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        res.render('community');
    }
    // res.render('myblogs');
});

router.get('/myblogs', async function(req, res) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        const cus_id = cusInfo._id;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("posts").find({ user_id: cus_id }).toArray();
        res.render('myblogs', { posts: result, customer: cusInfo });
    }
    // res.render('myblogs');
});

// ------------------ ADDING PAGE ----------------

// Adding blogs
router.get('/adding-tips', function(req, res) {
    res.render('adding-tips')
});

router.post('/do-adding-tips', async function(req, res, next) {
    let newData = {
        category: req.body.category,
        name: req.body.name,
        author: req.body.author,
        content: req.body.content,
        image: req.body.image,
        image1: req.body.image1,
        image2: req.body.image2
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    await dbo.collection("tips").insertOne(newData);
    res.redirect("statistics-tips");
});

// Adding videos
router.get('/adding-videos', function(req, res) {
    res.render('adding-videos')
});

router.post('/do-adding-videos', async function(req, res, next) {
    let newData = {
        category: req.body.category,
        name: req.body.name,
        instructor: req.body.instructor,
        image: req.body.image,
        video: req.body.video,
        content: req.body.content,
        difficulty: req.body.difficulty,
        equipment: req.body.equipment,
        calories: req.body.calories,
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    await dbo.collection("videos").insertOne(newData);
    res.redirect("statistics-videos");

});

// Adding accounts
router.get('/adding-accounts', function(req, res) {
    res.render('adding-accounts')
});

// Adding account - Admin page
router.post('/do-adding-accounts', async function(req, res, next) {
    let newData = {
        username: req.body.username,
        email: req.body.email,
        image: req.body.image,
        role: req.body.role,
        password: req.body.password,
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let usernames = await dbo.collection("users").findOne({ username: req.body.username });
    let emails = await dbo.collection("users").findOne({ email: req.body.email });
    if (usernames) {
        res.render("adding-accounts", {
            errorMessage: "This username has been used!",
        });
    } else if (emails) {
        res.render("adding-accounts", {
            errorMessage1: "This email has been used!",
        });
    } else {
        await dbo.collection("users").insertOne(newData);
        res.redirect("statistics-accounts");
    }
});


// Adding products
router.get('/adding-products', function(req, res) {
    res.render('adding-products')
});

router.post('/do-adding-products', async function(req, res, next) {
    let newData = {
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        image: req.body.image,
        stock: req.body.stock,
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    await dbo.collection("products").insertOne(newData);
    res.redirect("statistics-products");

});

// Adding trainers
router.get('/adding-trainers', function(req, res) {
    res.render('adding-trainers')
});

router.post('/do-adding-trainers', async function(req, res, next) {
    let newData = {
        name: req.body.name,
        birthday: req.body.birthday,
        content: req.body.content,
        image: req.body.image,
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    await dbo.collection("trainers").insertOne(newData);
    res.redirect("statistics-trainers");

});

// Adding classes
router.get('/adding-classes', function(req, res) {
    res.render('adding-classes')
});

router.post('/do-adding-classes', async function(req, res, next) {
    let newData = {
        name: req.body.name,
        date: req.body.date,
        content: req.body.content,
        image: req.body.image,
        student: 0,
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    await dbo.collection("classes").insertOne(newData);
    res.redirect("statistics-classes");

});


// Register
router.get('/register', function(req, res) {
    res.render('register')
});

router.post('/do-register', async function(req, res, next) {
    let newData = {
        username: req.body.username,
        email: req.body.email,
        role: "Customers",
        password: req.body.password,
        image: req.body.image,
        date: new Date().getDay(),
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");

    let usernames = await dbo.collection("users").findOne({ username: req.body.username });
    let email = await dbo.collection("users").findOne({ email: req.body.email });
    
    if (usernames) {
        res.render("register", {
            errorMessage: "This username has been used!",
        });
    } else if (email) {
        res.render("register", {
            errorMessage1: "This email has been used!",
        });
    } else {
        await dbo.collection("users").insertOne(newData);
        res.redirect("logincus");
    }
});



// Adding new post - Customers
router.get('/write-posts', function(req, res) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        res.render('write-posts')
    }
});

router.post('/do-adding-posts', async function(req, res, next) {
    const cusInfo = req.session.cusInfo;
    let newData = {
        name: req.body.name,
        author: cusInfo.username, // Replace by customer.username
        date: new Date(),
        content: req.body.content,
        image: req.body.image,
        user_id: cusInfo._id,
        date_post: new Date().getDay(),
        num_comments: 0,
        rate_scores: 0,
        time_rates: 0,
        avg: 0.0,
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    await dbo.collection("posts").insertOne(newData);
    let posts = await dbo.collection("posts").find({}).sort({ _id: -1 }).toArray();
    var sortedArray = posts.sort(function(a, b) {
        return (b.num_comments + b.avg * 3) / 4 - (a.num_comments + a.avg * 3) / 4;
    });
    let pop_posts = [];
    for (var i = 0; i < 3; i++) {
        pop_posts.push(sortedArray[i]);
    }
    res.render("community", { model: posts, pop_posts: pop_posts });

});



// -------------- ADMIN PAGE --------------------
router.get('/admin', async function(req, res) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {

        let target_role = "Customers";
        let target_day1 = 1;
        let target_day2 = 2;
        let target_day3 = 3;
        let target_day4 = 4;
        let target_day5 = 5;
        let target_day6 = 6;
        let target_day7 = 0;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("posts").estimatedDocumentCount();
        const query = { role: "Customers" };
        let result1 = await dbo.collection("users").estimatedDocumentCount(query);
        let result2 = await dbo.collection("comments").estimatedDocumentCount();
        let result3 = await dbo.collection("plans").find({}).toArray();
        let money = await dbo.collection("purchase").find({}).toArray();
        let avenue = 0;
        for (var i = 0; i < money.length; i++) {
            avenue += money[i].money;
        }
        let result4 = await dbo.collection("users").find({ role: target_role }).sort({ _id: -1 }).limit(3).toArray();
        let day1 = await dbo.collection("users").find({ date: target_day1 }).count();
        let day2 = await dbo.collection("users").find({ date: target_day2 }).count();
        let day3 = await dbo.collection("users").find({ date: target_day3 }).count();
        let day4 = await dbo.collection("users").find({ date: target_day4 }).count();
        let day5 = await dbo.collection("users").find({ date: target_day5 }).count();
        let day6 = await dbo.collection("users").find({ date: target_day6 }).count();
        let day7 = await dbo.collection("users").find({ date: target_day7 }).count();

        let p_day1 = await dbo.collection("posts").find({ date_post: target_day1 }).count();
        let p_day2 = await dbo.collection("posts").find({ date_post: target_day2 }).count();
        let p_day3 = await dbo.collection("posts").find({ date_post: target_day3 }).count();
        let p_day4 = await dbo.collection("posts").find({ date_post: target_day4 }).count();
        let p_day5 = await dbo.collection("posts").find({ date_post: target_day5 }).count();
        let p_day6 = await dbo.collection("posts").find({ date_post: target_day6 }).count();
        let p_day7 = await dbo.collection("posts").find({ date_post: target_day7 }).count();

        res.render("admin", {
            avenue: avenue,
            num_posts: result,
            num_users: result1,
            plan: result3,
            num_comments: result2,
            num_views: req.session.views,
            admin: adminInfo,
            recent_users: result4,
            day1: day1,
            day2: day2,
            day3: day3,
            day4: day4,
            day5: day5,
            day6: day6,
            day7: day7,
            p_day1: p_day1,
            p_day2: p_day2,
            p_day3: p_day3,
            p_day4: p_day4,
            p_day5: p_day5,
            p_day6: p_day6,
            p_day7: p_day7,
        });
    }

});


router.get('/loginadmin', function(req, res) {
    res.render('loginadmin')
});

// Admin Login
router.post("/loginadmin", async(req, res) => {
    let role = "Admin";
    let email = req.body.email;
    let password = req.body.password;

    const mongo = await getMongoClient();
    const loggedInAccount = await mongo
        .collection("users")
        .findOne({ role, email, password });

    if (loggedInAccount) {
        req.session.adminInfo = loggedInAccount;
        res.redirect("admin");
    } else {
        res.render("loginadmin", {
            errorMessage: "Username or Password is not correct!",
        });
    }
});

// Admin logout
router.get("/logoutadmin", function(req, res) {
    delete req.session.adminInfo;
    res.redirect("loginadmin");
});


// Forget password
router.get("/account/password/reset", async function(req, res) {
    res.render("reset-password");
});



router.post("/do-reset-password", async function(req, res) {
    let target_email = req.body.email;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo.collection("users").find({ email: target_email }).toArray();
    if (result.length == 1) {
        let newData = {
            email: target_email,
        }
        await dbo.collection("reset_passwords").insertOne(newData);
        // var transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: 'homefitness.hf.0704@gmail.com',
        //         pass: 'homefitnesshf0704'
        //     }
        // });

        // var mailOptions = {
        //     from: 'homefitness.hf.0704@gmail.com',
        //     to: target_email,
        //     subject: "Reset your HomeFitness password",
        //     html: "<h1 style='color: lightblue;' > Hey peeps! </h1> <p>Someone (hopefully you) has requested a password reset for your Heroku account. Follow the link below to set a new password: </p><br><br><p></p><p>If you don't wish to reset your password, disregard this email and no action will be taken.</p>",
        // };

        // transporter.sendMail(mailOptions, async function(error, info) {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log('Email sent: ' + info.response);
        //     }
        // });
        // res.render("reset-password", { message: "We've sent you an email. Check it now!" });
        res.render("set-password");
    } else {
        res.render("reset-password", { message: "This email has not been used to register!" });
    }
});


router.get("/set-password", async function(req, res) {
    res.render("set-password");
});

router.post("/do-set-password", async function(req, res) {
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let emails = await dbo.collection("reset_passwords").find({}).sort({ _id: -1 }).toArray();
    let target_email = emails[0].email;
    let list_accounts = await dbo.collection("users").find({}).toArray();
    let target_accounts = [];
    for (var i = 0; i < list_accounts.length; i++) {
        if (target_email == list_accounts[i].email) {
            target_accounts.push(list_accounts[i]);
            break;
        }
    }
    let newData = {
        username: target_accounts[0].username,
        email: target_accounts[0].email,
        role: "Customers",
        image: target_accounts[0].image,
        date: target_accounts[0].date,
        password: req.body.password,
    };
    await dbo
        .collection("users")
        .updateOne({ email: target_email }, { $set: newData });
    res.render("logincus", { message: "Reset password successfully!" });
});


router.get('/logincus', async function(req, res) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render('logincus')
    } else {
        const cus_id = cusInfo._id;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("posts").find({ user_id: cus_id }).toArray();
        res.render("myblogs", { customer: cusInfo, message: "Log out first!", posts: result });
    }

});

//Customers Login
router.post("/logincus", async(req, res) => {
    let role = "Customers";
    let email = req.body.email;
    let password = req.body.password;
    const mongo = await getMongoClient();
    const loggedInAccount = await mongo
        .collection("users")
        .findOne({ role, email, password });

    if (loggedInAccount) {
        req.session.cusInfo = loggedInAccount;
        res.redirect("myblogs");
    } else {
        res.render("logincus", {
            errorMessage: "Username or Password is not correct!",
        });
    }
});




// Customers logout
router.get("/logoutcus", function(req, res) {
    delete req.session.cusInfo;
    res.redirect("logincus");
});


// ----------------- DISPLAY  -----------------

router.get('/statistics-products', async function(req, res) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("products").find({}).sort({ _id: -1 }).toArray();
        res.render("statistics-products", { model: result, admin: req.session.adminInfo });
    }

});

router.get('/statistics-accounts', async function(req, res) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("users").find({}).sort({ _id: -1 }).toArray();
        res.render("statistics-accounts", { model: result, admin: req.session.adminInfo });
    }
});

router.get('/statistics-classes', async function(req, res) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("classes").find({}).sort({ _id: -1 }).toArray();
        res.render("statistics-classes", { model: result, admin: req.session.adminInfo });
    }

});

router.get('/statistics-trainers', async function(req, res) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("trainers").find({}).sort({ _id: -1 }).toArray();
        res.render("statistics-trainers", { model: result, admin: req.session.adminInfo });
    }

});

router.get('/statistics-posts', async function(req, res) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("posts").find({}).sort({ _id: -1 }).toArray();
        res.render("statistics-posts", { model: result, admin: req.session.adminInfo });
    }
});

router.get('/statistics-tips', async function(req, res) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("tips").find({}).sort({ _id: -1 }).toArray();
        res.render("statistics-tips", { model: result, admin: req.session.adminInfo });
    }

});

router.get('/statistics-videos', async function(req, res) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("videos").find({}).sort({ _id: -1 }).toArray();
        res.render("statistics-videos", { model: result, admin: req.session.adminInfo });
    }

});


// -------------- UPDATE  -----------------------


// ------- Update accounts ------------
router.get('/update-accounts/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        const target_id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        const result = await dbo.collection("users").findOne({ _id: ObjectID(target_id) });
        res.render("update-accounts", { model: result });
    }

});

// Do update account
router.post("/do-update-accounts", async(req, res) => {
    let newData = {
        username: req.body.username,
        email: req.body.email,
        image: req.body.image,
        role: req.body.role,
        password: req.body.password,
    };
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let usernames = await dbo.collection("users").findOne({ username: req.body.username });
    let emails = await dbo.collection("users").findOne({ email: req.body.email });
    if (usernames) {
        res.render("update-accounts", {
            errorMessage: "This username has been used!",
        });
    } else if (emails) {
        res.render("update-accounts", {
            errorMessage1: "This email has been used!",
        });
    } else {
        var id = req.body.id;
        var ObjectID = require("mongodb").ObjectID;
        await dbo
            .collection("users")
            .updateOne({ _id: ObjectID(id) }, { $set: newData });
        res.redirect("statistics-accounts");
    }
});


// ------- Update product ------------
router.get('/update-products/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        const target_id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        const result = await dbo
            .collection("products")
            .findOne({ _id: ObjectID(target_id) });
        res.render("update-products", { model: result });

    }

});

// Do update product
router.post("/do-update-products", async(req, res) => {
    let newData = {
        name: req.body.name,
        price: req.body.price,
        image: req.body.image,
        brand: req.body.brand
    };
    var id = req.body.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    var ObjectID = require("mongodb").ObjectID;
    await dbo
        .collection("products")
        .updateOne({ _id: ObjectID(id) }, { $set: newData });
    res.redirect("statistics-products");
});


// ------- Update class ------------
router.get('/update-classes/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        const target_id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        const result = await dbo.collection("classes").findOne({ _id: ObjectID(target_id) });
        res.render("update-classes", { model: result });
    }

});

// Do update class
router.post("/do-update-classes", async(req, res) => {
    let newData = {
        name: req.body.name,
        date: req.body.date,
        content: req.body.content,
        image: req.body.image
    };
    var id = req.body.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    var ObjectID = require("mongodb").ObjectID;
    await dbo
        .collection("classes")
        .updateOne({ _id: ObjectID(id) }, { $set: newData });
    res.redirect("statistics-classes");
});

// ------- Update trainers ------------
router.get('/update-trainers/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        const target_id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        const result = await dbo.collection("trainers").findOne({ _id: ObjectID(target_id) });
        res.render("update-trainers", { model: result });
    }

});

// Do update trainers
router.post("/do-update-trainers", async(req, res) => {
    let newData = {
        name: req.body.name,
        birthday: req.body.birthday,
        content: req.body.content,
        image: req.body.image
    };
    var id = req.body.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    var ObjectID = require("mongodb").ObjectID;
    await dbo
        .collection("trainers")
        .updateOne({ _id: ObjectID(id) }, { $set: newData });
    res.redirect("statistics-trainers");
});

// ------- Update videos ------------
router.get('/update-videos/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        const target_id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        const result = await dbo.collection("videos").findOne({ _id: ObjectID(target_id) });
        res.render("update-videos", { model: result });
    }
});

// Do update videos
router.post("/do-update-videos", async(req, res) => {
    let newData = {
        category: req.body.category,
        name: req.body.name,
        instructor: req.body.instructor,
        image: req.body.image,
        video: req.body.video,
        content: req.body.content,
        difficulty: req.body.difficulty,
        equipment: req.body.equipment,
        calories: req.body.calories
    };
    var id = req.body.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    var ObjectID = require("mongodb").ObjectID;
    await dbo
        .collection("videos")
        .updateOne({ _id: ObjectID(id) }, { $set: newData });
    res.redirect("statistics-videos");
});

// ------- Update blogs ------------
router.get('/update-tips/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        const target_id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        const result = await dbo.collection("tips").findOne({ _id: ObjectID(target_id) });
        res.render("update-tips", { model: result });
    }
});

// Do update blogs
router.post("/do-update-tips", async(req, res) => {
    let newData = {
        category: req.body.category,
        name: req.body.name,
        author: req.body.author,
        content: req.body.content,
        image: req.body.image,
    };
    var id = req.body.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    var ObjectID = require("mongodb").ObjectID;
    await dbo
        .collection("tips")
        .updateOne({ _id: ObjectID(id) }, { $set: newData });
    res.redirect("statistics-tips");
});

// ------- Update plans ------------
router.get('/update-plans/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        const target_id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        const result = await dbo.collection("plans").findOne({ _id: ObjectID(target_id) });
        res.render("update-plans", { model: result });
    }
});

// Do update plans
router.post("/do-update-plans", async(req, res) => {
    let newData = {
        title: req.body.title,
        name: req.body.name,
        content: req.body.content,

    };
    var id = req.body.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    var ObjectID = require("mongodb").ObjectID;
    await dbo
        .collection("plans")
        .updateOne({ _id: ObjectID(id) }, { $set: newData });
    res.redirect("admin");
});




// ------------------- REMOVE ------------------------
router.get('/remove/posts/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        const id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        await dbo.collection("posts").findOneAndDelete({ _id: ObjectID(id) });
        let result = await dbo.collection("posts").find({}).toArray();
        res.render("statistics-posts", { model: result, admin: adminInfo });
    }

});

router.get('/cus/remove-posts/:id', async function(req, res, next) {
    const customer = req.session.cusInfo;
    var id = req.params.id;
    var ObjectID = require("mongodb").ObjectID;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    await dbo.collection("posts").findOneAndDelete({ _id: ObjectID(id) });
    let result = await dbo.collection("posts").find({user_id: customer._id}).toArray();
    res.render("myblogs", {posts: result, customer: customer});
});


router.get('/remove-products/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        await dbo.collection("products").deleteOne({ _id: ObjectID(id) });
        let result = await dbo.collection("products").find({}).toArray();
        res.render("statistics-products", { model: result, admin: adminInfo });
    }

});

router.get('/remove-accounts/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        await dbo.collection("users").deleteOne({ _id: ObjectID(id) });
        await dbo.collection("posts").deleteMany({ user_id: ObjectID(id) });
        let result = await dbo.collection("accounts").find({}).toArray();
        res.render("statistics-accounts", { model: result, admin: adminInfo });
    }

});

router.get('/remove-tips/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        await dbo.collection("tips").deleteOne({ _id: ObjectID(id) });
        let result = await dbo.collection("tips").find({}).toArray();
        res.render("statistics-tips", { model: result, admin: adminInfo });
    }

});

router.get('/remove-videos/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        await dbo.collection("videos").deleteOne({ _id: ObjectID(id) });
        let result = await dbo.collection("videos").find({}).toArray();
        res.render("statistics-videos", { model: result, admin: adminInfo });
    }

});

router.get('/remove-classes/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        await dbo.collection("classes").deleteOne({ _id: ObjectID(id) });
        let result = await dbo.collection("classes").find({}).toArray();
        res.render("statistics-classes", { model: result, admin: adminInfo });
    }

});

router.get('/remove-trainers/:id', async function(req, res, next) {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        await dbo.collection("trainers").deleteOne({ _id: ObjectID(id) });
        let result = await dbo.collection("trainers").find({}).toArray();
        res.render("statistics-trainers", { model: result, admin: adminInfo });
    }

});


// ----------------------- SEARCH ---------------------

// Search products
router.get("/search-products", async(req, res) => {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let name_search = req.query.txtSearch;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo
            .collection("products")
            .find({ name: new RegExp(name_search, "i") })
            .toArray();
        res.render("statistics-products", { model: result, admin: req.session.adminInfo });
    }
});

// Search products shop
// router.get("/search-products-shop", async(req, res) => {
//     let name_search = req.query.txtSearch;
//     let client = await MongoClient.connect(url);
//     let dbo = client.db("HomeFitness");
//     let result = await dbo
//         .collection("products")
//         .find({ name: new RegExp(name_search, "i") })
//         .toArray();
//     if (result.length >= 1) {
//         res.render("shop", { model: result });
//     } else {
//         res.render("shop", { message: "Nothing matched with your keywords!" });
//     }
// });

// Search tips
router.get("/search-tips", async(req, res) => {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let name_search = req.query.txtSearch;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo
            .collection("tips")
            .find({ name: new RegExp(name_search, "i") })
            .toArray();
        res.render("statistics-tips", { model: result, admin: req.session.adminInfo });
    }

});

// Search trainers

router.get("/search-trainers", async(req, res) => {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let name_search = req.query.txtSearch;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo
            .collection("trainers")
            .find({ name: new RegExp(name_search, "i") })
            .toArray();
        res.render("statistics-trainers", { model: result, admin: req.session.adminInfo });
    }

});

// Search posts
router.get("/search-posts", async(req, res) => {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let name_search = req.query.txtSearch;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo
            .collection("posts")
            .find({ name: new RegExp(name_search, "i") })
            .toArray();
        res.render("statistics-posts", { model: result, admin: req.session.adminInfo });
    }

});

// Search classes
router.get("/search-classes", async(req, res) => {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let name_search = req.query.txtSearch;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo
            .collection("classes")
            .find({ name: new RegExp(name_search, "i") })
            .toArray();
        res.render("statistics-classes", { model: result, admin: req.session.adminInfo });
    }

});

// Search videos
router.get("/search-videos", async(req, res) => {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let name_search = req.query.txtSearch;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo
            .collection("videos")
            .find({ name: new RegExp(name_search, "i") })
            .toArray();
        res.render("statistics-videos", { model: result, admin: req.session.adminInfo });
    }

});

// Search accounts
router.get("/search-accounts", async(req, res) => {
    const adminInfo = req.session.adminInfo;
    if (!adminInfo) {
        res.render("error1");
    } else {
        let name_search = req.query.txtSearch;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo
            .collection("users")
            .find({ username: new RegExp(name_search, "i") })
            .toArray();
        res.render("statistics-accounts", { model: result, admin: req.session.adminInfo });
    }

});

router.get("/search", async(req, res) => {
    res.render("search");
});


router.get("/do-search", async(req, res) => {
    let name_search = req.query.txtSearch;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("tips")
        .find({ name: new RegExp(name_search, "i") })
        .toArray();
    let result1 = await dbo
        .collection("videos")
        .find({ name: new RegExp(name_search, "i") })
        .toArray();
    if (result.length == 0 & result1.length == 0) {
        res.render("search", { message: "Nothing matched your keyword!" });
    } else {
        res.render("search", { result: result, result1: result1 });
    }


});

router.get("/confirm", async(req, res) => {
    res.render("confirm");
});


// --------------------- STORE-----------------------

router.get("/store", async(req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo.collection("products").find({}).toArray();
    let quantity = await dbo.collection("products").find({}).count();
    res.render("store", { model: result, quantity: quantity });
});


// ----------- SORT FUNCTION STORE ---------------
router.get("/store/sort/price/asc", async(req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let quantity = await dbo.collection("products").find({}).count();
    var array = await dbo.collection("products").find({}).toArray();
    // sorted price - asc
    var sortedArray = array.sort(function(a, b) {
        return a.price - b.price;
    });
    res.render("store", { model: sortedArray, quantity: quantity });
});

router.get("/store/sort/price/dsc", async(req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let quantity = await dbo.collection("products").find({}).count();
    var array = await dbo.collection("products").find({}).toArray();
    // sorted price - dsc
    var sortedArray = array.sort(function(a, b) {
        return b.price - a.price;
    });
    res.render("store", { model: sortedArray, quantity: quantity });
});

// ----------- SORT FUNCTION CART ---------------

router.get("/cart/sort/price/asc", async(req, res) => {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("cart").find({ user_id: cusInfo._id }).toArray();
        let quantity = result.length;
        var sortedArray = result.sort(function(a, b) {
            return a.price - b.price;
        });
        var subtotal = 0;
        for (var i = 0; i < result.length; i++) {
            subtotal += result[i].price * result[i].quantity;
        }
        var total = subtotal + (subtotal * 5) / 100;
        res.render("cart", { model: sortedArray, cart_quantity: quantity, subtotal: subtotal, total: total, cusInfo: cusInfo });
    }

});

router.get("/cart/sort/price/dsc", async(req, res) => {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");

        let result = await dbo.collection("cart").find({ user_id: cusInfo._id }).toArray();
        let quantity = result.length;
        var sortedArray = result.sort(function(a, b) {
            return b.price - a.price;
        });
        var subtotal = 0;
        for (var i = 0; i < result.length; i++) {
            subtotal += result[i].price * result[i].quantity;
        }
        var total = subtotal + (subtotal * 5) / 100;
        res.render("cart", { model: sortedArray, cart_quantity: quantity, subtotal: subtotal, total: total, cusInfo: cusInfo });
    }
});

// ---------- CART -------------------------------

router.get("/cart", async(req, res) => {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        const target_id = cusInfo._id;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("cart").find({ user_id: target_id }).toArray();
        var subtotal = 0;
        for (var i = 0; i < result.length; i++) {
            subtotal += result[i].price * result[i].quantity;
        }
        var total = subtotal + (subtotal * 5) / 100;
        let cart_quantity = await dbo.collection("cart").find({ user_id: cusInfo._id }).count();
        res.render("cart", {
            model: result,
            cart_quantity: cart_quantity,
            cusInfo: cusInfo,
            subtotal: subtotal,
            total: total
        });
    }

});

router.get("/do-add-to-cart", async(req, res) => {
    res.render("store");
});


// ------------- ADD PRODUCT TO CART -----------------
router.post('/do-add-to-cart/:id', async function(req, res, next) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");

        let result0 = await dbo.collection("cart").find({ user_id: cusInfo._id }).toArray();
        let names = [];
        for (var i = 0; i < result0.length; i++) {
            names.push(result0[i].name);
        }
        let result = await dbo.collection("products").find({ _id: ObjectID(req.params.id) }).toArray();
        var check = 0;
        for (var i = 0; i < names.length; i++) {
            if (names[i] === result[0].name) {
                check += 1;
                break;
            }
        }
        if (check == 1) {

            let client = await MongoClient.connect(url);
            let dbo = client.db("HomeFitness");
            let result = await dbo.collection("products").find({}).toArray();
            let quantity = await dbo.collection("products").find({}).count();
            res.render("store", {
                message1: "This product has already been in your cart!",
                model: result,
                quantity: quantity,
            });
        } else {
            let newData = {
                name: result[0].name,
                price: result[0].price,
                image: result[0].image,
                category: result[0].category,
                user_id: cusInfo._id,
                quantity: 1,
            };

            await dbo.collection("cart").insertOne(newData);
            let result1 = await dbo.collection("cart").find({ user_id: cusInfo._id }).toArray();
            let cart_quantity = result1.length;
            var subtotal = 0;
            for (var i = 0; i < result1.length; i++) {
                subtotal += result1[i].price * result1[i].quantity;
            }
            var total = subtotal + (subtotal * 5) / 100;
            res.render("cart", { model: result1, cart_quantity: cart_quantity, subtotal: subtotal, total: total, cusInfo: cusInfo });
        }

    }
});

// ------- UPDATE QUANTITY -----------


router.post('/do-update-quantity/:id', async function(req, res, next) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        const id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let target_cart = await dbo.collection("cart").findOne({ _id: ObjectID(id) });
        // Update
        let newData = {
            name: target_cart.name,
            price: target_cart.price,
            image: target_cart.image,
            category: target_cart.category,
            user_id: cusInfo._id,
            quantity: req.body.quantity,
        };
        await dbo
            .collection("cart")
            .updateOne({ _id: ObjectID(id) }, { $set: newData });

        let cart_quantity = await dbo.collection("cart").find({ user_id: cusInfo._id }).count();
        let result = await dbo.collection("cart").find({ user_id: cusInfo._id }).toArray();
        var subtotal = 0;
        for (var i = 0; i < result.length; i++) {
            subtotal += result[i].price * result[i].quantity;
        }
        var total = subtotal + (subtotal * 5) / 100;
        res.render("cart", { model: result, cart_quantity: cart_quantity, subtotal: subtotal, total: total, cusInfo: cusInfo });
        // res.render("cart", { model: result, cart_quantity: cart_quantity, subtotal: subtotal, total: total, cusInfo: cusInfo });
    }

});

router.get('/do-update-quantity', async function(req, res, next) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo.collection("cart").find({ user_id: cusInfo._id }).toArray();

        let cart_quantity = result.length;
        var subtotal = 0;
        for (var i = 0; i < result.length; i++) {
            subtotal += result[i].price * result[i].quantity;
        }
        var total = subtotal + (subtotal * 5) / 100;
        res.render("cart", { model: result, cart_quantity: cart_quantity, subtotal: subtotal, total: total, cusInfo: cusInfo });
    }

});


// ------- REMOVE PRODUCT FROM CART ------------
router.get('/remove-from-cart/:id', async function(req, res, next) {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        const id = req.params.id;
        var ObjectID = require("mongodb").ObjectID;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");

        await dbo.collection("cart").findOneAndDelete({ _id: ObjectID(id) });
        let result = await dbo.collection("cart").find({ user_id: cusInfo._id }).toArray();
        let cart_quantity = await dbo.collection("cart").find({ user_id: cusInfo._id }).count();
        var subtotal = 0;
        for (var i = 0; i < result.length; i++) {
            subtotal += result[i].price * result[i].quantity;
        }
        var total = subtotal + (subtotal * 5) / 100;
        res.render("cart", { model: result, cart_quantity: cart_quantity, subtotal: subtotal, total: total, cusInfo: cusInfo });
    }
});

// ---------- SEARCH PRODUCT SHOP --------------
router.get("/search-products-store", async(req, res) => {
    let name_search = req.query.txtSearch;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let result = await dbo
        .collection("products")
        .find({ name: new RegExp(name_search, "i") })
        .toArray();
    if (result.length >= 1) {
        var quantity = result.length;
        res.render("store", { model: result, quantity: quantity });
    } else {
        res.render("store", { message: "Nothing matched with your keywords!" });
    }
});


// ---------- SEARCH PRODUCT CART --------------
router.get("/search-products-cart", async(req, res) => {
    const cusInfo = req.session.cusInfo;
    if (!cusInfo) {
        res.render("error1");
    } else {
        let name_search = req.query.txtSearch;
        let client = await MongoClient.connect(url);
        let dbo = client.db("HomeFitness");
        let result = await dbo
            .collection("cart")
            .find({ user_id: cusInfo._id, name: new RegExp(name_search, "i") })
            .toArray();
        if (result.length >= 1) {

            var subtotal = 0;
            for (var i = 0; i < result.length; i++) {
                subtotal += result[i].price * result[i].quantity;
            }
            var total = subtotal + (subtotal * 5) / 100;
            res.render("cart", { model: result, subtotal: subtotal, total: total });
        } else {
            res.render("cart", { message: "Nothing matched with your keywords!" });
        }
    }

});
// ------------- PURCHASE ---------------

router.get("/purchase", async(req, res) => {
    res.render("congrat");
});


router.post("/purchase", async(req, res) => {
    const cusInfo = req.session.cusInfo;
    let client = await MongoClient.connect(url);
    let dbo = client.db("HomeFitness");
    let check = await dbo.collection("cart").find({ user_id: cusInfo._id }).toArray();
    if (!cusInfo) {
        res.render("error1");
    } else {
        if (check.length == 0) {
            let cart_quantity = 0;
            var subtotal = 0;
            var total = 0;
            res.render("cart", {
                message: "There is nothing in cart!",
                cart_quantity: cart_quantity,
                subtotal: subtotal,
                total: total,
                cusInfo: cusInfo,
            })
        } else {
            var subtotal = 0;
            for (var i = 0; i < check.length; i++) {
                subtotal += check[i].price * check[i].quantity;
            }
            var total = subtotal + (subtotal * 5) / 100;
            let newData = {
                user_id: cusInfo._id,
                name: cusInfo.username,
                date: new Date(),
                card_number: req.body.number,
                code: req.body.code,
                money: total,
            };
            await dbo.collection("purchase").insertOne(newData);
            await dbo.collection("cart").remove({ user_id: cusInfo._id });
            res.render("congrat");
        }

    }
});

module.exports = router;