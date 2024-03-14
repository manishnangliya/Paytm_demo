const express = require("express");
const userRoute = require("./user");
const accountRoute = require("./accounts");

const router = express.Router();

router.use('/user',userRoute);
router.use('/account',accountRoute);

router.get("/",function(req,res){


});


module.exports = router;