import { TreeNode } from "./TreeNode";

export interface OptionCallback {
  (...params: any[]): any;
}


/**
 * options
 */
export interface Options {
  style: {
    width: string|number;
    height: string|number;
    paddingLeft: number;
  };

  /**
   * 노드 행 선택할지 여부 default false
   * 
   * false : node name select
   * true : node row select
   */
  selectOnWholeRow:boolean; 
  
  /**
   * 다중선택 여부
   *
   * @type {boolean}
   */
  multiple?: boolean;
  
  /**
   * root node info
   *
   * @type {*}
   */
  rootNode: any;
  enableIcon?: boolean;
  /**
   * root node 활성화 여부
   */
  enableRootNode?: boolean;
  // node style class
  nodeStyleClass?:OptionCallback;
  
  /**
   * tree item key
   *
   * @type {{
   *     id: string;
   *     pid: string;
   *     text: string;
   *     icon: string;
   *   }}
   */
  itemKey: {
    id: string;
    pid: string;
    text: string;
    icon: string;
  };
  plugins?: Plugins;
  items: Array;
  openDepth: number;
  click: OptionCallback | undefined; // click callback
  dblclick: OptionCallback | undefined; // double click callback
  getIcon: OptionCallback | undefined; // node icon class
  selectNode: OptionCallback | undefined; // node 선택시 이벤트
  focusNode: OptionCallback | undefined; // node focus 이벤트
}


/**
 * tree plugin option
 *
 * @export
 * @interface Plugins
 * @typedef {Plugins}
 */
export interface Plugins {
  checkbox?: CheckboxOptions;
  dnd?: DndOptions;
  edit?: EditOptions;
  contextmenu?: any;
  keydown?: KeydownOptions;
  search?:SearchOptions;
  request: {
    url:
      | string
      | {
          create: ""; // 생성시 url
          search: ""; // 목록 url
          modify: ""; // 수정 url
          delete: ""; // 삭제 url
        };
    headers: any; // header 값
    success: OptionCallback; // success 메소드
    error: OptionCallback; // 에러 콜백 메소드
    getParam: OptionCallback; // 파라미터 메소드
  };
}

/**
 * edit plugin options
 */
export interface EditOptions{

  width: string;
  before: OptionCallback;
  after: OptionCallback;  
}

/**
 * checkbox option
 *
 * @export
 * @interface CheckboxOption
 * @typedef {CheckboxOption}
 */
export interface CheckboxOptions{

}

/**
 * drag and drop option
 *
 * @export
 * @interface DndOptions
 * @typedef {DndOptions}
 */
export interface DndOptions{
  
  /**
   * drag helper margin top
   *
   * @type {number}
   */
  marginTop :number;

  /**
   * drag helper margin left
   *
   * @type {number}
   */
  marginLeft: 10,
  
  /**
   * add postion
   *
   * @type {('last'|'first')} 
   */
  inside: 'last'|'first',

  /**
   * drag object drop callback 
   *
   * @type {(item: any) => {}}
   */
  drop: OptionCallback;

  
  /**
   * drag start callback
   *
   * @type {OptionCallback}
   */
  start:OptionCallback;
}


/**
 * keydown option
 *
 * @export
 * @interface KeydownOption
 * @typedef {KeydownOption}
 */
export interface KeydownOptions{

}

/**
 * search option
 *
 * @export
 * @interface SearchOptions
 * @typedef {SearchOptions}
 */
export interface SearchOptions{
  callback: SearchCallback;
}


export interface SearchCallback {
  (searchText:string, node:TreeNode): boolean;
}