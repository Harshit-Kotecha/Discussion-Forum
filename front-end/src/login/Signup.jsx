import React, { useState } from 'react';
import ApiService from '../api/apiService';
import { apiUrls } from '../api/apiUrls';
import { LOCAL_STORAGE_KEYS } from '../storage/storageKeys';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Signing up with', email, password);
    const apiService = new ApiService();

    const signupInfo = {
        'name': fullName,
        'email': email,
        'password': password 
    }

    apiService
      .post(apiUrls.signup, signupInfo)
      .then((data) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.EMAIL, email);
        localStorage.setItem(LOCAL_STORAGE_KEYS.FULL_NAME, fullName);
        console.log("Signup successful:", data)
        navigate('/login')
      })
      .catch((error) => console.error("Error logging in:", error));
    };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff' }}>
        <h1>Online Debate Platform</h1>
      </header>
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign Up</h2>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="fullName" style={{ display: 'block', marginBottom: '5px' }}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
          <button
            onClick={handleSignUp}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <a href="/login" style={{ color: '#007BFF', textDecoration: 'none' }}>
              Already have an account? Login
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignUpPage;
