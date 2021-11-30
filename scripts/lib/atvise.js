console.log('component running...')

//---------------------------------------------------	
var idListItem = -1 // последний заданный идентификатор для элемента списка (-1 еще не задан)

var root = webMI.query["listsignal"]
console.log("root", root)
//---------------------------------------------------	
async function getListStructure(listRoot) {
  console.log("listRoot", listRoot)
  var objResult = []
  var rootParam = listRoot
  var paramArray = await getRootArrayFromRootParam(rootParam) // получить массив параметров, из разных типов параметров


  console.log("paramArray:", paramArray)
  console.log("END:")


  //  console.log("paramValue", paramValue)
}

//---------------------------------------------------	
// getListStructure(root)

// testing:
// getListStructure('') // пустое значение
// getListStructure('фывфывфывфывфыв') // пустое значение
// getListStructure('["фывфывфывфывфыв"]') // массив
// getListStructure('["200", "190", "180", "170"]') // массив несколько значений
getListStructure('AGENT.OBJECTS._wishco.add1.combo2') // массив несколько значений

//---------------------------------------------------

async function getRootArrayFromRootParam(param) {
  // если param не объект, то входящий string пробуем преобразовать обработки
  if (typeof param === "object") { // ЕСЛИ ПРОСТОЙ МАССИВ
    console.log("ВХОД объект!")
    return Object.values(param) // ВЫХОДИМ!, возвращам массив [объект приводим в массив]
  }

  var rootArray = parseJSON_ToArray(param)
  if (rootArray) { // ЕСЛИ ПРОСТОЙ МАССИВ
    console.log("ВХОД Массив!")
    var rootArrResult = rootArray.map((el) => {
      return { id: getId(), text: el, value: el }
    })
    return rootArrResult // ВЫХОДИМ!, возвращам массив
  }

  var paramRoot1 = await getAsyncParam(param)
  var isSubElement = !!paramRoot1.value // есть свойство, значит есть вложенные элементы...

  if (!isSubElement) { // если нет вложенных элементов, получаемое значение СТРОКА
    var isArrayCurrParam = []
    isArrayCurrParam.push({ id: getId(), text: param, value: param })
    console.log("isArrayCurrParam", isArrayCurrParam)
    return isArrayCurrParam // ВЫХОДИМ!, возвращам массив
  }

  if (isSubElement) { // если есть sub вложение
    var paramRoot2 = await getAsyncParam(paramRoot1.value)
    /// !!! если захотим в переменную, напрямую записывать JSON объект для comboBox, то тут должен быть обработчик для JSON 'paramRoot2' 
    if (!!paramRoot2.value) { // если у вложения в значение, задано значение глобальной переменной Atvise, то пляшем от его значения
      paramRoot1 = paramRoot2
    }
  }

  if (!isSubElement) { // если нет вложенных элементов, получаемое значение СТРОКА
    var isArrayCurrParam = []
    isArrayCurrParam.push({ id: getId(), text: param, value: param })
    console.log("isArrayCurrParam", isArrayCurrParam)
    return isArrayCurrParam // ВЫХОДИМ!, возвращам массив
  }


  console.log("paramRoot1", paramRoot1)
  // если есть вложенные элементы (переменная ATVISE)
  var paramValue3 = paramRoot1.value

  // if (Array.isArray(paramValue3)) {
  //   var u1 = paramValue3.map((_el) => {
  //     console.log(_el)
  //     var _elParse = JSON.parse(_el)
  //     return _elParse
  //   })
  //   console.log("paramValue Arrray", true)
  //   console.log("paramValue Arrray", u1)
  // } else {
  //   console.log("paramValue Arrray", false)
  // }



  // если нет вложенных элементов
  console.log("paramRoot", paramRoot1)



}


function getId() {
  return ++idListItem
}

function parseJSON_ToArray(param) {
  var parseResult
  try {
    parseResult = JSON.parse(param)
  } catch (error) {
    parseResult = ""
  }
  return Array.isArray(parseResult) ? parseResult : null // возвращаем массива или null
}

function getArrayParametersFromString() {

}


// получить параметр, ассинхронно
async function getAsyncParam(param) {
  console.log("paramRoo2")
  var promise = new Promise(function (resolve, reject) {
    webMI.data.read(param, function (resultParam) {
      resolve(resultParam)
    })
  })
  console.log("paramRoo3")
  return promise
}











