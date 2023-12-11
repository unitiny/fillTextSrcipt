// ==UserScript==
// @name         剪贴板 FillText
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  快速填写预设文本到输入框，适用于所有https网站。
// @author       Unitiny
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @license MIT
// ==/UserScript==

let Global = {};
const CSS = {
    flex: {
        bs: "space-between", start: "flex-start", end: "flex-end", center: "center", column: "column", row: "row"
    },
};
(function () {
    Global = getGlobal()
    loadResource()
    initStyle()
    setInputDom()
    operationBoard()
})();

/**
 * 初始化
 */
//设置input节点
function setInputDom () {
    let t = setInterval(() => {
        let downingKeys = [];
        let editKey = "";
        let inputDoms = document.querySelectorAll('input');
        inputDoms.forEach(function (dom, i) {
            dom.setAttribute(Global.attributeName, i)
            dom.addEventListener("click", function (event) {
                let d = event.target
                Global.curInputDom = d.getAttribute(Global.attributeName)
                if (Global.order === 1) {
                    d.value = getSpanText(Global.curSpan)
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
                    getCurCateVal().spans.map(v => {
                        if (editKey === v.key) {
                            dom.value = getSpanText(v.index) || dom.value
                            event.preventDefault()
                            downingKeys = []
                            editKey = ""
                        }
                    })
                    return;
                }

                //编辑模式
                let str = dom.value + event.key
                getCurCateVal().spans.map(v => {
                    if (str === v.key.split("+").join("")) {
                        dom.value = getSpanText(v.index) || dom.value
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
        Global.inputDoms = inputDoms
        //有拿到inputDoms
        if (inputDoms.length > 0) {
            clearInterval(t)
        }
    }, 1000)
}

/**
 * 工具函数
 */

function isOnline () {
    return !window.location.host.includes("localhost") && !window.location.host.includes("127.0.0.1")
}

//添加前缀来防止与原页面id重复
function prefixStr (str) {
    return `${Global.prefix}-${str}`
}

function getLink () {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0";
    return link
}

function loadResource () {
    document.head.appendChild(getLink());
}

function containKeys (a, b) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    return aKeys.length >= bKeys.length && bKeys.every(key => aKeys.includes(key));
}

/**
 * 样式区
 */

function initStyle () {
    CSS.boardStyle = `
    ${flexStyle({ jc: CSS.flex.bs, fd: CSS.flex.column })}
    position: absolute;
    left: 0px;
    top: 0px;
    width: 330px;
    height: 400px;
    margin: 10px;
    background: white;
    border: 5px solid ${themeColor()};
    border-radius: 5px;
    overflow: auto;
    z-index:999;`
    CSS.hiddenBoardStyle = `
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
    z-index:999;
    display: none;`
    CSS.divStyle = `
                ${flexStyle({ fd: CSS.flex.column })}
                width: 300px;
                height: 400px;
                margin: 10px;
                border: 1px solid skyblue;
                border-radius: 5px;
                overflow: auto`
    CSS.cateSpanStyle = `
                padding: 5px 12px;
                width: auto;
                height: 35px;
                border: 1px solid ${themeColor()};
                border-radius: 5px;
                background: white;
                font-size: 16px;
                text-align: center;
                line-height: 33px;
                margin-right: 10px;`
    CSS.spanStyle = `
                ${flexStyle({ jc: CSS.flex.center, ai: CSS.flex.start, fd: CSS.flex.column })}
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
    CSS.pStyle = `
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;`
    CSS.operationStyle = `
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
    CSS.textArea = `
    border: 1px solid ${themeColor()};
    border-radius: 5px;
    flex-grow: 0;
    flex-shrink: 0;
    min-width: 250px;
    max-width: 250px;
    min-height: 100px;
    max-height: 100px;
    margin: 10px 0 10px 0;`
    CSS.iconStyle = `
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
    CSS.spanSettingStyle = `
    width: 100%;
    ${flexStyle({ jc: CSS.flex.end })}
    `
    CSS.displayNone = "display: none;"
    CSS.displayFlex = "display: flex;"
    CSS.borderRed = "border: 1px solid red;"
    CSS.borderSkyblue = "border: 1px solid skyblue;"
}

function themeColor () {
    return Global.theme ? "skyblue" : "black"
}

function isShow (show) {
    return show ? "" : CSS.displayNone
}

function showDom (dom, add = CSS.displayFlex) {
    dom.style.cssText = dom.style.cssText.replace(isShow(false), "")
    dom.style.cssText += add
}

function hiddenDom (dom) {
    dom.style.cssText += isShow(false)
}

function replaceStyle (dom, key, value) {
    let list = dom.style.cssText.split(";");
    for (let i = 0; i < list.length; i++) {
        if (list[i].includes(key + ":")) {
            list[i] = `${key}:${value}`
            break
        }
    }
    dom.style.cssText = list.join(";")
}

function flexStyle ({ jc = CSS.flex.center, ai = CSS.flex.center, fd = CSS.flex.row }) {
    return `display: flex;
            justify-content: ${jc};
            align-items: ${ai};
            flex-direction: ${fd};`
}


/**
 * Global
 */
function defaultGlobal () {
    return {
        id: 0, //global版本号
        order: 0,
        style: {},
        show: 0,
        theme: true,
        curSpan: 0,
        curInputDom: 0,
        prefix: "fillText",
        attributeName: "data-fillText",
        inputDoms: [],
        boardChildNodes: 3,
        curCate: "default",
        category: [
            {
                name: "default",
                setting: {},
                spans: randSpans()
            },
            {
                name: "常用",
                setting: {},
                spans: []
            }
        ]
    }
}

function checkGlobal (data) {
    return data && JSON.stringify(data) !== "{}" && containKeys(data, defaultGlobal())
}

function saveGlobalInterval () {
    setInterval(function () {
        saveGlobal()
    }, 1000 * 30)
}

function saveGlobal (g = Global) {
    console.log("saveGlobal", g)
    if (!isOnline()) {
        return false
    }

    let lastG = GM_getValue("fillTextGlobal")
    if (!checkGlobal(lastG)) {
        GM_setValue("fillTextGlobal", g)
        return true
    }

    g.id++
    if (checkGlobal(g) && lastG.id < g.id) {
        GM_setValue("fillTextGlobal", g)
        return true
    }
    return false
}

function getGlobal () {
    if (!isOnline()) {
        return defaultGlobal();
    }

    let data = GM_getValue("fillTextGlobal")
    if (!checkGlobal(data)) {
        saveGlobal(defaultGlobal())
        return defaultGlobal()
    }

    return data
}

/**
 * 分类
 */

function getCurCateVal () {
    for (const v of Global.category) {
        if (v.name === Global.curCate) {
            return v
        }
    }
    return Global.category[0]
}

function showCateInput () {
    if (Global.board.childNodes.length > Global.boardChildNodes + 1) {
        return
    }
    let el = document.createElement("input");
    el.placeholder = "请输入内容，按回车添加"
    el.style.cssText = CSS.textArea
    replaceStyle(el, "border", `1px solid ${themeColor()}`)
    el.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addCategory(event.target.value)
            renderBoard(renderSpan())
            toBottom()
        }
    })
    Global.board.appendChild(el)
    toBottom()
}

function addCategory (name) {
    if (name.length > 10) {
        alert("分类名过长")
        return
    }
    let has = false
    Global.category.forEach((v, i) => {
        if (v.name === name) {
            alert("已存在该分类")
            has = true
            return
        }
    })

    if (has) return
    Global.category.push({
        name: name,
        spansText: [],
        setting: {},
        spans: []
    })
    Global.curCate = Global.category.length - 1
    saveGlobal()
}

function delCategory (name) {
    if(Global.category.length <= 1) {
        alert("必须有一个分类存在")
        return
    }
    let index = 0
    Global.category.map((v, i) => {
        if (v.name === name) {
            index = i
        }
    })
    Global.category.splice(index, 1)
    if(name === Global.curCate) {
        Global.curCate = Global.category[0].name
    }
    saveGlobal()
}

function categoryList () {
    let list = []
    for (let i = 0; i < Global.category.length; i++) {
        list.push(getCategorySpan(i, Global.category[i]))
    }
    let div = document.createElement("div")
    div.setAttribute("id", prefixStr("categoryList"))
    div.style.cssText = `${flexStyle({ jc: CSS.flex.start })}width:80%; margin: 0 20px 10px 0px;`
    div.append(...list)
    Global.board.appendChild(div)
    toBottom()
}

function getCategorySpan (i, cate) {
    let close = document.createElement("span")
    close.style = CSS.iconStyle
    close.style.cssText += `
    position: absolute;
    right: -9px;
    top: -14px;`
    close.innerText = "×"
    close.addEventListener("click", function (event) {
        delCategory(cate.name)
        let div = document.getElementById(prefixStr("categoryList"))
        div.removeChild(div.childNodes[i])
        event.stopImmediatePropagation()
    })

    let span = document.createElement("span")
    span.innerText = cate.name
    span.style.cssText = CSS.cateSpanStyle
    span.style.cssText += `position: relative;`
    span.addEventListener("click", function (event) {
        Global.curSpan = 0
        Global.curCate = cate.name
        renderBoard(renderSpan())
        document.getElementById(prefixStr("curCate")).innerText = `当前分类：${Global.curCate}`
    })

    span.appendChild(close)
    return span
}

/**
 * 文本栏
 */

//输入栏添加span
function showInput () {
    if (Global.board.childNodes.length > Global.boardChildNodes + 1) {
        return
    }
    let el = document.createElement("input");
    el.placeholder = "请输入内容，按回车添加"
    el.style.cssText = CSS.textArea
    replaceStyle(el, "border", `1px solid ${themeColor()}`)
    el.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addSpan(event.target.value, {})
            renderBoard(renderSpan())
            toBottom()
            saveGlobal()
        }
    })
    Global.board.appendChild(el)
    toBottom()
}

function addSpan (text, {
    cancel = false,
    editKey = "",
    finish = false,
    index = 0,
    input = false,
    key = "",
    set = false,
    show = false
}) {
    let s = createSpanData(text, getCurCateVal().spans.length)
    s.show = show
    s.input = input
    s.set = set
    s.finish = finish
    s.cancel = cancel
    s.index = index
    s.key = key
    s.editKey = editKey
    getCurCateVal().spans.push(s)
}

function createSpanData (text, i = 0) {
    return {
        text: text,
        cancel: false,
        editKey: "",
        finish: false,
        index: i,
        input: false,
        key: "",
        set: false,
        show: false,
    }
}

function randSpans () {
    if (isOnline()) {
        return [
            createSpanData("账号: 123456"),
            createSpanData("密码: 123456"),
            createSpanData("点击输入框，再点击任意文本即可自动填写。也可设置快捷键填写。")
        ]
    }
    let list = []
    for (let i = 0; i < Math.round(Math.random() * 10 + 3); i++) {
        let s = ""
        for (let j = 0; j < Math.round(Math.random() * 50 + 10); j++) {
            s += Math.round(Math.random() * 10).toString()
        }
        list.push(createSpanData(s, i))
    }
    return list
}

function getSpanText (index) {
    return getCurCateVal().spans[index].text
}

function getSpans () {
    let list = []
    for (let i = 0; i < getCurCateVal().spans.length; i++) {
        list.push(getSpan(i, getSpanText(i)))
    }
    return list
}

function getSpan (i, text) {
    let span = document.createElement("span")
    span.tabIndex = 0
    span.innerHTML = `
<p style="${CSS.pStyle}">${text}</p>
<div style="${CSS.spanSettingStyle}${isShow(getSpanData(i).show)}">

<input id="settingInput${i}" style="width: 80%; height: 30px;${isShow(getSpanData(i).input)}" type="text" placeholder="请按键设置" readonly>

<span style="${CSS.iconStyle}${isShow(getSpanData(i).set)}">settings</span>

<span style="${CSS.iconStyle}${isShow(getSpanData(i).finish)}">done</span>

<span style="${CSS.iconStyle}${isShow(getSpanData(i).cancel)}">close</span>
</div>
`
    span.style.cssText = CSS.spanStyle
    replaceStyle(span, "border", `1px solid ${themeColor()}`)
    span.addEventListener("click", function (event) {
        selectSpan(i)
        span.removeEventListener("keydown", moveSpan)
        span.addEventListener("keydown", moveSpan)
        if (Global.order === 0) {
            let target = `${Global.attributeName}="${Global.curInputDom}"`
            let element = document.querySelector(`input[${target}]`);
            element.value = text
        }
    })

    let childSpan = span.getElementsByTagName("span")
    childSpan[0].addEventListener("click", function () {
        settingCtl({ input: true, set: false, finish: true, cancel: true, index: i })
    })
    childSpan[1].addEventListener("click", function () {
        saveKey(i)
    })
    childSpan[2].addEventListener("click", function () {
        cancel(i)
    })
    return span
}

function selectSpan (i = Global.curSpan) {
    let spanList = getCurCateVal().spanList
    if(spanList.length === 0 || spanList.childNodes.length === 0) {
        return
    }
    
    let spanNodes = spanList.childNodes
    replaceStyle(spanNodes[Global.curSpan], "border", `1px solid ${themeColor()}`)

    Global.curSpan = i
    replaceStyle(spanNodes[Global.curSpan], "border", "1px solid red")
}

function moveSpan (event) {
    if (event.altKey) {
        let arrow = 0
        if (event.key === 'ArrowDown') {
            if (Global.curSpan >= getCurCateVal().spans.length - 1) {
                return
            }
            arrow = 1
        } else if (event.key === 'ArrowUp') {
            if (Global.curSpan <= 0) {
                return
            }
            arrow = -1
        }
        if (arrow !== 0) {
            let target = Global.curSpan + arrow
            let s = getCurCateVal().spans[Global.curSpan]
            getCurCateVal().spans.splice(Global.curSpan, 1)
            getCurCateVal().spans.splice(target, 0, s)
            exchangeSpanText(Global.curSpan, target)
            selectSpan(target)
            Global.curSpan = target
            // moveSpan无法多次触发问题，好bug，找了好久
            // 由于之前selectSpan()写法会先移除moveSpan事件，导致当前执行的moveSpan直接return了，
            // 无法触发后面添加moveSpan逻辑。
        }
    }
}

function exchangeSpanText (i, j) {
    let spanNodes = getCurCateVal().spanList.childNodes
    let a = spanNodes[i].getElementsByTagName("p")[0]
    let b = spanNodes[j].getElementsByTagName("p")[0]

    let t = a.innerText
    a.innerText = b.innerText
    b.innerText = t
}

function delSpan () {
    getCurCateVal().spans.splice(Global.curSpan, 1)
    Global.curSpan = 0
    renderBoard(renderSpan())
    saveGlobal()
}

function delAllSpan () {
    getCurCateVal().spans = []
    renderBoard(renderSpan())
    saveGlobal()
}

function renderSpan () {
    let div = document.createElement("div");
    div.setAttribute("id", "textSpanList")
    div.style.cssText = flexStyle({ fd: CSS.flex.column })
    div.append(...getSpans())
    getCurCateVal().spanList = div
    return div
}

function getSpanData (index) {
    return index >= 0 ? getCurCateVal().spans[index] : getCurCateVal().setting
}

/**
 * 快捷键
 */

function changeOrder () {
    let d = document.getElementById(prefixStr("orderOperation"))
    d.innerText = d.innerText === "先填后选" ? "先选后填" : "先填后选"
    Global.order = Global.order ? 0 : 1
    saveGlobal()
}

function editKey () {
    settingCtl({ show: !getCurCateVal().setting.show, set: !getCurCateVal().setting.set })
}

function settingCtl ({ show = true, input = false, set = true, finish = false, cancel = false, index = -1 }) {
    console.log(index, getCurCateVal().spans.length)
    if (index !== -1) {
        //单span控制
        let span = getCurCateVal().spans[index]
        getCurCateVal().spans[index].show = show
        getCurCateVal().spans[index].input = input
        getCurCateVal().spans[index].set = set
        getCurCateVal().spans[index].finish = finish
        getCurCateVal().spans[index].cancel = cancel
    } else {
        //全局控制
        getCurCateVal().setting.show = show
        getCurCateVal().setting.input = input
        getCurCateVal().setting.set = set
        getCurCateVal().setting.finish = finish
        getCurCateVal().setting.cancel = cancel
        getCurCateVal().spans.map(v => {
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

function listenKey (index) {
    let ss = getSpanData(index)
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

function saveKey (index) {
    let ss = getSpanData(index)
    let has = false
    getCurCateVal().spans.map(v => {
        if (v.key === ss.editKey && v.index !== ss.index) {
            alert(`文本 ${getSpanText(v.index)} 已设置该快捷键`)
            has = true
        }
    })
    if (!has) {
        ss.key = ss.editKey
        ss.editKey = ""
        settingCtl({ index: index })
    }
    saveGlobal()
}

function cancel (index) {
    let ss = getSpanData(index)
    ss.editKey = ""
    settingCtl({ index: index })
}


/**
 * 控制面板
 */

function changeBoardHeight (h) {
    Global.board.style.height = parseInt(Global.board.style.height) + h + "px"
}

function renderBoard (spanListDom) {
    Global.board.replaceChild(spanListDom, Global.board.childNodes[1])
    let l = Global.board.childNodes.length
    if (l > Global.boardChildNodes) {
        for (let i = Global.boardChildNodes; i < l; i++) {
            Global.board.removeChild(Global.board.lastChild)
        }
    }
    selectSpan()
}

function modeCtl () {
    if (Global.theme) {
        Global.theme = false
        replaceStyle(Global.board, "border", `5px solid ${themeColor()}`)
        getCurCateVal().spanList.childNodes.forEach(v => {
            replaceStyle(v, "border", `1px solid ${themeColor()}`)
        })
        return
    }
    Global.theme = true
    replaceStyle(Global.board, "border", `5px solid ${themeColor()}`)
    getCurCateVal().spanList.childNodes.forEach(v => {
        replaceStyle(v, "border", `1px solid ${themeColor()}`)
    })
    saveGlobal()
}

function topOperation () {
    let operation = document.createElement("div")
    operation.style.width = "100%"
    operation.innerHTML = `
<div id="${prefixStr("topOperation")}" style="${flexStyle({ jc: CSS.flex.end })}margin: 0 20px 10px 0px;">
    <span style="${CSS.iconStyle}font-size: 20px;">light_mode</span>
    <span style="${CSS.iconStyle}">expand_more</span>
    <span style="${CSS.iconStyle}">remove</span>
</div>`

    let childSpan = operation.getElementsByTagName("span")
    childSpan[0].addEventListener("click", modeCtl)
    childSpan[1].addEventListener("click", toBottom)
    childSpan[2].addEventListener("click", function () {
        boardCtl(false)
    })
    return operation
}

function bottomOperation () {
    let operation = document.createElement("div")
    operation.style.width = "100%"
    operation.innerHTML = `
<div id="${prefixStr("bottomOperation")}">
    <div style="${flexStyle({ jc: CSS.flex.end })}margin: 0 20px 10px 0px;">
        <span style="${CSS.operationStyle}" >快捷键</span>
        <span style="${CSS.operationStyle}">添加</span>
        <span style="${CSS.operationStyle}background: #ea5c5c;">删除</span>
        <span style="${CSS.operationStyle}margin-right: 0px;background: #ea5c5c;">清空</span>
    </div>
    <div style="${flexStyle({ jc: CSS.flex.end })}margin: 0 20px 10px 0px;">
        <span style="${CSS.operationStyle}">说明</span>
        <span style="${CSS.operationStyle}">保存配置</span>
        <span id="${prefixStr("orderOperation")}" style="${CSS.operationStyle}margin-right: 0px;">先填后选</span>
    </div>
    <div style="${flexStyle({ jc: CSS.flex.end })}margin: 0 20px 10px 0px;">
        <span style="${CSS.operationStyle}">⬆</span>
        <span style="${CSS.operationStyle}">⬇</span>
        <span style="${CSS.operationStyle}">添加分类</span>
        <span style="${CSS.operationStyle}margin-right: 0px;">分类列表</span>
    </div>
    <div style="${flexStyle({ jc: CSS.flex.end })}margin: 0 20px 10px 0px;">
        <span id="${prefixStr("curCate")}" style="${CSS.operationStyle}margin-right: 0px;">当前分类：${Global.curCate}</span>
    </div>
</div>`

    let list = [editKey, showInput, delSpan, delAllSpan, doc, saveGlobal, changeOrder, changeBoardHeight, changeBoardHeight, showCateInput, categoryList]
    list.forEach((v, i) => {
        if (v.name === "changeBoardHeight") {
            operation.getElementsByTagName("span")[i].addEventListener("click", function () {
                i % 2 === 0 ? v(40) : v(-40)
            })
        } else if (v.name === "saveGlobal") {
            operation.getElementsByTagName("span")[i].addEventListener("click", function () {
                if (saveGlobal()) {
                    alert(`保存成功!`)
                } else {
                    alert(`配置数据太旧，无法保存。请刷新页面后再编辑保存`)
                }
            })
        } else {
            operation.getElementsByTagName("span")[i].addEventListener("click", v)
        }
    })
    return operation
}

function board () {
    let b = document.createElement("div");
    b.style.cssText = CSS.boardStyle
    b.setAttribute("id", "fillTextBoard")
    b.appendChild(topOperation())
    b.appendChild(renderSpan())
    b.appendChild(bottomOperation())
    Global.board = b
    return b
}

function hiddenBoard () {
    let hb = document.createElement("div")
    hb.style.cssText = CSS.hiddenBoardStyle
    hb.setAttribute("id", "fillTextHiddenBoard")
    hb.innerHTML = `<span style="${CSS.iconStyle}font-size:30px;pointer-events: none;">add</span>`
    hb.addEventListener("click", function () {
        boardCtl(true)
    })
    Global.hiddenBoard = hb
    return hb
}

function boardCtl (show) {
    if (show === 0) {
        hiddenDom(Global.hiddenBoard)
        showDom(Global.board)
    } else if(show === 1) {
        hiddenDom(Global.board)
        showDom(Global.hiddenBoard)
    } else if(show === -1) {
        hiddenDom(Global.board)
        hiddenDom(Global.hiddenBoard)
    }

    Global.show = show
    saveGlobal()
}

//操作面板
function operationBoard () {
    document.body.appendChild(board())
    document.body.appendChild(hiddenBoard())
    document.body.addEventListener("keydown", function(event) {
        if(event.altKey) {
            if(event.key === "z") {
                Global.show === -1 ? boardCtl(0) : boardCtl(-1)
            }
        }
    })
    boardCtl(Global.show)
    moveDom(Global.board)
}

/**
 * 响应事件区
 */

function toBottom () {
    Global.board.scrollTop = Global.board.scrollHeight
}

function moveDom (dom) {
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

function doc () {
    alert("快捷键建议Alt开头或纯字母数字，如：Alt+1、qq、11")
}


