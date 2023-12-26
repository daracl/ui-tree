import domUtils from "src/util/domUtils";
import nodeUtils from "src/util/nodeUtils";
import Tree from "../Tree";
import eventUtils from "src/util/eventUtils";

export default {
  expanderClick(treeContext: Tree, el: Element | string | NodeList) {
    eventUtils.eventOn(el, "click", ".dt-expander.visible", (e: Event, ele: Element) => {
      nodeUtils.elementToTreeNode(ele, treeContext).folderToggle();
      return false;
    });

    eventUtils.eventOn(treeContext.mainElement, "focusout", (e: Event, ele: Element) => {
      domUtils.removeClass(treeContext.mainElement.querySelectorAll(".dt-text-content.focus"), "focus");
      treeContext.config.focusNode = null;
    });
  },

  textClick(treeContext: Tree, el: Element | string | NodeList) {
    let clickCount = 0;
    let clickTimer: any;
    let clickDelay = 300;
    let clickNode: any = {};
    const resetClick = () => {
      clickCount = 0;
      clickNode = null;
    };

    // Function to wait for the next click
    const conserveClick = (node: any) => {
      clickNode = node;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(resetClick, clickDelay);
    };

    eventUtils.eventOn(el, "mousedown", ".dt-text-content", (e: MouseEvent, ele: Element) => {
      if (e.button === 2 || e.which === 3) {
        clickTimer = null;
        return true;
      }

      if (domUtils.isInputField((e.target as HTMLElement).tagName)) {
        return true;
      }

      const nodeInfo = nodeUtils.elementToTreeNode(ele, treeContext);

      if (!nodeInfo) return;

      if (clickCount > 0 && clickNode.id == nodeInfo.id) {
        nodeInfo.doubleClick(e);
        clearTimeout(clickTimer);
        resetClick();
        //console.log("doubleClick : ", clickCount);
      } else {
        ++clickCount;
        conserveClick(nodeInfo);
        nodeInfo.click(e);
      }

      //console.log("double Clicked!");
    });
  },
};
