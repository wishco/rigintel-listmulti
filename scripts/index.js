
var SELECTOR_NEXT_ELEMENT = 'ul' // перебор по ноде, вглубь (сокращаем ноду) т.е. идём к потомку
var SELECTOR_PREVIOS_ELEMENT = 'ul' // перебор по ноде, вверх (увеличиваем ноду) т.е. идём к parent
var SELECTOR_OUT = 'box' // селектор, куда будем писать данные
var SELECTOR_IN = 'text' // селектор, откуда будем брать данные

var PREFIX_VALUE = 'value' // префикс value
var PREFIX_SHORT = 'short' // префикс short 
var SIMBOL_SHORT = "/"

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
  var nodeForAction = target.querySelector(SELECTOR_NEXT_ELEMENT)

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
    changePreviosElements.bind(this)(nodeForAction, ActionForEachElementOfChain)
    return // выходим из функции, сделали всё что надо
  }

  // 3. Обработчик при нажатии, На последний элемент списка:
  var root = getRootNodeOfBlock.bind(this)(e.target)
  var nodeForChangingAttributes = root.querySelector(this.getClassName(PREFIX_VALUE))
  updateAttributeFromSourceToTarget.bind(this)(e.target, nodeForChangingAttributes, PREFIX_VALUE)
  updateInnerHtmlFromValue.bind(this)(e.target.innerHTML, nodeForChangingAttributes, PREFIX_VALUE)
  clearActiveClases.bind(this)(e)

  var nodeIn = target.querySelector(this.getClassName(SELECTOR_IN))
  var getInObjData = {}
  getInObjData.short = getAttrtFromNode.bind(this)(nodeIn, PREFIX_SHORT) || nodeIn.innerHTML
  getInObjData.value = getAttrtFromNode.bind(this)(nodeIn, PREFIX_VALUE)

  console.log("getInObjData:", getInObjData);



  function getAttrtFromNode(node, prefix) { // получить атрибут, если он есть иначе undefined
    var attr_string = this.getAttribute(prefix)
    var hasShort = node.hasAttribute(attr_string)
    return hasShort ? node.getAttribute(attr_string) : void 0
  }










  // Изменить элементы от текущей ноды, до root 
  function changePreviosElements(nodeCurr, fnChanging) {
    var prev = nodeCurr
    do { // цикл пока не найдем root блока или не получим null(null - в ноде, нет необходимых условий)
      var prev = getPreviosElement.bind(this)(prev, SELECTOR_PREVIOS_ELEMENT)
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

function fh_linkHandler(el) {
  var currHandler = handlerClick.bind(listmultiStructure)
  el.addEventListener('click', currHandler, false)
}
// Добавляем, обработчики событий на блоки
listmultiAll.forEach(fh_linkHandler.bind(this))



function dataMain() {
  return
  [
    {
      name: "item1",
      textName: 'Значение1',
      arr: [200, 190, 180, 170, 160, 150]
    },
    {
      name: "item2",
      textName: 'Значение2',
      arr: [200, 190, 180, 170, 160, 150]
    },
    {
      name: "item3",
      textName: 'Значение3',
      arr: [200, 190, 180, 170, 160, 150]
    },
    {
      name: "item4",
      textName: 'Значение4',
      arr: [200, 190, 180, 170, 160, 150]
    }
  ]
}