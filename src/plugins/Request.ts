import Tree from "../Tree";
import { TreeNode } from "@t/TreeNode";
import { ajax } from "src/util/ajaxUtils";
import domUtils from "src/util/domUtils";
import nodeUtils from "src/util/nodeUtils";
import utils from "src/util/utils";

const REQUEST_DEFAULT_OPTIONS = {
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
 * request
 *
 * @class Request
 * @typedef {Request}
 */
export default class Request {
  private tree;
  private url: any;
  private opts: any;
  private successCallback: any;
  private errorCallback: any;
  private getParameters: any;
  private initFlag = false;

  constructor(tree: Tree) {
    this.tree = tree;

    if (utils.isUndefined(tree.options.plugins.request)) {
      return;
    }

    const reqOpt = tree.options.plugins.request;
    tree.config.isRequest = true;

    this.initFlag = true;
    let opts: any;

    if (utils.isString(reqOpt)) {
      opts = utils.objectMerge({}, REQUEST_DEFAULT_OPTIONS, { url: { search: reqOpt } });
    } else if (utils.isString(reqOpt?.url)) {
      opts = utils.objectMerge({}, REQUEST_DEFAULT_OPTIONS, { url: { search: reqOpt?.url } });
    } else {
      opts = utils.objectMerge({}, REQUEST_DEFAULT_OPTIONS, reqOpt);
    }

    opts.$mainElement = tree.mainElement;
    this.url = opts.url;

    this.successCallback = opts.success || this.defaultSuccessCallback;
    this.errorCallback = opts.error || this.defaultErrorCallback;
    this.getParameters = opts.parameters || this.defaultGetParameters;
    this.opts = opts;
  }

  public search(node: TreeNode) {
    const paramNode = nodeUtils.getParameterNode(node);

    node.isLoaded = true;

    if (this.opts.searchNode) {
      this.opts.searchNode(paramNode);
      return;
    }

    if (!this.initFlag) return;

    this.opts.$node = node;
    this.opts.data = this.getParameters(paramNode, "search");

    ajax(this.url.search, this.opts)
      .then((response) => {
        this.successCallback(response, "search");
      })
      .catch((error) => {
        this.errorCallback(error, "search");
      });
  }

  public create(node: TreeNode): any {
    const paramNode = nodeUtils.getParameterNode(node);

    if (this.opts.createNode) {
      return this.opts.createNode(paramNode);
    }

    if (!this.initFlag || utils.isUndefined(this.url.create)) return;

    this.opts.$node = node;
    this.opts.data = this.getParameters(paramNode, "create");
    ajax(this.url.create, this.opts)
      .then((response) => {
        this.successCallback(response, "create");
      })
      .catch((error) => {
        this.errorCallback(error, "create");
      });
  }

  public modify(node: TreeNode): any {
    const paramNode = nodeUtils.getParameterNode(node);

    if (this.opts.modifyNode) {
      return this.opts.modifyNode(paramNode);
    }

    if (!this.initFlag || utils.isUndefined(this.url.modify)) return;

    this.opts.$node = node;
    this.opts.data = this.getParameters(paramNode, "modify");
    ajax(this.url.modify, this.opts)
      .then((response) => {
        this.successCallback(response, "modify");
      })
      .catch((error) => {
        this.errorCallback(error, "modify");
      });
  }

  public remove(node: TreeNode): any {
    const paramNode = nodeUtils.getParameterNode(node);

    if (this.opts.removeNode) {
      return this.opts.removeNode(paramNode, "remove");
    }

    if (!this.initFlag || utils.isUndefined(this.url.remove)) return;

    this.opts.$node = node;
    this.opts.data = this.getParameters(paramNode);
    ajax(this.url.remove, this.opts)
      .then((response) => {
        this.successCallback(response, "remove");
      })
      .catch((error) => {
        this.errorCallback(error, "remove");
      });
  }

  private defaultSuccessCallback(response: any) {
    this.tree.addNode(response);
  }

  private defaultErrorCallback(response: any) {
    console.log("tree ajax error : ", response);
  }

  private defaultGetParameters(node: TreeNode, mode: string) {
    return node;
  }
}
