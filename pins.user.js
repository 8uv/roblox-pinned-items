// ==UserScript==
// @name         Roblox Pinned Items
// @namespace    https://x3.ci
// @version      1.1
// @description  do not scratch your balls
// @author       9n25
// @match        https://www.roblox.com/my/avatar
// @icon         https://www.google.com/s2/favicons?sz=64&domain=roblox.com
// @run-at       document-body
// @grant        GM_xmlhttpRequest
// @connect      githubusercontent.com
// ==/UserScript==

GM_xmlhttpRequest({
    method: "GET",
    url: "https://raw.githubusercontent.com/8uv/roblox-pinned-items/main/pin.js",
    headers: {
        "Content-Type": "application/json"
    },
    onload: res => {
        const s = document.createElement("script")
        s.innerHTML = res.responseText
        document.body.appendChild(s)
    }
})