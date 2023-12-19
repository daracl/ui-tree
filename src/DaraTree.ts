import { Options } from "@t/Options";
import { ConfigInfo } from "@t/ConfigInfo";
import utils from "./util/utils";
import treeEvent from "./event/initEvents";
import { Message } from "@t/Message";
import Lanauage from "./util/Lanauage";
import domUtils from "./util/domUtils";
import { TreeNode } from "@t/TreeNode";
import Checkbox from "./plugins/Checkbox";
import { CHECK_STATE } from "./constants";
import TreeNodeInfo from "./TreeNodeInfo";
import nodeUtils from "./util/nodeUtils";
import Dnd from "./plugins/Dnd";

const defaultOptions = {
  style: {
    width: "",
    height: "",
    paddingLeft: 12,
  },
  itemKey: {
    id: "id",
    pid: "pid",
    text: "text",
    icon: "icon",
  },
  plugins: {},
  enableIcon: true,
  items: [],
  openDepth: 1,
  click: (nodeItem) => {},
  dblclick: (nodeItem) => {},
} as Options;

interface ComponentMap {
  [key: string]: Daratree;
}

// all instance
const allInstance: ComponentMap = {};

// dnd default option
const dndDefaultOptions = {
  marginTop: 10,
  marginLeft: 10,
  inside: "last",
  drop: (item: any) => {},
  start: (item: any) => {},
};

/**
 * Daratree class
 *
 * @class Daratree
 * @typedef {Daratree}
 */
export default class Daratree {
  public options;

  private orginStyle;
  private orginStyleClass;

  private selector: string;

  private prefix: string;

  public mainElement: HTMLElement;

  public config: ConfigInfo;

  constructor(selector: string, options: Options, message: Message) {
    const mainElement = document.querySelector<HTMLElement>(selector);
    if (!mainElement) {
      throw new Error(`${selector} tree selector not found`);
    }

    this.options = utils.objectMerge({}, defaultOptions, options);

    this.orginStyleClass = mainElement.className;
    mainElement.classList.add("dara-tree");

    if (this.options.style) {
      let style = [];

      let addStyle = (this.orginStyle = mainElement.getAttribute("style")) || "";
      if (this.options.style.width) {
        addStyle = addStyle.replace(/(width:).+?(;[\s]?|$)/g, "");

        style.push(`width:${this.options.style.width};`);
      }
      if (this.options.style.height) {
        addStyle = addStyle.replace(/(height:).+?(;[\s]?|$)/g, "");

        style.push(`height:${this.options.style.height};`);
      }

      style.push(addStyle ? addStyle + ";" : "");

      mainElement.setAttribute("style", style.join(""));
    }

    this.selector = selector;
    this.mainElement = mainElement;

    this.prefix = "dt" + utils.getHashCode(selector);

    this.initConfig();

    this.init();

    allInstance[selector] = this;
  }

  private initConfig() {
    this.config = {
      startPaddingLeft: this.options.topMenuView ? this.options.style.paddingLeft : 0,
      allNode: {},
      selectedNode: null,
      isFocus: false,
      rootNodes: [] as any[],
      isCheckbox: !utils.isUndefined(this.options.plugins["checkbox"]),
      isDnd: false,
      isContextmenu: !utils.isUndefined(this.options.plugins["contextmenu"]),
      isEdit: !utils.isUndefined(this.options.plugins["edit"]),
      isNodeDrag: false,
    } as ConfigInfo;

    if (!utils.isUndefined(this.options.plugins["dnd"])) {
      this.config.isDnd = true;
      this.options.plugins["dnd"] = utils.objectMerge({}, dndDefaultOptions, this.options.plugins["dnd"]);

      this.config.dndLinePadding = (this.config.isCheckbox ? 24 : 0) + (this.options.enableIcon ? 23 : 0);
      this.config.dndLinePadding = this.config.dndLinePadding == 0 ? 20 : this.config.dndLinePadding;
    }
  }

  public init() {
    this.request();
    this.initEvt();
  }

  private initEvt() {
    treeEvent.focus(this);

    treeEvent.expanderClick(this, this.mainElement);

    if (this.config.isDnd) {
      this.config.dnd = new Dnd(this);
    }

    if (this.config.isCheckbox) {
      this.config.checkbox = new Checkbox(this);
    }

    treeEvent.textClick(this, this.mainElement);
  }

  public static setMessage(message: Message): void {
    Lanauage.set(message);
  }

  public request() {
    const opts = this.options;

    const callbackResponse = (items: any[]) => {
      this.addNode(items);
    };

    if (utils.isFunction(opts.source)) {
      opts.source(this.config.selectedNode, callbackResponse);
    } else if (utils.isArray(opts.items)) {
      this.addNode(opts.items);
    }
  }

  public refresh(id: any) {
    this.render(id);
  }

  /**
   * tree node 추가.
   *
   * @param nodeItem {object|array} add node items
   * @param parentId {any} parent id
   * @param options {Object} add options
   */
  public addNode(nodeItem: any[] | any, parentId?: any, options?: any) {
    let nodeArr = [];
    if (!utils.isArray(nodeItem)) {
      nodeArr.push(nodeItem);
    } else {
      nodeArr = nodeItem;
    }

    for (const node of nodeArr) {
      this.treeGrid(node, parentId);
    }

    this.render(parentId);
  }

  public createNode(nodeInfo: any) {
    nodeInfo = nodeInfo ?? {};
    nodeInfo["_cud"] = "C";
    nodeInfo[this.options.itemKey.pid] = nodeInfo.pid ?? nodeInfo[this.options.itemKey.pid] ?? (this.config.selectedNode ? this.config.selectedNode.id : "");
    nodeInfo[this.options.itemKey.id] = nodeInfo.id ?? nodeInfo[this.options.itemKey.id] ?? utils.generateUUID();
    nodeInfo[this.options.itemKey.text] = nodeInfo.text ?? nodeInfo[this.options.itemKey.text] ?? "New Node";

    this.addNode(nodeInfo);
  }

  private treeGrid(node: any, parentId?: any) {
    const pid = parentId ?? node[this.options.itemKey.pid];
    const id = node[this.options.itemKey.id];

    const addNode = new TreeNodeInfo(node, pid, this);
    const parentNode = this.config.allNode[pid];

    if (parentNode) {
      parentNode.addChild(addNode);

      if (parentNode.checkState == CHECK_STATE.CHECKED) {
        addNode.checkState = CHECK_STATE.CHECKED;
      }
    } else {
      this.config.rootNodes.push(addNode);
    }

    if (node.childNodes && node.childNodes.length > 0) {
      for (const childNode of node.childNodes) {
        this.addNode(childNode);
      }
    }

    this.config.allNode[id] = addNode;
  }

  private render(id?: any) {
    if (utils.isBlank(id) && this.config.selectedNode == null) {
      // init load
      this.mainElement.innerHTML = `<ul id="${this.prefix}" class="dt-container">
        ${this.getNodeTemplate(this.config.rootNodes)}
        </ul>`;
    } else {
      let selectedNode = this.config.allNode[id] ?? this.config.selectedNode;

      const childNodeElemnt = this.mainElement.querySelector(`[data-node-id="${selectedNode.id}"]>.dt-children`);
      if (childNodeElemnt) {
        childNodeElemnt.innerHTML = this.getNodeTemplate(selectedNode.childNodes);
      }

      const parentElement = this.mainElement.querySelector(`[data-node-id="${selectedNode.id}"]>.dt-node`);
      if (parentElement) {
        parentElement.innerHTML = this.nodeContentHtml(selectedNode);
        this.setSelectNode(selectedNode.id);
      }
    }
  }

  private getNodeTemplate(viewNodes: TreeNode[]): string {
    const treeHtml = [];
    viewNodes = viewNodes ?? this.config.rootNodes;
    const childNodeLength = viewNodes.length;

    const openDepth = this.options.openDepth;

    let stylePaddingLeft = childNodeLength > 0 ? nodeUtils.textContentPadding(viewNodes[0].depth, this) : 0;

    for (let i = 0; i < childNodeLength; i++) {
      let treeNode = viewNodes[i];

      let childNodes = treeNode.childNodes;

      const openClass = openDepth == -1 || openDepth >= treeNode.depth ? "open" : "";

      if (treeNode.depth == 0) {
        treeHtml.push(
          `<li data-node-id="${treeNode.id}" class="open">
              <div class="dt-node" style="display:${this.options.topMenuView ? "inline" : "none"}">
                ${this.nodeContentHtml(treeNode)}
              </div>
              <ul id="c_${treeNode.id}" class="dt-children">${this.getNodeTemplate(childNodes)}</ul>
            </li>`
        );
      } else {
        treeHtml.push(
          `<li data-node-id="${treeNode.id}" class="${openClass}">
            <div class="dt-node" style="padding-left:${stylePaddingLeft}px" draggable="true">
              ${this.nodeContentHtml(treeNode)}
            </div>
            <ul class="dt-children">${treeNode.childLength() == 0 ? "" : this.getNodeTemplate(childNodes)}</ul>
          </li>`
        );
      }
    }

    return treeHtml.join("");
  }

  private nodeContentHtml(tNode: TreeNode) {
    return this.getExpandIconHtml(tNode) + this.getNodeNameHtml(tNode);
  }

  private getExpandIconHtml(tNode: TreeNode) {
    return `<i class="dt-expander ${tNode.childLength() > 0 ? "visible" : ""}"></i>`;
  }

  private getNodeNameHtml(tNode: TreeNode) {
    let icon = tNode.icon;
    let iconHtml = "";
    if (utils.isBlank(icon)) {
      icon = tNode.childLength() == 0 ? "dt-file" : "dt-folder";
      if (this.options.enableIcon) {
        iconHtml = `<i class="dt-icon ${icon}"></i>`;
      }
    } else {
      iconHtml = `<i class="dt-icon ${icon}"></i>`;
    }

    let checkboxHtml = "";
    if (this.config.isCheckbox) {
      checkboxHtml = `<label class="dt-checkbox"><span class="dt-icon checkbox"></span></label>`;
    }

    return `${checkboxHtml}<a href ="javascript:" class="dt-text-content">${iconHtml}<span>${tNode.text}</span></a>`;
  }

  public getPrefix() {
    return this.prefix;
  }

  /**
   * 설정 옵션 얻기
   */
  public getOptions = () => {
    return this.options;
  };

  /**
   * set items
   * @param items {array} items
   */
  public setItems(items: any[]) {
    this.options.items = items;
  }

  public static instance(selector?: string) {
    if (utils.isUndefined(selector) || utils.isBlank(selector)) {
      const keys = Object.keys(allInstance);
      if (keys.length > 1) {
        throw new Error(`selector empty : [${selector}]`);
      }
      selector = keys[0];
    }

    return allInstance[selector];
  }

  public destroy = () => {
    domUtils.setAttribute(this.mainElement, { class: this.orginStyleClass, style: this.orginStyle });
    this.mainElement.replaceChildren();

    for (const key in this) {
      if (utils.hasOwnProp(this, key)) {
        delete this[key];
        delete allInstance[this.selector];
      }
    }
  };

  /**
   * check 아이템 얻기
   *
   * @returns check tree nodes
   */
  public getCheckValues() {
    return this.config.checkbox.getCheckValues();
  }

  /**
   * 전체 노드 열기
   */
  public allOpen() {
    for (const node of this.config.rootNodes) {
      node.open(true);
    }
  }

  /**
   * 전체 노드 닫기
   */
  public allClose() {
    for (const node of this.config.rootNodes) {
      node.close(true);
    }
  }

  /**
   * 트리 노드 정보 얻기
   *
   * @param id tree id
   * @returns  tree node 정보
   */
  public getNodes(id: any): TreeNode {
    return this.config.allNode[id];
  }

  /**
   * 노드 선택하기
   *
   * @param id tree id
   */
  public setSelectNode(id: any) {
    domUtils.removeClass(this.mainElement.querySelectorAll(".dt-text-content"), "selected");

    const nodeElement = nodeUtils.nodeIdToElement(this.mainElement, id);

    if (nodeElement) {
      this.config.selectedNode = this.config.allNode[id];
      domUtils.addClass(nodeElement.querySelector(".dt-text-content"), "selected");
    }
  }

  /**
   * 선택된 tree node 값 얻기.
   *
   * @returns {TreeNode} 선택된 tree node
   */
  public getSelectNode(): TreeNode {
    return nodeUtils.elementToTreeNode(this.mainElement.querySelector(".selected"), this);
  }

  /**
   *
   * @returns {TreeNode[]} check된 tree node 값
   */
  public getCheckNodes(): TreeNode[] {
    return this.config.checkbox.getCheckValues();
  }

  /**
   * 노드 삭제 하기.
   *
   * @param id tree node id
   * @returns 삭제된 노드 값
   */
  public remove(...ids: any[]) {
    const reval = [];
    for (const id of ids) {
      const removeNode = this.config.allNode[id];

      if (removeNode) {
        reval.push(removeNode.remove());
      } else {
        reval.push(`id not found [${id}]`);
      }
    }
    return reval;
  }
}
