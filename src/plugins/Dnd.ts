import DaraTree from "../DaraTree";
import domUtils from "../util/domUtils";
import { TreeNode } from "@t/TreeNode";

/**
 * tree node drag & drop
 *
 * @export
 * @class Dnd
 * @typedef {Dnd}
 */
export default class Dnd {
  private daraTree;
  private dragHelper: HTMLElement;

  constructor(daraTree: DaraTree) {
    this.daraTree = daraTree;
    this.createHolderElement();
    this.initEvt();
  }
  createHolderElement() {
    const dragHelper = document.createElement("div");

    domUtils.setAttribute(dragHelper, { class: "drag-helper" });

    this.daraTree.mainElement.appendChild(dragHelper);

    this.dragHelper = dragHelper;
  }

  initEvt() {
    domUtils.eventOn(this.daraTree.mainElement, "mousedown", ".dt-node", (e: any, ele: Element) => {
      const evtTouche = e.touches;

      const startX = evtTouche && evtTouche[0] ? evtTouche[0].pageX : e.pageX,
        startY = evtTouche && evtTouche[0] ? evtTouche[0].pageY : e.pageY;

      console.log("awef", startX, startY);

      domUtils.eventOn(document, "dragstart", () => {
        this.dragHelper.textContent = "asdf";
        this.dragHelper.style.top = startY;
        this.dragHelper.style.left = startX;
        domUtils.addClass(this.dragHelper, "dt-drag");
        return false;
      });

      domUtils.eventOn(document, "touchmove mousemove", (e: any) => {
        this.mousemove(e);
      });

      domUtils.eventOn(document, "touchend mouseup", (e: any) => {
        this.mouseup(e);
        return false;
      });
      //this.daraTree.config.
    });
  }

  public mousemove(e: any) {
    console.log(1111);
  }

  public mouseup(e: any) {
    domUtils.removeClass(this.dragHelper, "dt-drag");
    domUtils.eventOff(document, "touchmove mousemove dragstart");
    domUtils.eventOff(document, "mouseup touchend mouseup");
  }
}

function _movesemove() {
  console.log(1111);
}
