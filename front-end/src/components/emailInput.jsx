import { useState } from "react";

const EmailInput = ({ emails, setEmails }) => {
  const [errorMsg, setErrorMsg] = useState([]);

  const [inputValue, setInputValue] = useState("");

  const addEmail = () => {
    if (emails?.length >= 3) {
      setErrorMsg("You can only add up to 3 judges.");
      return;
    }

    // Basic validation for email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(inputValue)) {
      setErrorMsg("Please enter a valid email.");
      return;
    }

    if (emails?.includes(inputValue)) {
      setErrorMsg("This email is already added.");
      return;
    }

    setEmails([...emails, inputValue]);
    setInputValue("");
  };

  const removeEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  return (
    <div
      style={{ maxWidth: "400px", margin: "20px auto", fontFamily: "Arial" }}
    >
      <h3>Add Judges</h3>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value), setErrorMsg("");
          }}
          placeholder="Enter email"
          style={{
            padding: "8px",
            width: "calc(100% - 90px)",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "white",
          }}
        />
        <button
          type="button"
          onClick={addEmail}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>
      <p>{errorMsg}</p>
      <div>
        {emails?.map((email, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "white",
              padding: "8px",
              marginBottom: "5px",
              borderRadius: "4px",
            }}
          >
            <span>{email}</span>
            <button
              type="button"
              onClick={() => removeEmail(email)}
              style={{
                background: "red",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailInput;
