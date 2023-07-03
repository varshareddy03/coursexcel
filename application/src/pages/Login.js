import { useForm } from "react-hook-form";
//import {useState, useContext} from 'react'
import { loginContext } from "../contexts/loginContext";
import { useContext } from "react";

function Login() {

  let [ currentUser, loginErr, userLoginStatus , loginUser] = useContext(loginContext)
  let {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  //form submit
  let submitForm = (userObj) => {
    console.log("LOGGING IN", userObj);
    loginUser(userObj)
    //     //Make a HTTP post request
    //     fetch("http://localhost:4000/users", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(userObj),
    //     })
    //       .then((res) => res.json())
    //       .then((message) => console.log(message))
    //       .catch((err) => console.log("err is ", err));
  };
  return (
    <div className="container">
      <div className="row mt-5">
        <div className="formbox col-11 col-sm-8 col-md-6 mt-5 m-auto text-center border border-3 border-dark rounded p-5">
          <h1 className="text-success mb-3">USER LOGIN</h1>
          <form onSubmit={handleSubmit(submitForm)}>
            <p className="text-start">Enter your email:</p>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Email"
              {...register("email")}
            ></input>
            <br></br>
            <p className="text-start">Enter password :</p>
            {/*password*/}
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Password"
              {...register("password")}
            ></input>
            <button type="submit" className="btn btn-success mt-3 ">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
