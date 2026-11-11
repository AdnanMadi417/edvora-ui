// postcss-import inlines the @imports in src/styles/globals.css in order, so
// Tailwind sees one stylesheet. Tailwind v4 does this itself: replace this
// file's plugins with { '@tailwindcss/postcss': {} } (docs/tailwind-v4.md).
module.exports = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
