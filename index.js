let global = {};
const flex = {
    bs: "space-between",
    start: "flex-start",
    end: "flex-end",
    center: "center",
    column: "column",
    row: "row"
};
const linkResource = [
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
];
(function () {
    global = {
        curInputDom: 0,
        curSpan: 0,
        attributeName: "data-fillText",
        clipBoardList: [],
        spansText: randText(),
        style: {},
    }
    loadResource()
    initStyle()
    setInputDom()
    operationBoard()
})();

function icons() {
    // <span className="material-symbols-outlined">delete</span>
    // <span className="material-symbols-outlined">colorize</span>
}

function getLink(href) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    return link
}

function loadResource() {
    for (const l of linkResource) {
        document.head.appendChild(getLink(l));
    }
}

function initStyle() {
    global.style.boardStyle = `
    ${flexStyle({jc: flex.bs, fd: flex.column})}
    width: 330px;
    height: 400px;
    margin: 10px;
    border: 5px solid skyblue;
    border-radius: 5px;
    overflow: auto;`
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
                border: 1px solid skyblue;
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
    width: 55px;
    height: 35px;
    border-radius: 5px;
    background: #4bb84b;
    color: white;
    font-size: 16px;
    text-align: center;
    line-height: 33px;`
    global.style.textArea = `
    border: 1px solid skyblue;
    border-radius: 5px;
    flex-grow: 0;
    flex-shrink: 0;
    min-width: 250px; 
    max-width: 250px; 
    min-height: 100px; 
    max-height: 100px; 
    margin: 10px 0 10px 0;`
}

function flexStyle({jc = flex.center, ai = flex.center, fd = flex.row}) {
    return `display: flex;
            justify-content: ${jc};
            align-items: ${ai};
            flex-direction: ${fd};`
}

//设置input节点
function setInputDom() {
    let inputDoms = document.querySelectorAll('input[type="text"]');
    inputDoms.forEach(function (dom, i) {
        dom.setAttribute(global.attributeName, i)
        dom.addEventListener("click", function (event) {
            let d = event.target
            global.curInputDom = d.getAttribute(global.attributeName)
        })
    })
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

function getLocalData() {
    let list = []
    return list
}

function showInput() {
    if (global.board.childNodes.length > 2) {
        return
    }
    let el = document.createElement("input");
    el.placeholder = "请输入内容，按回车添加"
    el.style.cssText = global.style.textArea
    el.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            global.spansText.push(event.target.value)
            renderBoard(renderSpan())
            global.board.scrollTop = global.board.scrollHeight
        }
    })
    global.board.appendChild(el)
    global.board.scrollTop = global.board.scrollHeight
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
    span.innerHTML = `<p style="${global.style.pStyle}">${text}</p>`
    span.style.cssText = global.style.spanStyle
    span.addEventListener("click", function (event) {
        global.curSpan = i
        let target = `${global.attributeName}="${global.curInputDom}"`
        let element = document.querySelector(`input[${target}]`);
        element.value = event.target.innerText
    })
    return span
}

function delSpan() {
    global.spansText.splice(global.curSpan, 1)
    global.curSpan = 0
    renderBoard(renderSpan())
}

function delAllSpan() {
    global.spansText = []
    renderBoard(renderSpan())
}

function renderBoard(spanListDom) {
    global.board.replaceChild(spanListDom, global.board.childNodes[0])
    let l = global.board.childNodes.length
    if (l > 2) {
        for (let i = 2; i < l; i++) {
            global.board.removeChild(global.board.lastChild)
        }
    }
}

function renderSpan() {
    let div = document.createElement("div");
    div.setAttribute("id", "textSpanList")
    div.style.cssText = flexStyle({fd: flex.column})
    div.append(...getSpans())
    return div
}

//操作面板
function operationBoard() {
    let operation = document.createElement("div")
    operation.style.width = "100%"
    operation.innerHTML = `
<div id="operation" style="${flexStyle({jc: flex.end})}margin: 0 20px 10px 0px;">
    <span style="${global.style.operationStyle}margin-right: 10px;" onclick="showInput()">添加</span>    
    <span style="${global.style.operationStyle}margin-right: 10px;background: #ea5c5c;" onclick="delSpan()">删除</span>    
    <span style="${global.style.operationStyle}margin-right: 0px;background: #ea5c5c;" onclick="delAllSpan()">清空</span>
</div>`

    let board = document.createElement("div");
    board.style.cssText = global.style.boardStyle
    board.setAttribute("id", "fillTextDiv")
    board.appendChild(renderSpan())
    board.appendChild(operation)
    document.body.appendChild(board)
    global.board = board
}




