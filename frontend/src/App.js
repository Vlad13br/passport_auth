import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; // Імпортуй необхідні компоненти
import Register from "./Register";
import Login from "./Login";
import { AuthProvider } from "./context/AuthProvider";

const API = () => {
    return (
        <Router> {/* Додаємо Router для маршрутизації */}
            <main className='App'>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} /> {/* Маршрут для входу */}
                        <Route path="/register" element={<Register />} /> {/* Маршрут для реєстрації */}
                    </Routes>
                </AuthProvider>
            </main>
        </Router>
    );
};

export default API;
