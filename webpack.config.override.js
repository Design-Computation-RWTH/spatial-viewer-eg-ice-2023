const path = require("path");
const webpack = require("webpack");

module.exports = function overrideWebpackConfig(config) {
  return {
    ...config,
    resolve: {
      fullySpecified: false,
      fallback: {
        util: require.resolve("util/"),
      },
    },
    node: {
      global: true,
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV || "development"
        ),
        "process.env.BROWSER": JSON.stringify(true),
      }),
    ],
  };
};
