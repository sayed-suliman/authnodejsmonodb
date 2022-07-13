require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_Uri, {
    useNewUrlParser: true, useUnifiedTopology: true, writeConcern: { w: 'majority', j: true, wtimeout: 1000 }
}).then(() => {
    console.log("Database Connentecd");
}).catch((err) => console.log(err));