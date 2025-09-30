# tree
JavaScript tree library

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/daracl/ui-tree/blob/main/LICENSE)
[![npm version](https://badge.fury.io/js/@daracl%2Ftree.svg)](https://badge.fury.io/js/@daracl%2Ftree)
[![npm](https://img.shields.io/npm/d18m/%40daracl%2Ftree)](https://github.com/daracl/ui-tree/releases)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@daracl%2Ftree)](https://bundlephobia.com/package/@daracl%2Ftree)


<p>
<img src="https://raw.githubusercontent.com/daracl/ui-tree/refs/heads/main/demo.gif"/>
</p>

## Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)  
--- | --- | --- | --- | --- |  
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |  


1. Install

```sh
yarn install
# OR
npm install
```

2. Run

```sh
npm start
```

3. Open `http://localhost:8891` in your browser


# 테스트 설치 모듈
```
npx playwright install
```



# 사용방법
```

var treeItem = [];
treeItem.push({ id: 0, pid: '', text: 'My example tree1', url: "detail('2')" });
treeItem.push({ id: 1, pid: 0, text: 'pub 1', url: "detail('2')" });
treeItem.push({ id: 3, pid: 1, text: 'pub 1.1', url: "detail('2')" });
treeItem.push({ id: 5, pid: 3, text: '5Node 1.1.1', url: "detail('2')", state: { checked: true } });
treeItem.push({ id: 6, pid: 5, text: '6Node 1.1.1.1', url: "detail('2')" });
treeItem.push({ id: 14, pid: 3, text: '14Node 1.1.1', url: "detail('2')" });
treeItem.push({ id: 15, pid: 14, text: '15Node 1.1.1', url: "detail('2')" });
treeItem.push({ id: 16, pid: 14, text: '16Node 1.1.1', url: "detail('2')", childCnt: 1000 });
treeItem.push({ id: 4, pid: 0, text: '4Node 3', url: "detail('2')" });
treeItem.push({ id: 2, pid: 0, text: '2Node 2', url: "detail('2')" });
treeItem.push({ id: 7, pid: 0, text: '7Node 4', url: "detail('2')" });
treeItem.push({ id: 41, pid: 0, text: '4Node 3', url: "detail('2')" });
treeItem.push({ id: 21, pid: 0, text: '2Node 2', url: "detail('2')" });
treeItem.push({ id: 712, pid: 0, text: '7Node 4', url: "detail('2')" });
treeItem.push({ id: 9, pid: 0, text: '9My Pictures', url: "detail('2')", img: 'img/cd.gif', childCnt: 10 });

const example1 = Daracl.tree.create("#treeDiv", {
   items: treeItem
   , style: {
      height: '200px'
   }
   , rootNode: {
      id: 0
      , text: 'root node'
   }
   , enableRootNode1: true
   , enableIcon: true
   , openDepth: -1
   , plugins: {
      checkbox: {}
      , edit: {
         before: function (item) {
         console.log(item)
         //return false;
         }
         , after: function (item) {
         console.log(item)
         //return 'asdfawef';
         }
      }
      , dnd: {
         drop: function (item) {
         console.log('item ', item);
         }
      }
      , request1: {
         searchNode: function (node) {

         fetch('/data/tree-node.json?id=${node.id}&pid=' + node.pid, {
            method: 'get', data: node
         })
            .then(function (response) {
               return response.json();
            })
            .then(function (data) {

               const nodeData = [];


               for (let idx in data) {
               var item = data[idx];

               if (item.pid == node.id) {
                  if (item.state) {
                     item.state.folder = true;
                  } else {
                     item.state = { folder: true }
                  }
                  nodeData.push(item);
               }
               }
               treeObj.addNode(nodeData)
            })
            .catch(function (error) {
               console.log(error)
            });

         }
         , removeNode: function (node) {
         console.log('removeNode ', node)

         }
         , modifyNode: function (node) {
         console.log('modifyNode ', node)
         }
         , createNode: function (node) {
         treeObj.getNodeInfo(node.id).setEdit();
         console.log(node);
         //console.log('createNode ', node)
         }
      }
   }
   , click: function (nodeInfo) {
      console.log('click', nodeInfo.id)
   }
   , dblclick: function (nodeInfo) {
      console.log('dblclick', nodeInfo.id)
      //return false;
   }
   , selectNode: function (nodeInfo) {
      console.log('selectNode', nodeInfo.id)
   }

   });
```
  
<style>
  table td, table th{
    border: 1px solid #dddd;
    vertical-align:top;
  }
  </style>

# 옵션
<table>
   <thead>
      <tr>
         <th></th>
         <th>설명</th>
         <th>기본값</th>
         <th>옵션</th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td>style</td>
         <td> </td>
         <td>
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th>설명</th>
                     <th>기본값</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>width</td>
                     <td> 넓이 </td>
                     <td>"auto"</td>
                  </tr>
                  <tr>
                     <td>height</td>
                     <td>높이 </td>
                     <td>300</td>
                  </tr>
               </tbody>
            </table>
         </td>
         <td></td>
      </tr>
      <tr>
         <td>mode</td>
         <td>mode </td>
         <td>double</td>
         <td>single, double</td>
      </tr>
      <tr>
         <td>orientation</td>
         <td> 방향</td>
         <td>horizontal</td>
         <td>horizontal, vertical</td>
      </tr>
      <tr>
         <td>body</td>
         <td> </td>
         <td>
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th>설명</th>
                     <th>기본값</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>enableMoveBtn</td>
                     <td> 이동버튼 보이기 여부 </td>
                     <td>true</td>
                  </tr>
                  <tr>
                     <td>moveBtnSize</td>
                     <td> 버튼 width </td>
                     <td>50</td>
                  </tr>
               </tbody>
            </table>
         </td>
         <td></td>
      </tr>
      <tr>
         <td>enableAddEmptyMessage</td>
         <td> 추가 아이템 없을때 메시지 보이기 여부 </td>
         <td>false</td>
         <td></td>
      </tr>
      <tr>
         <td>enableRemoveEmptyMessage</td>
         <td> 삭제 아이템 없을때 메시지 보이기 여부 </td>
         <td>false</td>
         <td></td>
      </tr>
      <tr>
         <td>usetree</td>
         <td> 다중 항목 추가 여부 사용여부 </td>
         <td>true</td>
         <td></td>
      </tr>
      <tr>
         <td>useDragMove</td>
         <td> Drag 이동여부 </td>
         <td>false</td>
         <td></td>
      </tr>
      <tr>
         <td>useDragSort</td>
         <td> drag 상하위 이동 가능여부 </td>
         <td>false</td>
         <td></td>
      </tr>
      <tr>
         <td>addPosition</td>
         <td> 추가 위치  </td>
         <td>bottom</td>
         <td>bottom, top</td>
      </tr>
      <tr>
         <td>duplicateCheck</td>
         <td> 중복체크 </td>
         <td>true</td>
         <td></td>
      </tr>
      <tr>
         <td>enableUpDown</td>
         <td> 상하위 이동 버튼 활성화 여부 </td>
         <td>false</td>
         <td></td>
      </tr>
      <tr>
         <td>valueKey</td>
         <td>item value key  </td>
         <td>code</td>
         <td></td>
      </tr>
      <tr>
         <td>labelKey</td>
         <td>item label key </td>
         <td>name</td>
         <td></td>
      </tr>
      <tr>
         <td>pageNumKey</td>
         <td> page number key </td>
         <td>pageNo</td>
         <td></td>
      </tr>
      <tr>
         <td>source</td>
         <td> </td>
         <td>
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th>설명</th>
                     <th>기본값</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>label</td>
                     <td> label name </td>
                     <td></td>
                  </tr>
                  <tr>
                     <td>labelAlign</td>
                     <td> label 정렬 </td>
                     <td>center<br> ex:) left, center, right </td>
                  </tr>
                  <tr>
                     <td>enableLabel</td>
                     <td>label 활성화 여부</td>
                     <td>false</td>
                  </tr>
                  <tr>
                     <td>enableAddBtn</td>
                     <td> 추가 버튼 보이기 여부 </td>
                     <td>true</td>
                  </tr>
                  <tr>
                     <td>emptyMessage</td>
                     <td> 항목 없을때 메시지 </td>
                     <td>""</td>
                  </tr>
                  <tr>
                     <td>items</td>
                     <td> 항목 </td>
                     <td>[]</td>
                  </tr>
                  <tr>
                     <td>search</td>
                     <td> </td>
                     <td>
                        <table>
                           <thead>
                              <tr>
                                 <th></th>
                                 <th>설명</th>
                                 <th>기본값</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 <td>enable</td>
                                 <td> 검색 활성화 여부 </td>
                                 <td>false</td>
                              </tr>
                               <tr>
                                 <td>callback</td>
                                 <td>검색 콜백 </td>
                                 <td></td>
                              </tr>
                           </tbody>
                        </table>
                     </td>
                  </tr>
                  <tr>
                     <td>paging</td>
                     <td> </td>
                     <td>
                        <table>
                           <thead>
                              <tr>
                                 <th></th>
                                 <th>설명</th>
                                 <th>기본값</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 <td>enable</td>
                                 <td> 페이지 활성화 여부 </td>
                                 <td>false</td>
                              </tr>
                              <tr>
                                 <td>unitPage</td>
                                 <td>페이지 몇개 보일지 여부 </td>
                                 <td>10</td>
                              </tr>
                              <tr>
                                 <td>currPage</td>
                                 <td>현재 페이지 정보 </td>
                                 <td>1</td>
                              </tr>
                           </tbody>
                        </table>
                     </td>
                  </tr>
               </tbody>
            </table>
         </td>
         <td></td>
      </tr>
      <tr>
         <td>target</td>
         <td> </td>
         <td>
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th>설명</th>
                     <th>기본값</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>label</td>
                     <td> label name </td>
                     <td></td>
                  </tr>
                  <tr>
                     <td>labelAlign</td>
                     <td> label 정렬 </td>
                     <td>"center"</td>
                  </tr>
                  <tr>
                     <td>enableLabel</td>
                     <td> label 활성화 여부 </td>
                     <td>false</td>
                  </tr>
                  <tr>
                     <td>enableRemoveBtn</td>
                     <td> 삭제 버튼 보이기 여부 </td>
                     <td>true</td>
                  </tr>
                  <tr>
                     <td>emptyMessage</td>
                     <td>항목 없을때 메시지 </td>
                     <td></td>
                  </tr>
                  <tr>
                     <td>items</td>
                     <td>항목 </td>
                     <td>[]</td>
                  </tr>
                  <tr>
                     <td>limitSize</td>
                     <td> 제한갯수 </td>
                     <td>-1</td>
                  </tr>
                  <tr>
                     <td>search</td>
                     <td> </td>
                     <td>
                        <table>
                           <thead>
                              <tr>
                                 <th></th>
                                 <th>설명</th>
                                 <th>기본값</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 <td>enable</td>
                                 <td> 검색 활성화 여부  </td>
                                 <td>false</td>
                              </tr>
                              <tr>
                                 <td>callback</td>
                                 <td>검색 콜백 </td>
                                 <td></td>
                              </tr>
                           </tbody>
                        </table>
                     </td>
                  </tr>
                  <tr>
                     <td>paging</td>
                     <td> </td>
                     <td>
                        <table>
                           <thead>
                              <tr>
                                 <th></th>
                                 <th>설명</th>
                                 <th>기본값</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 <td>enable</td>
                                 <td> 페이지 활성화 여부 </td>
                                 <td>false</td>
                              </tr>
                              <tr>
                                 <td>unitPage</td>
                                 <td> 페이지 몇개 보일지 여부 </td>
                                 <td>10</td>
                              </tr>
                              <tr>
                                 <td>currPage</td>
                                 <td> 현재 페이지 정보 </td>
                                 <td>1</td>
                              </tr>
                              <tr>
                                 <td>enableMultiple</td>
                                 <td> </td>
                                 <td>true</td>
                              </tr>
                           </tbody>
                        </table>
                     </td>
                  </tr>
               </tbody>
            </table>
         </td>
         <td></td>
      </tr>
   </tbody>
</table>


## License
Darainfo is under [MIT License](./LICENSE).