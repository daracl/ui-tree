import { TreeNode } from "@t/TreeNode";
import Tree from "src/Tree";
import utils from "./utils";

export default {
  /**
   * value 구하기.
   *
   * @param itemEle {Element} value를 구할 element
   */
  itemValue(itemEle: Element): string | null {
    return itemEle.getAttribute("data-val");
  },
  nodeLiElement(itemEle: Element): Element | null {
    return itemEle.closest("[data-dt-id]");
  },

  nodeIdToElement(treeElement: Element, id: any): Element | null {
    return treeElement.querySelector(`[data-dt-id="${id}"]`);
  },

  
  /**
   * node title element
   *
   * @param {Element} treeElement main tree element
   * @param {*} id node id  
   * @returns {(Element | null)} node title element
   */
  nodeIdToNodeTitleElement(treeElement: Element, id: any): Element | null {
    return treeElement.querySelector(`[data-dt-id="${id}"]>.dt-node>.dt-node-title`);
  },


  /**
   * text-content padding 값 구하기.
   *
   * @param depth {number}
   * @param tree {DataTree}
   * @returns padding value
   */
  textContentPadding(depth: number, tree: Tree): number {
    return tree.config.startPaddingLeft + (depth - 1) * tree.options.style.paddingLeft;
  },

  /**
   * node id 구하기.
   *
   * @param itemEle {Element} node
   * @returns nodeid
   */
  elementToTreeNode(itemEle: Element, treeContext: Tree): TreeNode {
    let nodeEle;
    if (itemEle.hasAttribute("data-dt-id")) {
      nodeEle = itemEle;
    } else {
      nodeEle = this.nodeLiElement(itemEle);
    }

    return treeContext.config.allNode[nodeEle?.getAttribute("data-dt-id") ?? ""];
  },

  getNodeIdx(childNodes: TreeNode[], id: any) {
    return childNodes.findIndex((element: any) => element.id == id);
  },

  /**
   *
   * @param node {TreeNode} tree node
   * @returns {Object} tree 정보
   */
  getParameterNode(node: TreeNode) {
    return {
      id: node.id,
      pid: node.pid,
      text: node.text,
      depth: node.depth,
      origin: node.orgin,
    };
  },

  /**
   * 폴더 여부
   *
   * @param node {TreeNode} tree node
   * @returns {boolean} 폴더 = true , false
   */
  isFolder(node: TreeNode) {
    return node.stateFolder === true || node.getChildLength() > 0;
  },

  /**
   * 아이콘
   *
   * @param node {TreeNode} tree node
   * @returns {string} icon
   */
  getIcon(node: TreeNode): string {
    let icon = node.icon;

    if (utils.isBlank(icon)) {
      return this.isFolder(node) ? "dt-folder" : "dt-file";
    } else {
      return icon ?? "dt-file";
    }
  },
};
