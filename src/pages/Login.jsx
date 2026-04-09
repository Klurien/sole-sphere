import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../apiConfig';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Pass both user data and token to AuthContext
                login(data.user, data.token);
                navigate(data.user.role === 'admin' ? '/admin' : '/');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <p>Sign in to manage your account or shop our collection.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className={error ? "text-error" : ""}><Mail size={16} /> Username</label>
                        <input
                            type="text"
                            className={error ? "error-input" : ""}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className={error ? "text-error" : ""}><Lock size={16} /> Password</label>
                        <input
                            type="password"
                            className={error ? "error-input" : ""}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {error && <span className="liquid-error-text text-editorial" style={{ marginTop: '10px' }}>{error}</span>}
                    </div>

                    <button type="submit" className="btn btn-accent btn-full" disabled={loading}>
                        {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
