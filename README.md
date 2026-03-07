# 🛒 MerqueEnvios

**MerqueEnvios** is an online supermarket web application developed as a SENA technology project. It allows users to register, log in, and access a digital marketplace for grocery delivery.

---

## 📋 Features

- **User Registration** — Sign up with full name, age, date of birth, email, phone number, and a secure password.
- **User Login** — Authenticate with email and password using SHA-256 hashing via CryptoJS.
- **Password visibility toggle** — Show/hide password fields in both login and registration forms.
- **Form validation** — Client-side validation with descriptive error messages and accessible ARIA attributes.
- **Remember me** — Option to remember session on the login page.
- **Responsive design** — Mobile-friendly layout for all screen sizes.

---

## 🗂️ Project Structure

```
Merque-Envios/
├── login.html          # Login page
├── login.css           # Login page styles
├── login.js            # Login logic & validation
├── registro.html       # Registration page
├── registro.css        # Registration page styles
├── registro.js         # Registration logic & validation
├── logo_merqueenvios.jpg  # Brand logo
└── README.md
```

---

## 🚀 Getting Started

Since this is a pure front-end project, no installation is required.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Merque-Envios.git
   ```
2. Open `login.html` in your browser to start.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling & responsive layout |
| JavaScript (ES6+) | Form logic & validation |
| [CryptoJS 4.1.1](https://github.com/brix/crypto-js) | SHA-256 password hashing |

---

## 🔒 Security Notes

- Passwords are hashed client-side using **SHA-256** before any processing.
- `autocomplete` attributes are set appropriately for credential fields.
- Accessible error messages use `aria-describedby` and `aria-live` regions.

---

## 📚 Context

This project was built as part of the **SENA** (Servicio Nacional de Aprendizaje) technology program in Colombia.

---

## 📄 License

This project is for educational purposes only.
