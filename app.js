const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// =============== Mongoose Setup ===============
const mongoUrl = '';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to database.");
});

// ============================================

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, '/public')));

// =============== Schema Setup ===============
const challengeSchema = mongoose.Schema({
    challengeName: String,
    flagHash: String
});

const Challenge = mongoose.model("Challenge", challengeSchema);
// ============================================

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/flagcheck', (req, res) => {
    const secret = fs.readFileSync(__dirname + '/secret.txt', 'utf8').trim();
    const sha256Hasher = crypto.createHmac("sha256", secret);
    const flag = req.body.flag.trim();
    const flagHash = sha256Hasher.update(flag).digest("hex");
    Challenge.findOne({ flagHash: flagHash }, (err, result) => {
        if (err) {
            console.log("Error while finding challenge.");
            console.log(err);
        } else {
            if (result) {
                res.render("result", { success: true, challengeName: result.challengeName });
            } else {
                res.render("result", { success: false });
            }
        }
    });
});

app.get("*", (req, res) => {
    res.status(404).render("404");
});

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
