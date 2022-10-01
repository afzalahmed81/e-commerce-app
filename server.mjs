import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { varifyHash, stringToHash } from 'bcrypt-inzi';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const SECRET = process.env.secret || 'topsecret';
const app = express();
app.use(express.json());    //parsing body
app.use(cookieParser());    //parsing cookies

app.use(cors({
    origin: ['http://localhost:3000', "*"],
    credentials: true
}));

const port = process.env.PORT || 5001;
const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, min: 17, max: 65, default: 18 },
    isMarried: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.name }
});

const userModel = mongoose.model('Users', userSchema);
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: String, required: true },
    code: { type: String, required: true },

    createdOn: { type: Date, default: Date.now },
});
const productModel = mongoose.model('Products', productSchema);

app.post("/signup", (req, res) => {
    let body = req.body;
    if (!body.firstName || !body.lastName || !body.email || !body.password) {
        res.status(400).send(`required fields missing, request example:{
            "firstName": "John",
            "lastName": "Doe",
            "email": "abc@abc.com",
            "password": "12345"
        }`);
        return;
    }
    // Check if user already exist, query email user
    userModel.findOne({ email: body.email }, (err, data) => {
        if (!err) {
            console.log("data", data);
            if (data) { // user already exist
                console.log("user already exist", data);
                res.status(400).send({ message: "user already exist ,try a different email" });
                return;
            } else { // user does not exist already
                stringToHash(body.password).then(hashString => {
                    userModel.create({
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email.toLowerCase(),
                        password: hashString
                      },
                        (err, result) => {
                            if (!err) {
                                console.log("data saved", result);
                                res.status(201).send({ message: "User is created" });
                            } else {
                                console.log("Database Error", err);
                                res.status(500).send({ message: "Internal server error" });
                            }
                        }
                    );
                })

            }

        } else {
            console.log("db error: ", err);
            res.status(500).send({ message: "db error in query" });
            return;
        }
    })

});







app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})





