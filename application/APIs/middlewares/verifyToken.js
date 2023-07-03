const jwt = require("jsonwebtoken");

const verifyToken = (request, response, next) => {
  //get authorizationn key from req.headers
  const bearerToken = request.headers.authorization;

  if (bearerToken === undefined) {
    response.send({ message: "Unauthorized access. Login First" })
  } else {
    //get token from bearer token
    const token = bearerToken.split(" ")[1];

    //verify token
    try {
      jwt.verify(token, "abcdef");
      next();
    } catch (err) {
      //forward error to err handling middleware
      next(new Error('Session expired. Please login again'));
    }
  }
};

module.exports = verifyToken;
