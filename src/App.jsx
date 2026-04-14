import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════
//  ROLE DEFINITIONS
// ═══════════════════════════════════════════════════════
const ROLES = {
  superadmin: { label: "後台維修", color: "#dc2626", badge: "★", canEdit: true, canDelete: true, canManageUsers: true, canViewFinance: true,
    pages: ["dashboard","rooms","tenants","bills","repairs","report","users","log"] },
  admin:      { label: "管理員",   color: "#2563eb", badge: "▲", canEdit: true, canDelete: false, canManageUsers: false, canViewFinance: true,
    pages: ["dashboard","rooms","tenants","bills","repairs","report","users","log"] },
  staff:      { label: "工作人員", color: "#d97706", badge: "●", canEdit: true, canDelete: false, canManageUsers: false, canViewFinance: false,
    pages: ["tenants","repairs"] },
  viewer:     { label: "租客",     color: "#6b7280", badge: "○", canEdit: false, canDelete: false, canManageUsers: false, canViewFinance: false,
    pages: ["rooms","bills","repairs"] },
};

// ═══════════════════════════════════════════════════════
//  DEFAULT DATA
// ═══════════════════════════════════════════════════════
const DEFAULT_DATA = {
  users: [
    { id: "u2", name: "林小雯", email: "staff@rentkeeper.tw", password: "staff123", role: "admin", avatar: "林", online: false, lastSeen: null },
    { id: "u3", name: "陳建志", email: "view@rentkeeper.tw", password: "view123", role: "viewer", avatar: "陳", online: false, lastSeen: null },
    { id: "u4", name: "憲哥", email: "okdnhaco@gmail.com", password: "LIN082921", role: "superadmin", avatar: "憲", online: false, lastSeen: null },
    { id: "u5", name: "婉婷", email: "a0000196@gmail.com", password: "LIN082921", role: "superadmin", avatar: "婉", online: false, lastSeen: null },
    { id: "u6", name: "管理員", email: "okdnhaco@gmail.com", password: "lin082921", role: "admin", avatar: "管", online: false, lastSeen: null },
  ],
  rooms: [
    { id: "r1", propId: "p1", communityName: "101室", name: "101室", floor: 1, size: 8, rent: 12000, status: "rented", tenantId: "t1", rentDay: "5", leaseStart: "2024-03-01", contractEnd: "2025-03-01", tenantContactName: "張小華", tenantContactPhone: "0912-345-678", cohabitants: [] },
    { id: "r2", propId: "p1", communityName: "102室", name: "102室", floor: 1, size: 10, rent: 14000, status: "rented", tenantId: "t2", rentDay: "5", leaseStart: "2024-01-15", contractEnd: "2025-01-15", tenantContactName: "李美麗", tenantContactPhone: "0923-456-789", cohabitants: [] },
    { id: "r3", propId: "p1", communityName: "201室", name: "201室", floor: 2, size: 8, rent: 12000, status: "vacant", tenantId: null, rentDay: "5", leaseStart: "", contractEnd: "", tenantContactName: "", tenantContactPhone: "", cohabitants: [] },
    { id: "r4", propId: "p1", communityName: "202室", name: "202室", floor: 2, size: 12, rent: 16000, status: "rented", tenantId: "t3", rentDay: "5", leaseStart: "2023-11-01", contractEnd: "2024-11-01", tenantContactName: "陳志偉", tenantContactPhone: "0934-567-890", cohabitants: [] },
    { id: "r5", propId: "p2", communityName: "A01", name: "A01", floor: 1, size: 15, rent: 18000, status: "rented", tenantId: "t4", rentDay: "5", leaseStart: "2024-06-01", contractEnd: "2025-06-01", tenantContactName: "林淑芬", tenantContactPhone: "0945-678-901", cohabitants: [] },
    { id: "r6", propId: "p2", communityName: "B01", name: "B01", floor: 2, size: 20, rent: 22000, status: "vacant", tenantId: null, rentDay: "5", leaseStart: "", contractEnd: "", tenantContactName: "", tenantContactPhone: "", cohabitants: [] },
  ],
  tenants: [
    { id: "t1", name: "張小華", phone: "0912-345-678", email: "a@email.com", roomId: "r1", moveIn: "2024-03-01", contractEnd: "2025-05-01", deposit: 24000 },
    { id: "t2", name: "李美麗", phone: "0923-456-789", email: "b@email.com", roomId: "r2", moveIn: "2024-01-15", contractEnd: "2025-07-15", deposit: 28000 },
    { id: "t3", name: "陳志偉", phone: "0934-567-890", email: "c@email.com", roomId: "r4", moveIn: "2023-11-01", contractEnd: "2025-08-01", deposit: 32000 },
    { id: "t4", name: "林淑芬", phone: "0945-678-901", email: "d@email.com", roomId: "r5", moveIn: "2024-06-01", contractEnd: "2025-06-01", deposit: 36000 },
  ],
  bills: [
    { id: "b1", tenantId: "t1", roomId: "r1", type: "rent", amount: 12000, month: "2025-04", status: "paid", paidDate: "2025-04-03", recordedBy: "u1" },
    { id: "b2", tenantId: "t2", roomId: "r2", type: "rent", amount: 14000, month: "2025-04", status: "unpaid", paidDate: null, recordedBy: null },
    { id: "b3", tenantId: "t3", roomId: "r4", type: "rent", amount: 16000, month: "2025-04", status: "unpaid", paidDate: null, recordedBy: null },
    { id: "b4", tenantId: "t4", roomId: "r5", type: "rent", amount: 18000, month: "2025-04", status: "paid", paidDate: "2025-04-02", recordedBy: "u2" },
  ],
  repairs: [
    { id: "rep1", roomId: "r2", tenantName: "李美麗", title: "冷氣不製冷", desc: "冷氣開了但不冷", status: "pending", date: "2025-04-01", priority: "high", assignedTo: null, updatedBy: null },
    { id: "rep2", roomId: "r4", tenantName: "陳志偉", title: "廁所漏水", desc: "馬桶旁邊地板有水", status: "in_progress", date: "2025-03-28", priority: "high", assignedTo: "u2", updatedBy: "u2" },
  ],
  activityLog: [
    { id: "log1", userId: "u1", action: "標記 b1 已繳租", timestamp: "2025-04-03T09:15:00" },
    { id: "log2", userId: "u2", action: "標記 b4 已繳租", timestamp: "2025-04-02T14:30:00" },
    { id: "log3", userId: "u2", action: "更新報修 rep2 為處理中", timestamp: "2025-03-28T10:00:00" },
  ],
  chatTemplates: [
    "提醒您又到了匯租金的時間，麻煩您上傳匯款截圖。",
    "您好，請問收到我們的訊息了嗎？",
    "如有任何問題請隨時聯繫我們，謝謝！",
    "感謝您的配合，祝您生活愉快！",
  ],
};

// ═══════════════════════════════════════════════════════
//  STORAGE HELPERS
// ═══════════════════════════════════════════════════════
const STORE_KEY    = "rentkeeper-shared-v24";
const BASELINE_KEY = "rentkeeper-baseline-v24";

async function saveBaseline(data) {
  try { await window.storage.set(BASELINE_KEY, JSON.stringify(data), true); } catch (_) {}
}
async function loadBaseline() {
  try {
    const res = await window.storage.get(BASELINE_KEY, true);
    if (res && res.value) return JSON.parse(res.value);
  } catch (_) {}
  return null;
}
async function loadSharedData() {
  try {
    const res = await window.storage.get(STORE_KEY, true);
    if (res && res.value) {
      const parsed = JSON.parse(res.value);
      parsed.users = parsed.users.map(u => ({ ...u, online: false }));
      return parsed;
    }
  } catch (_) {}
  return null;
}
async function saveSharedData(data) {
  try { await window.storage.set(STORE_KEY, JSON.stringify(data), true); } catch (_) {}
}

// ═══════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════
const fmt = (n) => `NT$ ${Number(n).toLocaleString()}`;
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
const toROC = (dateStr, showTime = false) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear() - 1911;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (showTime) {
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `民國${year}年${month}月${day}日 ${h}:${m}`;
  }
  return `民國${year}年${month}月${day}日`;
};
const toROCMonth = (monthStr) => {
  if (!monthStr) return "—";
  const parts = monthStr.split("-");
  if (parts.length >= 2) return `民國${parseInt(parts[0]) - 1911}年${parts[1]}月`;
  return monthStr;
};
const statusLabel = { rented: "已出租", vacant: "空房", pending: "待處理", in_progress: "處理中", done: "已完成", paid: "已繳", unpaid: "未繳", rent: "租金", electric: "電費" };

// ═══════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════
const Icon = ({ n, s = 18 }) => ({
  home:     <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  dollar:   <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  tool:     <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  file:     <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chart:    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  plus:     <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  bell:     <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  x:        <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  shield:   <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  logout:   <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  edit:     <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  check:    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  refresh:  <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  lock:     <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  activity: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  building: <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M9 2v20M15 2v20M2 9h20M2 15h20"/></svg>,
  person:   <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  build:    <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
}[n] || null);

// ═══════════════════════════════════════════════════════
//  THEME — 白底黑字
// ═══════════════════════════════════════════════════════
const T = {
  bg:        "#ffffff",
  bgSub:     "#f9fafb",
  bgMuted:   "#f3f4f6",
  border:    "#e5e7eb",
  borderMd:  "#d1d5db",
  text:      "#111827",
  textSub:   "#6b7280",
  textMuted: "#9ca3af",
  accent:    "#1d4ed8",
  accentBg:  "#eff6ff",
  green:     "#16a34a",
  greenBg:   "#f0fdf4",
  red:       "#dc2626",
  redBg:     "#fef2f2",
  amber:     "#d97706",
  amberBg:   "#fffbeb",
  blue:      "#2563eb",
  blueBg:    "#eff6ff",
};

const css = {
  input: { width: "100%", background: T.bg, border: `1px solid ${T.borderMd}`, borderRadius: 8, color: T.text, padding: "10px 12px", fontSize: 15, boxSizing: "border-box", marginBottom: 12, outline: "none" },
  label: { display: "block", color: T.textSub, fontSize: 12, marginBottom: 4, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" },
  btn: (c = T.accent, ghost = false) => ({
    background: ghost ? "transparent" : c,
    color: ghost ? c : "#fff",
    border: `1px solid ${c}`,
    borderRadius: 7,
    padding: "8px 14px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  }),
  card: { background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 },
  tag: (c) => ({ fontSize: 12, fontWeight: 600, background: c + "18", color: c, padding: "2px 8px", borderRadius: 99 }),
  sectionTitle: { fontSize: 18, fontWeight: 700, color: T.text, margin: 0, marginBottom: 16 },
};

// ═══════════════════════════════════════════════════════
//  UI PRIMITIVES
// ═══════════════════════════════════════════════════════
function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 14, width: "100%", maxWidth: width, maxHeight: "88vh", overflow: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 14px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, padding: 4, borderRadius: 6 }}><Icon n="x" /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  const bg = type === "error" ? T.red : type === "chat" ? T.text : T.green;
  return (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: bg, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", whiteSpace: "nowrap", maxWidth: "90vw", overflow: "hidden", textOverflow: "ellipsis" }}>
      {msg}
    </div>
  );
}

function AvatarBadge({ user, size = 34 }) {
  const role = ROLES[user.role];
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: role.color + "22", border: `1.5px solid ${role.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: role.color }}>
        {user.avatar}
      </div>
      <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: user.online ? T.green : T.borderMd, border: `2px solid ${T.bg}` }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ROC DATE INPUT（民國年月日選單）
// ═══════════════════════════════════════════════════════
function ROCDateInput({ value, onChange }) {
  const selStyle = {
    flex: 1, background: T.bg, border: `1px solid ${T.borderMd}`,
    borderRadius: 8, color: T.text, padding: "10px 4px",
    fontSize: 14, outline: "none", cursor: "pointer",
  };
  const parts = value ? value.split("-") : ["", "", ""];
  const rocYear = parts[0] ? String(parseInt(parts[0]) - 1911) : "";
  const month   = parts[1] || "";
  const day     = parts[2] || "";

  const emit = (y, m, d) => {
    if (y && m && d) onChange({ target: { value: `${parseInt(y) + 1911}-${m}-${d}` } });
  };

  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
      <select value={rocYear} onChange={e => emit(e.target.value, month, day)} style={selStyle}>
        <option value="">民國年</option>
        {Array.from({ length: 36 }, (_, i) => 95 + i).map(y => (
          <option key={y} value={y}>民國 {y} 年</option>
        ))}
      </select>
      <select value={month} onChange={e => emit(rocYear, e.target.value, day)} style={selStyle}>
        <option value="">月</option>
        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(m => (
          <option key={m} value={m}>{parseInt(m)} 月</option>
        ))}
      </select>
      <select value={day} onChange={e => emit(rocYear, month, e.target.value)} style={selStyle}>
        <option value="">日</option>
        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map(d => (
          <option key={d} value={d}>{parseInt(d)} 日</option>
        ))}
      </select>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  LOGIN SCREEN
// ═══════════════════════════════════════════════════════
function LoginScreen({ users, tenants, onLogin }) {
  // selectedRole: null | "tenant" | "admin" | "superadmin"
  const [selectedRole, setSelectedRole] = useState(null);
  const [phone, setPhone]   = useState("");
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const roleButtons = [
    { key: "tenant",     label: "租客",   icon: "person",  color: "#6b7280", bg: "#f3f4f6" },
    { key: "admin",      label: "管理員", icon: "shield",  color: "#2563eb", bg: "#eff6ff" },
    { key: "superadmin", label: "後台維修", icon: "build", color: "#dc2626", bg: "#fef2f2" },
  ];

  const handleSelectRole = (key) => {
    setSelectedRole(key);
    setErr("");
    setPhone(""); setEmail(""); setPw("");
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (selectedRole === "tenant") {
        // Match by phone against tenants array
        const normalizedInput = phone.replace(/[-\s]/g, "");
        const matched = tenants.find(t => {
          const normalizedTenant = (t.phone || "").replace(/[-\s]/g, "");
          return normalizedTenant === normalizedInput;
        });
        if (!matched) {
          setErr("找不到符合此手機號碼的租客"); setLoading(false); return;
        }
        // Build a synthetic viewer user from the tenant record
        const syntheticUser = {
          id: matched.id,
          name: matched.name,
          email: matched.email || "",
          role: "viewer",
          avatar: matched.name?.[0] || "租",
          online: true,
          lastSeen: null,
          _tenantId: matched.id,
          _roomId: matched.roomId || matched.linkedRoom,
        };
        onLogin(syntheticUser);
      } else {
        // admin or superadmin: email + password
        const u = users.find(u => u.email === email && u.password === pw && u.role === selectedRole);
        if (u) { onLogin(u); }
        else { setErr("帳號或密碼錯誤"); setLoading(false); }
      }
    }, 600);
  };

  const canSubmit = selectedRole === "tenant" ? phone.trim().length >= 8
    : (email.trim().length > 0 && pw.trim().length > 0);

  return (
    <div style={{ minHeight: "100vh", background: T.bgSub, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Noto Sans TC', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: T.accent, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#fff" }}>
            <Icon n="home" s={24} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>家樂美房產管理顧問有限公司</h1>
          <p style={{ color: T.textSub, marginTop: 4, fontSize: 14 }}>多人協作租屋管理平台</p>
        </div>

        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          {/* Input area */}
          {!selectedRole && (
            <div style={{ textAlign: "center", color: T.textSub, fontSize: 15, padding: "24px 0 8px" }}>
              請選擇您的身份以繼續登入
            </div>
          )}

          {selectedRole === "tenant" && (
            <>
              <label style={css.label}>手機號碼</label>
              <input
                style={css.input}
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setErr(""); }}
                placeholder="例：0912-345-678"
                onKeyDown={e => e.key === "Enter" && canSubmit && handleLogin()}
                autoFocus
              />
            </>
          )}

          {(selectedRole === "admin" || selectedRole === "superadmin") && (
            <>
              <label style={css.label}>帳號 Email</label>
              <input
                style={css.input}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErr(""); }}
                placeholder="your@email.com"
                onKeyDown={e => e.key === "Enter" && canSubmit && handleLogin()}
                autoFocus
              />
              <label style={css.label}>密碼</label>
              <input
                style={css.input}
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setErr(""); }}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && canSubmit && handleLogin()}
              />
            </>
          )}

          {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 10 }}>{err}</div>}

          {selectedRole && (
            <button
              onClick={handleLogin}
              disabled={loading || !canSubmit}
              style={{ ...css.btn(), width: "100%", justifyContent: "center", padding: "12px", fontSize: 15, opacity: (loading || !canSubmit) ? 0.55 : 1, marginBottom: 0 }}
            >
              {loading ? "登入中..." : "登入"}
            </button>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: selectedRole ? "20px 0 16px" : "12px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ color: T.textSub, fontSize: 12, whiteSpace: "nowrap" }}>選擇身份</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          {/* Role selector buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            {roleButtons.map(rb => {
              const isActive = selectedRole === rb.key;
              return (
                <button
                  key={rb.key}
                  onClick={() => handleSelectRole(rb.key)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "14px 6px", borderRadius: 12, cursor: "pointer",
                    border: `2px solid ${isActive ? rb.color : T.border}`,
                    background: isActive ? rb.bg : T.bg,
                    color: isActive ? rb.color : T.textSub,
                    fontFamily: "'Noto Sans TC', sans-serif",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    transition: "all 0.15s",
                    outline: "none",
                  }}
                >
                  <Icon n={rb.icon} s={20} />
                  {rb.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════
function Dashboard({ data, currentUser, onUpdate }) {
  const { rooms, tenants, bills, repairs, activityLog, users } = data;

  const handleRenewalDone = (room) => {
    const newEnd = addOneYear(room._endDate);
    const newLeaseStart = room._endDate;
    onUpdate(d => ({
      ...d,
      rooms: d.rooms.map(r => r.id === room.id ? { ...r, contractEnd: newEnd, leaseStart: newLeaseStart } : r),
      activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `確認「${room.communityName || room.name}」續約，合約延至 ${newEnd}`, timestamp: now() }],
    }));
  };
  const totalRooms = rooms.length;
  const rented = rooms.filter(r => r.status === "rented").length;
  const occ = Math.round((rented / totalRooms) * 100);
  const paidRent = bills.filter(b => b.status === "paid" && b.type === "rent").reduce((s, b) => s + b.amount, 0);
  const unpaidRent = bills.filter(b => b.status === "unpaid").reduce((s, b) => s + b.amount, 0);
  const pending = repairs.filter(r => r.status === "pending").length;
  const expiring = tenants.filter(t => daysUntil(t.contractEnd) <= 60 && daysUntil(t.contractEnd) > 0);
  const renewalAlert = rooms
    .filter(r => r.status === "rented")
    .map(r => {
      // 優先使用房源自己的到期日，沒有的話用對應租客的到期日
      const tenant = tenants.find(t => t.id === r.tenantId || t.roomId === r.id);
      const endDate = r.contractEnd || tenant?.contractEnd || "";
      const days = endDate ? daysUntil(endDate) : null;
      return { ...r, _endDate: endDate, _days: days, _tenantName: r.tenantContactName || tenant?.name || "" };
    })
    .filter(r => r._endDate && r._days !== null && r._days <= 45 && r._days > 0);
  const onlineUsers = users.filter(u => u.online && u.id !== currentUser.id);
  const role = ROLES[currentUser.role];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h2 style={{ ...css.sectionTitle, marginBottom: 0 }}>總覽</h2>
          {onlineUsers.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: T.greenBg, border: `1px solid ${T.green}33`, borderRadius: 99, padding: "3px 10px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>{onlineUsers.length} 人在線</span>
            </div>
          )}
        </div>
        <p style={{ color: T.textSub, fontSize: 14, margin: 0 }}>歡迎回來，{currentUser.name} · <span style={{ color: role.color, fontWeight: 600 }}>{role.label}</span></p>
      </div>

      {/* Renewal Alert Banner */}
      {renewalAlert.length > 0 && (
        <div style={{ background: T.redBg, border: `2px solid ${T.red}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.red, letterSpacing: "0.02em" }}>是否確認續約</span>
            <span style={{ marginLeft: "auto", background: T.red, color: "#fff", borderRadius: 99, fontSize: 12, fontWeight: 700, padding: "2px 9px" }}>{renewalAlert.length} 間</span>
          </div>
          {renewalAlert.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid ${T.red}33` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.red }}>{r.communityName || r.name}</div>
                {r._tenantName && <div style={{ fontSize: 12, color: T.red, opacity: 0.8, marginTop: 2 }}>租客：{r._tenantName}</div>}
                <div style={{ fontSize: 11, color: T.red, opacity: 0.7, marginTop: 2 }}>到期：{toROC(r._endDate)}　剩 <strong>{r._days}</strong> 天</div>
              </div>
              <button
                onClick={() => handleRenewalDone(r)}
                style={{ flexShrink: 0, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "7px 13px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                ✅ 續約完畢
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { l: "入住率", v: `${occ}%`, sub: `${rented}/${totalRooms} 間`, c: T.blue },
          { l: "待繳款", v: fmt(unpaidRent), sub: `${bills.filter(b => b.status === "unpaid").length} 筆`, c: T.red, hide: !role.canViewFinance },
          { l: "已收租金", v: fmt(paidRent), sub: "本月", c: T.green, hide: !role.canViewFinance },
          { l: "待處理報修", v: pending, sub: "件", c: T.amber },
        ].filter(s => !s.hide).map((s, i) => (
          <div key={i} style={{ ...css.card }}>
            <div style={{ fontSize: 11, color: T.textSub, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 8 }}>{s.l.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div style={{ ...css.card, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: T.textSub, fontSize: 13, fontWeight: 600 }}>房間入住狀況</span>
          <span style={{ color: T.blue, fontWeight: 700, fontSize: 13 }}>{occ}%</span>
        </div>
        <div style={{ background: T.bgMuted, borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ width: `${occ}%`, height: "100%", background: T.blue, borderRadius: 99 }} />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {rooms.map(r => (
            <div key={r.id} title={r.name} style={{ height: 6, width: 24, borderRadius: 3, background: r.status === "rented" ? T.blue : T.bgMuted, border: `1px solid ${T.border}` }} />
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(expiring.length > 0 || pending > 0) && (
        <div style={{ ...css.card, borderColor: T.amberBg, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: T.amber, fontWeight: 700, marginBottom: 12 }}>⚠ 待辦事項</div>
          {expiring.map(t => (
            <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber, flexShrink: 0 }} />
              <div>
                <div style={{ color: T.text, fontSize: 14 }}>{t.name} 合約即將到期</div>
                <div style={{ color: T.textSub, fontSize: 12 }}>剩 {daysUntil(t.contractEnd)} 天</div>
              </div>
            </div>
          ))}
          {pending > 0 && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", paddingTop: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.red }} />
              <div style={{ color: T.text, fontSize: 14 }}>{pending} 件報修待處理</div>
            </div>
          )}
        </div>
      )}

      {/* Recent activity */}
      <div style={{ ...css.card }}>
        <div style={{ fontSize: 13, color: T.textSub, fontWeight: 700, marginBottom: 12 }}>最近動態</div>
        {[...activityLog].reverse().slice(0, 5).map(log => {
          const u = users.find(u => u.id === log.userId);
          return (
            <div key={log.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              {u ? <AvatarBadge user={u} size={28} /> : <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.bgMuted }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: T.text }}>
                  <span style={{ color: u ? ROLES[u.role].color : T.textSub, fontWeight: 600 }}>{u?.name || "系統"}</span> {log.action}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{toROC(log.timestamp, true)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════════════════
function UserManagement({ data, currentUser, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "viewer" });

  const save = () => {
    if (!form.name || !form.email) return;
    onUpdate(d => {
      const newUser = { id: uid(), ...form, avatar: form.name[0], online: false, lastSeen: null };
      const users = editUser ? d.users.map(u => u.id === editUser.id ? { ...u, ...form } : u) : [...d.users, newUser];
      return { ...d, users, activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `${editUser ? "修改" : "新增"}使用者 ${form.name}`, timestamp: now() }] };
    });
    setShowAdd(false); setEditUser(null); setForm({ name: "", email: "", password: "", role: "viewer" });
  };

  const [confirmDelete, setConfirmDelete] = useState(null);

  const changeRole = (u, role) => {
    onUpdate(d => ({ ...d, users: d.users.map(x => x.id === u.id ? { ...x, role } : x), activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `變更 ${u.name} 權限為 ${ROLES[role].label}`, timestamp: now() }] }));
  };

  const deleteUser = (u) => {
    onUpdate(d => ({
      ...d,
      users: d.users.filter(x => x.id !== u.id),
      activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `刪除使用者 ${u.name}（${ROLES[u.role].label}）`, timestamp: now() }],
    }));
    setConfirmDelete(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={css.sectionTitle}>人員管理</h2>
        <button onClick={() => setShowAdd(true)} style={css.btn()}><Icon n="plus" s={13} /> 新增人員</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.users.map(u => (
          <div key={u.id} style={{ ...css.card, display: "flex", alignItems: "center", gap: 12 }}>
            <AvatarBadge user={u} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 600, color: T.text, fontSize: 14 }}>{u.name}</span>
                {u.id === currentUser.id && <span style={css.tag(T.blue)}>我</span>}
              </div>
              <div style={{ fontSize: 13, color: T.textSub, marginTop: 2 }}>{u.email}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={css.tag(ROLES[u.role].color)}>{ROLES[u.role].label}</span>
              {u.id !== currentUser.id && (
                <>
                  <select value={u.role} onChange={e => changeRole(u, e.target.value)}
                    style={{ background: T.bg, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 13, cursor: "pointer" }}>
                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => setConfirmDelete(u)}
                    style={{ background: T.redBg, color: T.red, border: `1px solid ${T.red}33`, borderRadius: 6, padding: "4px 10px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon n="trash" s={12} /> 刪除
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <Modal title="確認刪除使用者" onClose={() => setConfirmDelete(null)} width={360}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.redBg, border: `2px solid ${T.red}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: T.red }}>
              <Icon n="trash" s={22} />
            </div>
            <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>刪除「{confirmDelete.name}」？</div>
            <div style={{ color: T.textSub, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>此操作無法復原，帳號將被永久移除。</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>取消</button>
              <button onClick={() => deleteUser(confirmDelete)} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>確認刪除</button>
            </div>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="新增人員" onClose={() => setShowAdd(false)}>
          {[["name", "姓名"], ["email", "Email"], ["password", "密碼"]].map(([k, l]) => (
            <div key={k}><label style={css.label}>{l}</label><input style={css.input} type={k === "password" ? "password" : "text"} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
          ))}
          <label style={css.label}>權限角色</label>
          <select style={css.input} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={save} style={{ ...css.btn(), width: "100%", justifyContent: "center", padding: 11 }}>確認新增</button>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ROOMS TAB
// ═══════════════════════════════════════════════════════
const todayStr = () => new Date().toISOString().slice(0, 10);
const addOneYear = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};
const getEmptyRoomForm = () => {
  const today = todayStr();
  return {
    communityName: "", address: "", rentDay: "5", rent: "",
    leaseStart: today,
    contractEnd: addOneYear(today),
    renewals: [],   // [{ renewStart, renewEnd }, ...]
    contractPhoto: "", ownerBankPhoto: "", ownerName: "", salesRep: "",
    tenantContactName: "", tenantContactPhone: "", cohabitants: [],
    autoRentRemind: false,
  };
};

function Rooms({ data, currentUser, onUpdate }) {
  const { rooms, tenants, bills } = data;
  const role = ROLES[currentUser.role];
  const isSuperAdmin = currentUser.role === "superadmin";

  // ── Rent-due helpers ────────────────────────────────────
  const thisMonthStr = () => new Date().toISOString().slice(0, 7);
  const todayDay = new Date().getDate();

  const isRentDue = (room) => {
    if (room.status !== "rented") return false;
    const rentDay = parseInt(room.rentDay || "5");
    if (todayDay < rentDay) return false;
    return !(bills || []).some(b =>
      b.roomId === room.id &&
      b.month === thisMonthStr() &&
      b.status === "paid"
    );
  };

  const markRentPaid = (room) => {
    const month = thisMonthStr();
    const mainTenant =
      tenants.find(t => t.linkedRoom === room.id && !t.isCohabitant) ||
      tenants.find(t => t.roomId === room.id && !t.isCohabitant) ||
      tenants.find(t => t.roomId === room.id);
    onUpdate(d => {
      const existing = d.bills.find(b => b.roomId === room.id && b.month === month);
      const newBills = existing
        ? d.bills.map(b => b.id === existing.id
            ? { ...b, status: "paid", paidDate: todayStr(), recordedBy: currentUser.id }
            : b)
        : [...d.bills, {
            id: uid(),
            tenantId: mainTenant?.id || room.tenantId || "",
            roomId: room.id,
            type: "rent",
            amount: room.rent,
            month,
            status: "paid",
            paidDate: todayStr(),
            recordedBy: currentUser.id,
          }];
      return {
        ...d,
        bills: newBills,
        activityLog: [...d.activityLog, {
          id: uid(), userId: currentUser.id,
          action: `標記「${room.communityName || room.name}」${month} 月租金已繳`,
          timestamp: now(),
        }],
      };
    });
  };
  const [showAdd, setShowAdd] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [showRenewSection, setShowRenewSection] = useState(false);
  const [confirmDelete, setConfirmDeleteRoom] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [form, setForm] = useState(getEmptyRoomForm);
  const fileRef = useRef(null);
  const bankPhotoRef = useRef(null);
  const [openChat, setOpenChat] = useState(null);
  const [chatInputs, setChatInputs] = useState({});
  const [editingTpl, setEditingTpl] = useState(false);
  const [tplDraft, setTplDraft]     = useState(null);
  const isViewer = currentUser.role === "viewer";
  const viewerRoomId = isViewer ? (currentUser._roomId || "") : "";

  // 預設全部折疊；租客模式自動展開自己的房間
  const [expandedRooms, setExpandedRooms] = useState(() => {
    const s = new Set();
    if (isViewer && viewerRoomId) s.add(viewerRoomId);
    return s;
  });

  const toggleExpand = (id) =>
    setExpandedRooms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, contractPhoto: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleMeterPhoto = (key) => (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, [key]: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const openAdd = () => { setForm(getEmptyRoomForm()); setEditRoom(null); setShowAdd(true); setShowRenewSection(false); };
  const openEdit = (room) => {
    const renewals = (room.renewals || []).map(r => ({ renewStart: r.renewStart || "", renewEnd: r.renewEnd || "" }));
    setForm({
      communityName: room.communityName || "", address: room.address || "", rentDay: room.rentDay || "5",
      rent: room.rent || "", leaseStart: room.leaseStart || "", contractEnd: room.contractEnd || "",
      renewals,
      contractPhoto: room.contractPhoto || "", ownerBankPhoto: room.ownerBankPhoto || "",
      ownerName: room.ownerName || "", salesRep: room.salesRep || "",
      tenantContactName: room.tenantContactName || "", tenantContactPhone: room.tenantContactPhone || "",
      cohabitants: (room.cohabitants || []).map(c => ({ name: c.name || "", phone: c.phone || "" })),
      autoRentRemind: room.autoRentRemind || false,
    });
    setShowRenewSection(renewals.length > 0);
    setEditRoom(room); setShowAdd(true);
  };

  const saveRoom = () => {
    if (!form.communityName || !form.rent) return;
    const targetRoomId = editRoom ? editRoom.id : uid();
    onUpdate(d => {
      // 更新房源列表
      let rooms;
      if (editRoom) {
        rooms = d.rooms.map(r => r.id === editRoom.id ? { ...r, ...form, rent: parseInt(form.rent) } : r);
      } else {
        const newRoom = { id: targetRoomId, status: "vacant", tenantId: null, propId: "p1", ...form, rent: parseInt(form.rent) };
        rooms = [...d.rooms, newRoom];
      }
      // 連動房客管理：先移除此房源的舊連結租客（主租客＋同住人），再重新建立
      let tenants = d.tenants.filter(t => t.linkedRoom !== targetRoomId);
      let mainId = null;
      if (form.tenantContactName) {
        const existingMain = d.tenants.find(t => t.linkedRoom === targetRoomId && !t.isCohabitant);
        mainId = existingMain ? existingMain.id : uid();
        // 主租客記錄
        tenants = [...tenants, {
          id: mainId,
          name: form.tenantContactName,
          phone: form.tenantContactPhone || "",
          email: existingMain?.email || "",
          roomId: targetRoomId,
          moveIn: existingMain?.moveIn || "",
          contractEnd: form.contractEnd || "",
          deposit: existingMain?.deposit || 0,
          linkedRoom: targetRoomId,
          isCohabitant: false,
        }];
        // 同步 room.tenantId
        rooms = rooms.map(r => r.id === targetRoomId ? { ...r, status: "rented", tenantId: mainId } : r);
        // 各同住人獨立記錄
        (form.cohabitants || []).forEach((c, i) => {
          if (c.name) {
            const existingC = d.tenants.find(t => t.linkedRoom === targetRoomId && t.isCohabitant && t.cohabitantIndex === i);
            tenants = [...tenants, {
              id: existingC ? existingC.id : uid(),
              name: c.name,
              phone: c.phone || "",
              email: existingC?.email || "",
              roomId: targetRoomId,
              moveIn: existingMain?.moveIn || "",
              contractEnd: form.contractEnd || "",
              deposit: 0,
              linkedRoom: targetRoomId,
              isCohabitant: true,
              cohabitantIndex: i,
            }];
          }
        });
      } else {
        // 沒有主租客就維持空房
        rooms = rooms.map(r => r.id === targetRoomId ? { ...r, status: "vacant", tenantId: null } : r);
      }

      // 新增房源時自動產生本月帳單（若尚未存在）
      let bills = d.bills;
      if (!editRoom && mainId) {
        const month = new Date().toISOString().slice(0, 7);
        const exists = bills.find(b => b.roomId === targetRoomId && b.month === month);
        if (!exists) {
          bills = [...bills, {
            id: uid(),
            tenantId: mainId,
            roomId: targetRoomId,
            type: "rent",
            amount: parseInt(form.rent),
            month,
            status: "unpaid",
            paidDate: null,
            recordedBy: null,
          }];
        }
      }

      return {
        ...d,
        rooms,
        tenants,
        bills,
        activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `${editRoom ? "編輯" : "新增"}房源「${form.communityName}」`, timestamp: now() }],
      };
    });
    setShowAdd(false); setEditRoom(null);
  };

  const deleteRoom = (room) => {
    onUpdate(d => ({
      ...d,
      rooms: d.rooms.filter(r => r.id !== room.id),
      // 連動刪除此房源的連結租客
      tenants: d.tenants.filter(t => t.linkedRoom !== room.id),
      activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `刪除房源「${room.communityName || room.name}」`, timestamp: now() }],
    }));
    setConfirmDeleteRoom(null);
  };

  const sendMessage = (roomId) => {
    const text = (chatInputs[roomId] || "").trim(); if (!text) return;
    const msg = { id: uid(), userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, text, timestamp: now() };
    onUpdate(d => ({ ...d, rooms: d.rooms.map(r => r.id === roomId ? { ...r, messages: [...(r.messages || []), msg] } : r) }));
    setChatInputs(c => ({ ...c, [roomId]: "" }));
  };

  // Full-page chat view
  if (openChat) {
    const room = rooms.find(r => r.id === openChat);
    if (!room) { setOpenChat(null); return null; }
    const messages  = room.messages || [];
    const chatText  = chatInputs[openChat] || "";
    const templates = data.chatTemplates || ["", "", "", ""];
    // tplDraft 初始化：若尚未設定則使用目前 templates
    const activeTplDraft = tplDraft ?? templates;

    const doSend = (textOverride) => {
      const text = (textOverride ?? chatText).trim(); if (!text) return;
      const msg = { id: uid(), userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, text, timestamp: now() };
      onUpdate(d => ({ ...d, rooms: d.rooms.map(r => r.id === openChat ? { ...r, messages: [...(r.messages || []), msg] } : r) }));
      if (!textOverride) setChatInputs(c => ({ ...c, [openChat]: "" }));
    };

    const saveTpl = () => {
      onUpdate(d => ({ ...d, chatTemplates: activeTplDraft }));
      setEditingTpl(false);
      setTplDraft(null);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 0 12px", borderBottom: `1px solid ${T.border}`, marginBottom: 12, flexShrink: 0 }}>
          <button onClick={() => setOpenChat(null)} style={{ background: T.bgMuted, border: "none", borderRadius: 7, color: T.textSub, padding: "6px 12px", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>‹ 返回</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: T.text, fontSize: 15 }}>{room.communityName || room.name}</div>
            {room.address && <div style={{ fontSize: 13, color: T.textSub, marginTop: 1 }}>📍 {room.address}</div>}
          </div>
          <span style={{ fontSize: 13, color: T.textSub }}>{messages.length} 則訊息</span>
        </div>

        {/* Message list */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: T.textSub, gap: 8 }}>
              <div style={{ fontSize: 32 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>尚無對話</div>
            </div>
          ) : messages.map((msg, i) => {
            const isSystem = msg.isSystem;
            const isMe     = !isSystem && msg.userId === currentUser.id;
            const msgRole  = ROLES[msg.userRole];
            const showDate = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[i - 1].timestamp).toDateString();
            return (
              <div key={msg.id}>
                {showDate && (
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span style={{ background: T.bgMuted, color: T.textSub, fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 99 }}>
                      {(() => { const d = new Date(msg.timestamp); return `${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日`; })()}
                    </span>
                  </div>
                )}
                {/* 系統自動提醒訊息 */}
                {isSystem ? (
                  <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
                    <div style={{ background: T.amberBg, border: `1px solid ${T.amber}44`, borderRadius: 10, padding: "10px 14px", maxWidth: "88%", fontSize: 13, color: T.text, lineHeight: 1.6 }}>
                      <div style={{ fontSize: 11, color: T.amber, fontWeight: 700, marginBottom: 4, letterSpacing: "0.06em" }}>🔔 系統自動提醒</div>
                      {msg.text}
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{new Date(msg.timestamp).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: (msgRole?.color || T.textSub) + "22", border: `1px solid ${(msgRole?.color || T.textSub)}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: msgRole?.color || T.textSub, flexShrink: 0 }}>
                      {msg.userName?.[0] || "?"}
                    </div>
                    <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 3 }}>
                      <div style={{ fontSize: 12, color: T.textSub, display: "flex", gap: 5, alignItems: "center" }}>
                        {!isMe && <span style={{ color: msgRole?.color, fontWeight: 600 }}>{msg.userName}</span>}
                        <span>{new Date(msg.timestamp).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div style={{ background: isMe ? T.accent : T.bgMuted, color: isMe ? "#fff" : T.text, border: isMe ? "none" : `1px solid ${T.border}`, borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "9px 14px", fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── 快速範本區 ── */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: "0.06em" }}>⚡ 快速範本</span>
            {role.canEdit && (
              editingTpl
                ? <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={saveTpl} style={{ background: T.green, color: "#fff", border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>儲存</button>
                    <button onClick={() => { setTplDraft(null); setEditingTpl(false); }} style={{ background: T.bgMuted, color: T.textSub, border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer" }}>取消</button>
                  </div>
                : <button onClick={() => { setTplDraft([...templates]); setEditingTpl(true); }} style={{ background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer" }}>✎ 編輯範本</button>
            )}
          </div>
          {editingTpl ? (
            /* 編輯模式：顯示 4 個輸入框 */
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
              {activeTplDraft.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: T.textMuted, width: 18, flexShrink: 0, textAlign: "right" }}>{i + 1}.</span>
                  <input
                    style={{ flex: 1, background: T.bg, border: `1px solid ${T.borderMd}`, borderRadius: 7, color: T.text, padding: "7px 10px", fontSize: 13, outline: "none" }}
                    value={t}
                    placeholder={`範本 ${i + 1}`}
                    onChange={e => setTplDraft(prev => (prev ?? templates).map((v, j) => j === i ? e.target.value : v))}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* 一般模式：橫向捲動按鈕列 */
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 8 }}>
              {templates.map((t, i) => t.trim() ? (
                <button key={i}
                  onClick={() => doSend(t)}
                  style={{ flexShrink: 0, maxWidth: 200, background: T.bgSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: T.text, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}
                  title={t}
                >
                  {t.length > 22 ? t.slice(0, 22) + "…" : t}
                </button>
              ) : null)}
            </div>
          )}
        </div>

        {/* 輸入列 */}
        <div style={{ display: "flex", gap: 8, paddingTop: 6, flexShrink: 0 }}>
          <input style={{ flex: 1, background: T.bgMuted, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "10px 14px", fontSize: 14, outline: "none" }}
            placeholder="輸入訊息…" value={chatText}
            onChange={e => setChatInputs(c => ({ ...c, [openChat]: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && doSend()} />
          <button onClick={() => doSend()} style={{ background: chatText.trim() ? T.accent : T.bgMuted, color: chatText.trim() ? "#fff" : T.textSub, border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>送出</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={css.sectionTitle}>房源管理</h2>
        {isSuperAdmin && <button onClick={openAdd} style={css.btn()}><Icon n="plus" s={13} /> 新增房源</button>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rooms
          .filter(room => {
            if (currentUser.role === "superadmin" || currentUser.role === "admin" || currentUser.role === "staff") return true;
            // 租客：只顯示自己的房間（以 _roomId 精準比對）
            return room.id === viewerRoomId;
          })
          .sort((a, b) => (isRentDue(a) ? 0 : 1) - (isRentDue(b) ? 0 : 1))
          .map(room => {
            const daysLeft   = room.contractEnd ? daysUntil(room.contractEnd) : null;
            const nearExpiry = daysLeft !== null && daysLeft <= 60 && daysLeft > 0;
            const rentDue    = isRentDue(room);
            const isExpanded = expandedRooms.has(room.id);
            const canSeeContacts = currentUser.role === "superadmin" || currentUser.role === "admin";

            // 折疊橫幅底色
            const bannerBg = rentDue ? T.redBg : (nearExpiry ? T.amberBg : T.bg);
            const borderColor = rentDue ? T.red : (nearExpiry ? T.amber + "99" : T.border);

            return (
              <div key={room.id} style={{ borderRadius: 12, border: `${rentDue ? 2 : 1}px solid ${borderColor}`, overflow: "hidden", background: T.bg, boxShadow: isExpanded ? "0 2px 12px rgba(0,0,0,0.06)" : "none" }}>

                {/* ── 折疊橫幅（點擊展開/收合） ── */}
                <div
                  onClick={() => toggleExpand(room.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer", background: bannerBg, userSelect: "none" }}
                >
                  {/* 狀態指示圓點 */}
                  <div style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0, background: rentDue ? T.red : (room.status === "rented" ? T.green : T.amber) }} />

                  {/* 房源名稱 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {room.communityName || room.name}
                    </div>
                    {/* 折疊狀態下的摘要 */}
                    {!isExpanded && (
                      <div style={{ fontSize: 12, color: T.textSub, marginTop: 1, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {room.rent && <span>{fmt(room.rent)}/月</span>}
                        {room.tenantContactName && <span>· {room.tenantContactName}</span>}
                        {rentDue && <span style={{ color: T.red, fontWeight: 700 }}>· ⚠️ 待繳租</span>}
                        {nearExpiry && !rentDue && <span style={{ color: T.amber, fontWeight: 700 }}>· 即將到期</span>}
                      </div>
                    )}
                  </div>

                  {/* 右側：已繳租完畢按鈕（待繳租時顯示）+ 狀態標籤 + 箭頭 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {rentDue && role.canEdit && (
                      <button
                        onClick={e => { e.stopPropagation(); markRentPaid(room); }}
                        style={{ background: T.green, color: "#fff", border: "none", borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        已繳租完畢
                      </button>
                    )}
                    <span style={css.tag(room.status === "rented" ? T.green : T.amber)}>{statusLabel[room.status]}</span>
                    <span style={{ color: T.textMuted, fontSize: 11, display: "inline-block", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                  </div>
                </div>

                {/* ── 展開內容 ── */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 16px" }}>

                    {/* 待繳租警告橫幅 */}
                    {rentDue && (
                      <div style={{ background: T.redBg, border: `1px solid ${T.red}55`, borderRadius: 8, padding: "10px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ color: T.red, fontWeight: 700, fontSize: 13 }}>
                          ⚠️ 本月租金待繳（每月 {room.rentDay} 號繳租）
                        </div>
                        {role.canEdit && (
                          <button onClick={e => { e.stopPropagation(); markRentPaid(room); }}
                            style={{ background: T.green, color: "#fff", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                            已繳租完畢
                          </button>
                        )}
                      </div>
                    )}

                    {/* 房源基本資訊 */}
                    <div style={{ marginBottom: 10 }}>
                      {room.address && <div style={{ fontSize: 13, color: T.textSub, marginBottom: 4 }}>📍 {room.address}</div>}
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {room.ownerName && <span style={{ fontSize: 13, color: T.textSub }}>屋主：<strong style={{ color: T.text }}>{room.ownerName}</strong></span>}
                        {room.salesRep && <span style={{ fontSize: 13, color: T.textSub }}>業務：<strong style={{ color: T.blue }}>{room.salesRep}</strong></span>}
                      </div>
                    </div>

                    {/* 租客聯絡資訊 */}
                    {canSeeContacts && (room.tenantContactName || (room.cohabitants && room.cohabitants.length > 0)) && (
                      <div style={{ background: T.bgSub, borderRadius: 8, padding: "10px 12px", marginBottom: 10, border: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 12, color: T.textSub, fontWeight: 700, marginBottom: 8, letterSpacing: "0.06em" }}>👥 租客聯絡資訊</div>
                        {room.tenantContactName && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: room.cohabitants?.length > 0 ? 8 : 0, paddingBottom: room.cohabitants?.length > 0 ? 8 : 0, borderBottom: room.cohabitants?.length > 0 ? `1px solid ${T.border}` : "none" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{room.tenantContactName}</span>
                                <span style={css.tag(T.blue)}>主租客</span>
                              </div>
                              {room.tenantContactPhone && <div style={{ fontSize: 13, color: T.textSub, marginTop: 2 }}>📞 {room.tenantContactPhone}</div>}
                            </div>
                            {room.tenantContactPhone && (
                              <a href={`tel:${room.tenantContactPhone}`} style={{ background: T.greenBg, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 7, padding: "5px 10px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>📞</a>
                            )}
                          </div>
                        )}
                        {room.cohabitants?.map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: i > 0 ? 6 : 0 }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: T.textSub }}>{c.name} <span style={css.tag(T.textMuted)}>同住人</span></div>
                              {c.phone && <div style={{ fontSize: 12, color: T.textSub, marginTop: 1 }}>📞 {c.phone}</div>}
                            </div>
                            {c.phone && <a href={`tel:${c.phone}`} style={{ background: T.greenBg, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 7, padding: "4px 9px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>📞</a>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 資訊格 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      {[
                        ["月租金", fmt(room.rent)],
                        ["繳租日", room.rentDay ? `每月 ${room.rentDay} 號` : "—"],
                        ["起租日", toROC(room.leaseStart)],
                        ["合約到期", toROC(room.contractEnd)],
                        ["剩餘天數", daysLeft !== null ? `${daysLeft} 天` : "—"],
                      ].map(([k, v]) => (
                        <div key={k} style={{ background: T.bgSub, borderRadius: 7, padding: "8px 10px", border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>{k}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* 續約資料顯示 */}
                    {(room.renewals || []).length > 0 && (
                      <div style={{ marginBottom: 10, background: T.accentBg, border: `1px solid ${T.accent}33`, borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>🔄 續約記錄</div>
                        {(room.renewals || []).map((rv, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < room.renewals.length - 1 ? 8 : 0, flexWrap: "wrap" }}>
                            <div style={{ background: T.bg, borderRadius: 6, padding: "6px 10px", border: `1px solid ${T.border}`, flex: 1 }}>
                              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginBottom: 1 }}>第 {i+1} 次 · 起租</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{toROC(rv.renewStart) || "—"}</div>
                            </div>
                            <div style={{ background: T.bg, borderRadius: 6, padding: "6px 10px", border: `1px solid ${T.border}`, flex: 1 }}>
                              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginBottom: 1 }}>第 {i+1} 次 · 到期</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{toROC(rv.renewEnd) || "—"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 照片按鈕 */}
                    {(room.contractPhoto || (isSuperAdmin && room.ownerBankPhoto)) && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        {room.contractPhoto && (
                          <button onClick={() => setViewPhoto(room.contractPhoto)} style={{ flex: 1, background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px", fontSize: 13, cursor: "pointer" }}>📄 租約照片</button>
                        )}
                        {isSuperAdmin && room.ownerBankPhoto && (
                          <button onClick={() => setViewPhoto(room.ownerBankPhoto)} style={{ flex: 1, background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px", fontSize: 13, cursor: "pointer" }}>🏦 匯款帳號</button>
                        )}
                      </div>
                    )}

                    {/* 操作按鈕 */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setOpenChat(room.id)} style={{ flex: 1, ...css.btn(T.blue, true), justifyContent: "center", fontSize: 13 }}>
                        💬 {(room.messages || []).length > 0 ? `對話 (${room.messages.length})` : "對話室"}
                      </button>
                      {role.canEdit && (
                        <button onClick={() => openEdit(room)} style={{ ...css.btn(T.textSub, true), fontSize: 13 }}><Icon n="edit" s={13} /></button>
                      )}
                      {role.canDelete && (
                        <button onClick={() => setConfirmDeleteRoom(room)} style={{ ...css.btn(T.red, true), fontSize: 13 }}><Icon n="trash" s={13} /></button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Photo viewer */}
      {viewPhoto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setViewPhoto(null)}>
          <img src={viewPhoto} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, objectFit: "contain" }} alt="photo" />
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal title="確認刪除房源" onClose={() => setConfirmDeleteRoom(null)} width={360}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>刪除「{confirmDelete.communityName || confirmDelete.name}」？</div>
            <div style={{ color: T.textSub, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>此操作無法復原。</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDeleteRoom(null)} style={{ flex: 1, background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>取消</button>
              <button onClick={() => deleteRoom(confirmDelete)} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>確認刪除</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit modal */}
      {showAdd && (
        <Modal title={editRoom ? `編輯「${editRoom.communityName || editRoom.name}」` : "新增房源"} onClose={() => { setShowAdd(false); setEditRoom(null); }}>
          <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginBottom: 10, letterSpacing: "0.06em" }}>基本資訊</div>
          {[["communityName", "社區名稱 *"], ["ownerName", "屋主名字"], ["salesRep", "開發業務"], ["address", "地址"]].map(([k, l]) => (
            <div key={k}><label style={css.label}>{l}</label><input style={css.input} value={form[k]} onChange={set(k)} /></div>
          ))}
          <label style={css.label}>繳租日期</label>
          <select style={css.input} value={form.rentDay} onChange={set("rentDay")}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d} 號</option>)}
          </select>
          {/* 自動提醒繳租 */}
          <div
            onClick={() => setForm(f => ({ ...f, autoRentRemind: !f.autoRentRemind }))}
            style={{ display: "flex", alignItems: "center", gap: 10, background: form.autoRentRemind ? T.accentBg : T.bgSub, border: `1px solid ${form.autoRentRemind ? T.accent : T.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, cursor: "pointer", userSelect: "none" }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${form.autoRentRemind ? T.accent : T.borderMd}`, background: form.autoRentRemind ? T.accent : T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              {form.autoRentRemind && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: form.autoRentRemind ? T.accent : T.text }}>自動提醒繳租</div>
              <div style={{ fontSize: 12, color: T.textSub, marginTop: 1 }}>勾選後，每月繳租日當天自動在對話室發送提醒訊息</div>
            </div>
          </div>
          <label style={css.label}>月租金 *</label>
          <input style={css.input} type="text" value={form.rent} onChange={set("rent")} />
          <label style={css.label}>起租日</label>
          <ROCDateInput value={form.leaseStart}
            onChange={e => setForm(f => ({ ...f, leaseStart: e.target.value, contractEnd: addOneYear(e.target.value) }))} />
          <label style={css.label}>租約到期日</label>
          <ROCDateInput value={form.contractEnd} onChange={e => setForm(f => ({ ...f, contractEnd: e.target.value }))} />

          {/* ── 折疊式續約資料區塊 ── */}
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 9, marginBottom: 14, overflow: "hidden" }}>
            {/* 標頭（點擊展開/收合） */}
            <div
              onClick={() => setShowRenewSection(v => !v)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", cursor: "pointer", background: showRenewSection ? T.accentBg : T.bgMuted, userSelect: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: showRenewSection ? T.accent : T.text }}>🔄 續約資料</span>
                {(form.renewals || []).length > 0 && (
                  <span style={{ background: T.accent, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "1px 7px" }}>
                    {form.renewals.length} 筆
                  </span>
                )}
              </div>
              <span style={{ color: T.textMuted, fontSize: 11, display: "inline-block", transition: "transform 0.2s", transform: showRenewSection ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </div>

            {/* 展開內容 */}
            {showRenewSection && (
              <div style={{ padding: "12px 13px", background: T.bg, borderTop: `1px solid ${T.border}` }}>
                {(form.renewals || []).length === 0 ? (
                  <div style={{ textAlign: "center", color: T.textMuted, fontSize: 13, padding: "10px 0 8px" }}>尚無續約記錄，點下方按鈕新增第一次續約</div>
                ) : (
                  (form.renewals || []).map((rv, i) => (
                    <div key={i} style={{ background: T.bgSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>第 {i + 1} 次續約</span>
                        <button
                          onClick={() => setForm(f => ({ ...f, renewals: f.renewals.filter((_, idx) => idx !== i) }))}
                          style={{ background: T.redBg, color: T.red, border: "none", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          刪除
                        </button>
                      </div>
                      <label style={css.label}>續約起租日</label>
                      <ROCDateInput
                        value={rv.renewStart}
                        onChange={e => setForm(f => ({
                          ...f,
                          renewals: f.renewals.map((r, idx) => idx === i
                            ? { renewStart: e.target.value, renewEnd: addOneYear(e.target.value) }
                            : r)
                        }))}
                      />
                      <label style={css.label}>續約到期日</label>
                      <ROCDateInput
                        value={rv.renewEnd}
                        onChange={e => setForm(f => ({
                          ...f,
                          renewals: f.renewals.map((r, idx) => idx === i ? { ...r, renewEnd: e.target.value } : r)
                        }))}
                      />
                    </div>
                  ))
                )}
                {/* 新增下一年度續約按鈕 */}
                <button
                  onClick={() => {
                    const prevEnd = (form.renewals || []).length > 0
                      ? form.renewals[form.renewals.length - 1].renewEnd
                      : form.contractEnd;
                    const newStart = prevEnd || todayStr();
                    setForm(f => ({ ...f, renewals: [...(f.renewals || []), { renewStart: newStart, renewEnd: addOneYear(newStart) }] }));
                  }}
                  style={{ ...css.btn(T.accent, true), width: "100%", justifyContent: "center", fontSize: 13, marginTop: 4 }}>
                  <Icon n="plus" s={13} /> {(form.renewals || []).length === 0 ? "新增第一次續約" : "新增下一年度續約"}
                </button>
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginBottom: 10, marginTop: 4, letterSpacing: "0.06em" }}>租客聯絡</div>
          {[["tenantContactName", "主租客姓名"], ["tenantContactPhone", "主租客電話"]].map(([k, l]) => (
            <div key={k}><label style={css.label}>{l}</label><input style={css.input} value={form[k]} onChange={set(k)} /></div>
          ))}
          {/* 同住人列表 */}
          {(form.cohabitants || []).map((c, i) => (
            <div key={i} style={{ background: T.bgSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: T.textSub, fontWeight: 700 }}>同住人 {i + 1}</span>
                <button
                  onClick={() => setForm(f => ({ ...f, cohabitants: f.cohabitants.filter((_, idx) => idx !== i) }))}
                  style={{ background: T.redBg, color: T.red, border: "none", borderRadius: 5, padding: "3px 9px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  刪除
                </button>
              </div>
              <label style={css.label}>姓名</label>
              <input style={css.input} value={c.name} placeholder="同住人姓名"
                onChange={e => setForm(f => ({ ...f, cohabitants: f.cohabitants.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x) }))} />
              <label style={css.label}>電話</label>
              <input style={{ ...css.input, marginBottom: 0 }} value={c.phone} placeholder="同住人電話"
                onChange={e => setForm(f => ({ ...f, cohabitants: f.cohabitants.map((x, idx) => idx === i ? { ...x, phone: e.target.value } : x) }))} />
            </div>
          ))}
          <button
            onClick={() => setForm(f => ({ ...f, cohabitants: [...(f.cohabitants || []), { name: "", phone: "" }] }))}
            style={{ ...css.btn(T.textSub, true), width: "100%", justifyContent: "center", marginBottom: 12 }}>
            <Icon n="plus" s={13} /> 新增同住人
          </button>
          <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginBottom: 10, marginTop: 4, letterSpacing: "0.06em" }}>照片</div>
          <div style={{ marginBottom: 10 }}>
            <label style={css.label}>租約照片</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} style={{ ...css.btn(T.textSub, true), width: "100%", justifyContent: "center", marginBottom: 4 }}>
              {form.contractPhoto ? "✅ 已上傳（點擊更換）" : "選擇照片"}
            </button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={css.label}>屋主匯款帳號（僅超級管理員可見）</label>
            <input ref={bankPhotoRef} type="file" accept="image/*" onChange={handleMeterPhoto("ownerBankPhoto")} style={{ display: "none" }} />
            <button onClick={() => bankPhotoRef.current?.click()} style={{ ...css.btn(T.textSub, true), width: "100%", justifyContent: "center" }}>
              {form.ownerBankPhoto ? "✅ 已上傳（點擊更換）" : "選擇照片"}
            </button>
          </div>
          <button onClick={saveRoom} style={{ ...css.btn(), width: "100%", justifyContent: "center", padding: 11, marginTop: 4 }}>
            {editRoom ? "儲存修改" : "確認新增"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TENANTS TAB
// ═══════════════════════════════════════════════════════
function Tenants({ data, currentUser, onUpdate }) {
  const { tenants, rooms } = data;
  const isSuperAdmin = currentUser.role === "superadmin";
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [confirmDelete, setConfirmDeleteTenant] = useState(null);
  const EMPTY = { name: "", phone: "", email: "", idNo: "", roomId: "", moveIn: "", contractEnd: "", deposit: "", emergencyName: "", emergencyPhone: "", note: "" };
  const [form, setForm] = useState(EMPTY);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd = () => { setForm(EMPTY); setEditTenant(null); setShowForm(true); };
  const openEdit = (t) => { setForm({ ...EMPTY, ...t, deposit: String(t.deposit || "") }); setEditTenant(t); setShowForm(true); };

  const saveTenant = () => {
    if (!form.name) return;
    if (editTenant) {
      onUpdate(d => ({ ...d, tenants: d.tenants.map(t => t.id === editTenant.id ? { ...t, ...form, deposit: parseInt(form.deposit) || 0 } : t), rooms: d.rooms.map(r => { if (r.id === editTenant.roomId && r.id !== form.roomId) return { ...r, status: "vacant", tenantId: null }; if (r.id === form.roomId) return { ...r, status: "rented", tenantId: editTenant.id }; return r; }), activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `修改房客「${form.name}」資料`, timestamp: now() }] }));
    } else {
      const nid = uid();
      onUpdate(d => ({ ...d, tenants: [...d.tenants, { id: nid, ...form, deposit: parseInt(form.deposit) || 0 }], rooms: d.rooms.map(r => r.id === form.roomId ? { ...r, status: "rented", tenantId: nid } : r), activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `新增房客「${form.name}」`, timestamp: now() }] }));
    }
    setShowForm(false); setEditTenant(null);
  };

  const deleteTenant = (t) => {
    onUpdate(d => ({ ...d, tenants: d.tenants.filter(x => x.id !== t.id), rooms: d.rooms.map(r => r.id === t.roomId ? { ...r, status: "vacant", tenantId: null } : r), activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `刪除房客「${t.name}」`, timestamp: now() }] }));
    setConfirmDeleteTenant(null); setSelected(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={css.sectionTitle}>房客管理</h2>
        {isSuperAdmin && <button onClick={openAdd} style={css.btn()}><Icon n="plus" s={13} /> 新增房客</button>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tenants.map(t => {
          const room = rooms.find(r => r.id === t.roomId);
          const days = t.contractEnd ? daysUntil(t.contractEnd) : null;
          const nearExpiry = days !== null && days <= 60 && days > 0;
          const isOpen = selected === t.id;
          return (
            <div key={t.id} style={{ ...css.card, borderColor: nearExpiry ? T.amber + "66" : T.border }}>
              <div onClick={() => setSelected(isOpen ? null : t.id)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.isCohabitant ? T.bgMuted : T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: t.isCohabitant ? T.textSub : T.accent, flexShrink: 0 }}>{t.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{t.name}</span>
                    {t.isCohabitant && <span style={css.tag(T.textMuted)}>同住人</span>}
                  </div>
                  <div style={{ fontSize: 13, color: T.textSub, marginTop: 1 }}>{room?.communityName || room?.name || "未分配"} · {t.phone}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {nearExpiry && <span style={css.tag(T.amber)}>即將到期</span>}
                  <span style={{ fontSize: 12, color: T.textMuted }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {[["入住日", toROC(t.moveIn)], ["合約到期", toROC(t.contractEnd)], ["押金", t.deposit ? fmt(t.deposit) : "—"], ["剩餘天數", days !== null ? `${days} 天` : "—"]].map(([k, v]) => (
                      <div key={k} style={{ background: T.bgSub, borderRadius: 7, padding: "8px 10px", border: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {[["Email", t.email || "—"], ["身份證號", t.idNo || "—"], ["緊急聯絡人", t.emergencyName || "—"], ["緊急聯絡電話", t.emergencyPhone || "—"]].map(([k, v]) => (
                      <div key={k} style={{ background: T.bgSub, borderRadius: 7, padding: "8px 10px", border: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 13, color: T.textSub, wordBreak: "break-all" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {t.note && (
                    <div style={{ background: T.bgSub, borderRadius: 7, padding: "8px 10px", marginBottom: 10, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>備註</div>
                      <div style={{ fontSize: 13, color: T.textSub }}>{t.note}</div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginBottom: isSuperAdmin ? 10 : 0 }}>
                    {t.phone && <a href={`tel:${t.phone}`} style={{ flex: 1, background: T.greenBg, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>📞 撥打電話</a>}
                    {t.email && <a href={`mailto:${t.email}`} style={{ flex: 1, background: T.accentBg, color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>✉️ 寄信</a>}
                  </div>
                  {isSuperAdmin && (
                    <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                      <button onClick={() => openEdit(t)} style={{ flex: 1, ...css.btn(T.textSub, true), justifyContent: "center", fontSize: 13 }}><Icon n="edit" s={13} /> 編輯</button>
                      <button onClick={() => setConfirmDeleteTenant(t)} style={{ flex: 1, ...css.btn(T.red, true), justifyContent: "center", fontSize: 13 }}><Icon n="trash" s={13} /> 刪除</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal title={editTenant ? `編輯「${editTenant.name}」` : "新增房客"} onClose={() => { setShowForm(false); setEditTenant(null); }}>
          <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginBottom: 10, letterSpacing: "0.06em" }}>基本資料</div>
          {[["name", "姓名 *", "text"], ["phone", "電話", "text"], ["email", "Email", "email"], ["idNo", "身份證號", "text"]].map(([k, l, tp]) => (
            <div key={k}><label style={css.label}>{l}</label><input style={css.input} type={tp} value={form[k]} onChange={set(k)} /></div>
          ))}
          <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginBottom: 10, marginTop: 4, letterSpacing: "0.06em" }}>租約資訊</div>
          <label style={css.label}>分配房間</label>
          <select style={css.input} value={form.roomId} onChange={set("roomId")}>
            <option value="">— 選擇房間 —</option>
            {rooms.filter(r => r.status === "vacant" || r.id === editTenant?.roomId).map(r => (
              <option key={r.id} value={r.id}>{r.communityName || r.name} {r.id === editTenant?.roomId ? "（目前）" : `(${fmt(r.rent)}/月)`}</option>
            ))}
          </select>
          {[["moveIn", "入住日", "date"], ["contractEnd", "合約到期", "date"], ["deposit", "押金金額", "number"]].map(([k, l, tp]) => (
            <div key={k}><label style={css.label}>{l}</label><input style={css.input} type={tp} value={form[k]} onChange={set(k)} /></div>
          ))}
          <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginBottom: 10, marginTop: 4, letterSpacing: "0.06em" }}>緊急聯絡人</div>
          {[["emergencyName", "姓名", "text"], ["emergencyPhone", "電話", "text"]].map(([k, l, tp]) => (
            <div key={k}><label style={css.label}>{l}</label><input style={css.input} type={tp} value={form[k]} onChange={set(k)} /></div>
          ))}
          <label style={css.label}>備註</label>
          <textarea style={{ ...css.input, height: 68, resize: "vertical" }} value={form.note} onChange={set("note")} placeholder="特殊注意事項..." />
          <button onClick={saveTenant} style={{ ...css.btn(), width: "100%", justifyContent: "center", padding: 11, marginTop: 4 }}>{editTenant ? "儲存修改" : "確認新增"}</button>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="確認刪除房客" onClose={() => setConfirmDeleteTenant(null)} width={360}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>刪除「{confirmDelete.name}」？</div>
            <div style={{ color: T.textSub, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>此操作無法復原，對應房間將自動設為空房。</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDeleteTenant(null)} style={{ flex: 1, background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>取消</button>
              <button onClick={() => deleteTenant(confirmDelete)} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>確認刪除</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  BILLS TAB
// ═══════════════════════════════════════════════════════
function Bills({ data, currentUser, onUpdate }) {
  const { bills, tenants, rooms } = data;
  const role = ROLES[currentUser.role];
  const isTenantMode = currentUser.role === "viewer";
  const tenantRoomId = isTenantMode ? (currentUser._roomId || "") : "";
  const [filter, setFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [viewPayProof, setViewPayProof] = useState(null);
  const payProofRefs = useRef({});

  const thisMonth = new Date().toISOString().slice(0, 7);

  // 依月份 + 狀態篩選；租客只看自己的帳單
  const shown = bills
    .filter(b => isTenantMode ? b.roomId === tenantRoomId : true)
    .filter(b => !monthFilter || b.month === monthFilter)
    .filter(b => filter === "all" ? true : b.status === filter);

  // 租客上傳租金截圖
  const handlePayProofUpload = (billId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpdate(d => ({
        ...d,
        bills: d.bills.map(b => b.id === billId ? { ...b, paymentProof: ev.target.result } : b),
        activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `上傳租金截圖（${rooms.find(r => r.id === tenantRoomId)?.communityName || tenantRoomId}）`, timestamp: now() }],
      }));
    };
    reader.readAsDataURL(file);
  };

  const markPaid = (id) => {
    const bill = bills.find(b => b.id === id);
    const tenant = tenants.find(t => t.id === bill?.tenantId);
    const room = rooms.find(r => r.id === bill?.roomId);
    onUpdate(d => ({
      ...d,
      bills: d.bills.map(b => b.id === id
        ? { ...b, status: "paid", paidDate: todayStr(), recordedBy: currentUser.id }
        : b),
      activityLog: [...d.activityLog, {
        id: uid(), userId: currentUser.id,
        action: `標記「${room?.communityName || room?.name || bill?.roomId}」${statusLabel[bill?.type] || "款項"} 已繳`,
        timestamp: now(),
      }],
    }));
  };

  // 為本月缺少帳單的出租房源產生帳單
  const genMissingBills = () => {
    onUpdate(d => {
      let newBills = [...d.bills];
      d.rooms.filter(r => r.status === "rented").forEach(r => {
        const exists = newBills.find(b => b.roomId === r.id && b.month === thisMonth);
        if (!exists) {
          const tenant = d.tenants.find(t => (t.linkedRoom === r.id || t.roomId === r.id) && !t.isCohabitant);
          newBills = [...newBills, {
            id: uid(),
            tenantId: tenant?.id || r.tenantId || "",
            roomId: r.id,
            type: "rent",
            amount: r.rent,
            month: thisMonth,
            status: "unpaid",
            paidDate: null,
            recordedBy: null,
          }];
        }
      });
      return {
        ...d,
        bills: newBills,
        activityLog: [...d.activityLog, {
          id: uid(), userId: currentUser.id,
          action: `產生 ${thisMonth} 月所有房源帳單`,
          timestamp: now(),
        }],
      };
    });
  };

  // 非租客且無財務權限 → 鎖定
  if (!role.canViewFinance && !isTenantMode) return (
    <div style={{ textAlign: "center", padding: 60, color: T.textSub }}>
      <Icon n="lock" s={40} />
      <div style={{ marginTop: 12, fontSize: 14 }}>您的權限不足以查看財務資料</div>
    </div>
  );

  const shownPaid   = shown.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const shownUnpaid = shown.filter(b => b.status === "unpaid").reduce((s, b) => s + b.amount, 0);

  // 本月出租房源中尚未有帳單的數量
  const missingCount = rooms.filter(r =>
    r.status === "rented" && !bills.find(b => b.roomId === r.id && b.month === thisMonth)
  ).length;

  // 月份選單（從最早帳單到今天）
  const allMonths = [...new Set(bills.map(b => b.month))].sort().reverse();
  if (!allMonths.includes(thisMonth)) allMonths.unshift(thisMonth);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ ...css.sectionTitle, marginBottom: 0 }}>{isTenantMode ? "我的帳單" : "帳務管理"}</h2>
        {role.canEdit && missingCount > 0 && (
          <button onClick={genMissingBills} style={{ ...css.btn(T.accent), fontSize: 13 }}>
            <Icon n="plus" s={13} /> 產生本月帳單（{missingCount} 間）
          </button>
        )}
      </div>

      {/* 月份 + 狀態篩選 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          style={{ background: T.bg, border: `1px solid ${T.borderMd}`, borderRadius: 7, color: T.text, padding: "6px 10px", fontSize: 13, outline: "none", cursor: "pointer" }}
        >
          <option value="">全部月份</option>
          {allMonths.map(m => <option key={m} value={m}>{toROCMonth(m)}</option>)}
        </select>
        {[["all", "全部"], ["unpaid", "未繳"], ["paid", "已繳"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ background: filter === v ? T.accent : T.bgMuted, color: filter === v ? "#fff" : T.textSub, border: `1px solid ${filter === v ? T.accent : T.border}`, borderRadius: 7, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l}
          </button>
        ))}
      </div>

      {/* 統計卡 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ ...css.card, borderColor: T.green + "44" }}>
          <div style={{ fontSize: 11, color: T.textSub, fontWeight: 700, letterSpacing: "0.07em" }}>已收款</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.green, marginTop: 6 }}>{fmt(shownPaid)}</div>
        </div>
        <div style={{ ...css.card, borderColor: T.red + "44" }}>
          <div style={{ fontSize: 11, color: T.textSub, fontWeight: 700, letterSpacing: "0.07em" }}>未收款</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.red, marginTop: 6 }}>{fmt(shownUnpaid)}</div>
        </div>
      </div>

      {/* 帳單列表 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shown.length === 0 && (
          <div style={{ textAlign: "center", color: T.textSub, padding: "32px 0", fontSize: 14 }}>此條件下無帳單記錄</div>
        )}
        {shown
          .sort((a, b) => (a.status === "unpaid" ? -1 : 1) - (b.status === "unpaid" ? -1 : 1))
          .map(b => {
            const tenant = tenants.find(t => t.id === b.tenantId);
            const room   = rooms.find(r => r.id === b.roomId);
            const recorder = data.users?.find(u => u.id === b.recordedBy);
            const isOverdue = b.status === "unpaid" && b.month < thisMonth;
            return (
              <div key={b.id} style={{ ...css.card, border: `1px solid ${isOverdue ? T.red + "66" : (b.status === "unpaid" ? T.amber + "66" : T.border)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>
                      {room?.communityName || room?.name || "—"}
                    </div>
                    <div style={{ fontSize: 13, color: T.textSub, marginTop: 2 }}>
                      {isTenantMode ? "" : (tenant?.name || "—") + " · "}{toROCMonth(b.month)} · {statusLabel[b.type]}
                    </div>
                    {room?.rentDay && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>繳租日：每月 {room.rentDay} 號</div>}
                    {recorder && b.status === "paid" && (
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>由 {recorder.name} 記錄</div>
                    )}
                    {isOverdue && <div style={{ fontSize: 12, color: T.red, fontWeight: 700, marginTop: 2 }}>⚠️ 逾期未繳</div>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontWeight: 700, color: b.status === "paid" ? T.green : (isOverdue ? T.red : T.amber), fontSize: 15 }}>
                      {fmt(b.amount)}
                    </div>
                    {b.status === "unpaid" && role.canEdit ? (
                      <button onClick={() => markPaid(b.id)} style={{ background: T.greenBg, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 6, padding: "4px 10px", fontSize: 13, cursor: "pointer", marginTop: 4, fontWeight: 600 }}>標記已收</button>
                    ) : b.paidDate ? (
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{toROC(b.paidDate)}</div>
                    ) : null}
                  </div>
                </div>

                {/* ── 租金截圖上傳區（租客可上傳，管理員可查看） ── */}
                <div style={{ marginTop: 10, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
                  {b.paymentProof ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => setViewPayProof(b.paymentProof)}
                        style={{ background: T.greenBg, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        📷 查看租金截圖
                      </button>
                      {isTenantMode && (
                        <button onClick={() => { if (payProofRefs.current[b.id]) payProofRefs.current[b.id].click(); }}
                          style={{ background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
                          重新上傳
                        </button>
                      )}
                    </div>
                  ) : isTenantMode ? (
                    <button onClick={() => { if (payProofRefs.current[b.id]) payProofRefs.current[b.id].click(); }}
                      style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 7, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      📷 租金截圖上傳
                    </button>
                  ) : (
                    <div style={{ fontSize: 12, color: T.textMuted }}>尚未上傳租金截圖</div>
                  )}
                  {isTenantMode && (
                    <input
                      ref={el => payProofRefs.current[b.id] = el}
                      type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                      onChange={e => handlePayProofUpload(b.id, e.target.files[0])}
                    />
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* 截圖全螢幕檢視 */}
      {viewPayProof && (
        <div onClick={() => setViewPayProof(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <img src={viewPayProof} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, objectFit: "contain" }} alt="租金截圖" />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  REPAIRS TAB
// ═══════════════════════════════════════════════════════
function Repairs({ data, currentUser, onUpdate }) {
  const { repairs, rooms, users } = data;
  const role      = ROLES[currentUser.role];
  const isTenant  = currentUser.role === "viewer";
  // 租客模式：預先帶入自己的房間
  const tenantRoomId = isTenant ? (currentUser._roomId || "") : "";

  const emptyForm = () => ({ roomId: tenantRoomId, title: "", desc: "", priority: "high", photos: [] });
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [viewPhoto, setViewPhoto] = useState(null);
  const photoInputRef = useRef(null);

  const updateRepair = (id, status) => {
    const rep = repairs.find(r => r.id === id);
    onUpdate(d => ({ ...d, repairs: d.repairs.map(r => r.id === id ? { ...r, status, updatedBy: currentUser.id } : r), activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `更新報修「${rep.title}」為 ${statusLabel[status]}`, timestamp: now() }] }));
  };

  const addRepair = () => {
    if (!form.title || !form.roomId) return;
    const room = rooms.find(r => r.id === form.roomId);
    onUpdate(d => ({
      ...d,
      repairs: [...d.repairs, {
        id: uid(), ...form,
        status: "pending",
        date: todayStr(),
        tenantName: currentUser.name || "—",
        assignedTo: null, updatedBy: null,
        photos: form.photos || [],
      }],
      activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `新增報修「${form.title}」(${room?.communityName || room?.name})`, timestamp: now() }],
    }));
    setShowAdd(false); setForm(emptyForm());
  };

  // 處理圖片上傳（多張，轉 base64）
  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(f => ({ ...f, photos: [...(f.photos || []), ev.target.result] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (idx) => setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));

  const pColor     = { high: T.red, low: T.textMuted };
  const statusColor = { done: T.green, in_progress: T.blue, pending: T.amber };

  // 租客只看自己房間的報修，管理員看全部
  const visibleRepairs = isTenant
    ? repairs.filter(r => r.roomId === tenantRoomId)
    : repairs;

  const canAddRepair = role.canEdit || isTenant;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={css.sectionTitle}>報修管理</h2>
        {canAddRepair && (
          <button onClick={() => { setForm(emptyForm()); setShowAdd(true); }} style={css.btn()}>
            <Icon n="plus" s={13} /> 新增報修
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleRepairs.length === 0 && (
          <div style={{ textAlign: "center", color: T.textSub, padding: "32px 0", fontSize: 14 }}>目前沒有報修記錄</div>
        )}
        {visibleRepairs.map(r => {
          const room    = rooms.find(rm => rm.id === r.roomId);
          const updater = users?.find(u => u.id === r.updatedBy);
          const photos  = r.photos || [];
          return (
            <div key={r.id} style={{ ...css.card }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: pColor[r.priority], flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{r.title}</span>
                </div>
                <span style={css.tag(statusColor[r.status] || T.textSub)}>{statusLabel[r.status]}</span>
              </div>
              <div style={{ fontSize: 13, color: T.textSub, marginBottom: 4 }}>
                {room?.communityName || room?.name} · {r.tenantName} · {toROC(r.date)}
              </div>
              {r.desc && <div style={{ fontSize: 13, color: T.textMuted, marginBottom: photos.length > 0 ? 10 : 0 }}>{r.desc}</div>}

              {/* 圖片縮圖列 */}
              {photos.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, marginBottom: 10 }}>
                  {photos.map((src, i) => (
                    <div key={i} onClick={() => setViewPhoto(src)}
                      style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, cursor: "pointer", flexShrink: 0, background: T.bgMuted }}>
                      <img src={src} alt={`報修圖${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: T.textMuted, alignSelf: "flex-end", paddingBottom: 4 }}>
                    📷 {photos.length} 張照片（點擊放大）
                  </div>
                </div>
              )}

              {updater && <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>由 {updater.name} 更新</div>}
              {r.status !== "done" && role.canEdit && (
                <div style={{ display: "flex", gap: 8 }}>
                  {r.status === "pending" && <button onClick={() => updateRepair(r.id, "in_progress")} style={css.btn(T.blue, true)}>開始處理</button>}
                  <button onClick={() => updateRepair(r.id, "done")} style={css.btn(T.green, true)}>完成</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 圖片全螢幕預覽 */}
      {viewPhoto && (
        <div onClick={() => setViewPhoto(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, cursor: "zoom-out" }}>
          <img src={viewPhoto} alt="放大" style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: 10, objectFit: "contain", boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }} />
          <button onClick={() => setViewPhoto(null)}
            style={{ position: "absolute", top: 16, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "50%", width: 36, height: 36, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      )}

      {/* 新增報修 Modal */}
      {showAdd && (
        <Modal title="新增報修" onClose={() => { setShowAdd(false); setForm(emptyForm()); }}>
          {/* 房間選擇（租客已鎖定） */}
          <label style={css.label}>房間</label>
          {isTenant ? (
            <div style={{ ...css.input, color: T.textSub, background: T.bgMuted, marginBottom: 12 }}>
              {rooms.find(r => r.id === tenantRoomId)?.communityName || "我的房間"}
            </div>
          ) : (
            <select style={css.input} value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}>
              <option value="">— 選擇房間 —</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.communityName || r.name}</option>)}
            </select>
          )}

          <label style={css.label}>問題標題 *</label>
          <input style={css.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例：廁所漏水、冷氣不製冷" />

          <label style={css.label}>問題描述</label>
          <textarea style={{ ...css.input, height: 80, resize: "vertical" }} value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="請描述問題的位置與狀況，讓師傅更容易了解..." />

          {/* 圖片上傳區 */}
          <label style={css.label}>現場照片（選填，可多張）</label>
          <div
            onClick={() => photoInputRef.current?.click()}
            style={{ border: `2px dashed ${T.borderMd}`, borderRadius: 10, padding: "16px", textAlign: "center", cursor: "pointer", marginBottom: 12, background: T.bgSub }}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = T.accent; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = T.borderMd; }}
            onDrop={e => {
              e.preventDefault(); e.currentTarget.style.borderColor = T.borderMd;
              Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/")).forEach(file => {
                const reader = new FileReader();
                reader.onload = ev => setForm(f => ({ ...f, photos: [...(f.photos || []), ev.target.result] }));
                reader.readAsDataURL(file);
              });
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
            <div style={{ fontSize: 13, color: T.textSub }}>點擊選擇或拖曳圖片至此</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>支援 JPG、PNG、HEIC 等圖片格式</div>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoAdd} />

          {/* 已選圖片預覽 */}
          {(form.photos || []).length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {form.photos.map((src, i) => (
                <div key={i} style={{ position: "relative", width: 70, height: 70, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, flexShrink: 0 }}>
                  <img src={src} alt={`圖${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => removePhoto(i)}
                    style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {!isTenant && (
            <>
              <label style={css.label}>優先級</label>
              <select style={css.input} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="high">高（緊急）</option><option value="low">低（一般）</option>
              </select>
            </>
          )}

          <button
            onClick={addRepair}
            disabled={!form.title || !form.roomId}
            style={{ ...css.btn(), width: "100%", justifyContent: "center", padding: 12, opacity: (!form.title || !form.roomId) ? 0.5 : 1 }}
          >
            送出報修申請
          </button>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  REPORT TAB
// ═══════════════════════════════════════════════════════
function Report({ bills, rooms, tenants, repairs }) {
  const nowDate  = new Date();
  const thisYear = nowDate.getFullYear();
  const [selectedYear, setSelectedYear] = useState(thisYear);
  const [viewMode, setViewMode] = useState("monthly"); // "monthly" | "rooms" | "renewal"

  // ── 年度月份統計 ────────────────────────────────────
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const month = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
    const mb = bills.filter(b => b.month === month);
    const roomIds = [...new Set(mb.map(b => b.roomId))];
    const collected   = mb.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
    const uncollected = mb.filter(b => b.status === "unpaid").reduce((s, b) => s + b.amount, 0);
    return { month, roomCount: roomIds.length, collected, uncollected, total: collected + uncollected };
  });

  const yearCollected   = monthlyStats.reduce((s, m) => s + m.collected, 0);
  const yearUncollected = monthlyStats.reduce((s, m) => s + m.uncollected, 0);
  const yearTotal       = yearCollected + yearUncollected;
  const maxTotal        = Math.max(...monthlyStats.map(m => m.total), 1);

  // ── 目前狀態 ───────────────────────────────────────
  const rentedRooms  = rooms.filter(r => r.status === "rented");
  const vacantRooms  = rooms.filter(r => r.status === "vacant");
  const occupancy    = rooms.length > 0 ? Math.round((rentedRooms.length / rooms.length) * 100) : 0;

  // ── 年度房源事件統計（用於續約分析頁） ──────────────
  const yrStr = String(selectedYear);
  const prevYrStr = String(selectedYear - 1);

  // 本年度有帳單的房源（上一年）→ 判斷是否舊有房源
  const prevYrRoomIds = new Set(
    bills.filter(b => b.month?.startsWith(prevYrStr)).map(b => b.roomId)
  );
  // 本年度有帳單的房源
  const thisYrRoomIds = new Set(
    bills.filter(b => b.month?.startsWith(yrStr)).map(b => b.roomId)
  );

  // 新增房源：起租日在本年度，且上一年無帳單（真正新進場的房源）
  const newRooms = rooms.filter(r =>
    r.leaseStart?.startsWith(yrStr) && !prevYrRoomIds.has(r.id)
  );

  // 更換租客：起租日在本年度，但上一年有帳單（同房源換租客）
  const tenantChanges = rooms.filter(r =>
    r.leaseStart?.startsWith(yrStr) && prevYrRoomIds.has(r.id)
  );

  // 續約：renewals 陣列中有任一筆 renewStart 在本年度
  const renewedRooms = rooms.filter(r =>
    (r.renewals || []).some(rv => rv.renewStart?.startsWith(yrStr))
  );
  // 所有年度有活動的房源（取聯集：上一年＋本年＋新增＋續約）
  const activeRoomTotal = rooms.length;

  // 各類事件筆數
  const renewalStats = {
    total:         activeRoomTotal,
    rented:        rentedRooms.length,
    newRooms:      newRooms.length,
    tenantChanges: tenantChanges.length,
    renewals:      renewedRooms.length,
    vacant:        vacantRooms.length,
  };

  // ── SheetJS Excel 匯出 ─────────────────────────────
  const exportExcel = async () => {
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    const XL = window.XLSX;
    const wb = XL.utils.book_new();

    // ── Sheet 1：年度月份統計 ──────────────────────────
    const s1 = [
      [`RentKeeper 房源報表 — 民國 ${selectedYear - 1911} 年（西元 ${selectedYear} 年）`],
      [],
      ["月份", "出租間數", "已收租金 (NT$)", "未收租金 (NT$)", "合計 (NT$)"],
      ...monthlyStats.map(m => [
        `民國${selectedYear - 1911}年${parseInt(m.month.slice(5))}月`,
        m.roomCount,
        m.collected,
        m.uncollected,
        m.total,
      ]),
      [],
      ["全年合計", "", yearCollected, yearUncollected, yearTotal],
    ];
    const ws1 = XL.utils.aoa_to_sheet(s1);
    ws1["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
    XL.utils.book_append_sheet(wb, ws1, "月份統計");

    // ── Sheet 2：房源明細 ──────────────────────────────
    const s2 = [
      ["房源名稱", "地址", "狀態", "月租金 (NT$)", "繳租日", "起租日", "合約到期", "主租客姓名", "主租客電話"],
      ...rooms.map(r => [
        r.communityName || r.name || "",
        r.address || "",
        r.status === "rented" ? "已出租" : "空房",
        r.rent || 0,
        r.rentDay ? `每月 ${r.rentDay} 號` : "",
        r.leaseStart || "",
        r.contractEnd || "",
        r.tenantContactName || "",
        r.tenantContactPhone || "",
      ]),
    ];
    const ws2 = XL.utils.aoa_to_sheet(s2);
    ws2["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 8 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }];
    XL.utils.book_append_sheet(wb, ws2, "房源明細");

    // ── Sheet 3：帳務明細 ──────────────────────────────
    const s3 = [
      ["月份", "房源名稱", "租客姓名", "類型", "金額 (NT$)", "狀態", "繳款日"],
      ...bills
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(b => {
          const room   = rooms.find(r => r.id === b.roomId);
          const tenant = tenants.find(t => t.id === b.tenantId);
          const [yr, mo] = (b.month || "").split("-");
          return [
            yr && mo ? `民國${parseInt(yr) - 1911}年${parseInt(mo)}月` : b.month,
            room?.communityName || room?.name || "",
            tenant?.name || "",
            b.type === "rent" ? "租金" : (b.type || ""),
            b.amount || 0,
            b.status === "paid" ? "已繳" : "未繳",
            b.paidDate || "",
          ];
        }),
    ];
    const ws3 = XL.utils.aoa_to_sheet(s3);
    ws3["!cols"] = [{ wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 8 }, { wch: 12 }];
    XL.utils.book_append_sheet(wb, ws3, "帳務明細");

    // ── Sheet 4：年度房源統計 ─────────────────────────
    const s4 = [
      [`家樂美房產管理顧問有限公司　民國 ${selectedYear - 1911} 年　年度房源統計`],
      [],
      ["項目", "間數", "佔比（%）", "說明"],
      ["所有房源",   renewalStats.total,         renewalStats.total > 0 ? 100 : 0,                                                                "系統內全部房源數量"],
      ["已出租",     renewalStats.rented,        renewalStats.total > 0 ? Math.round(renewalStats.rented        / renewalStats.total * 100) : 0,   "目前出租中的房源"],
      ["空房",       renewalStats.vacant,        renewalStats.total > 0 ? Math.round(renewalStats.vacant        / renewalStats.total * 100) : 0,   "目前空置中的房源"],
      ["新增房源",   renewalStats.newRooms,      renewalStats.total > 0 ? Math.round(renewalStats.newRooms      / renewalStats.total * 100) : 0,   `${selectedYear - 1911}年起租且為全新進場（無上年帳單）`],
      ["更換租客",   renewalStats.tenantChanges, renewalStats.total > 0 ? Math.round(renewalStats.tenantChanges / renewalStats.total * 100) : 0,   `${selectedYear - 1911}年起租且上一年同房源已有帳單（換人）`],
      ["辦理續約",   renewalStats.renewals,      renewalStats.total > 0 ? Math.round(renewalStats.renewals      / renewalStats.total * 100) : 0,   `續約起租日落在${selectedYear - 1911}年的房源`],
      [],
      [`── 新增房源明細（${newRooms.length} 間）──`],
      ["房源名稱", "主租客", "起租日", "合約到期"],
      ...newRooms.map(r => [r.communityName || r.name, r.tenantContactName || "—", r.leaseStart || "", r.contractEnd || ""]),
      [],
      [`── 更換租客明細（${tenantChanges.length} 間）──`],
      ["房源名稱", "新租客", "新起租日", "合約到期"],
      ...tenantChanges.map(r => [r.communityName || r.name, r.tenantContactName || "—", r.leaseStart || "", r.contractEnd || ""]),
      [],
      [`── 辦理續約明細（${renewedRooms.length} 間）──`],
      ["房源名稱", "主租客", "續約起租日", "續約到期日"],
      ...renewedRooms.flatMap(r =>
        (r.renewals || [])
          .filter(rv => rv.renewStart?.startsWith(yrStr))
          .map(rv => [r.communityName || r.name, r.tenantContactName || "—", rv.renewStart || "", rv.renewEnd || ""])
      ),
    ];
    const ws4 = XL.utils.aoa_to_sheet(s4);
    ws4["!cols"] = [{ wch: 20 }, { wch: 8 }, { wch: 10 }, { wch: 40 }];
    ws4["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    XL.utils.book_append_sheet(wb, ws4, "年度房源統計");

    XL.writeFile(wb, `RentKeeper_民國${selectedYear - 1911}年報表.xlsx`);
  };

  // 讓父層底部 action bar 可呼叫
  useEffect(() => { window.__rentkeeper_export = exportExcel; }, [selectedYear, bills, rooms, tenants, renewalStats]);
  useEffect(() => () => { delete window.__rentkeeper_export; }, []);

  // ── 可選年份（從帳單或近3年） ──────────────────────
  const billYears = [...new Set(bills.map(b => b.month?.slice(0, 4)).filter(Boolean).map(Number))];
  const years = [...new Set([...billYears, thisYear - 1, thisYear, thisYear + 1])].sort((a, b) => b - a);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ ...css.sectionTitle, marginBottom: 2 }}>房源報表</h2>
          <p style={{ color: T.textSub, fontSize: 13, margin: 0 }}>民國 {selectedYear - 1911} 年 / 西元 {selectedYear} 年</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ background: T.bg, border: `1px solid ${T.borderMd}`, borderRadius: 8, color: T.text, padding: "7px 10px", fontSize: 13, outline: "none", cursor: "pointer" }}
          >
            {years.map(y => <option key={y} value={y}>民國 {y - 1911} 年</option>)}
          </select>
        </div>
      </div>

      {/* 年度概覽卡 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { l: "目前出租", v: `${rentedRooms.length} 間`, sub: `入住率 ${occupancy}%`, c: T.green },
          { l: "空房", v: `${vacantRooms.length} 間`, sub: `共 ${rooms.length} 間房源`, c: T.amber },
          { l: `${selectedYear - 1911}年已收款`, v: fmt(yearCollected), sub: "全年合計", c: T.blue },
          { l: `${selectedYear - 1911}年未收款`, v: fmt(yearUncollected), sub: "全年合計", c: T.red },
        ].map((s, i) => (
          <div key={i} style={{ ...css.card }}>
            <div style={{ fontSize: 11, color: T.textSub, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 入住率進度條 */}
      <div style={{ ...css.card, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: T.textSub, fontSize: 13, fontWeight: 600 }}>整體入住率</span>
          <span style={{ color: T.blue, fontWeight: 700, fontSize: 13 }}>{occupancy}%</span>
        </div>
        <div style={{ background: T.bgMuted, borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${occupancy}%`, height: "100%", background: `linear-gradient(90deg, ${T.blue}, ${T.accent})`, borderRadius: 99, transition: "width 0.8s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {rooms.map(r => (
            <div key={r.id} title={r.communityName || r.name}
              style={{ height: 7, width: 22, borderRadius: 3, background: r.status === "rented" ? T.blue : T.bgMuted, border: `1px solid ${T.border}` }} />
          ))}
        </div>
      </div>

      {/* 切換頁籤 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {[["monthly", "月份統計"], ["rooms", "房源明細"], ["renewal", "年度統計"]].map(([k, l]) => (
          <button key={k} onClick={() => setViewMode(k)}
            style={{ background: viewMode === k ? T.accent : T.bgMuted, color: viewMode === k ? "#fff" : T.textSub, border: `1px solid ${viewMode === k ? T.accent : T.border}`, borderRadius: 7, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── 月份統計表 ── */}
      {viewMode === "monthly" && (
        <div style={{ ...css.card, padding: 0, overflow: "hidden" }}>
          {/* 長條圖 */}
          <div style={{ padding: "14px 14px 6px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, color: T.textSub, fontWeight: 700, marginBottom: 10 }}>月收租走勢（民國 {selectedYear - 1911} 年）</div>
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 64 }}>
              {monthlyStats.map((m, i) => {
                const h = maxTotal > 0 ? Math.max(4, Math.round((m.total / maxTotal) * 60)) : 4;
                const hPaid = maxTotal > 0 ? Math.round((m.collected / maxTotal) * 60) : 0;
                const isCurrentMonth = m.month === new Date().toISOString().slice(0, 7);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", height: h, borderRadius: "4px 4px 0 0", position: "relative", background: T.bgMuted, overflow: "hidden" }}>
                      <div style={{ position: "absolute", bottom: 0, width: "100%", height: hPaid, background: isCurrentMonth ? T.blue : T.green + "bb", borderRadius: "4px 4px 0 0" }} />
                    </div>
                    <div style={{ fontSize: 10, color: isCurrentMonth ? T.blue : T.textMuted, fontWeight: isCurrentMonth ? 700 : 400 }}>
                      {i + 1}月
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* 表格 */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.bgSub }}>
                  {["月份", "出租間數", "已收租金", "未收租金", "合計"].map(h => (
                    <th key={h} style={{ padding: "9px 10px", textAlign: h === "月份" ? "left" : "right", color: T.textSub, fontWeight: 700, fontSize: 11, borderBottom: `1px solid ${T.border}`, letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((m, i) => {
                  const isCurrentMonth = m.month === new Date().toISOString().slice(0, 7);
                  return (
                    <tr key={i} style={{ background: isCurrentMonth ? T.accentBg : "transparent", borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "9px 10px", color: isCurrentMonth ? T.accent : T.text, fontWeight: isCurrentMonth ? 700 : 500 }}>
                        {i + 1} 月{isCurrentMonth && <span style={{ fontSize: 10, color: T.accent, marginLeft: 4 }}>●本月</span>}
                      </td>
                      <td style={{ padding: "9px 10px", textAlign: "right", color: T.text, fontWeight: 600 }}>{m.roomCount} 間</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", color: m.collected > 0 ? T.green : T.textMuted, fontWeight: 600 }}>
                        {m.collected > 0 ? fmt(m.collected) : "—"}
                      </td>
                      <td style={{ padding: "9px 10px", textAlign: "right", color: m.uncollected > 0 ? T.red : T.textMuted, fontWeight: 600 }}>
                        {m.uncollected > 0 ? fmt(m.uncollected) : "—"}
                      </td>
                      <td style={{ padding: "9px 10px", textAlign: "right", color: T.text, fontWeight: 700 }}>
                        {m.total > 0 ? fmt(m.total) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: T.bgSub, borderTop: `2px solid ${T.borderMd}` }}>
                  <td style={{ padding: "10px 10px", fontWeight: 800, color: T.text }}>全年合計</td>
                  <td style={{ padding: "10px 10px", textAlign: "right", color: T.textSub, fontWeight: 600 }}>—</td>
                  <td style={{ padding: "10px 10px", textAlign: "right", color: T.green, fontWeight: 800 }}>{fmt(yearCollected)}</td>
                  <td style={{ padding: "10px 10px", textAlign: "right", color: T.red, fontWeight: 800 }}>{fmt(yearUncollected)}</td>
                  <td style={{ padding: "10px 10px", textAlign: "right", color: T.accent, fontWeight: 800 }}>{fmt(yearTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── 年度統計（續約分析） ── */}
      {viewMode === "renewal" && (() => {
        // 橫條比例圖輔助
        const Bar = ({ value, total, color }) => {
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div style={{ flex: 1 }}>
              <div style={{ background: T.bgMuted, borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        };

        const rows = [
          { label: "所有房源",   value: renewalStats.total,         color: T.blue,    icon: "🏠", desc: "系統內全部房源數量" },
          { label: "已出租",     value: renewalStats.rented,        color: T.green,   icon: "✅", desc: "目前出租中的房源" },
          { label: "新增房源",   value: renewalStats.newRooms,      color: T.accent,  icon: "🆕", desc: `${selectedYear - 1911}年起租且為全新進場的房源` },
          { label: "更換租客",   value: renewalStats.tenantChanges, color: T.amber,   icon: "🔄", desc: `${selectedYear - 1911}年起租且同房源上年已有帳單（換人）` },
          { label: "辦理續約",   value: renewalStats.renewals,      color: T.purple || "#7c3aed", icon: "📋", desc: `續約起租日落在${selectedYear - 1911}年的房源` },
          { label: "空房",       value: renewalStats.vacant,        color: T.textMuted, icon: "🚪", desc: "目前空置中的房源" },
        ];

        // 年度各月新增/續約分布
        const monthlyEvents = Array.from({ length: 12 }, (_, i) => {
          const m = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
          const mNewRooms = rooms.filter(r => r.leaseStart?.slice(0, 7) === m && !prevYrRoomIds.has(r.id)).length;
          const mChanges  = rooms.filter(r => r.leaseStart?.slice(0, 7) === m && prevYrRoomIds.has(r.id)).length;
          const mRenewals = rooms.filter(r => (r.renewals || []).some(rv => rv.renewStart?.slice(0, 7) === m)).length;
          return { m: i + 1, mNewRooms, mChanges, mRenewals };
        });
        const maxEvents = Math.max(...monthlyEvents.map(e => e.mNewRooms + e.mChanges + e.mRenewals), 1);

        return (
          <div>
            {/* 統計卡片 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {rows.slice(0, 4).map((r, i) => (
                <div key={i} style={{ ...css.card }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: 11, color: T.textSub, fontWeight: 700, letterSpacing: "0.06em" }}>{r.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: r.color, margin: "4px 0" }}>{r.value} 間</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{renewalStats.total > 0 ? Math.round((r.value / renewalStats.total) * 100) : 0}%</div>
                </div>
              ))}
            </div>

            {/* 橫條比例圖 */}
            <div style={{ ...css.card, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 12, letterSpacing: "0.06em" }}>
                民國 {selectedYear - 1911} 年　房源事件比例
              </div>
              {rows.map((r, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{r.icon} {r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>
                      {r.value} 間
                      <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 400, marginLeft: 5 }}>
                        ({renewalStats.total > 0 ? Math.round((r.value / renewalStats.total) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div style={{ background: T.bgMuted, borderRadius: 99, height: 9, overflow: "hidden" }}>
                    <div style={{ width: `${renewalStats.total > 0 ? (r.value / renewalStats.total) * 100 : 0}%`, height: "100%", background: r.color, borderRadius: 99, transition: "width 0.7s ease" }} />
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{r.desc}</div>
                </div>
              ))}
            </div>

            {/* 月份分布長條圖 */}
            <div style={{ ...css.card, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 10, letterSpacing: "0.06em" }}>
                各月房源事件分布（民國 {selectedYear - 1911} 年）
              </div>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 80, marginBottom: 6 }}>
                {monthlyEvents.map((e, i) => {
                  const total = e.mNewRooms + e.mChanges + e.mRenewals;
                  const h = maxEvents > 0 ? Math.max(total > 0 ? 6 : 0, Math.round((total / maxEvents) * 70)) : 0;
                  const hNew = maxEvents > 0 ? Math.round((e.mNewRooms / maxEvents) * 70) : 0;
                  const hChg = maxEvents > 0 ? Math.round((e.mChanges / maxEvents) * 70) : 0;
                  const hRen = maxEvents > 0 ? Math.round((e.mRenewals / maxEvents) * 70) : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 72, gap: 0 }}>
                        {hRen > 0 && <div style={{ height: hRen, background: T.purple || "#7c3aed", borderRadius: total === hRen ? "4px 4px 0 0" : 0, opacity: 0.85 }} />}
                        {hChg > 0 && <div style={{ height: hChg, background: T.amber, opacity: 0.85 }} />}
                        {hNew > 0 && <div style={{ height: hNew, background: T.accent, borderRadius: e.mChanges === 0 && e.mRenewals === 0 ? "4px 4px 0 0" : 0, opacity: 0.85 }} />}
                        {total === 0 && <div style={{ height: 4, background: T.bgMuted, borderRadius: 2 }} />}
                      </div>
                      <div style={{ fontSize: 10, color: T.textMuted }}>{e.m}月</div>
                    </div>
                  );
                })}
              </div>
              {/* 圖例 */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {[["新增房源", T.accent], ["更換租客", T.amber], ["辦理續約", T.purple || "#7c3aed"]].map(([l, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                    <span style={{ fontSize: 11, color: T.textSub }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 明細列表 */}
            {[
              { title: `🆕 新增房源（${newRooms.length} 間）`, list: newRooms, color: T.accent, dateKey: "leaseStart", dateLabel: "起租日" },
              { title: `🔄 更換租客（${tenantChanges.length} 間）`, list: tenantChanges, color: T.amber, dateKey: "leaseStart", dateLabel: "新起租日" },
              { title: `📋 辦理續約（${renewedRooms.length} 間）`, list: renewedRooms, color: T.purple || "#7c3aed", dateKey: null, dateLabel: "續約起租日" },
            ].map(({ title, list, color, dateKey, dateLabel }) => list.length > 0 && (
              <div key={title} style={{ ...css.card, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, color, fontSize: 13, marginBottom: 10 }}>{title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {list.map(r => {
                    const renewInYear = (r.renewals || []).filter(rv => rv.renewStart?.startsWith(yrStr));
                    return (
                      <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: T.bgSub, borderRadius: 7, border: `1px solid ${T.border}` }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{r.communityName || r.name}</div>
                          <div style={{ fontSize: 12, color: T.textSub, marginTop: 1 }}>
                            {r.tenantContactName || "空房"}{r.tenantContactName ? " ·" : ""} {dateKey ? toROC(r[dateKey]) : renewInYear.map(rv => toROC(rv.renewStart)).join("、")}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: 12, color: T.textMuted }}>{dateLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── 房源明細 ── */}
      {viewMode === "rooms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rooms.map(r => {
            const yearBills = bills.filter(b => b.roomId === r.id && b.month?.startsWith(String(selectedYear)));
            const roomCollected   = yearBills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
            const roomUncollected = yearBills.filter(b => b.status === "unpaid").reduce((s, b) => s + b.amount, 0);
            return (
              <div key={r.id} style={{ ...css.card }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{r.communityName || r.name}</div>
                    {r.address && <div style={{ fontSize: 12, color: T.textSub, marginTop: 1 }}>📍 {r.address}</div>}
                  </div>
                  <span style={css.tag(r.status === "rented" ? T.green : T.amber)}>{r.status === "rented" ? "已出租" : "空房"}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[
                    ["月租金", fmt(r.rent), T.text],
                    [`${selectedYear - 1911}年已收`, fmt(roomCollected), T.green],
                    [`${selectedYear - 1911}年未收`, fmt(roomUncollected), T.red],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ background: T.bgSub, borderRadius: 7, padding: "7px 8px", border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {r.status === "rented" && (
                  <div style={{ fontSize: 12, color: T.textSub, marginTop: 8 }}>
                    主租客：<strong style={{ color: T.text }}>{r.tenantContactName || "—"}</strong>
                    {r.contractEnd && <span style={{ marginLeft: 8 }}>合約到期：<span style={{ color: daysUntil(r.contractEnd) <= 60 ? T.amber : T.textMuted }}>{toROC(r.contractEnd)}</span></span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ACTIVITY LOG
// ═══════════════════════════════════════════════════════
// ─── 備份 localStorage key ───────────────────────────────
const BACKUP_TS_KEY = "rentkeeper-last-backup-v24";
const getLastBackupTs  = () => { try { return localStorage.getItem(BACKUP_TS_KEY); } catch { return null; } };
const setLastBackupTs  = (ts) => { try { localStorage.setItem(BACKUP_TS_KEY, ts); } catch {} };

function ActivityLog({ data, currentUser, onUpdate }) {
  const { activityLog, users } = data;
  const isSuperAdmin = currentUser?.role === "superadmin";
  const importRef    = useRef(null);
  const [lastBackup, setLastBackup] = useState(getLastBackupTs);
  const [importing, setImporting]   = useState(false);
  const [confirmImport, setConfirmImport] = useState(null);
  const [confirmClear, setConfirmClear]   = useState(false); // 匯出後清空確認

  // ── 維修紀錄 Excel 匯出 + 清空 ──────────────────────
  const exportLogExcel = async () => {
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    const XL = window.XLSX;
    const wb = XL.utils.book_new();
    const today = new Date().toISOString().slice(0, 10);

    // 整理記錄資料（從舊到新）
    const rows = [...activityLog]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(log => {
        const u = users.find(u => u.id === log.userId);
        return [
          toROC(log.timestamp, true),
          u?.name || "系統",
          u ? ROLES[u.role]?.label : "—",
          log.action,
        ];
      });

    const ws = XL.utils.aoa_to_sheet([
      [`家樂美房產管理顧問有限公司　操作記錄匯出　${today}`],
      [],
      ["時間", "操作人員", "角色", "操作內容"],
      ...rows,
    ]);
    ws["!cols"] = [{ wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 50 }];
    // 標題合併
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    XL.utils.book_append_sheet(wb, ws, "操作記錄");

    XL.writeFile(wb, `家樂美_操作記錄_${today}.xlsx`);

    // 匯出後記錄此動作，然後清空
    const ts = new Date().toISOString();
    onUpdate(d => ({
      ...d,
      activityLog: [{
        id: uid(), userId: currentUser?.id,
        action: `匯出操作記錄 Excel（共 ${activityLog.length} 筆），並清空記錄`,
        timestamp: ts,
      }],
    }));
    setConfirmClear(false);
  };

  // 掛載到 window 供 action bar 呼叫
  useEffect(() => { window.__rentkeeper_log_export = () => setConfirmClear(true); }, []);
  useEffect(() => () => { delete window.__rentkeeper_log_export; }, []);

  // ── 匯出備份 ─────────────────────────────────────────
  const exportBackup = (isAuto = false) => {
    const ts = new Date().toISOString();
    const snapshot = { ...data, _backupTime: ts, _rentkeeper: true };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `RentKeeper_${isAuto ? "自動備份" : "備份"}_${ts.slice(0, 10)}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    setLastBackupTs(ts); setLastBackup(ts);
    if (onUpdate) {
      onUpdate(d => ({
        ...d,
        activityLog: [...d.activityLog, {
          id: uid(), userId: currentUser?.id || "system",
          action: isAuto ? "系統自動備份（每月1號）" : "手動匯出系統備份檔案",
          timestamp: ts,
        }],
      }));
    }
  };

  // ── 匯入備份 ─────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.users || !parsed.rooms || !parsed.tenants || !parsed._rentkeeper) {
          alert("⚠️ 無效的備份檔案，請選擇正確的 RentKeeper 備份（.json）");
          setImporting(false); return;
        }
        setConfirmImport(parsed);
      } catch {
        alert("⚠️ 備份檔案解析失敗，請確認格式正確");
      }
      setImporting(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const doImport = () => {
    if (!confirmImport) return;
    const { _backupTime, _rentkeeper, ...restoreData } = confirmImport;
    const ts = new Date().toISOString();
    onUpdate(() => ({
      ...restoreData,
      activityLog: [...(restoreData.activityLog || []), {
        id: uid(), userId: currentUser?.id || "system",
        action: `從備份還原系統（備份時間：${_backupTime ? toROC(_backupTime, true) : "未知"}）`,
        timestamp: ts,
      }],
    }));
    setLastBackupTs(ts); setLastBackup(ts);
    setConfirmImport(null);
  };

  // ── 計算距上次備份天數 ───────────────────────────────
  const daysSinceBackup = lastBackup
    ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000)
    : null;
  const backupWarning = daysSinceBackup === null || daysSinceBackup > 30;

  return (
    <div>
      <h2 style={css.sectionTitle}>操作記錄</h2>

      {/* ── 後台維修備份區塊 ── */}
      {isSuperAdmin && (
        <div style={{ marginBottom: 18 }}>
          {/* 備份狀態橫幅 */}
          <div style={{ background: backupWarning ? T.redBg : T.greenBg, border: `1px solid ${backupWarning ? T.red + "55" : T.green + "55"}`, borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, color: backupWarning ? T.red : T.green, fontSize: 14 }}>
                {backupWarning ? "⚠️ 超過 30 天未備份" : "✅ 備份狀態正常"}
              </div>
              <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
                {lastBackup
                  ? `上次備份：${toROC(lastBackup, true)}（${daysSinceBackup} 天前）`
                  : "尚未執行任何備份"}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                🔔 系統將於每月1號自動備份（若超過30天未手動備份）
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div style={{ display: "flex", gap: 10 }}>
            {/* 匯出備份 */}
            <button
              onClick={() => exportBackup(false)}
              style={{ flex: 1, background: T.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 8px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              ⬇ 匯出備份
            </button>

            {/* 匯入備份 */}
            <button
              onClick={() => importRef.current?.click()}
              disabled={importing}
              style={{ flex: 1, background: T.bg, color: T.text, border: `1px solid ${T.borderMd}`, borderRadius: 10, padding: "12px 8px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: importing ? 0.6 : 1 }}
            >
              ⬆ 匯入備份
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        </div>
      )}

      {/* ── 匯入確認對話框 ── */}
      {confirmImport && (
        <Modal title="確認還原備份" onClose={() => setConfirmImport(null)} width={360}>
          <div style={{ padding: "4px 0 16px" }}>
            <div style={{ background: T.redBg, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
              <div style={{ color: T.red, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>⚠️ 此操作將覆蓋所有目前資料</div>
              <div style={{ fontSize: 13, color: T.textSub }}>
                備份時間：{confirmImport._backupTime ? toROC(confirmImport._backupTime, true) : "未知"}
              </div>
              <div style={{ fontSize: 13, color: T.textSub, marginTop: 2 }}>
                房源：{confirmImport.rooms?.length || 0} 間　房客：{confirmImport.tenants?.length || 0} 位　帳單：{confirmImport.bills?.length || 0} 筆
              </div>
            </div>
            <div style={{ fontSize: 13, color: T.textSub, marginBottom: 18, lineHeight: 1.6 }}>
              確認後系統資料將還原至備份時的狀態，目前所有異動將遺失。請確認後再執行。
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmImport(null)} style={{ flex: 1, background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>取消</button>
              <button onClick={doImport} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>確認還原</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 匯出並清空確認對話框 ── */}
      {confirmClear && (
        <Modal title="確認匯出並清空記錄" onClose={() => setConfirmClear(false)} width={360}>
          <div style={{ padding: "4px 0 16px" }}>
            <div style={{ background: T.amberBg, border: `1px solid ${T.amber}55`, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
              <div style={{ color: T.amber, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>⚠️ 匯出後將清空所有操作記錄</div>
              <div style={{ fontSize: 13, color: T.textSub }}>目前共有 {activityLog.length} 筆記錄將被匯出至 Excel，匯出完成後記錄歸零。</div>
            </div>
            <div style={{ fontSize: 13, color: T.textSub, marginBottom: 18, lineHeight: 1.6 }}>
              請確認已妥善儲存 Excel 檔案後，系統將只保留本次匯出的記錄項目。
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmClear(false)} style={{ flex: 1, background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>取消</button>
              <button onClick={exportLogExcel} style={{ flex: 1, background: T.green, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>確認匯出並清空</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 操作記錄列表 ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...activityLog].reverse().map(log => {
          const u = users.find(u => u.id === log.userId);
          return (
            <div key={log.id} style={{ ...css.card, display: "flex", gap: 10, alignItems: "flex-start" }}>
              {u ? <AvatarBadge user={u} size={30} /> : <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.bgMuted, flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: T.text }}>
                  <span style={{ color: u ? ROLES[u.role].color : T.textSub, fontWeight: 600 }}>{u?.name || "系統"}</span> {log.action}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{toROC(log.timestamp, true)}</div>
              </div>
              {u && <span style={css.tag(ROLES[u.role].color)}>{ROLES[u.role].badge}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
export default function RentKeeperCollab() {
  const [data, setData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const pollRef = useRef(null);
  const msgCountRef = useRef({});
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    (async () => {
      const shared = await loadSharedData();
      if (shared) { setData(shared); }
      else { await saveSharedData(DEFAULT_DATA); setData(DEFAULT_DATA); }
    })();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    pollRef.current = setInterval(async () => {
      const shared = await loadSharedData();
      if (!shared) return;
      setData(prev => {
        (shared.rooms || []).forEach(room => {
          const msgs = room.messages || [];
          const prevCount = msgCountRef.current[room.id] ?? msgs.length;
          if (msgs.length > prevCount) {
            const newMsgs = msgs.slice(prevCount).filter(m => m.userId !== currentUser.id);
            newMsgs.forEach(m => {
              const notif = { id: uid(), roomId: room.id, roomName: room.communityName || room.name || "房源", senderName: m.userName, senderRole: m.userRole, text: m.text, timestamp: m.timestamp, read: false };
              setNotifications(n => [notif, ...n].slice(0, 50));
              setToast({ msg: `💬 ${m.userName}（${room.communityName || room.name}）：${m.text.slice(0, 30)}${m.text.length > 30 ? "…" : ""}`, type: "chat" });
              setTimeout(() => setToast(null), 4000);
            });
          }
          msgCountRef.current[room.id] = msgs.length;
        });
        return shared;
      });
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [currentUser]);

  // ── 每月1號自動備份（若超過30天未手動備份） ───────────
  const autoBackupDone = useRef(false);
  useEffect(() => {
    if (!data || !currentUser || currentUser.role !== "superadmin") return;
    if (autoBackupDone.current) return;
    const today = new Date();
    if (today.getDate() !== 1) return; // 只在每月1號觸發
    const lastTs = getLastBackupTs();
    if (lastTs) {
      const daysDiff = (today - new Date(lastTs)) / 86400000;
      if (daysDiff < 28) return; // 近30天內已備份
    }
    autoBackupDone.current = true;
    // 延遲執行，避免在 mount 時立刻觸發下載
    setTimeout(() => {
      const ts = new Date().toISOString();
      const snapshot = { ...data, _backupTime: ts, _rentkeeper: true };
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `RentKeeper_自動備份_${ts.slice(0, 10)}.json`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setLastBackupTs(ts);
      setData(d => {
        const updated = { ...d, activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: "系統自動備份（每月1號）", timestamp: ts }] };
        saveSharedData(updated);
        return updated;
      });
    }, 2000);
  }, [data, currentUser]);

  // ── 自動繳租提醒（每月繳租日自動發送對話室訊息） ──────
  const rentRemindDone = useRef(false);
  useEffect(() => {
    if (!data || !currentUser) return;
    if (rentRemindDone.current) return;
    const todayD  = new Date();
    const todayDay = todayD.getDate();
    const thisMonth = todayD.toISOString().slice(0, 7);
    const roomsToRemind = (data.rooms || []).filter(r =>
      r.autoRentRemind &&
      r.status === "rented" &&
      parseInt(r.rentDay || "5") === todayDay &&
      r.lastRentRemindMonth !== thisMonth
    );
    if (roomsToRemind.length === 0) return;
    rentRemindDone.current = true;
    const ts = new Date().toISOString();
    const reminderText = "本訊息為自動提醒，提醒您又到了匯租金的時間，麻煩您上傳匯款截圖，如已完成不須理會此訊息。";
    setData(d => {
      const updated = {
        ...d,
        rooms: d.rooms.map(r => {
          if (!roomsToRemind.find(x => x.id === r.id)) return r;
          const autoMsg = { id: uid(), userId: "system", userName: "系統", userRole: "system", text: reminderText, timestamp: ts, isSystem: true };
          return { ...r, messages: [...(r.messages || []), autoMsg], lastRentRemindMonth: thisMonth };
        }),
        activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: `自動發送 ${roomsToRemind.length} 間房源繳租提醒`, timestamp: ts }],
      };
      saveSharedData(updated);
      return updated;
    });
  }, [data, currentUser]);

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  const handleLogin = async (user) => {
    setCurrentUser(user);
    setData(d => {
      if (d?.rooms) d.rooms.forEach(r => { msgCountRef.current[r.id] = (r.messages || []).length; });
      const updated = { ...d, users: d.users.map(u => u.id === user.id ? { ...u, online: true } : u), activityLog: [...d.activityLog, { id: uid(), userId: user.id, action: "登入系統", timestamp: now() }] };
      saveSharedData(updated);
      return updated;
    });
    showToast(`歡迎，${user.name}！`);
  };

  const handleLogout = () => {
    setData(d => { const updated = { ...d, users: d.users.map(u => u.id === currentUser.id ? { ...u, online: false } : u) }; saveSharedData(updated); return updated; });
    setCurrentUser(null); setTab("dashboard"); setNotifications([]); msgCountRef.current = {};
  };

  const updateData = useCallback(async (fn) => {
    setSyncing(true);
    setData(prev => {
      const next = fn(prev);
      saveSharedData(next).then(() => { setSyncing(false); showToast("已儲存並同步"); });
      return next;
    });
  }, []);

  const handleReset = async () => {
    const baseline = await loadBaseline();
    const target = baseline || DEFAULT_DATA;
    await saveSharedData(target);
    setData(target); setCurrentUser(null); setTab("dashboard"); setShowReset(false);
  };

  const handleSaveBaseline = async () => {
    const snapshot = { ...data, users: data.users.map(u => ({ ...u, online: false })) };
    await saveBaseline(snapshot); await saveSharedData(snapshot);
    showToast("✅ 已儲存為預設版本！");
    updateData(d => ({ ...d, activityLog: [...d.activityLog, { id: uid(), userId: currentUser.id, action: "儲存當前狀態為系統預設基準", timestamp: now() }] }));
  };


  if (!data) return <div style={{ minHeight: "100vh", background: T.bgSub, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSub, fontFamily: "sans-serif", fontSize: 14 }}>載入中...</div>;
  if (!currentUser) return <LoginScreen users={data.users} tenants={data.tenants} onLogin={handleLogin} />;

  const role = ROLES[currentUser.role];
  const unpaidCount = data.bills.filter(b => b.status === "unpaid").length;
  const pendingRepairs = data.repairs.filter(r => r.status === "pending").length;

  const ALL_TABS = [
    { id: "dashboard", label: "總覽",  icon: "chart" },
    { id: "rooms",     label: "房源",  icon: "building" },
    { id: "tenants",   label: "房客",  icon: "users" },
    { id: "bills",     label: "帳務",  icon: "dollar", badge: unpaidCount },
    { id: "repairs",   label: "報修",  icon: "tool",   badge: pendingRepairs },
    { id: "report",    label: "報表",  icon: "file" },
    { id: "users",     label: "人員",  icon: "shield" },
    { id: "log",       label: "記錄",  icon: "activity" },
  ];
  const tabs = ALL_TABS.filter(t => role.pages.includes(t.id));
  const activeTab = role.pages.includes(tab) ? tab : tabs[0]?.id;

  return (
    <div style={{ minHeight: "100vh", background: T.bgSub, fontFamily: "'Noto Sans TC', 'PingFang TC', sans-serif", color: T.text, fontSize: 15 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} * { box-sizing: border-box; } select option{background:#fff;color:#111827;}`}</style>

      {/* Header */}
      <div style={{ background: T.bg, borderBottom: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Icon n="home" s={15} /></div>
          <span style={{ fontWeight: 800, fontSize: 13, color: T.text }}>家樂美房產管理顧問有限公司</span>
          {syncing && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber, animation: "pulse 1s infinite" }} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex" }}>
            {data.users.filter(u => u.online).map(u => <AvatarBadge key={u.id} user={u} size={26} />)}
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowNotifications(v => !v); setNotifications(n => n.map(x => ({ ...x, read: true }))); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, padding: 4, position: "relative" }}>
              <Icon n="bell" s={20} />
              {notifications.some(n => !n.read) && (
                <div style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, background: T.red, borderRadius: "50%", border: `2px solid ${T.bg}`, animation: "pulse 1.5s infinite" }} />
              )}
            </button>
          </div>
          <AvatarBadge user={{ ...currentUser, online: true }} size={28} />
          {role.canManageUsers && (
            <button onClick={() => setShowReset(true)} title="重置系統" style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, padding: 4 }}><Icon n="refresh" s={17} /></button>
          )}
          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, padding: 4 }}><Icon n="logout" s={18} /></button>
        </div>
      </div>

      {/* Notification panel */}
      {showNotifications && (
        <div style={{ position: "fixed", top: 52, right: 0, width: "min(320px, 100vw)", maxHeight: "60vh", background: T.bg, border: `1px solid ${T.border}`, borderRadius: "0 0 0 14px", zIndex: 300, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>🔔 對話通知</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {notifications.length > 0 && (
                <button onClick={() => setNotifications([])} style={{ background: "none", border: "none", color: T.textSub, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>清除全部</button>
              )}
              <button onClick={() => setShowNotifications(false)} style={{ background: "none", border: "none", color: T.textSub, cursor: "pointer" }}><Icon n="x" s={16} /></button>
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 28, textAlign: "center", color: T.textMuted, fontSize: 13 }}>目前沒有新通知</div>
            ) : notifications.map(n => {
              const msgRole = ROLES[n.senderRole];
              return (
                <div key={n.id} onClick={() => { setShowNotifications(false); setTab("rooms"); }}
                  style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: n.read ? "transparent" : T.accentBg }}
                  onMouseEnter={e => e.currentTarget.style.background = T.bgMuted}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : T.accentBg}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: msgRole?.color + "22", border: `1px solid ${msgRole?.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: msgRole?.color, flexShrink: 0 }}>
                      {n.senderName?.[0] || "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: T.text }}>
                        <span style={{ color: msgRole?.color, fontWeight: 600 }}>{n.senderName}</span>
                        <span style={{ color: T.textSub }}> 在 </span>
                        <span style={{ color: T.text, fontWeight: 600 }}>{n.roomName}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.textSub, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.text}</div>
                    </div>
                    {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, paddingLeft: 32 }}>{toROC(n.timestamp, true)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset confirm modal */}
      {showReset && (
        <Modal title="重置系統資料" onClose={() => setShowReset(false)} width={360}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.redBg, border: `2px solid ${T.red}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: T.red }}>
              <Icon n="refresh" s={22} />
            </div>
            <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>確定要重置所有資料？</div>
            <div style={{ color: T.textSub, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              這將清除所有房客、帳務、報修、人員資料，恢復成系統預設狀態。<br />
              <span style={{ color: T.red, fontWeight: 600 }}>此操作無法復原，請謹慎使用。</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowReset(false)} style={{ flex: 1, background: T.bgMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>取消</button>
              <button onClick={handleReset} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>確認重置</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Viewer banner */}
      {!role.canEdit && (
        <div style={{ background: T.bgMuted, borderBottom: `1px solid ${T.border}`, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon n="lock" s={14} />
          <span style={{ fontSize: 13, color: T.textSub }}>您目前為租客模式，僅能查看資料，無法編輯</span>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "16px 16px 160px", maxWidth: 640, margin: "0 auto" }}>
        {activeTab === "dashboard" && <Dashboard data={data} currentUser={currentUser} onUpdate={updateData} />}
        {activeTab === "rooms"     && <Rooms data={data} currentUser={currentUser} onUpdate={updateData} />}
        {activeTab === "tenants"   && <Tenants data={data} currentUser={currentUser} onUpdate={updateData} />}
        {activeTab === "bills"     && <Bills data={data} currentUser={currentUser} onUpdate={updateData} />}
        {activeTab === "repairs"   && <Repairs data={data} currentUser={currentUser} onUpdate={updateData} />}
        {activeTab === "report"    && <Report bills={data.bills} rooms={data.rooms} tenants={data.tenants} repairs={data.repairs} />}
        {activeTab === "users"     && <UserManagement data={data} currentUser={currentUser} onUpdate={updateData} />}
        {activeTab === "log"       && <ActivityLog data={data} currentUser={currentUser} onUpdate={updateData} />}
      </div>

      {/* Action bar（報表匯出 / 記錄匯出 / 儲存基準） */}
      {(role.canManageUsers || (role.canViewFinance && activeTab === "report") || (role.pages?.includes("log") && activeTab === "log")) && (
        <div style={{ position: "fixed", bottom: 62, left: 0, right: 0, zIndex: 199, padding: "0 16px 6px", display: "flex", gap: 10, maxWidth: 640, margin: "0 auto" }}>
          {activeTab === "report" ? (
            <button
              onClick={() => window.__rentkeeper_export?.()}
              style={{ flex: 1, background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "10px 8px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              📊 一鍵匯出 (Excel)
            </button>
          ) : activeTab === "log" ? (
            <button
              onClick={() => window.__rentkeeper_log_export?.()}
              style={{ flex: 1, background: T.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 8px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              📋 維修紀錄一鍵匯出
            </button>
          ) : role.canManageUsers ? (
            <button onClick={handleSaveBaseline} style={{ flex: 1, background: T.bg, color: T.accent, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 8px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Icon n="check" s={15} /> 修改並儲存
            </button>
          ) : null}
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.bg, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 16px", zIndex: 200 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: activeTab === t.id ? T.accent : T.textMuted, padding: "4px 6px", position: "relative", transition: "color 0.15s" }}>
            <Icon n={t.icon} s={20} />
            <span style={{ fontSize: 11, fontWeight: activeTab === t.id ? 700 : 500 }}>{t.label}</span>
            {t.badge > 0 && (
              <div style={{ position: "absolute", top: 0, right: 0, minWidth: 16, height: 16, background: T.red, color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{t.badge}</div>
            )}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

    </div>
  );
}
