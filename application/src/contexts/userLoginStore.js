import { useState } from "react";
import axios from "axios";
import { loginContext } from "./loginContext";

function UserLoginStore({ children }) {
  const [currentUser, setCurrentUser] = useState({});
  const [loginErr, setLoginErr] = useState("");
  const [userLoginStatus, setUserLoginStatus] = useState(false)

  //function to make user login  request
  const loginUser = (userCredentialsObj) => {
    axios
      .post("http://localhost:3500/user/user-login", userCredentialsObj)
      .then((response) => {
        if (response.data.message === "Valid user") {
          //navigate to user profile
          localStorage.setItem("token", response.data.token)
          setCurrentUser({...response.data.user})
          setLoginErr("")
          setUserLoginStatus(true)
          console.log("Navigated to user profile");
        } else {
          console.log("user login failed", response.data.message);
          setLoginErr(response.data.message);
        }
      })
      .catch((err) => {
        console.log("ERROR IN USER LOGIN", err);
        setLoginErr(err.message)
      });
  };

  return (
    <loginContext.Provider value={[ currentUser, loginErr, userLoginStatus , loginUser]}>
      {children}
    </loginContext.Provider>
  );
}

export default UserLoginStore;
