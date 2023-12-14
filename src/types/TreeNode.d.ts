export interface OptionCallback {
  (...params: any[]): any;
}

export interface TreeNode {
  id: string | number;
  pid: string | number;
  text: string;
  url?: string;
  checkState?: number;
  target?: string;
  icon?: string;
  depth: number;
  childNodes: TreeNode[];
  orgin: any;
  _cud: "C" | "U" | "D";

  moveChild: OptionCallback;
  open: OptionCallback;
  close: OptionCallback;
  remove: OptionCallback;

  childLength: OptionCallback;
  click: OptionCallback;
  doubleClick: OptionCallback;
}
