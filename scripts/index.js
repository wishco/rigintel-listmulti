
var SELECTOR_NEXT_ACTIVE = 'ul' // перебор по ноде, вглубь (сокращаем ноду) т.е. идём к потомку
var SELECTOR_PREVIOS_ACTIVE = 'ul' // перебор по ноде, вверх (увеличиваем ноду) т.е. идём к parent
var SELECTOR_PREVIOS_TEXT = 'li' // перебор по ноде, вверх (увеличиваем ноду) т.е. идём к parent

var SELECTOR_OUT = 'box' // селектор, куда будем писать данные
var SELECTOR_IN = 'text' // селектор, откуда будем брать данные

var PREFIX_VALUE = 'value' // префикс value
var PREFIX_SHORT = 'short' // префикс short 
var SHORT_SEPARATOR = "/"

var listmultiStructure = new createBlankBlock('listmulti')
var listmultiAll = document.querySelectorAll(listmultiStructure.getClassName()) // .listmulti

var getData = dataMain() // данные

var handlerClick = function (e) {

  // список обработчиков (кликов/нажатий):
  // 1. На главный элемент блока: [products]
  // 2. На элемент выпадающего списка: [prod1], [prod1->item1], [prod1->item1->base1]
  // 3. На последный элемент списка: [prod1->item1->base1->200] 200 это последний элемент списка

  // isMainBlockClicked: BOOL состояние нажали/нет, на главный элемент блока
  var isMainBlockClicked = isNodeRootBlock.bind(this)(e.target)

  // target: если клик по лицевому элементу, то берём ноду текущую, иначе берем ноду родительскую от клика в списке
  var target = isMainBlockClicked ? e.target : e.target.parentElement

  // nodeForAction: нода, ищем ближайший селектор для последущих действий
  var nodeForAction = target.querySelector(SELECTOR_NEXT_ACTIVE)

  // isNoLastBlockClicked: BOOL состояние нажали/нет, на последний блок в списке
  // false:  элемент списка: не последний, при нажатии снимаем прежнюю ACTIVE у элементов и создаем у дерева новую ACTIVE
  // true: элемент списка: последний, при нажатии, делаем выбор и снимаем ACTIVE
  var isNoLastBlockClicked = !!nodeForAction

  // 1. Обработчик при нажатии, На главный элемент блока:
  if (isMainBlockClicked) {
    var isActiveStatus = nodeForAction.classList.contains(this.active)
    clearActiveClases.bind(this)(e)
    if (!isActiveStatus) {
      var nodeOut = target.querySelector(this.getClassName(SELECTOR_OUT))
      nodeOut.classList.add(this.active)
      nodeForAction.classList.add(this.active) // устанавливаем ACTIVE, если не было ACTIVE
    }
    return // выходим из функции, сделали всё что надо
  }

  // 2. Обработчик при нажатии, На элемент выпадающего списка:
  if (isNoLastBlockClicked) {
    clearActiveClases.bind(this)(e)
    var root = getRootNodeOfBlock.bind(this)(e.target)
    var nodeOut = root.querySelector(this.getClassName(SELECTOR_OUT))
    nodeOut.classList.add(this.active) // делаем root активным
    nodeForAction.classList.add(this.active) //  делаем активным элемент, на который кликнули

    function ActionForEachElementOfChain(nodeForActive) { // Action по цепочке нод
      nodeForActive.classList.add(this.active) // делаем  активными элементы цепочки
    }
    // элементы, которые находятся в цепочке вложения от текущего (запускаем, Action по цепочке нод)
    taskPreviosElements.bind(this)(nodeForAction, SELECTOR_PREVIOS_ACTIVE, ActionForEachElementOfChain)
    return // выходим из функции, сделали всё что надо
  }

  // 3. Обработчик при нажатии, На последний элемент списка:
  var root = getRootNodeOfBlock.bind(this)(e.target)
  var nodeForChangingAttributes = root.querySelector(this.getClassName(PREFIX_VALUE))
  updateAttributeFromSourceToTarget.bind(this)(e.target, nodeForChangingAttributes, PREFIX_VALUE)
  clearActiveClases.bind(this)(e)

  var nodeIn = target.querySelector(this.getClassName(SELECTOR_IN))
  var getInObjData = {}
  getInObjData.short = []
  getInObjData.text = []
  getInObjData.value = getAttrtFromNode.bind(this)(nodeIn, PREFIX_VALUE)

  function ActionForEachElementOfChainIfClickOnLastElement(node) { // Action по цепочке нод
    var _nodeIn = node.querySelector(this.getClassName(SELECTOR_IN))
    var newShortChain = getAttrtFromNode.bind(this)(_nodeIn, PREFIX_SHORT) || _nodeIn.innerHTML
    getInObjData.short.unshift(newShortChain) // добавляем, каждый след. элемент в начало массива
    getInObjData.text.unshift(_nodeIn.innerHTML)

  }
  taskPreviosElements.bind(this)(nodeIn, SELECTOR_PREVIOS_TEXT, ActionForEachElementOfChainIfClickOnLastElement)

  var shortResult = getInObjData.short.join(SHORT_SEPARATOR)
  var textResult = getInObjData.text.join(' ' + SHORT_SEPARATOR + ' ')
  updateInnerHtmlFromValue.bind(this)(shortResult, nodeForChangingAttributes, PREFIX_VALUE)
  root.setAttribute('title', textResult)

  // Конец. Обработчики закончили работу  

  // получить атрибут, если он есть иначе undefined
  function getAttrtFromNode(node, prefix) {
    var attr_string = this.getAttribute(prefix)
    var hasShort = node.hasAttribute(attr_string)
    return hasShort ? node.getAttribute(attr_string) : void 0
  }

  // Изменить элементы от текущей ноды, до root 
  function taskPreviosElements(nodeCurr, selector, fnChanging) {
    var prev = nodeCurr
    do { // цикл пока не найдем root блока или не получим null(null - в ноде, нет необходимых условий)
      var prev = getPreviosElement.bind(this)(prev, selector)
      if (prev) fnChanging.call(this, prev)

    }
    while (prev !== null);
  }

  // получить прошлую ноду если подходит по селектору (ведем поиск к родителю)
  function getPreviosElement(nodeCurr, selector) {
    var nodeParent = nodeCurr.parentElement

    if (!nodeParent) return null // если не нашли ноду, то выходим
    var isIntoRootElement = nodeParent.classList.contains(this.getClass())
    if (isIntoRootElement) return null // если Root елемент, то выходим

    var isExistClassIntoElement = nodeParent.classList.contains(this.getClass(selector))

    if (isExistClassIntoElement) return nodeParent // если TRUE - то возвращаем искомую НОДУ
    return getPreviosElement.bind(this)(nodeParent, selector)  // иначе запускаем поиск заново, но уже по Parent ноде
  }

  // clearActiveClases: Сброс у всех блоков, класс ACTIVE
  function clearActiveClases(e) {
    var clearActivesAllBlocks = document.querySelectorAll(this.getClassName())
    function fn_clearActivesAllBlocks(el) {
      var activeClasses = el.querySelectorAll(this.getClassNameActive())
      function fn_removeClass(_el) {
        _el.classList.remove(this.active)
      }
      activeClasses.forEach(fn_removeClass.bind(this))
    }
    clearActivesAllBlocks.forEach(fn_clearActivesAllBlocks.bind(this))
  }

  // getRootNodeOfBlock: НОДА, получить 'главную' ноду (главный родительский блок)
  function getRootNodeOfBlock(node) {
    if (isNodeRootBlock.bind(this)(node)) return node
    return getRootNodeOfBlock.bind(this)(node.parentElement)
  }

  function updateAttributeFromSourceToTarget(nodeSource, nodeChange, attrName) {
    var attrSourceValue = nodeSource.getAttribute(this.getAttribute(attrName))
    attrSourceValue ? nodeChange.setAttribute(this.getAttribute(attrName), attrSourceValue) : nodeChange.removeAttribute(this.getAttribute(attrName))
  }

  function updateInnerHtmlFromValue(value, nodeChange) {
    var value = String(value).trim()
    nodeChange.innerHTML = value
  }

  // isNodeRootBlock: BOOL текущая нода ROOT или НЕТ (главный родительский блок или НЕТ)
  function isNodeRootBlock(node) {
    // var result = node.classList.contains(BEM_BLOCK)
    var result = node.classList.contains(this.getClass())
    return result
  }
}

function createStructureHtmlFromObject(mainNode) {
  var newDiv = document.createElement('div')
  newDiv.innerHTML = getTemplateBlank()
  newDiv.classList.add(this.getClass())
  mainNode.append(newDiv)

  console.log("createStructureHtmlFromObject");
  console.log(this);
}

var mainNode = document.querySelector('.wrapper1')
createStructureHtmlFromObject.bind(listmultiStructure)(mainNode)

var t = mainNode.querySelector(".listmulti__value")
console.log(t);

console.log(dataMain());






// res2 = Object.values(result.value.map((item)=> {
//   res.push( JSON.parse('{' + item + '}'))
//   console.log(res)
// })








function dataMain() {
  console.log(111111111111111);
  return [
    {
      id: "item1",
      short: 'знач1',
      text: 'Значение1',
      value: 100
    },
    {
      id: "item2",
      short: 'знач2',
      text: 'Значение2',
      sub: [
        {
          id: "sub1-item1",
          short: 'sub1-знач1',
          text: 'sub1-Значение1',
          value: 1100
        },
        {
          id: "sub1-item1",
          short: 'sub1-знач1',
          text: 'sub1-Значение1',
          sub: [
            {
              id: "sub2-item1",
              short: 'sub2-знач1',
              text: 'sub2-Значение1',
              value: 2100
            },
            {
              id: "sub2-item2",
              short: 'sub2-знач2',
              text: 'sub2-Значение2',
              value: 2200
            }
          ]
        },
        {
          id: "sub1-item1",
          short: 'sub1-знач1',
          text: 'sub1-Значение1',
          value: 1300
        }
      ]
    },
    {
      name: "item3",
      short: 'знач3',
      text: 'Значение3',
      value: 300
    },
  ]
}

// sub: {
//   values: [200, 190, 180, 170, 160, 150],
// }

function getTemplateItemWrapper() {
  `<ul class='listmulti__ul'>
  </ul>`
}

function getTemplateItem() {
  `<li class='listmulti__li'>
    <a class="listmulti__text" href='#'></a>
  </li>`
}

function getTemplateBlank() {
  return `
 <div data-listmulti-out="data-listmulti-out" class="listmulti__box">
   <a class="listmulti__value"></a>
   <div class="listmulti__svg-select">
     <svg class="svg-select" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="15px" height="5px" viewBox="0 0 0.9 0.3">
       <path class="svg-select__path" d="M0.4 0.3l-0.4 -0.3c0.3,0 0.6,0 0.9,0 -0.1,0.1 -0.3,0.2 -0.5,0.3z"/>
     </svg>
   </div>
 </div>
`
}





function fh_linkHandler(el) {
  var currHandler = handlerClick.bind(listmultiStructure)
  el.addEventListener('click', currHandler, false)
}
// Добавляем, обработчики событий на блоки
listmultiAll.forEach(fh_linkHandler.bind(this))
