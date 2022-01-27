module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  plugins: [
    require("tailwindcss-font-inter"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography")
  ]
}
