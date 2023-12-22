import Checkbox from "src/plugins/Checkbox";
import Dnd from "src/plugins/Dnd";
import Keydown from "src/plugins/Keydown";
import { TreeNode } from "./TreeNode";
import Ajax from "src/plugins/Ajax";

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
  ajax: Ajax;
  isFocus: boolean;
  isKeydown: boolean;
  isCheckbox: boolean;
  isDnd: boolean;
  isContextmenu: boolean;
  isEdit: boolean;
  isNodeDrag: boolean;
  isAjax: boolean;
}
