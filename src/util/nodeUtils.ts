import { TreeNode } from "@t/TreeNode";
import DaraTree from "src/DaraTree";

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
   * node id 구하기.
   *
   * @param itemEle {Element} node
   * @returns nodeid
   */
  elementToTreeNode(itemEle: Element | null, treeContext: DaraTree) {
    if (itemEle == null) return;
    let nodeEle;
    if (itemEle.hasAttribute("data-node-id")) {
      nodeEle = itemEle;
    } else {
      nodeEle = this.nodeLiElement(itemEle);
    }

    return treeContext.config.allNode[nodeEle?.getAttribute("data-node-id") ?? ""];
  },
};
