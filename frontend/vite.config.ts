import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
    plugins: [vue()],
    build: {
        sourcemap: false,
        minify: "terser",
        terserOptions: {
            compress: {
                defaults: true,
                passes: 2,
                drop_debugger: true,
                drop_console: true,
                dead_code: true,
                unused: true,
                side_effects: true,
                conditionals: true,
                comparisons: true,
                evaluate: true,
                booleans: true,
                sequences: true,
                join_vars: true,
                collapse_vars: true,
                reduce_vars: true,
                reduce_funcs: true,
                hoist_funs: true,
                inline: true,
                switches: true
            },
            mangle: {
                properties: false,
                toplevel: true
            },
            keep_fnames: false,
            keep_classnames: false,
            format: {
                comments: false,
                beautify: false
            },
        },
    }
})
