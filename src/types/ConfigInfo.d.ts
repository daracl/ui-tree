import Checkbox from "src/plugins/Checkbox";
import Dnd from "src/plugins/Dnd";
import Keydown from "src/plugins/Keydown";

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
  keydown: Keydown;
  isFocus: boolean;
  isKeydown: boolean;
  isCheckbox: boolean;
  isDnd: boolean;
  isContextmenu: boolean;
  isEdit: boolean;
  isNodeDrag: boolean;
}
