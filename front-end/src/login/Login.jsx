import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../api/apiService";
import { apiUrls } from "../api/apiUrls";
import { LOCAL_STORAGE_KEYS } from "../storage/storageKeys";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const loginInfo = {
      email: email,
      password: password,
    };
    console.log("Logging in with", email, password);
    const apiService = new ApiService();
    apiService
      .post(apiUrls.login, loginInfo)
      .then((data) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.EMAIL, email);
        localStorage.setItem(LOCAL_STORAGE_KEYS.FULL_NAME, data.user.name);

        console.log("Login successful:", data);
        navigate("/");
      })
      .catch((error) => console.error("Error logging in:", error));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <header
        style={{
          width: "100%",
          padding: "10px 20px",
          backgroundColor: "#333",
          color: "#fff",
        }}
      >
        <h1>Online Debate Platform</h1>
      </header>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#fff",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px",
                background:"white"
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="password"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px",
                background:"white"

              }}
            />
          </div>
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <a
              href="/signup"
              style={{ color: "#007BFF", textDecoration: "none" }}
            >
              Dont have an account? Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
