import React, { useState } from "react";
import axios from "axios";

const API = () => {
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prevState) => ({ ...prevState, [name]: value }));
  };

  const registerUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/auth/register",
        registerData
      );
      if (response.status === 201) {
        alert("User registered successfully");
      }
    } catch (error) {
      alert("Registration failed");
    }
  };

  const loginUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/auth/login",
        loginData
      );
      const { accessToken, refreshToken } = response.data;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      alert("Login successful");
    } catch (error) {
      alert("Login failed");
    }
  };

  const accessProtectedRoute = async () => {
    try {
      const response = await axios.get("http://localhost:3001/auth/protected", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert(`Protected Route Accessed: ${response.data}`);
    } catch (error) {
      alert("Access denied");
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post("http://localhost:3001/auth/token", {
        token: refreshToken,
      });
      setAccessToken(response.data.accessToken);
      alert("Access token refreshed");
    } catch (error) {
      alert("Token refresh failed");
    }
  };

  const logoutUser = async () => {
    try {
      await axios.post("http://localhost:3001/auth/logout", {
        token: refreshToken,
      });
      setAccessToken("");
      setRefreshToken("");
      alert("Logged out");
    } catch (error) {
      alert("Logout failed");
    }
  };

  return (
    <div>
      <h1>API</h1>

      <h2>Register</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={registerData.name}
        onChange={(e) => handleChange(e, setRegisterData)}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={registerData.email}
        onChange={(e) => handleChange(e, setRegisterData)}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={registerData.password}
        onChange={(e) => handleChange(e, setRegisterData)}
      />
      <button onClick={registerUser}>Register</button>

      <h2>Login</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={loginData.email}
        onChange={(e) => handleChange(e, setLoginData)}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={loginData.password}
        onChange={(e) => handleChange(e, setLoginData)}
      />
      <button onClick={loginUser}>Login</button>

      <h2>Protected Route</h2>
      <button onClick={accessProtectedRoute}>Access Protected Route</button>

      <h2>Refresh Token</h2>
      <button onClick={refreshAccessToken}>Refresh Token</button>

      <h2>Logout</h2>
      <button onClick={logoutUser}>Logout</button>
    </div>
  );
};

export default API;
