require("esbuild")
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outdir: "./dist",
    platform: "node",
    loader: { ".ts": "ts" },
    minify: process.env.NODE_ENV !== "development",
    external: ["fs", "path", "util"],
  })
  .catch(() => process.exit(1));
