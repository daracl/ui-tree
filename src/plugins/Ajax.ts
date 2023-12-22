import nodeUtils from "src/util/nodeUtils";
import Tree from "../Tree";
import domUtils from "../util/domUtils";
import { TreeNode } from "@t/TreeNode";
import { MOVE_POSITION } from "src/constants";
import eventUtils from "src/util/eventUtils";
import { ajax } from "src/util/ajaxUtils";

/**
 * ajax
 *
 * @class Ajax
 * @typedef {Ajax}
 */
export default class Ajax {
  private tree;
  private url: any;
  private opt: any;
  private successCallback: any;
  private errorCallback: any;
  private getParameter: any;
  private initFlag = false;

  constructor(tree: Tree) {
    this.tree = tree;

    if (!tree.config.isAjax) return;

    this.initFlag = true;

    const ajaxOpt = this.tree.options.plugins.ajax;

    this.url = ajaxOpt.url;

    delete ajaxOpt.url;

    this.successCallback = ajaxOpt.success || this.defaultSuccessCallback;
    this.errorCallback = ajaxOpt.error || this.defaultErrorCallback;
    this.getParameter = ajaxOpt.getParam || this.defaultGetParam;

    this.opt = ajaxOpt;
  }

  public search(node: TreeNode) {
    if (!this.initFlag) return;

    this.opt.data = this.getParameter(node);
    ajax(this.url.search, this.opt)
      .then((response) => {
        this.successCallback(response, "search");
      })
      .catch((error) => {
        this.errorCallback(error, "search");
      });
  }

  public create(node: TreeNode) {
    if (!this.initFlag && this.url.create) return;

    this.opt.data = this.getParameter(node);
    ajax(this.url.create, this.opt)
      .then((response) => {
        this.successCallback(response, "create");
      })
      .catch((error) => {
        this.errorCallback(error, "create");
      });
  }

  public modify(node: TreeNode) {
    if (!this.initFlag && this.url.modify) return;

    this.opt.data = this.getParameter(node);
    ajax(this.url.modify, this.opt)
      .then((response) => {
        this.successCallback(response, "modify");
      })
      .catch((error) => {
        this.errorCallback(error, "modify");
      });
  }

  public delete(node: TreeNode) {
    if (!this.initFlag && this.url.delete) return;

    this.opt.data = this.getParameter(node);
    ajax(this.url.delete, this.opt)
      .then((response) => {
        this.successCallback(response, "delete");
      })
      .catch((error) => {
        this.errorCallback(error, "delete");
      });
  }

  private defaultSuccessCallback(response: any) {
    this.tree.addNode(response);
  }

  private defaultErrorCallback(response: any) {
    this.tree.addNode(response);
  }

  private defaultGetParam(node: TreeNode) {
    return node;
  }
}
