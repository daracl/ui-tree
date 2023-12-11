import domUtils from "src/util/domUtils";
import nodeUtils from "src/util/nodeUtils";
import DaraTree from "../DaraTree";

export default {
  expanderClick(treeContext: DaraTree, el: Element | string | NodeList) {
    domUtils.eventOn(el, "click", ".dt-expander", (e: Event, ele: Element) => {
      domUtils.toggleClass(nodeUtils.nodeLiElement(ele), "open");
    });
  },

  textClick(treeContext: DaraTree, el: Element | string | NodeList) {
    domUtils.eventOn(el, "click", ".dt-text-content", (e: Event, ele: Element) => {
      domUtils.removeClass(treeContext.mainElement.querySelectorAll(".dt-text-content"), "selected");
      domUtils.addClass(ele, "selected");

      const nodeInfo = nodeUtils.elementToTreeNode(ele, treeContext);

      if (treeContext.options.click) {
        treeContext.options.click.call(null, { node: nodeInfo, evt: e });
      }
    });
  },
};
