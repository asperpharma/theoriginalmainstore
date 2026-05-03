import autoprefixer from "autoprefixer";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const originalParse = postcss.parse;
if (!originalParse.__patchedForFrom) {
  postcss.parse = (css, opts = {}) =>
    originalParse(css, { from: opts?.from ?? "tailwind.css", ...opts });
  postcss.parse.__patchedForFrom = true;
}

const ensureSourceFile = () => ({
  postcssPlugin: "ensure-source-file",
  // Tailwind generates rules from strings, which can leave declarations without a source file.
  // Add a stable fallback so downstream plugins (e.g. Vite URL rewriter) have a file path.
  OnceExit(root) {
    const shouldLog = process.env.DEBUG_POSTCSS_SOURCE === "1";
    let patched = 0;
    root.walkDecls((decl) => {
      const input = decl.source?.input;
      if (input && !input.file) {
        input.file = "tailwind.css";
        patched += 1;
      } else if (!input) {
        // postcss types allow populating a minimal source input object
        decl.source = { input: { file: "tailwind.css" } };
        patched += 1;
      }
    });
    if (shouldLog) {
      // eslint-disable-next-line no-console -- debug hook when env is set
      console.log(`[postcss] ensure-source-file patched ${patched} declarations`);
    }
    if (shouldLog && patched === 0) {
      // eslint-disable-next-line no-console -- debug hook when env is set
      console.log("[postcss] ensure-source-file found no declarations without a file");
    } else if (shouldLog) {
      const maybeTotal = Array.from(root.nodes ?? []).length;
      if (Number.isFinite(maybeTotal)) {
        // eslint-disable-next-line no-console -- debug hook when env is set
        console.log(`[postcss] root nodes inspected: ${maybeTotal}`);
      }
    }
  },
});
ensureSourceFile.postcss = true;

export default {
  plugins: [ensureSourceFile(), tailwindcss(), autoprefixer()],
  // Explicitly set `from` to silence PostCSS warnings about missing source paths
  options: {
    from: undefined,
  },
};
