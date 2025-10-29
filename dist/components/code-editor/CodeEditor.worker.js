import o from "../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js";
import e from "../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js";
import p from "../../node_modules/monaco-editor/esm/vs/language/css/css.worker.js";
import n from "../../node_modules/monaco-editor/esm/vs/language/html/html.worker.js";
import t from "../../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js";
self.MonacoEnvironment = {
  getWorker(m, r) {
    return r === "json" ? new e() : r === "css" || r === "scss" || r === "less" ? new p() : r === "html" || r === "handlebars" || r === "razor" ? new n() : r === "typescript" || r === "javascript" ? new t() : new o();
  }
};
