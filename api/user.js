const express = require("express");
const router = express.Router();
// password user
const bcrypt = require("bcrypt");
// mongodb user  model
const Student = require("./../model/User");
const Product = require("../model/huner");
const Testing = require("../model/tesitng");
const User = require("./../model/User");
// path for static verified page
const path = require("path")
// mongodb user verificaiton model
const UserVerification = require("./../model/userVerification");
// email handler
const nodemailer = require("nodemailer");
// unique string
const { v4: uuidv4 } = require("uuid");
// env varibles
require("dotenv").config();
// rou
// nodemailer stuff
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
});
// testing successfull
transporter.verify((error, success) => {
    if (error) {
        console.log("+++++++++++++++++++++++++++++++++++++")
        console.log(error)
    } else {
        console.log("Ready for messages")
        console.log(success)
    }
});
// home
router.post("/s",async  (req, res) => {
    try {
        // console.log(req.body.name)
        var message = await req.body
        console.log(message)
       var pp = new Testing([{
        product_name:req.body
       }])
       var ppp = await pp.save()
        console.log(ppp)
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
router.post("/faisel", async (req,res)=>{
    var message =  req.body
    console.log(message)
   var pp = new Testing({
    product_name:"new data added"
   })
   var ppp = await pp.save()
})
router.get("/s",(req,res)=>{
    res.sendFile(path.join(__dirname, "./../views/verified.html"))
})
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
router.post('/sent', async(req, res) => {
    var message = await req.body;
    console.log(message);
})
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
                    result: result
                })
            } else {
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const userData = new User({
                        name: name,
                        email: email,
                        password: hashedPassword,
                        dateOfBirth: dateOfBirth,
                        verified: false
                    });
                    userData.save().then(result => {
                        // res.status(201).json({
                        //     status: "Success",
                        //     statusNumber: "201",
                        //     message: "User added Successfully",
                        //     result:result
                        // });

                        // handle verfication email
                        sendVerificaitonEmail(result, res);
                    }).catch(e => {
                        res.status(201).json({
                            status: "Failed",
                            statusNumber: "401",
                            message: "Error Occured when come user creating time",
                        });
                    });


                }).catch(err => {
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
// send verificaiton email
const sendVerificaitonEmail = ({ _id, email }, res) => {
    // url to be used in the email
    const currentUrl = "http://localhost:3000/"
    const uniqueString = uuidv4() + _id;
    // mail option 
    const mailOption = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your Email",
        html: `<p>Verify your email:</p><p>This link will be expire in 6hours</p><p>press<a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a> to procees..</p>`
    }
    // hash the uniquestring
            // set values in userverification collection
            const newVerificaiton = new UserVerification({
                userId: _id,
                uniqueString: uniqueString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 21600000
            })
            newVerificaiton.save().then(() => {
                transporter.sendMail(mailOption).then(() => {
                    res.json({
                        status: "Pending",
                        message: "Verification Email Sent"
                    })
                }).catch((e) => {
                    res.json({
                        status: e,
                        err: "Failed",
                        message: "An error occur while sending email issue"
                    })
                })
            }).catch(err => {
                res.json({
                    status: err,
                    err: "Failed",
                    message: "An error occur while saving data"
                })
            })
        
}
// verfiy email
router.get("/verify/:userId/:uniqueString", (req, res) => {
    let { userId, uniqueString } = req.params
    UserVerification.find({ userId })
        .then(result => {
            if (result.length) {
                // user verification recoerf exits so we procedd
                const { expiresAt } = result[0]
                // console.log(expiresAt)
                // const hashedUniqueString = result[0].uniqueString
                // checking for expired unique string
                if (expiresAt < Date.now()) {
                    // record has expired so we delte it
                    UserVerification.deleteOne({ userId }).then(
                        result => {
                            User.deleteOne({ _id: userId }).then(() => {
                                let message = "Linked has expired . Please sign up again"
                                res.redirect(`/user/verified/error=true&message=${message}`)
                            }).catch(error => {
                                console.log(error)
                                let message = "Clearing  user witn expired uniqure string failed"
                                res.redirect(`/user/verified/error=true&message=${message}`)
                            })
                        }
                    ).catch(error => {
                        console.log(error)
                        let message = "An Error occured while clering expired user verificaiton record"
                        res.redirect(`/user/verified/error=true&message=${message}`)
                    })
                } else {
                    // valid record exists so we validate the user string 
                    User.updateOne({ _id: userId }, { verified: true }).then(() => {
                        UserVerification.deleteOne({ userId }).then(() => {
                            res.sendFile(path.join(__dirname, "./../views/verified.html"))
                        }).catch(error => {
                            console.log(error)
                            let message = "An error occurred while finalizing successful verifcation"
                            res.redirect(`/user/verified/error=true&message=${message}`)
                        })
                    }).catch(error => {
                        console.log(error)
                        let message = "An error occurred while updating user record to show vrfied"
                        res.redirect(`/user/verified/error=true&message=${message}`)
                    })
                    // first compare the hashed uniue string
                    // bcrypt.compare(uniqueString, hashedUniqueString).then(result => {
                    //     if (result) {
                    //         // string matched
                    //     } else {
                    //         // existing  record but incorrect verification dtailes passed
                    //         let message = "Invalid verification dtailes passed. Check your inbox"
                    //         res.redirect(`/user/verified/error=true&message=${message}`)
                    //     }
                    // }).catch(error => {
                    //     let message = "Ac error occur while comparing uniue string"
                    //     res.redirect(`/user/verified/error=true&message=${message}`)
                    // })
                }
            } else {
                // user verification record doesn't exist
                let message = "Pleaase sighn up or login user verification record user verification record doesn't exist"
                res.redirect(`/user/verified/error=true&message=${message}`)
            }
        })
        .catch(error => {
            console.log(error)
            let message = "An Error occured while checking for existing user verification record"
            res.redirect(`/user/verified/error=true&message=${message}`)
        })
})
// verified page route
router.get("verified", (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/verified.html"))
})

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
router.post("/signin", (req, res) => {
    let { email, pass } = req.body;
    if (email == "" || pass == "") {
        res.status(401).json({
            message: "All field are required"
        });
    } else {
        User.findOne({ email: email })
            .then(data => {
                if (data) {

                    // User exists
                    // check if user is verified

                    if (!data.verified) {
                        res.status(420).json({
                            message: "Emails hasn't verfied",
                            status: "Failed",
                            pass: data.verified
                        })
                    } else {
                        const hashedPassword = data.password;
                        bcrypt.compare(pass, hashedPassword).then(result => {
                            if (result) {
                                res.status(201).json({
                                    message: "Successfully Login",
                                    data: data
                                });
                            } else {
                                res.status(420).json({
                                    message: "Password not matched",
                                    hashedPass: hashedPassword,
                                    pass: pass
                                })
                            }
                        }).catch(e => {
                            res.status(451).json({
                                data: "Error Occur during hashing data"
                            });
                        })
                    }


                } else {
                    res.status(404).json({
                        message: "Invalid Credentials"
                    })
                }
            }).catch(err => {
                res.status(404).json({
                    message: "Some error occures in first stages"
                })
            });
    }

});
router.get("/fetch", (req, res) => {
    User.find().then(value => {
        res.json({
            val: value
        })
    }).catch(err => {
        res.status(404).json({
            message: "Some error occures in first stages"
        })
    })
});
module.exports = router;