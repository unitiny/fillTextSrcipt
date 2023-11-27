// ==UserScript==
// @name         FillText
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

let online = false
let global = {};
const flex = {
    bs: "space-between", start: "flex-start", end: "flex-end", center: "center", column: "column", row: "row"
};
(function () {
    global = getGlobal()
    loadResource()
    initStyle()
    setInputDom()
    operationBoard()
    saveGlobalInterval()
})();

function icons() {
    // <span className="material-symbols-outlined">delete</span>
    // <span className="material-symbols-outlined">colorize</span>
    // <span className="material-symbols-outlined">remove</span>
}

function getLink() {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0";
    return link
}

function loadResource() {
    document.head.appendChild(getLink());
}

function initStyle() {
    global.style.boardStyle = `
    ${flexStyle({jc: flex.bs, fd: flex.column})}
    position: absolute;
    left: 0px;
    top: 0px;
    width: 330px;
    height: 400px;
    margin: 10px;
    background: white;
    border: 5px solid ${themeColor()};
    border-radius: 5px;
    overflow: auto;`
    global.style.hiddenBoardStyle = `
    ${flexStyle({})}
    position: absolute;
    left: 0px;
    top: 0px;
    width: 40px;
    height: 40px;
    margin: 10px;
    border: 5px solid skyblue;
    border-radius: 50%;
    overflow: auto;
    color: white;
    background: skyblue;
    display: none;`
    global.style.divStyle = `
                ${flexStyle({fd: flex.column})}
                width: 300px;
                height: 400px;
                margin: 10px;
                border: 1px solid skyblue;
                border-radius: 5px;
                overflow: auto`
    global.style.spanStyle = `
                ${flexStyle({jc: flex.center, ai: flex.start, fd: flex.column})}
                flex-grow: 0;
                flex-shrink: 0;
                min-width: 250px; 
                max-width: 250px; 
                min-height: 100px; 
                max-height: 100px; 
                margin: 10px 20px;
                border: 1px solid ${themeColor()};
                border-radius: 7px;
                height: 70px;
                padding: 0 10px 0 10px;`
    global.style.pStyle = `
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;`
    global.style.operationStyle = `
    padding: 0 12px 0 12px;
    width: auto;
    height: 35px;
    border-radius: 5px;
    background: #4bb84b;
    color: white;
    font-size: 16px;
    text-align: center;
    line-height: 33px;
    margin-right: 10px;`
    global.style.textArea = `
    border: 1px solid ${themeColor()};
    border-radius: 5px;
    flex-grow: 0;
    flex-shrink: 0;
    min-width: 250px; 
    max-width: 250px; 
    min-height: 100px; 
    max-height: 100px; 
    margin: 10px 0 10px 0;`
    global.style.iconStyle = `
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;`
    global.style.spanSettingStyle = `
    width: 100%;
    ${flexStyle({jc: flex.end})}
    `
    global.style.displayNone = "display: none;"
    global.style.displayFlex = "display: flex;"
    global.style.borderRed = "border: 1px solid red;"
    global.style.borderSkyblue = "border: 1px solid skyblue;"
}

function themeColor() {
    return global.theme ? "skyblue" : "black"
}

function isShow(show) {
    return show ? "" : global.style.displayNone
}

function showDom(dom, add = global.style.displayFlex) {
    dom.style.cssText = dom.style.cssText.replace(isShow(false), "")
    dom.style.cssText += add
}

function hiddenDom(dom) {
    dom.style.cssText += isShow(false)
}

function replaceStyle(dom, key, value) {
    let list = dom.style.cssText.split(";");
    for (let i = 0; i < list.length; i++) {
        if (list[i].includes(key + ":")) {
            list[i] = `${key}:${value}`
            break
        }
    }
    dom.style.cssText = list.join(";")
}

function flexStyle({jc = flex.center, ai = flex.center, fd = flex.row}) {
    return `display: flex;
            justify-content: ${jc};
            align-items: ${ai};
            flex-direction: ${fd};`
}

function toBottom() {
    global.board.scrollTop = global.board.scrollHeight
}

function moveDom(dom) {
    let isDragging = false;
    let x, y;

    dom.addEventListener("mousedown", function (event) {
        isDragging = true;
        x = event.x;
        y = event.y;
    });

    dom.addEventListener("mousemove", function (event) {
        if (isDragging) {
            let offsetX = event.x - x;
            let offsetY = event.y - y;

            dom.style.left = parseInt(dom.style.left) + offsetX + "px";
            dom.style.top = parseInt(dom.style.top) + offsetY + "px";
            x = event.x
            y = event.y
        }
    });

    dom.addEventListener("mouseup", function () {
        isDragging = false;
    });
}

function defaultGlobal() {
    return {
        curInputDom: 0,
        curSpan: 0,
        attributeName: "data-fillText",
        clipBoardList: [],
        inputDoms: [],
        spansText: randText(),
        boardChildNodes: 3,
        style: {},
        theme: true,
        order: 0,
        setting: {
            spans: []
        }
    }
}

function saveGlobalInterval() {
    setInterval(function () {
        saveGlobal()
    }, 1000 * 30)
}

function saveGlobal() {
    online ? GM_setValue("fillTextGlobal", global) : null;
}

function getGlobal() {
    if (!online) {
        return defaultGlobal();
    }

    let data = GM_getValue("fillTextGlobal", global)
    if (JSON.stringify(data) === "{}") {
        return defaultGlobal()
    }
    return data
}

//设置input节点
function setInputDom() {
    let t = setInterval(() => {
        let downingKeys = [];
        let editKey = "";
        let inputDoms = document.querySelectorAll('input');
        inputDoms.forEach(function (dom, i) {
            dom.setAttribute(global.attributeName, i)
            dom.addEventListener("click", function (event) {
                let d = event.target
                global.curInputDom = d.getAttribute(global.attributeName)
                if (global.order === 1) {
                    d.value = global.spansText[global.curSpan]
                }
            })
            dom.addEventListener("keydown", function (event) {
                //快捷键模式，按下Alt开始
                if (event.key === "Alt") {
                    downingKeys = []
                    downingKeys.push(event.key)
                    editKey = event.key
                    return
                }
                if (downingKeys.length > 0) {
                    if (downingKeys.indexOf(event.key) !== -1) return;
                    downingKeys.push(event.key)
                    editKey += "+" + event.key
                    global.setting.spans.map(v => {
                        if (editKey === v.key) {
                            dom.value = global.spansText[v.index] || dom.value
                            event.preventDefault()
                            downingKeys = []
                            editKey = ""
                        }
                    })
                    return;
                }

                //编辑模式
                let str = dom.value + event.key
                global.setting.spans.map(v => {
                    if (str === v.key.split("+").join("")) {
                        dom.value = global.spansText[v.index] || dom.value
                        event.preventDefault() //阻止写入该字符
                    }
                })
            })
            dom.addEventListener("keyup", function (event) {
                let i = downingKeys.indexOf(event.key)
                i !== -1 ? downingKeys.splice(i, 1) : null
                if (event.key === "Alt") {
                    downingKeys = []
                    editKey = ""
                }
            })
        })
        global.inputDoms = inputDoms
        if (inputDoms.length > 0) {
            clearInterval(t)
        }
    }, 1000)
}

function randText() {
    let list = []
    for (let i = 0; i < Math.round(Math.random() * 10 + 3); i++) {
        let s = ""
        for (let j = 0; j < Math.round(Math.random() * 50 + 10); j++) {
            s += Math.round(Math.random() * 10).toString()
        }
        list.push(s)
    }
    return list
}

//输入栏添加span
function showInput() {
    if (global.board.childNodes.length > global.board.childNodes) {
        return
    }
    let el = document.createElement("input");
    el.placeholder = "请输入内容，按回车添加"
    el.style.cssText = global.style.textArea
    replaceStyle(el, "border", `1px solid ${themeColor()}`)
    el.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            global.spansText.push(event.target.value)
            renderBoard(renderSpan())
            toBottom()
        }
    })
    global.board.appendChild(el)
    toBottom()
}

function getSpanText(index) {
    return global.spansText[index]
}

function getSpans() {
    let list = []
    for (let i = 0; i < global.spansText.length; i++) {
        list.push(getSpan(i, global.spansText[i]))
    }
    return list
}

function getSpan(i, text) {
    let span = document.createElement("span")
    span.innerHTML = `
<p style="${global.style.pStyle}">${text}</p>
<div style="${global.style.spanSettingStyle}${isShow(getSpanSetting(i).show)}">

<input id="settingInput${i}" style="width: 80%; height: 30px;${isShow(getSpanSetting(i).input)}" type="text" placeholder="请按键设置" readonly>

<span style="${global.style.iconStyle}${isShow(getSpanSetting(i).set)}">settings</span>

<span style="${global.style.iconStyle}${isShow(getSpanSetting(i).finish)}">done</span>

<span style="${global.style.iconStyle}${isShow(getSpanSetting(i).cancel)}">close</span>
</div>
`
    span.style.cssText = global.style.spanStyle
    replaceStyle(span, "border", `1px solid ${themeColor()}`)
    span.addEventListener("click", function (event) {
        selectSpan(i)
        if (global.order === 0) {
            let target = `${global.attributeName}="${global.curInputDom}"`
            let element = document.querySelector(`input[${target}]`);
            element.value = text
        }
    })

    let childSpan = span.getElementsByTagName("span")
    childSpan[0].addEventListener("click", function () {
        settingCtl({input: true, set: false, finish: true, cancel: true, index: i})
    })
    childSpan[1].addEventListener("click", function () {
        saveKey(i)
    })
    childSpan[2].addEventListener("click", function () {
        cancel(i)
    })
    return span
}

function selectSpan(i) {
    let spanNodes = global.spanList.childNodes
    replaceStyle(spanNodes[global.curSpan], "border", `1px solid ${themeColor()}`)
    global.curSpan = i
    replaceStyle(spanNodes[global.curSpan], "border", "1px solid red")
}

function delSpan() {
    global.spansText.splice(global.curSpan, 1)

    let i = 0
    global.setting.spans.map((v, index) => {
        if (v.index === global.curSpan) {
            i = index
        }
    })
    global.setting.spans.splice(i, 1)
    global.curSpan = 0
    renderBoard(renderSpan())
}

function delAllSpan() {
    global.spansText = []
    renderBoard(renderSpan())
}

function renderBoard(spanListDom) {
    global.board.replaceChild(spanListDom, global.board.childNodes[1])
    let l = global.board.childNodes.length
    if (l > global.boardChildNodes) {
        for (let i = global.boardChildNodes; i < l; i++) {
            global.board.removeChild(global.board.lastChild)
        }
    }
}

function renderSpan() {
    let div = document.createElement("div");
    div.setAttribute("id", "textSpanList")
    div.style.cssText = flexStyle({fd: flex.column})
    div.append(...getSpans())
    global.spanList = div
    return div
}

function changeOrder() {
    let d = document.getElementById("orderOperation")
    d.innerText = d.innerText === "先填后选" ? "先选后填" : "先填后选"
    global.order = global.order ? 0 : 1
}

function editKey() {
    settingCtl({show: !global.setting.show, set: !global.setting.set})
}

function settingCtl({show = true, input = false, set = true, finish = false, cancel = false, index = -1}) {
    if (index !== -1) {
        //单span控制
        let has = false
        for (const span of global.setting.spans) {
            if (span.index === index) {
                span.show = show
                span.input = input
                span.set = set
                span.finish = finish
                span.cancel = cancel
                has = true
            }
        }
        if (!has) {
            global.setting.spans.push({
                show: show, input: input, set: set, finish: finish, cancel: cancel, index: index, key: "", editKey: ""
            })
        }
    } else {
        //全局控制
        global.setting.show = show
        global.setting.input = input
        global.setting.set = set
        global.setting.finish = finish
        global.setting.cancel = cancel
        global.setting.spans.map(v => {
            v.show = show
            v.input = input
            v.set = set
            v.finish = finish
            v.cancel = cancel
        })
    }
    renderBoard(renderSpan())
    if (input) {
        listenKey(index)
    }

    //阻止冒泡
    let event = window.event || arguments.callee.caller.arguments[0];
    event.stopPropagation()
}

function listenKey(index) {
    let ss = getSpanSetting(index)
    let input = document.getElementById("settingInput" + index);
    input.focus()
    input.value = ss.key
    ss.editKey = ss.key
    let downingKeys = [] //按下未松开的keys
    input.addEventListener("keydown", function (event) {
        if (event.key === "Backspace") {
            //如果存在，则移除按下中的key
            let i = downingKeys.indexOf(event.key)
            i !== -1 ? downingKeys.splice(i, 1) : null

            let arr = ss.editKey.split("+")
            arr.pop()
            ss.editKey = arr.join("+")
        } else if (!downingKeys.includes(event.key)) {
            if (ss.editKey === "") {
                ss.editKey += event.key
            } else {
                ss.editKey += "+" + event.key
            }
            downingKeys.push(event.key)
        }
        input.value = ss.editKey
    });
    input.addEventListener("keyup", function (event) {
        if (event.key !== "Backspace") {
            let i = downingKeys.indexOf(event.key)
            i !== -1 ? downingKeys.splice(i, 1) : null
        }
    });
    let event = window.event || arguments.callee.caller.arguments[0];
    event.stopPropagation()
}

function saveKey(index) {
    let ss = getSpanSetting(index)
    let has = false
    global.setting.spans.map(v => {
        if (v.key === ss.editKey && v.index !== ss.index) {
            alert(`文本 ${getSpanText(v.index)} 已设置该快捷键`)
            has = true
        }
    })
    if (!has) {
        ss.key = ss.editKey
        ss.editKey = ""
        settingCtl({index: index})
    }
}

function cancel(index) {
    let ss = getSpanSetting(index)
    ss.editKey = ""
    settingCtl({index: index})
}

function getSpanSetting(index) {
    let set = global.setting.spans.filter((v) => {
        return index === v.index
    })
    return set.length > 0 ? set[0] : global.setting
}

function modeCtl() {
    if (global.theme) {
        global.theme = false
        replaceStyle(global.board, "border", `5px solid ${themeColor()}`)
        global.spanList.childNodes.forEach(v => {
            replaceStyle(v, "border", `1px solid ${themeColor()}`)
        })
        return
    }
    global.theme = true
    replaceStyle(global.board, "border", `5px solid ${themeColor()}`)
    global.spanList.childNodes.forEach(v => {
        replaceStyle(v, "border", `1px solid ${themeColor()}`)
    })
}

function topOperation() {
    let operation = document.createElement("div")
    operation.style.width = "100%"
    operation.innerHTML = `
<div id="topOperation" style="${flexStyle({jc: flex.end})}margin: 0 20px 10px 0px;">
    <span style="${global.style.iconStyle}font-size: 20px;">light_mode</span>
    <span style="${global.style.iconStyle}">expand_more</span>
    <span style="${global.style.iconStyle}">remove</span>
</div>`

    let childSpan = operation.getElementsByTagName("span")
    childSpan[0].addEventListener("click", modeCtl)
    childSpan[1].addEventListener("click", toBottom)
    childSpan[2].addEventListener("click", function () {
        boardCtl(false)
    })
    return operation
}

function bottomOperation() {
    let operation = document.createElement("div")
    operation.style.width = "100%"
    operation.innerHTML = `
<div id="bottomOperation">
    <div style="${flexStyle({jc: flex.end})}margin: 0 20px 10px 0px;">
        <span style="${global.style.operationStyle}" >快捷键</span>    
        <span style="${global.style.operationStyle}">添加</span>    
        <span style="${global.style.operationStyle}background: #ea5c5c;">删除</span>    
        <span style="${global.style.operationStyle}margin-right: 0px;background: #ea5c5c;">清空</span>
    </div>
    <div style="${flexStyle({jc: flex.end})}margin: 0 20px 10px 0px;">
        <span style="${global.style.operationStyle}">保存配置</span> 
        <span id="orderOperation" style="${global.style.operationStyle}margin-right: 0px;">先填后选</span>
    </div>
</div>`

    let list = [editKey, showInput, delSpan, delAllSpan, saveGlobal, changeOrder]
    list.forEach((v, i) => {
        operation.getElementsByTagName("span")[i].addEventListener("click", v)
    })
    return operation
}

function board() {
    let b = document.createElement("div");
    b.style.cssText = global.style.boardStyle
    b.setAttribute("id", "fillTextBoard")
    b.appendChild(topOperation())
    b.appendChild(renderSpan())
    b.appendChild(bottomOperation())
    global.board = b
    return b
}

function hiddenBoard() {
    let hb = document.createElement("div")
    hb.style.cssText = global.style.hiddenBoardStyle
    hb.setAttribute("id", "fillTextHiddenBoard")
    hb.innerHTML = `
    <span style="${global.style.iconStyle}font-size:30px;">add</span>
    `
    hb.getElementsByTagName("span")[0].addEventListener("click", function () {
        boardCtl(true)
    })
    global.hiddenBoard = hb
    return hb
}

function boardCtl(show) {
    if (show) {
        hiddenDom(global.hiddenBoard)
        showDom(global.board)
        return
    }
    hiddenDom(global.board)
    showDom(global.hiddenBoard)
}

//操作面板
function operationBoard() {
    document.body.appendChild(board())
    document.body.appendChild(hiddenBoard())
    moveDom(global.board)
}




