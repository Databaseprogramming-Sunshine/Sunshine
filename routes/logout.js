var express = require("express");
var app = express();
var router = express.Router();

router.get("/", function (req, res) {
  req.session.destroy(function (err) {
    console.log("๋ก๊ทธ์์");

    res.render("login");

    });
});

module.exports = router;
