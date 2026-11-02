/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```[cite: 1]

### 2. `postcss.config.js` file banayein
Usi root folder mein aik aur file banayein jiska naam **`postcss.config.js`** ho, aur uske andar yeh code paste kar dein[cite: 1]:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```[cite: 1]

### 3. Terminal mein push kar dein
Files banane ke baad terminal mein yeh commands run kar ke changes ko GitHub par push kar dein:

```bash
cd university-books-platform
git add .
git commit -m "Add missing tailwind and postcss config files for styling"
git push origin main