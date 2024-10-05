import React, { useState } from "react";
import Register from "./Register";
import Login from "./Login";
import {AuthProvider} from "./context/AuthProvider";

const API = () => {

  return (
    <main className='App'>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </main>
  );
};

export default API;
