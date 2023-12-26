import Tree from "../Tree";
import { TreeNode } from "@t/TreeNode";
import { ajax } from "src/util/ajaxUtils";
import domUtils from "src/util/domUtils";
import nodeUtils from "src/util/nodeUtils";
import utils from "src/util/utils";

const AJAX_DEFAULT_OPTIONS = {
  url: { search: "" },
  beforesend: _beforesend,
  completed: _completed,
};

function _beforesend(opts: any) {
  const node = opts.$node;

  let nodeElement;
  if (node) {
    nodeElement = opts.$mainElement.querySelector(`[data-node-id="${node.id}"] > .dt-node`) as HTMLElement;
  }

  if (!nodeElement) {
    nodeElement = opts.$mainElement;
  }

  domUtils.append(nodeElement, '<div class="dt-loader"><div class="spinner"></div></div>');
}

function _completed(result: any) {
  const opts = result.options;
  const node = opts.$node;

  let nodeElement;

  if (node) {
    nodeElement = opts.$mainElement.querySelector(`[data-node-id="${node.id}"] > .dt-node`) as HTMLElement;
  }

  if (!nodeElement) {
    nodeElement = opts.$mainElement;
  }

  nodeElement.querySelector(".dt-loader")?.remove();
}

/**
 * ajax
 *
 * @class Ajax
 * @typedef {Ajax}
 */
export default class Ajax {
  private tree;
  private url: any;
  private opts: any;
  private successCallback: any;
  private errorCallback: any;
  private getParameter: any;
  private initFlag = false;

  constructor(tree: Tree) {
    this.tree = tree;

    if (utils.isUndefined(tree.options.plugins.ajax)) {
      return;
    }

    const ajaxOpt = tree.options.plugins.ajax;
    tree.config.isAjax = true;

    this.initFlag = true;
    let opts: any;

    if (utils.isString(ajaxOpt)) {
      opts = utils.objectMerge({}, AJAX_DEFAULT_OPTIONS, { url: { search: ajaxOpt } });
    } else if (utils.isString(ajaxOpt?.url)) {
      opts = utils.objectMerge({}, AJAX_DEFAULT_OPTIONS, { url: { search: ajaxOpt?.url } });
    } else {
      opts = utils.objectMerge({}, AJAX_DEFAULT_OPTIONS, ajaxOpt);
    }

    opts.$mainElement = tree.mainElement;
    this.url = opts.url;

    this.successCallback = opts.success || this.defaultSuccessCallback;
    this.errorCallback = opts.error || this.defaultErrorCallback;
    this.getParameter = opts.getParam || this.defaultGetParam;
    this.opts = opts;
  }

  public search(node: TreeNode) {
    if (!this.initFlag) return;

    node.isLoaded = true;

    console.log("node.isLoaded ", node.isLoaded);

    const paramNode = nodeUtils.getParameterNode(node);

    if (this.opts.searchNode) {
      this.opts.searchNode(paramNode);
      return;
    }

    this.opts.$node = node;
    this.opts.data = this.getParameter(paramNode);

    ajax(this.url.search, this.opts)
      .then((response) => {
        this.successCallback(response, "search");
      })
      .catch((error) => {
        this.errorCallback(error, "search");
      });
  }

  public create(node: TreeNode) {
    if (!this.initFlag || utils.isUndefined(this.url.create)) return;

    const paramNode = nodeUtils.getParameterNode(node);

    if (this.opts.createNode) {
      this.opts.createNode(paramNode);
      return;
    }

    this.opts.$node = node;
    this.opts.data = this.getParameter(paramNode);
    ajax(this.url.create, this.opts)
      .then((response) => {
        this.successCallback(response, "create");
      })
      .catch((error) => {
        this.errorCallback(error, "create");
      });
  }

  public modify(node: TreeNode) {
    if (!this.initFlag || utils.isUndefined(this.url.modify)) return;

    const paramNode = nodeUtils.getParameterNode(node);

    if (this.opts.modifyNode) {
      this.opts.modifyNode(paramNode);
      return;
    }

    this.opts.$node = node;
    this.opts.data = this.getParameter(paramNode);
    ajax(this.url.modify, this.opts)
      .then((response) => {
        this.successCallback(response, "modify");
      })
      .catch((error) => {
        this.errorCallback(error, "modify");
      });
  }

  public delete(node: TreeNode) {
    if (!this.initFlag || utils.isUndefined(this.url.delete)) return;

    const paramNode = nodeUtils.getParameterNode(node);

    if (this.opts.deleteNode) {
      this.opts.deleteNode(paramNode);
      return;
    }

    this.opts.$node = node;
    this.opts.data = this.getParameter(paramNode);
    ajax(this.url.delete, this.opts)
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
    console.log("tree ajax error : ", response);
  }

  private defaultGetParam(node: TreeNode) {
    return node;
  }
}
