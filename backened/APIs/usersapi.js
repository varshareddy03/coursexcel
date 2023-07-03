//create a mini express userApp(a router)
const exp = require("express");
const userApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken")
const verifyToken = require('./middlewares/verifyToken')

//body parser
userApp.use(exp.json());

//CREATING USERS API

//getting all users
userApp.get("/get-users", (request, response) => {
  //getting userCollectionObj
  const userscollectionObj = request.app.get("userscollectionObj");

  //get users from db
  userscollectionObj
    .find()
    .toArray()
    .then((usersList) => {
      response.status(200).send({ message: "Users list", payload: usersList });
    })
    .catch((err) => {
      console.log("err in getting users list", err);
      response.send({ message: "Error", errMessage: err.message });
    });
});

//getting data of a particular user
userApp.get("/get-user/:username",verifyToken, (request, response) => {
  //getting userCollectionObj
  const userscollectionObj = request.app.get("userscollectionObj");

  //getting the id
  let username = request.params.username;

  userscollectionObj
    .findOne({ username: username })
    .then((userobj) => {
      response
        .status(200)
        .send({ message: "Users with the username", payload: userobj });
    })
    .catch((err) => {
      console.log("err in getting user with username", username, err);
      response.send({ message: "Error", errMessage: err.message });
    });
});

//user-signup
userApp.post(
  "/user-signup",
  expressAsyncHandler(async (request, response) => {
    //getting userCollectionObj
    const userscollectionObj = request.app.get("userscollectionObj");

    //get new user from request
    const newUser = request.body;

    //check for duplicate user
    let userOfDB = await userscollectionObj.findOne({
      username: newUser.username,
    });

    //if user exists already
    if (userOfDB != null) {
      response.status(200).send({ message: "User already exists" });
    } else {
      let hashedPassword = await bcryptjs.hash(newUser.password, 5);

      newUser.password = hashedPassword;

      userscollectionObj.insertOne(newUser);

      response.status(201).send({ message: "User created" });
    }
  })
);

//user login
userApp.post(
  "/user-login",
  expressAsyncHandler(async (request, response) => {
    //get user collection object
    const userscollectionObj = request.app.get("userscollectionObj");

    //get newUser from request
    const userCredObj = request.body;

    //verify username
    let userofDB = await userscollectionObj.findOne({
      email: userCredObj.email,
    });

    //if email is not valid
    if (userofDB === null) {
      response.status(200).send({ message: "Invaid user" });
    }
    //if user is valid
    else {
      //verify password
      let isEqual = await bcryptjs.compare(
        userCredObj.password,
        userofDB.password
      );

      //if not matched
      if (isEqual === false) {
        response.status(200).send({ message: "Invalid password" });
      }
      //if matched
      else {
        //create a jwt token
        let jwtToken = jwt.sign({ email: userofDB.email }, "abcdef", {
          expiresIn: 20,
        });

        //send token in response
        response.status(201).send({ message: "Valid user", token: jwtToken });
      }
    }
  })
);

//updating existing user
userApp.put("/update-user", (request, response) => {
  //getting userscollectionObj
  const userscollectionObj = request.app.get("userscollectionObj");

  //getting modified data of user
  let userModified = request.body;

  //update user in db
  userscollectionObj
    .updateOne({ id: userModified.id }, { $set: { ...userModified } })
    .then((dbRes) => {
      response.status(200).send({ message: "user updated" });
    })
    .catch((err) => {
      console.log("err in updating user", err);
      response.send({ message: "Error", errMessage: err.message });
    });
});

//deleting user
userApp.delete("/delete-user/:id", (request, response) => {
  //getting userscollectionObj
  const userscollectionObj = request.app.get("userscollectionObj");

  //getting the id
  let userid = +request.params.id;

  //delete user
  userscollectionObj
    .deleteOne({ id: userid })
    .then((dbres) => {
      response.status(200).send({ message: "User removed" });
    })
    .catch((err) => {
      console.log("err in deleting user", err);
      response.send({ message: "Error", errMessage: err.message });
    });
});

//export userApp
module.exports = userApp;
