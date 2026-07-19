/** @type {import('next').NextConfig} */
const nextConfig = {};

const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();

module.exports = nextConfig;
