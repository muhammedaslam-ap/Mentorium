/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all JS/TS files in src
    "./components/**/*.{js,jsx,ts,tsx}", // Include components directory
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#f0fdfa",
          500: "#14b8a6",
          950: "#042f2e",
        },
        violet: {
          50: "#f5f3ff",
          500: "#8b5cf6",
          950: "#2e1065",
        },
        red: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
          950: "#450a0a",
        },
      },
    },
  },
  plugins: [],
  darkMode: "class", // Enable dark mode for dark:* classes
}

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { 50: "#f0fdfa", 500: "#14b8a6", 950: "#042f2e" },
        violet: { 50: "#f5f3ff", 500: "#8b5cf6", 950: "#2e1065" },
        red: { 50: "#fef2f2", 500: "#ef4444", 600: "#dc2626", 950: "#450a0a" },
      },
      animation: {
        "fade-in": "animate__fadeIn 0.5s ease-out",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

