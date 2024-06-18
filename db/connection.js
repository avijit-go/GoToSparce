require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

mongoose.connect(
    process.env.DB_CONNECTION_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
    
).then(() => {
    console.log("DB Connection build....");
}).catch((err) => {
    console.log(`${err} - DB Connection failed....`);
})