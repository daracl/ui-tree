import Checkbox from "src/plugins/Checkbox";
import Dnd from "src/plugins/Dnd";
import Keydown from "src/plugins/Keydown";
import { TreeNode } from "./TreeNode";
import Request from "src/plugins/Request";
import { Search } from "src/plugins/Search";

export interface OptionCallback {
  (...params: any[]): any;
}

interface TreeNodeMap {
  [key: string | number]: TreeNodeInfo;
}

/**
 * options
 */
export interface ConfigInfo {
  startPaddingLeft: number;
  dndLinePadding: number;
  allNode: TreeNodeMap;
  selectedNode: any;
  focusNode: any;
  completed: false;
  rootDepth: number;
  rootNode: TreeNode;
  checkbox: Checkbox;
  dnd: Dnd;
  keydown: Keydown;
  search:Search;
  request: Request;
  isFocus: boolean;
  isKeydown: boolean;
  isCheckbox: boolean;
  isDnd: boolean;
  isContextmenu: boolean;
  isEdit: boolean;
  isSearch :boolean;
  isNodeDrag: boolean;
  isRequest: boolean;
}
