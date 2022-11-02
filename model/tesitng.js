const mongoose = require("mongoose");
const Schema =  mongoose.Schema;
const test = new Schema({
    product_name:{
        type:String,
        required:true,
    },
    expires_at:{
        type:Date,
        default:Date.now(),
        expires:60
    },
  
});
const TesingProduct = mongoose.model("Testing",test);
module.exports = TesingProduct;