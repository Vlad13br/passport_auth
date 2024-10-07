import { useRef, useState, useEffect, useContext } from 'react';
import AuthContext from "./context/AuthProvider";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const emailRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        emailRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [email, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:3001/auth/login", {
                email,
                password,
            }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true, // Для збереження refreshToken в cookie
            });

            const accessToken = response.data.accessToken;
            if (accessToken) {
                setAuth({ email, accessToken });
                setEmail('');
                setPassword('');
                setSuccess(true);
            } else {
                setErrMsg('No accessToken in response');
            }

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Email or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    }

    const refreshAccessToken = async () => {
        try {
            const response = await axios.post('http://localhost:3001/auth/token', {}, { withCredentials: true });
            const newAccessToken = response.data.accessToken;
            setAuth(prev => ({ ...prev, accessToken: newAccessToken }));
            alert("Access token refreshed");
        } catch (error) {
            console.error("Error during token refresh:", error.response || error.message);
            alert("Token refresh failed");
        }
    };

    const protectRouter = async () => {
        try {
            const response = await axios.get("http://localhost:3001/auth/protected", {
                headers: { Authorization: `Bearer ${auth?.accessToken}` },
            });
            alert(`Protected Route Accessed: ${response.data}`);
        } catch (error) {
            console.error("Error during protected route access:", error.response?.data || error.message);
            alert("Access denied");
        }
    };

    return (
        <>
            {success ? (
                <section>
                    <h1>You are logged in!</h1>
                    <br />
                    <button onClick={protectRouter}>Access Protected Route</button>
                    <button onClick={refreshAccessToken}>Refresh Token</button>
                </section>
            ) : (
                <section>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Sign In</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            ref={emailRef}
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />

                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        <button>Sign In</button>
                    </form>
                    <p>
                        Need an Account?<br />
                        <span className="line">
                            <Link to="/register">Sign Up</Link>
                        </span>
                    </p>
                </section>
            )}
        </>
    );
}

export default Login;
