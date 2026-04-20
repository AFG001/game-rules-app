import { useState } from "react";
import "./PasswordGate.css";

const STORAGE_KEY = "game_rules_auth";
const CORRECT = import.meta.env.VITE_APP_PASSWORD;

export function isAuthenticated() {
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

export default function PasswordGate({ onAuth }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (input === CORRECT) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      onAuth();
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="gate-overlay">
      <div className="gate-box">
        <div className="gate-icon">🎮</div>
        <h1 className="gate-title">ゲームルール管理</h1>
        <p className="gate-desc">パスワードを入力してください</p>
        <form onSubmit={handleSubmit}>
          <input
            className={`gate-input ${error ? "gate-input-error" : ""}`}
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="パスワード"
            autoFocus
          />
          {error && <p className="gate-error">パスワードが違います</p>}
          <button className="gate-btn" type="submit">入室する</button>
        </form>
      </div>
    </div>
  );
}
