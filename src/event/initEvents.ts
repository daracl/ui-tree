import domUtils from "src/util/domUtils";
import nodeUtils from "src/util/nodeUtils";
import DaraTree from "../DaraTree";

export default {
  expanderClick(treeContext: DaraTree, el: Element | string | NodeList) {
    domUtils.eventOn(el, "click", ".dt-expander", (e: Event, ele: Element) => {
      nodeUtils.elementToTreeNode(ele, treeContext).folderToggle();

      console.log("treeContext.config.isFocus : ", treeContext.config.isFocus);
      return false;
    });
  },

  textClick(treeContext: DaraTree, el: Element | string | NodeList) {
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

    domUtils.eventOn(el, "mousedown", ".dt-text-content", (e: MouseEvent, ele: Element) => {
      if (e.button === 2 || e.which === 3) {
        clickTimer = null;
        return true;
      }

      if (domUtils.isInputField((e.target as HTMLElement).tagName)) {
        return true;
      }

      const nodeInfo = nodeUtils.elementToTreeNode(ele, treeContext);

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

  keydown(treeContext: DaraTree) {
    domUtils.eventOn(document, "keydown", (e: any) => {
      if (!treeContext.config.isFocus) return;

      if (domUtils.isInputField((e.target as HTMLElement).tagName)) {
        return true;
      }

      if (e.metaKey || e.ctrlKey) {
        // copy
      }
    });
  },

  focus(treeContext: DaraTree) {
    domUtils.eventOn(treeContext.mainElement, "mousedown", (e: any) => {
      treeContext.config.isFocus = true;
      console.log("mousedown");
    });

    domUtils.eventOn(document, "blur", (e: any) => {
      const evtTarget = e.target as Element;
      const selectorEle = evtTarget.closest("#" + treeContext.getPrefix());

      console.log("blur ");

      if (!selectorEle) {
        treeContext.config.isFocus = false;
      }
    });
  },
};
