import Tree from "./Tree";
import "../style/daracl.tree.scss";

// 1) ESM / CJS 라이브러리 export
export default Tree;
export { Tree };

// 2) 브라우저 전역에 등록 (데모 실행용)
declare global {
  interface Window {
    Daracl?: any;
  }
}

if (typeof window !== "undefined") {
  window.Daracl = window.Daracl || {};
  window.Daracl.tree = Tree;
}