# Dashboard App

A simple personal dashboard that lets you save and sync your todos, notes, code snippets and links across devices.

Built with Vanilla JavaScript and Supabase for backend storage and authentication.

---

## 🚀 Features

This project includes:

✨ **User authentication** (email + password)
☁️ Cloud-synced data with Supabase
📋 **Todos** (with hidden / archived items)
📝 **Notes**
🧠 **Code snippets** editor
🔗 **Saved URLs** manager
📱 Works on desktop and mobile screens

---

## 🔧 Getting Started

To run this project locally:

1. Clone the repository
   ```bash
   git clone https://github.com/vengernazar12-web/dashboard-js.git

🗃 Data Structure

Each authenticated user has one row in the Supabase user_content table:

{
  "id": "auth.uid()",
  "content": {
    "todos": {},
    "notes": {},
    "codes": {},
    "urls": {}
  }
}

🧰 Technologies Used

HTML5

CSS3

Vanilla JavaScript

Supabase (auth + database)

🧩 How to Use

After signing in:

Manage your daily todos

Write and save notes

Store favorite links

Add and edit your code snippets