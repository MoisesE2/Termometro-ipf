// Configuração do PostCSS para Tailwind CSS v4
// Necessário para que o @import "tailwindcss" em `globals.css` seja processado
// e as classes utilitárias sejam geradas corretamente.

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;


