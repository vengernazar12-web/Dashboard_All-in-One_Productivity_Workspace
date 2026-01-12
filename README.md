# 🧠 Dashboard App

A simple personal dashboard that lets you save and sync your todos, notes, code snippets and links across devices.

Built with **Vanilla JavaScript** and **Supabase**.

---

## ✨ Features

- User authentication (email + password)
- Cloud-synced data
- Todos (with hidden / archived items)
- Notes
- Code snippets
- Saved URLs
- Works on desktop and mobile

---

## 🧰 Editor features

- Auto-close brackets and quotes  
  `() [] {} "" '' `` `
- Tab inserts 2 spaces
- Ctrl `+` / `-` changes text size
- Cursor-aware editing

---

## 🗄 Data storage

Each user has one row in the `user_content` table:

```json
{
  "id": "auth.uid()",
  "content": {
    "todos": {},
    "notes": {},
    "codes": {},
    "urls": {}
  }
}
