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

  /**
   * node id 구하기.
   *
   * @param itemEle {Element} node
   * @returns nodeid
   */
  elementToNodeId(itemEle: Element): string {
    const nodeEle = this.nodeLiElement(itemEle);
    return nodeEle?.getAttribute("data-node-id") ?? "";
  },
};
