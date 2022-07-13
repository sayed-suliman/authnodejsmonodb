const mongoose = require("mongoose");
const Schema =  mongoose.Schema;
const productSchema = new Schema({
    product_name:{
        type:String,
        required:true,
    },
    virtual:{
        type:Boolean,
        default:true
    },
    downloadable:{
        type:Boolean,
        default:false
    },
    min_price:{
        type:Number,
    },
    onsale:{
        type:Number
    },
    stock_quantity:{
        type:Number
    },
    rating_count:{
        type:Number
    },
    total_sale:{
        type:Number
    },
    tax_status:{
        type:String
    }
});
const AddProduct = mongoose.model("AllProduct",productSchema);
module.exports = AddProduct;