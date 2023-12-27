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
import Keydown from "./plugins/Keydown";
import Request from "./plugins/Request";

const defaultOptions = {
  style: {
    width: "",
    height: "",
    paddingLeft: 12,
  },
  rootNode: {
    id: "",
    text: "Root",
  },
  enableRootNode: false,
  itemKey: {
    id: "id",
    pid: "pid",
    text: "text",
    icon: "icon",
  },
  plugins: {
    keydown: {},
  },
  enableIcon: true,
  items: [],
  openDepth: 1,
  click: (nodeItem) => {},
  dblclick: (nodeItem) => {},
} as Options;

interface ComponentMap {
  [key: string]: Tree;
}

// all instance
const allInstance: ComponentMap = {};

// edit default option
const EDIT_DEFAULT_OPTIONS = {
  before: false,
  after: false,
};

/**
 * Tree class
 *
 * @class Tree
 * @typedef {Tree}
 */
export default class Tree {
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
      startPaddingLeft: this.options.enableRootNode ? this.options.style.paddingLeft : 0,
      rootDepth: this.options.enableRootNode ? 0 : 1,
      allNode: {},
      selectedNode: null,
      focusNode: null,
      isFocus: false,
      rootNode: {},
      isCheckbox: false,
      isDnd: !utils.isUndefined(this.options.plugins["dnd"]),
      isContextmenu: !utils.isUndefined(this.options.plugins["contextmenu"]),
      isEdit: false,
      isKeydown: !utils.isUndefined(this.options.plugins["keydown"]),
      isNodeDrag: false,
      isRequest: false,
    } as ConfigInfo;

    this.config.rootNode = new TreeNodeInfo(utils.objectMerge({}, this.options.rootNode), "$$root$$", this);
    this.config.allNode[this.config.rootNode.id] = this.config.rootNode;
    this.config.selectedNode = this.config.rootNode;

    if (this.options.plugins["edit"]) {
      this.config.isEdit = true;
      this.options.plugins["edit"] = utils.objectMerge({}, EDIT_DEFAULT_OPTIONS, this.options.plugins["edit"]);
    }

    this.config.request = new Request(this);
    this.config.checkbox = new Checkbox(this);
  }

  public init() {
    this.initEvt();
    this.request();
  }

  private initEvt() {
    if (this.config.isKeydown) {
      this.config.keydown = new Keydown(this);
    }

    treeEvent.expanderClick(this, this.mainElement);

    if (this.config.isDnd) {
      this.config.dnd = new Dnd(this);
    }

    treeEvent.textClick(this, this.mainElement);
  }

  public static setMessage(message: Message): void {
    Lanauage.set(message);
  }

  public request(id?: any) {
    const opts = this.options;

    if (this.config.isRequest) {
      id = !utils.isUndefined(id) ? id : this.config.rootNode.id;
      this.config.request.search(this.config.allNode[id]);
    } else if (utils.isArray(opts.items)) {
      this.addNode(opts.items);
    }
  }

  public refresh(id: any) {
    const refreshNode = this.config.allNode[id];

    if (!refreshNode) {
      throw new Error(`node not found : [${id}] `);
    }

    refreshNode.isLoaded = false;
    this.request(id);
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

    let firstFlag = true;
    let viewParentId = "";
    for (const node of nodeArr) {
      if (firstFlag) {
        if (node.id == this.config.rootNode.id) {
          viewParentId = node.id;
        } else {
          viewParentId = node.pid;
        }
        firstFlag = false;
      }
      this.treeGrid(node, parentId);
    }
    parentId = !utils.isUndefined(parentId) ? parentId : viewParentId;

    this.render(parentId);

    this.config.allNode[parentId]?.open();
  }

  public createNode(nodeInfo: any) {
    nodeInfo = nodeInfo ?? {};
    nodeInfo["_cud"] = "C";
    nodeInfo[this.options.itemKey.pid] = nodeInfo.pid ?? nodeInfo[this.options.itemKey.pid] ?? (this.config.selectedNode ? this.config.selectedNode.id : this.config.rootNode.id);
    nodeInfo[this.options.itemKey.id] = nodeInfo.id ?? nodeInfo[this.options.itemKey.id] ?? utils.generateUUID();
    nodeInfo[this.options.itemKey.text] = nodeInfo.text ?? nodeInfo[this.options.itemKey.text] ?? "New Node";

    this.config.request.create(nodeInfo);

    this.addNode(nodeInfo);
  }

  private treeGrid(node: any, parentId?: any) {
    const pid = parentId ?? node[this.options.itemKey.pid];
    const id = node[this.options.itemKey.id];

    if (this.config.rootNode.id === id) {
      this.config.rootNode.orgin = node;
      return;
    }

    if (utils.isBlank(this.config.rootNode.id)) {
      delete this.config.allNode[this.config.rootNode.id];
      this.config.rootNode.id = pid;
      this.config.allNode[this.config.rootNode.id] = this.config.rootNode;
    }

    const addNode = new TreeNodeInfo(node, pid, this);
    const parentNode = this.config.allNode[pid];

    if (parentNode) {
      parentNode.addChild(addNode);

      if (parentNode.checkState == CHECK_STATE.CHECKED) {
        addNode.checkState = CHECK_STATE.CHECKED;
      }
    } else {
      this.config.rootNode.addChild(addNode);
    }

    if (node.children && node.children.length > 0) {
      for (const childNode of node.children) {
        this.addNode(childNode);
      }
    }

    this.config.allNode[id] = addNode;
  }

  private render(id: any) {
    let renderParentNode;
    if (id === this.config.rootNode.id) {
      renderParentNode = this.config.rootNode;
      // init tree element
      this.mainElement.innerHTML = `<ul id="${this.prefix}" class="dt-container" tabindex="-1">
        ${this.getNodeTemplate([this.config.rootNode])}
        </ul>`;
    } else {
      if (utils.isBlank(id)) {
        return;
      }

      renderParentNode = this.config.allNode[id];

      const childNodeElemnt = this.mainElement.querySelector(`[data-node-id="${renderParentNode.id}"]>.dt-children`);
      if (childNodeElemnt) {
        childNodeElemnt.innerHTML = this.getNodeTemplate(renderParentNode.childNodes);
      }

      this.setNodeContent(renderParentNode);
    }

    this.config.checkbox.setNodeCheck(renderParentNode);
  }

  private setNodeContent(selectedNode: TreeNode) {
    const parentElement = this.mainElement.querySelector(`[data-node-id="${selectedNode.id}"]>.dt-node`);

    if (parentElement) {
      // 아이콘 활성화 일경우 아이콘 변경.
      if (this.options.enableIcon) {
        const iconElement = parentElement.querySelector("i.dt-icon");
        const icon = nodeUtils.getIcon(selectedNode);
        if (!domUtils.hasClass(iconElement, icon)) {
          domUtils.removeClass(iconElement, "dt-folder dt-file");
          domUtils.addClass(iconElement, icon);
        }
      }

      if (nodeUtils.isFolder(selectedNode) && parentElement.querySelector(".dt-expander.visible") == null) {
        // 폴더가 아닐 경우 폴더로 변경.
        domUtils.addClass(parentElement.querySelector(".dt-expander"), "visible");
      } else if (!nodeUtils.isFolder(selectedNode) && parentElement.querySelector(".dt-expander.visible")) {
        // 폴더일 경우 일반 노드로 변경.
        domUtils.removeClass(parentElement.querySelector(".dt-expander"), "visible");
      }
    }
    //parentElement.innerHTML = this.nodeContentHtml(selectedNode);
  }

  private getNodeTemplate(viewNodes: TreeNode[]): string {
    const treeHtml = [];
    viewNodes = viewNodes ?? this.config.rootNode.childNodes;
    const childNodeLength = viewNodes.length;

    let stylePaddingLeft = childNodeLength > 0 ? nodeUtils.textContentPadding(viewNodes[0].depth, this) : 0;

    for (let i = 0; i < childNodeLength; i++) {
      let treeNode = viewNodes[i];

      let childNodes = treeNode.childNodes;
      let openClass = "";
      if (treeNode.isOpen) {
        if (treeNode.getChildLength() > 0) {
          openClass = "open";
          treeNode.isOpen = true;
        } else {
          treeNode.isOpen = false;
        }
      }

      if (treeNode.depth == 0) {
        treeHtml.push(
          `<li data-node-id="${treeNode.id}" class="open">
              <div class="dt-node" style="display:${this.options.enableRootNode ? "inline" : "none"}">
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
            <ul class="dt-children">${treeNode.getChildLength() == 0 ? "" : this.getNodeTemplate(childNodes)}</ul>
          </li>`
        );
      }
    }

    return treeHtml.join("");
  }

  private nodeContentHtml(node: TreeNode) {
    return this.getExpandIconHtml(node) + this.getNodeNameHtml(node);
  }

  private getExpandIconHtml(node: TreeNode) {
    return `<i class="dt-expander ${nodeUtils.isFolder(node) ? "visible" : ""}"></i>`;
  }

  private getNodeNameHtml(node: TreeNode) {
    let iconHtml = "";

    if (this.options.enableIcon) {
      iconHtml = `<i class="dt-icon ${nodeUtils.getIcon(node)}"></i>`;
    }

    let checkboxHtml = "";
    if (this.config.isCheckbox) {
      checkboxHtml = `<label class="dt-checkbox"><span class="dt-icon checkbox"></span></label>`;
    }

    return `${checkboxHtml}<span class="dt-text-content">${iconHtml}<span>${node.text}</span></span>`;
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
   * Tree node 정보
   *
   * @param id {any} node id
   * @returns {TreeNode} 트리 노드 정보
   */
  public getNodeInfo = (id: any) => {
    return this.config.allNode[id];
  };

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
    this.config.rootNode.open(true);
  }

  /**
   * 전체 노드 닫기
   */
  public allClose() {
    this.config.rootNode.close(true);
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
    const node = this.config.allNode[id];

    if (node) {
      node.select();
    }
  }

  /**
   * 선택된 tree node 값 얻기.
   *
   * @returns {TreeNode} 선택된 tree node
   */
  public getSelectNode(): TreeNode | undefined {
    const selectElement = this.mainElement.querySelector(".selected");
    if (selectElement) {
      return nodeUtils.elementToTreeNode(selectElement, this);
    }
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
