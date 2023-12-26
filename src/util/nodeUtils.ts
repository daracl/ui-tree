import { TreeNode } from "@t/TreeNode";
import Tree from "src/Tree";

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
    return itemEle.closest("[data-node-id]");
  },

  nodeIdToElement(treeElement: Element, id: any): Element | null {
    return treeElement.querySelector(`[data-node-id="${id}"]`);
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
    if (itemEle.hasAttribute("data-node-id")) {
      nodeEle = itemEle;
    } else {
      nodeEle = this.nodeLiElement(itemEle);
    }

    return treeContext.config.allNode[nodeEle?.getAttribute("data-node-id") ?? ""];
  },

  getNodeIdx(childNodes: TreeNode[], id: any) {
    return childNodes.findIndex((element: any) => element.id == id);
  },

  getParameterNode(node: TreeNode) {
    return {
      id: node.id,
      pid: node.pid,
      text: node.text,
      depth: node.depth,
      origin: node.orgin,
    };
  },
};
