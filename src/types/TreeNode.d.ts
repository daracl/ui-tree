export interface TreeNode {
  id: string | number;
  pid: string | number;
  text: string;
  url?: string;
  checkState?: number;
  target?: string;
  icon?: string;
  childCount: number;
  sortOrder: number;
  depth: number;
  childNodes: TreeNode[];
  orginData: any;
}
