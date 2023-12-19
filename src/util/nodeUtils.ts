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
   * text-content padding 값 구하기.
   *
   * @param depth {number}
   * @param daraTree {DataTree}
   * @returns padding value
   */
  textContentPadding(depth: number, daraTree: DaraTree): number {
    return daraTree.config.startPaddingLeft + (depth - 1) * daraTree.options.style.paddingLeft;
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
