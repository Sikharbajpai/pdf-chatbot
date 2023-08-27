/** @type {import('next').NextConfig} */

const withImages = require("next-images");
const { NormalModuleReplacementPlugin } = require("webpack");
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withImages({
  env: {
    OPENAI_API_KEY: "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",
  },
  webpack: (config, { isServer }) => {
    config.externals["node:fs"] = "commonjs node:fs";

    config.plugins.push(
      new NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );
    config.module.rules.push({
      test: /\.(ogg|mp3|mp4|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve("url-loader"),
          options: {
            outputPath: `${isServer ? "../" : ""}static/images/`,
            name: "[name]-[hash].[ext]",
            esModule: config.esModule || false,
            limit: config.inlineImageLimit,
            fallback: require.resolve("file-loader"),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
          },
        },
      ],
    });
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
});
