import { SearchOptions } from "@t/Options";
import {Tree} from "../Tree";
import { TreeNode } from "@t/TreeNode";

import nodeUtils from "src/util/nodeUtils";
import { isFunction, objectMerge } from "src/util/utils";
import { escapeRegExp, findText, normalizeText } from "src/util/searchUtil";
import { addClass, removeClass } from "src/util/domUtils";
import { SearchCallback } from '../types/Options';

// default option
const SEARCH_DEFAULT_OPTIONS = {};

/**
 * keydown event
 *
 * @export
 * @class Keydown
 * @typedef {Keydown}
 */
export class Search {
  private tree;
  private opts: SearchOptions;

  constructor(tree: Tree) {
    this.tree = tree;
    const plugins = tree.options.plugins;

     if(!plugins?.search){
      return; 
    }

    tree.config.isSearch = true;
    this.opts = objectMerge({}, SEARCH_DEFAULT_OPTIONS, plugins.search) as SearchOptions;

  }


  /**
   * tree node search
   *
   * @public
   * @param {string} searchText search text
   * @param {?(string|number)} [id] node id 가 있을 경우 하위 노드 검색
   */
  public search(searchText: string, id?: string | number) {
      let searchResult: TreeNode[] = [];

      const mainTree = this.tree;

      const mainElement = this.tree.getRootElement();
      removeClass(mainElement.querySelectorAll('.dt-node.dt-highlight'), 'dt-highlight');

      // 검색 수행
      const startNode = id ? mainTree.config.allNode[id] : mainTree.config.rootNode;

      if(startNode){
        if(this.tree.config.isSearch && isFunction(this.opts.callback)){
          customNodeSearch(startNode, searchText, searchResult, this.opts.callback);
        }else{
          searchResult = this.defaultSearch(mainTree, searchText, startNode);
        }
      }
            
      if (searchResult.length < 1) return [];

      let firstResultNode
      // 결과 하이라이팅 및 노드 열기
      for (const node of searchResult) {
          if (!firstResultNode) firstResultNode = node
          mainTree.openNode(node.id)
          const titleEl = nodeUtils.nodeIdToNodeTitleElement(mainElement, node.id)
          addClass(titleEl, 'dt-highlight')
      }

      if (firstResultNode) firstResultNode.focus()

      return searchResult
  }

  private defaultSearch(mainTree: Tree, searchText: string, startNode:TreeNode) {
    let searchResult: TreeNode[] = [];
    // 공백만 있는 검색어 제거
    const cleanedText = (searchText ?? '').trim()
    if (!cleanedText) return searchResult

    const cleanedSearch = normalizeText(searchText)
    const safePattern = escapeRegExp(cleanedSearch)
    const searchRegex = new RegExp(safePattern, 'i') // 대소문자 무시
    
    if (startNode) {
        nodeSearch(startNode, searchRegex, searchResult)
    }
    return searchResult;
  }
}


/**
 * 사용자 정의 노드 검색
 *
 * @param {TreeNode} node tree node
 * @param {string} searchText  search text
 * @param {TreeNode[]} searchResult search result array
 * @param {SearchCallback} searchCallback  custom search function
 */
function customNodeSearch(node: TreeNode, searchText: string, searchResult: TreeNode[], searchCallback : SearchCallback) {
    if (node) {
        const childNodes = node.childNodes
        if (searchCallback(searchText, node)) {
            searchResult.push(node)
        }

        if (childNodes && childNodes.length > 0) {
            for (let treeNode of childNodes) {
                customNodeSearch(treeNode, searchText, searchResult, searchCallback);
            }
        }
    }
}

/**
 * 노드 검색
 *
 * @param {TreeNode} node tree node
 * @param {RegExp} searchText 검색 정규화
 * @param {TreeNode[]} searchResult 검색결과
 */
function nodeSearch(node: TreeNode, searchText: RegExp, searchResult: TreeNode[]) {
    if (node) {
        const childNodes = node.childNodes
        if (findText(searchText, node.text)) {
            searchResult.push(node)
        }

        if (childNodes && childNodes.length > 0) {
            for (let treeNode of childNodes) {
                nodeSearch(treeNode, searchText, searchResult)
            }
        }
    }
}
