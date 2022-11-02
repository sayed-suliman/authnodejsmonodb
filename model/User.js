const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchma  = new Schema({
    name:String,
    email:String,
    password:String,
    dateOfBirth:Date,
    verified:Boolean
});
const User = mongoose.model("User",UserSchma);
module.exports = User;
// const mongoose = require("mongoose");
// const validator = require("validator");
// const studentSchema = new mongoose.Schema({
//     name:{
//         type:String,
//         required:true,
//         minlength:3
//     },
//     email:{
//         type:String,
//         required:true,
//         unique:[true,"Email I'd is Already present"],
//         validate(value){
//             if(!validator.isEmail(value)){
//                 throw new Error("invalid email");
//             }
//         }
//     },
//     phone: {
//         type:Number,
//         min:10,
//         // max:10,
//         required:true,
//         unique:true
//     },
//     address:{
//         type:String,
//         required:true
//     },
// });
//  we will create a new user colection

// const Student = mongoose.model("Student",studentSchema);
// module.exports = Student;