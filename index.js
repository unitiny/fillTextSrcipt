let global = {};
(function () {
    console.log("start work")
    global = {
        curInputDom: 0,
        attributeName: "data-fillText",
        clipBoardList: [],
        style: {
            childCenter1: `
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;`,
            childCenter2: `
            display: flex;
            justify-content: flex-start;
            align-items: center;
            flex-direction: column;`
        }
    }
    global.style.divStyle = `
                display: block;
                width: 300px;
                height: 400px;
                margin: 10px;
                border: 1px solid skyblue;
                border-radius: 5px;
                overflow: auto`
    global.style.spanStyle = `
                ${global.style.childCenter1}
                margin: 10px 20px;
                border: 1px solid skyblue;
                border-radius: 7px;
                height: 70px;`
    global.style.pStyle = `
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    padding: 0 10px 0 10px;`
    setInputDom()
    operationBoard()
})();

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

function getClipList() {
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

function fillText(event) {
    let target = `${global.attributeName}="${global.curInputDom}"`
    let element = document.querySelector(`input[${target}]`);
    element.value = event.target.innerText
}

//操作面板
function operationBoard() {
    let div = document.createElement("div");
    div.style.cssText = global.style.divStyle

    let list = getClipList()
    let spanStyle = global.style.spanStyle
    for (const k in list) {
        let span = document.createElement("span")
        span.innerHTML = `<p style="${global.style.pStyle}">${list[k]}</p>`
        span.style.cssText = spanStyle
        span.addEventListener("click", fillText)
        div.appendChild(span)
    }

    let board = document.createElement("div");
    board.setAttribute("id", "fillTextDiv")
    board.appendChild(div)
    document.body.appendChild(board)
}




