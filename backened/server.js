const exp = require('express')
const app = exp();

app.listen(3500, () => console.log("Server listening on port 3500..."))

//get mongo client
const mclient = require('mongodb').MongoClient

//connect to db server using mongo client
mclient.connect("mongodb://127.0.0.1:27017")
.then((dbRef) => {
    //connect to database
    const dbObj = dbRef.db("coursexceldb");

    //connect to collections of this database
    const userscollectionObj = dbObj.collection("userscollection")

    //share collection to API
    app.set('userscollectionObj', userscollectionObj);

    //displaying message
    console.log("DB connection success")
})
.catch((err) => console.log("Database connect error:", err));

const userApp = require("./APIs/usersapi")

//execute usersapi when path starts with /user
app.use('/user', userApp)

//invalid path middleware
const invalidPathMiddleware = (requesr, response, next) => {
    response.send({message:"Invalid Path"})
}
app.use("*", invalidPathMiddleware)

//error handling middleware
const errhandlingMiddleware = (error, request, response, next) => {
    response.send({message:error.message})
}
app.use(errhandlingMiddleware)