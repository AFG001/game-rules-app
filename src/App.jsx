import { useState, useEffect, useCallback } from "react";
import { fetchRules, addRule, updateRule, toggleRule, deleteRule } from "./api";
import "./App.css";

const POLL_INTERVAL = 5000;

function RuleModal({ rule, onSave, onClose, saving }) {
  const [title, setTitle] = useState(rule?.title ?? "");
  const [content, setContent] = useState(rule?.content ?? "");
  const isEdit = rule !== null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave(title.trim(), content.trim());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "ルール編集" : "新規ルール追加"}</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            タイトル
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ルールのタイトル"
              autoFocus
            />
          </label>
          <label className="form-label">
            内容
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ルールの詳細内容"
              rows={4}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              キャンセル
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "保存中..." : isEdit ? "保存" : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalRule, setModalRule] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchRules();
      setRules(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [load]);

  async function handleSave(title, content) {
    setSaving(true);
    try {
      if (modalRule === null) {
        await addRule(title, content);
      } else {
        await updateRule(modalRule.id, title, content);
      }
      setModalRule(undefined);
      await load();
    } catch (e) {
      alert("保存に失敗しました: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(rule) {
    setTogglingId(rule.id);
    try {
      await toggleRule(rule.id, !rule.is_active);
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, is_active: !rule.is_active } : r))
      );
    } catch (e) {
      alert("更新に失敗しました: " + e.message);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(rule) {
    if (!confirm(`「${rule.title}」を削除しますか？`)) return;
    try {
      await deleteRule(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
    } catch (e) {
      alert("削除に失敗しました: " + e.message);
    }
  }

  const activeRules = rules.filter((r) => r.is_active);

  return (
    <div className="app">
      <header className="app-header">
        <h1>ゲームルール管理</h1>
      </header>

      <section className="active-section">
        <h2 className="section-title">
          適用中のルール
          <span className="badge">{activeRules.length}</span>
        </h2>
        {activeRules.length === 0 ? (
          <p className="empty-message">適用中のルールはありません</p>
        ) : (
          <div className="active-cards">
            {activeRules.map((rule) => (
              <div key={rule.id} className="active-card">
                <div className="active-card-title">{rule.title}</div>
                <div className="active-card-content">{rule.content}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="table-section">
        <div className="section-header">
          <h2 className="section-title">ルール一覧</h2>
          <button className="btn-primary" onClick={() => setModalRule(null)}>
            + 新規ルール追加
          </button>
        </div>

        {loading ? (
          <p className="loading">読み込み中...</p>
        ) : error ? (
          <p className="error-message">エラー: {error}</p>
        ) : rules.length === 0 ? (
          <p className="empty-message">ルールがありません。追加してください。</p>
        ) : (
          <div className="table-wrapper">
            <table className="rules-table">
              <thead>
                <tr>
                  <th className="col-status">適用</th>
                  <th className="col-title">タイトル</th>
                  <th className="col-content">内容</th>
                  <th className="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className={rule.is_active ? "row-active" : ""}>
                    <td className="col-status">
                      <button
                        className={`toggle-btn ${rule.is_active ? "active" : "inactive"}`}
                        onClick={() => handleToggle(rule)}
                        disabled={togglingId === rule.id}
                      >
                        {rule.is_active ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="col-title">{rule.title}</td>
                    <td className="col-content">{rule.content}</td>
                    <td className="col-actions">
                      <button className="btn-edit" onClick={() => setModalRule(rule)}>
                        編集
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(rule)}>
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalRule !== undefined && (
        <RuleModal
          rule={modalRule}
          onSave={handleSave}
          onClose={() => !saving && setModalRule(undefined)}
          saving={saving}
        />
      )}
    </div>
  );
}
