
var SELECTOR_FOR_FIND = 'ul'
var PREFIX_VALUE = 'value'

var listmultiStructure = new createBlankBlock('listmulti')



var listmultiAll = document.querySelectorAll(listmultiStructure.getClassName()) // .listmulti

var m = document.getElementsByClassName(listmultiStructure.getClass())

console.log("aaaaaaaaaaaaa", m);

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
  var nodeForAction = target.querySelector(SELECTOR_FOR_FIND)

  // isNoLastBlockClicked: BOOL состояние нажали/нет, на последний блок в списке
  // false:  элемент списка: не последний, при нажатии снимаем прежнюю ACTIVE у элементов и создаем у дерева новую ACTIVE
  // true: элемент списка: последний, при нажатии, делаем выбор и снимаем ACTIVE
  var isNoLastBlockClicked = !!nodeForAction

  // 1. Обработчик при нажатии, На главный элемент блока:
  if (isMainBlockClicked) {
    var isActiveStatus = nodeForAction.classList.contains(this.active)
    clearActiveClases.bind(this)(e)
    if (!isActiveStatus) nodeForAction.classList.add(this.active) // устанавливаем ACTIVE, если не было ACTIVE
    return // выходим из функции, сделали всё что надо
  }

  // 2. Обработчик при нажатии, На элемент выпадающего списка:
  if (isNoLastBlockClicked) {
    return // выходим из функции, сделали всё что надо
  }
  // 3. Обработчик при нажатии, На последный элемент списка:
  var root = getRootNodeOfBlock.bind(this)(e.target)
  var nodeForChangingAttributes = root.querySelector(this.getClassName(PREFIX_VALUE))
  updateAttributeFromSourceToTarget.bind(this)(e.target, nodeForChangingAttributes, PREFIX_VALUE)
  updateInnerHtmlFromValue.bind(this)(e.target.innerHTML, nodeForChangingAttributes, PREFIX_VALUE)
  clearActiveClases.bind(this)(e)


  // clearActiveClases: Сброс у всех блоков, класс ACTIVE
  // function clearActiveClases(e) {
  //   var clearActivesAllBlocks = document.querySelectorAll(this.getClassName())
  //   clearActivesAllBlocks.forEach(el => {
  //     var activeClasses = el.querySelectorAll(this.getClassNameActive())
  //     activeClasses.forEach(_el => {
  //       _el.classList.remove(this.active)
  //     })
  //   })
  // }
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
    console.log("value:", value);

  }


  // isNodeRootBlock: BOOL текущая нода ROOT или НЕТ (главный родительский блок или НЕТ)
  function isNodeRootBlock(node) {
    // var result = node.classList.contains(BEM_BLOCK)
    var result = node.classList.contains(this.getClass())
    return result
  }
}


function fh_linkHandler(el) {
  console.log("el1");
  console.log(el);
  console.log("el2");
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