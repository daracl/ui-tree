import utils from "./utils";

export function ajax(url: any, options: any) {
  const method = options.method ?? "get";
  const data = options.data;
  const headers = options.headers;

  // 로딩바 표시
  const loadingBar = document.getElementById("loading-bar");
  if (loadingBar) {
    loadingBar.style.display = "block";
  }

  if (window["fetch"]) {
    const options = {
      method: method,
      headers: headers || {},
    } as any;

    if ((method === "POST" || method === "PUT") && data) {
      options.body = JSON.stringify(data);
    }

    return fetch(url, options)
      .then((response) => {
        // 로딩바 숨김
        if (loadingBar) {
          loadingBar.style.display = "none";
        }

        if (!response.ok) {
          throw new Error("server response error");
        }
        return response.json();
      })
      .catch((error) => {
        // 로딩바 숨김
        if (loadingBar) {
          loadingBar.style.display = "none";
        }
        throw error;
      });
  } else {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader("Content-Type", "application/json");
      for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }
      xhr.onload = function () {
        // 로딩바 숨김
        if (loadingBar) {
          loadingBar.style.display = "none";
        }

        if (xhr.status === 200) {
          const responseData = JSON.parse(xhr.responseText);
          resolve(responseData);
        } else {
          reject(new Error("XMLHttpRequest error : " + xhr.status));
        }
      };
      xhr.onerror = function () {
        // 로딩바 숨김
        if (loadingBar) {
          loadingBar.style.display = "none";
        }
        reject(new Error("network error"));
      };
      if ((method === "POST" || method === "PUT") && data) {
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send();
      }
    });
  }
}
