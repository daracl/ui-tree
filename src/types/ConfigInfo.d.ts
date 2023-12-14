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
  allNode: TreeNodeMap;
  selectedNode: any;
  completed: false;
  rootNodes: any[];
  checkbox: Checkbox;
  dnd: Dnd;

  isCheckbox: boolean;
  isDnd: boolean;
  isContextmenu: boolean;
  isEdit: boolean;
}
