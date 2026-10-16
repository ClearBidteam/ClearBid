import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["192.168.1.11"],
	experimental: {
		serverActions: {
			allowedOrigins: ["192.168.1.11:3000"],
			bodySizeLimit: "6mb",
		},
	},
};

export default nextConfig;