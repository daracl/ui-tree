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

  
  /**
   * root depth
   *
   * @type {number}
   */
  rootDepth: number;
  
  /**
   * root node info
   *
   * @type {TreeNode}
   */
  rootNode: TreeNode;
  
  /**
   * checkbox object
   *
   * @type {Checkbox}
   */
  checkbox: Checkbox;
  
  /**
   * dnd object
   *
   * @type {Dnd}
   */
  dnd: Dnd;
  
  /**
   * keydown object
   *
   * @type {Keydown}
   */
  keydown: Keydown;

  
  /**
   * search object
   *
   * @type {Search}
   */
  search:Search;
  
  /**
   * request object
   *
   * @type {Request}
   */
  request: Request;
  
  /**
   * tree focus in 중인지
   *
   * @type {boolean}
   */
  isFocus: boolean;

  
  /**
   * keydown plugin 활성화 여부
   *
   * @type {boolean}
   */
  isKeydown: boolean;

  
  /**
   * checkbox plugin 활성화 여부
   *
   * @type {boolean}
   */
  isCheckbox: boolean;
  
  /**
   * drag & drop plugin 활성화 여부
   *
   * @type {boolean}
   */
  isDnd: boolean;
  
  /**
   * 컨텍스트 메뉴 plugin 활성화 여부
   *
   * @type {boolean}
   */
  isContextmenu: boolean;
  
  /**
   * edit plugin 활성화 여부
   *
   * @type {boolean}
   */
  isEdit: boolean;
  /**
   * 검색 plugin 활성화 여부
   */
  isSearch :boolean;
  
  /**
   * drag 중인지 여부
   *
   * @type {boolean}
   */
  isNodeDrag: boolean;
  
  isRequest: boolean;
  
  /**
   * drag & drop mousedown 
   *
   * @type {boolean}
   */
  isDndMouseDown:boolean;
}
