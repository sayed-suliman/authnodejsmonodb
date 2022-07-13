const express = require("express");
const router = express.Router();
// password user
const bcrypt = require("bcrypt");
// mongodb user  model
const Student = require("./../model/User");
const Product = require("../model/huner");
const User = require("./../model/User");
router.post("/students", (req, res) => {
    const user = new Student(req.body);
    user.save().then(() => {
        // console.log("Data added successfully");
        res.status(201).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
    console.log(user);
});
router.post("/products", async (req, res) => {
    try {
        const product = new Product(req.body);
        const createProduct = await product.save();
        res.status(201).json({
            status: "Success",
            statusNumber: "201",
            message: "Product added Successfully"
        });
    } catch (e) {
        res.status(400).json({
            status: "Failed",
            statusNumber: "400",
            message: "Product Not added",
            error: e
        });
    }

});
router.post("/users", (req, res) => {
    let { name, email, password, dateOfBirth } = req.body;
    if (name == "" || email == "" || password == "" || dateOfBirth == "") {
        res.json({
            status: "Failed",
            message: "Empty Input fields!"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "Failed",
            message: "Email is invalid"
        });
    } else if (password.length < 8) {
        res.json({
            status: "Failed",
            message: "Password is too short, Should be 8+ characters"
        });
    } else {
        User.findOne({ email: email }).then(result => {
            if (result) {
                res.json({
                    status: "Failed",
                    message: "An error occured Already Exists this email user!",
                    result:result
                })
            }else{
                const saltRounds = 10;
                bcrypt.hash(password,saltRounds).then(hashedPassword=>{
                    const userData = new User({
                        name:name,
                        email:email,
                        password:hashedPassword,
                        dateOfBirth:dateOfBirth
                    });
        userData.save().then(result=>{
            res.status(201).json({
                status: "Success",
                statusNumber: "201",
                message: "User added Successfully",
                result:result
            });
        }).catch(e=>{
            res.status(201).json({
                status: "Success",
                statusNumber: "401",
                message: "Error Occured when come user creating time",
            });
        });

       
                }).catch(err=>{
                    res.json({
                        status: "Failed",
                        message: "An error occurd while hashing a password"
                    })
                })
            }
        }).catch((e) => {
            console.log(e);
            res.json({
                status: "Failed",
                message: "An error occurd while checking for existing email user!"
            })
        });

    }



});
/*
router.post("/asyncStudents", async (req, res) => {
    try {
        const user = new Student(req.body);
        const createUser = await user.save();
        res.status(201).send(createUser);
    } catch (e) {
        res.status(400).send(e);
    }
});
*/
// router.post("/signup",async (req, res) => {
//     try{
//     const user = new User(req.body);
//     const createUser = await user.save();
//     // user.save().then(()=>{
//     //     res.json({
//     //         message:"Added Successfully",
//     //         status:"Success",
//     //         data:user
//     //     });
//     // })
//     console.log(createUser);
//     } catch(e){
//         res.json({
//             error: e,
//             message:"Failed TO add student",
//             status:"Failed",
//         });
//     };
// let { name, email, password, dateOfBirth } = req.body;
// name = name;
// email = email;
// password = password;
// dateOfBirth = dateOfBirth;
// if (name == "" || email == "" || password == "" || dateOfBirth == "") {
//     res.json({
//         status: "Failed",
//         message: "Empty input fields!"
//     });
// } else {
//     User.find({ email }).then(result => {
//         if (result.length) {
//             res.json({
//                 status: "failed",
//                 message: "User with the provided email already exists"
//             })
//         }else {
//             // new user
//             const newUser = new User({
//                 name,email,password,dateOfBirth
//             });
//             newUser.save().then(result=>{
//                 res.json({
//                     status:"Sussess",
//                     message:"Signup Successful",
//                     data:result
//                 })
//             }).catch(err=>{
//                 res.json({
//                     status: "Failerd",
//                     message: "An error occurred while saving user account for existing user!"
//                 })
//             })
//         }
//     }).catch(err => {
//         console.log(`email invalid : ${err}`);
//         res.json({
//             status: "Failerd",
//             message: "An error occurred  while  existing user!"
//         })
//     })
// }
// });
// router.post("/signin", (req, res) => {
//     let {email,password} = req.body;
//     if(email == "" || password == ""){
//         res.json({
//             status: "Failed",
//             message: "All Fields are required"
//         })  
//     }else{
//         Student.find({email}).then(data=>{
//             if(data.length){
//                 res.json({
//                     status:"Success",
//                     message:"Signin SUccess",
//                     data:data
//                 });
//             }else{
//                 res.send("nothing hapend");
//             }

//         });
//     }
// });
router.post("/signin",(req,res)=>{
    let {email,pass} = req.body;
    if(email == "" || pass == ""){
        res.status(401).json({
            message:"All field are required"
        });
    }else{
        User.findOne({email:email})
        .then(data=>{
            if(data){
                const hashedPassword = data.password;
                bcrypt.compare(pass,hashedPassword).then(result=>{
                    if(result){
                        res.status(201).json({
                            message:"Successfully Login",
                            data:data
                        });
                    }else{
                        res.status(420).json({
                            message:"Password not matched",
                            hashedPass:hashedPassword,
                            pass:pass
                        })
                    }
                }).catch(e=>{
                    res.status(451).json({
                        data:"Error Occur during hashing data"
                    });
                })
               
            }else{
                res.status(404).json({
                    message:"Invalid Credentials"
                })
            }
        }).catch(err=>{
            res.status(404).json({
                message:"Some error occures in first stages"
            })
        });
    }
    
});
router.get("/fetch",(req,res)=>{
    User.find().then(value=>{
        res.json({
            val:value
        })
    }).catch(err=>{
        res.status(404).json({
            message:"Some error occures in first stages"
        })
    })
});
module.exports = router;