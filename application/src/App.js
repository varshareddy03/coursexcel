import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout";
import Home from "./pages/Home";
import MyCourses from "./pages/MyCourses";
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import Login from './pages/Login'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "", // Update the path to an empty string for the default route
          element: <Home />,
        },
        {
          path: "mycourses", // Remove the leading "/" from the path
          element: <MyCourses />,
        },
        {
          path: "dashboard", // Remove the leading "/" from the path
          element: <Dashboard />,
        },
        {
          path: "register", // Remove the leading "/" from the path
          element: <Registration />,
        },
        {
          path: "login", // Remove the leading "/" from the path
          element: <Login />,
        }
      ],
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

