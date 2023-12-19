import Checkbox from "src/plugins/Checkbox";
import Dnd from "src/plugins/Dnd";

export interface OptionCallback {
  (...params: any[]): any;
}

interface TreeNodeMap {
  [key: string | number]: TreeNode;
}

/**
 * options
 */
export interface ConfigInfo {
  startPaddingLeft: number;
  dndLinePadding: number;
  allNode: TreeNodeMap;
  selectedNode: any;
  completed: false;
  rootNodes: any[];
  checkbox: Checkbox;
  dnd: Dnd;
  isFocus: boolean;

  isCheckbox: boolean;
  isDnd: boolean;
  isContextmenu: boolean;
  isEdit: boolean;
  isNodeDrag: boolean;
}
