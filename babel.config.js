module.exports = {
  "presets": [
    ["@babel/preset-env", { "useBuiltIns": "usage", "corejs": 3.6 }],
    "@babel/preset-react",
  ],
  "plugins": [
    ["prismjs", {
      "languages": ["javascript", "css", "markup"],
      "plugins": ["line-numbers"],
      "theme": "default",
      "css": true
    }],
  ]
}
