require("./config/config");
const express = require("express");
const app = express();
const userRouter = require("./api/user");
app.use(express.json());
app.use("/user",userRouter);
const port = 3000;
const bodyParser = require('express').json;
app.use(bodyParser());
app.listen(port,()=>{
    console.log("listen Port : " + port);
});