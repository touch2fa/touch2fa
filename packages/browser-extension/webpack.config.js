const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  devtool: "source-map", // Ensure no 'eval' is used
  entry: {
    background: "./src/background.ts",
    contentScript: "./src/contentScript.ts",
    popup: "./src/popup/popup.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@touch2fa/core": path.resolve(__dirname, "../core/src/"),
    },
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"), // May be needed for crypto-browserify
      vm: require.resolve("vm-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules|tests/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/manifest.json", to: "." },
        { from: "src/popup/popup.html", to: "." }, // Removed duplicate entry
      ],
    }),
  ],
};
