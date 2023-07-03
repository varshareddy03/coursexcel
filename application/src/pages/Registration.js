import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Registration() {
  let [error, setError] = useState("");

  let {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  //form submit
  let submitForm = (userObj) => {
    console.log("SUBMITTING REGIISTRATION", userObj)
    axios
      .post("http://localhost:3500/user/user-signup", userObj)
      .then((response) => {
        console.log('response is', response)
        if (response.status === 201) {
          //navigate to Users component
          navigate("/login");
        }
        if (response.status !== 201) {
          setError(response.data.message);
        }
      })
      .catch((err) => {
        console.log("error is", err);
        //the client gives an error response (5xx, 4xx)
        if (err.respones) {
          setError(err.response);
        }
        //the client never recieved a response
        else if (err.request) {
          setError(err.message);
        } else {
          setError(err.message);
        }
      });
  };

  return (
    <div className="container">
      <div className="row">
        <div className="formbox col-11 col-sm-8 col-md-6 mt-5 m-auto text-center border border-3 border-dark rounded p-5">
          <h1 className="text-success">USER REGISTRATION</h1>
          <form onSubmit={handleSubmit(submitForm)}>
            {/*Fullname */}
            <p className="text-start mt-4">Enter your full name:</p>
            <input
              type="text"
              id="fullname"
              className="form-control"
              placeholder="Full name"
              {...register("username")}
            ></input>
            {/* date of birth */}
            <p className="text-start mt-4">Enter your date of birth:</p>
            <input
              type="date"
              className="form-control "
              {...register("dateOfBirth")}
            ></input>
            <br></br>
            {/*city */}
            <p className="text-start">Enter your email:</p>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Email"
              {...register("email")}
            ></input>
            <br></br>
            <p className="text-start">Create a new password :</p>
            {/*password*/}
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Password"
              {...register("password")}
            ></input>
            <button type="submit" className="btn btn-success mt-3 ">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registration;
