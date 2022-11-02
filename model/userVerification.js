const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserVerificationSchma  = new Schema({
    userId:String,
    uniqueString:String,
    createdAt:Date,
    expiresAt:Date
});
const UserVerification = mongoose.model("UserVerificaiton",UserVerificationSchma);
module.exports = UserVerification;