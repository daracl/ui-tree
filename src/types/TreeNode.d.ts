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

  isOpen: boolean;
  isLoaded: boolean;
  stateFolder: boolean;

  addChild: OptionCallback;

  move: OptionCallback;
  open: OptionCallback;
  close: OptionCallback;
  remove: OptionCallback;

  getChildLength: OptionCallback;
  click: OptionCallback;
  doubleClick: OptionCallback;

  setChildNodeDepth: OptionCallback;

  select: OptionCallback;
  focus: OptionCallback;

  folderToggle: OptionCallback;
  getParentNode : OptionCallback;
}
