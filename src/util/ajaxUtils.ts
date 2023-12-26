import utils from "./utils";

export function ajax(url: any, ajaxOpts: any) {
  const method = ajaxOpts.method ?? "get";
  const data = ajaxOpts.data;
  const headers = ajaxOpts.headers;

  // 로딩바 표시
  if (ajaxOpts.beforesend) {
    if (ajaxOpts.beforesend(ajaxOpts) === false) {
      return new Promise(function (resolve, reject) {
        resolve("stop");
      });
    }
  }

  const completed = ajaxOpts.completed ? ajaxOpts.completed : () => {};

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
        completed({ status: "success", options: ajaxOpts, response: response });

        if (!response.ok) {
          throw new Error("server response error");
        }
        return response.json();
      })
      .catch((error) => {
        completed({ status: "error", options: ajaxOpts, response: error });
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
        completed({ status: "success", options: ajaxOpts, response: xhr });

        if (xhr.status === 200) {
          const responseData = JSON.parse(xhr.responseText);
          resolve(responseData);
        } else {
          reject(new Error("XMLHttpRequest error : " + xhr.status));
        }
      };
      xhr.onerror = function () {
        // 로딩바 숨김
        completed({ status: "error", options: ajaxOpts, response: xhr });
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
