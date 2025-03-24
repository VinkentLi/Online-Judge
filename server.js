const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const judge = require("./judge.js");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post("/submit", (req, res) => {
    const { code, problem, testcaseCount } = req.body;
    judge.judge(code, problem, testcaseCount).then(result => res.json({result}));
});

app.post("/available", (req, res) => {
    const result = judge.getBoxID();
    res.json({result});
});

app.post("/subStatus", (req, res) => {
    const { boxID } = req.body;
    const result = judge.getStatus(boxID);
    res.json({result});
});

app.listen(3000, () => console.log("Server running on port 3000"));
