console.log('component running...')

//---------------------------------------------------	
var idListItem = -1 // последний заданный идентификатор для элемента списка (-1 еще не задан)
var root = webMI.query["listsignal"]
console.log("root", root)
//---------------------------------------------------	
async function getListStructure(listRoot) {
  // console.log("listRoot", listRoot)
  var objResult = []
  var rootParam = listRoot
  var paramArray = await getRootArrayFromRootParam(rootParam) // получить массив параметров, из разных типов параметров

  console.log("paramArray:", paramArray)
  console.log("END:")
}

var TESTING = false
TESTING = 'AGENT.OBJECTS._wishco.add1.step' // шаги берём из переменной в ATVISE
// TESTING = 1 // STEP 1
//---------------------------------------------------	
// запускаем: тестирование или обычный запуск
TESTING ? testing(TESTING, root) : getListStructure(root)
// КОНЕЦ МОДУЛЯ
//---------------------------------------------------	
//---------------------------------------------------	

async function getRootArrayFromRootParam(param) {
  // если param не объект, то входящий string пробуем преобразовать обработки

  // 1.
  // console.log("STEP 1");
  // if (await getTypeParam(param) === "isEmpty") {
  //   console.log("Параметр не задан!!!!!!!!!!!!!!!!")
  //   return { id: getId(), text: webMI.query["caption"], value: webMI.query["caption"] }
  // }

  // .
  // console.log("STEP 2");
  // var paramRoot111 = await getAsyncParam(param)
  // if (getTypeParam(param) === "string") { // ЕСЛИ простая строка
  //   console.log("ВХОД string!")
  //   return param // ВЫХОДИМ!, возвращам массив [объект приводим в массив]
  // }

  // .
  // console.log("STEP 2");
  // if (typeof param === "object") { // ЕСЛИ object
  //   console.log("ВХОД объект!")
  //   return Object.values(param) // ВЫХОДИМ!, возвращам массив [объект приводим в массив]
  // }

  // .
  // console.log("STEP 2");
  // var rootArray = parseJSON_ToArray(param)
  // if (rootArray) { // ЕСЛИ ПРОСТОЙ МАССИВ
  //   console.log("ВХОД Массив!")
  //   var rootArrResult = rootArray.map((el) => {
  //     return { id: getId(), text: el, value: el }
  //   })
  //   return rootArrResult // ВЫХОДИМ!, возвращам массив
  // }

  // .
  // console.log("STEP 3");
  // var paramRoot1 = await getAsyncParam(param)
  // var isSubElement = !!paramRoot1.value // есть свойство, значит есть вложенные элементы...
  // if (!isSubElement) { // если нет вложенных элементов, получаемое значение СТРОКА
  //   var isArrayCurrParam = []
  //   isArrayCurrParam.push({ id: getId(), text: param, value: param })
  //   console.log("isArrayCurrParam", isArrayCurrParam)
  //   return isArrayCurrParam // ВЫХОДИМ!, возвращам массив
  // }

  // .
  // console.log("STEP 4");
  // if (isSubElement) { // если есть sub вложение
  //   var paramRoot2 = await getAsyncParam(paramRoot1.value)
  //   /// !!! если захотим в переменную, напрямую записывать JSON объект для comboBox, то тут должен быть обработчик для JSON 'paramRoot2' 
  //   if (!!paramRoot2.value) { // если у вложения в значение, задано значение глобальной переменной Atvise, то пляшем от его значения
  //     paramRoot1 = paramRoot2
  //   }
  // }

  // .
  // console.log("STEP 5");
  // if (!isSubElement) { // если нет вложенных элементов, получаемое значение СТРОКА
  //   var isArrayCurrParam = []
  //   isArrayCurrParam.push({ id: getId(), text: param, value: param })
  //   console.log("isArrayCurrParam", isArrayCurrParam)
  //   return isArrayCurrParam // ВЫХОДИМ!, возвращам массив
  // }

  var res1 = await getTypeAndValueFromParam(param)
  console.log("+++++++++++")
  console.log("getTypeParam: ", res1)
  console.log("+++++++++++")


  // если есть вложенные элементы (переменная ATVISE)
  // var paramValue3 = paramRoot1.value

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
  // console.log("paramRoot", paramRoot1)
  //


}

!!!!!!!!!!!!!!!утром начать с  138 строки, varFromParam1 перебрать типы

async function getTypeAndValueFromParam(param) {

  if (param === "") return { type: "isEmpty", value: "" }
  if (typeof param === "object") return { type: "isObject", value: param }

  var parseParam = parseJSON_ToArray(param)
  if (parseParam) return { type: "isArray", value: parseParam }

  var varFromParam1 = (await getAsyncParam(param)).value // если входящий параметр переменная, её значение / иначе null
  if (!varFromParam1) return { type: "isBasic", value: param } // если string number и пр... всё в basic

  if (varFromParam1 === "") return { type: "isEmpty", value: "" }
  if (typeof varFromParam1 === "number") return { type: "isBasic", value: varFromParam1 }

  parseParam = parseJSON_ToArray(varFromParam1)
  if (parseParam) return { type: "isArray", value: parseParam }
  parseParam = parseAtviseJSON_ToArray(varFromParam1)
  if (parseParam) return { type: "isArray", value: parseParam }

  console.log("!!!!!!!!!!!!!!!!parseParam", parseParam);

  var varFromParam2 = varFromParam1 && (await getAsyncParam(varFromParam1)).value || null // если входящий параметр переменная, и у неё строка, тоже переменная, то тут её значение / иначе null
  var varFromParamCalc = varFromParam2 && varFromParam2 || varFromParam1

  if (varFromParam1 && !varFromParam2)

    if (varFromParam2 === "") return { type: "isEmpty", value: "" }
  if (typeof varFromParam2 === "number") return { type: "isNumber", value: varFromParam1 }


  console.log("!!!!!!!!!!!!!!!!!!!4-1", param);
  console.log("!!!!!!!!!!!!!!!!!!!4-2", varFromParam1);
  console.log("!!!!!!!!!!!!!!!!!!!4-3", await getAsyncParam(varFromParam1));

  console.log("!!!!!!!!!!!!!!!!!!!5", param);

  console.log("!!!!!!!!!!!!!!!!!!!6", param);
  if ((varFromParam1 === "") || (varFromParam2 === "")) return { type: "isEmpty", value: "" }

  console.log("varFromParam1", varFromParam1);
  console.log("varFromParam2", varFromParam2);
  console.log("varFromParamCalc", varFromParamCalc);
  console.log("!!!!!!!!!!!!!!!!!!!5", param);

  if (varFromParamCalc) {
    return { type: "isVar", value: varFromParamCalc }
  }

  // все другие варианты считаем, базовые и возвращаем просто их значения (типа стринг, число...)
  return { type: "isBasic", value: param }

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

  console.log(param);
  console.log("fffffffffffffffffffff111111111111111", Array.isArray(parseResult));
  return Array.isArray(parseResult) ? parseResult : null // возвращаем массив или null
}

function parseAtviseJSON_ToArray(param) {
  var parseResult
  try {
    parseResult = param.map((el) => {
      var arr = JSON.parse("{" + el + "}")
      return Object.values(arr)
    })
  } catch (error) {
    parseResult = ""
  }

  console.log(param);
  console.log("fffffffffffffffffffff22222222222", Array.isArray(parseResult));
  return Array.isArray(parseResult) ? parseResult : null // возвращаем массив или null
}




function getArrayParametersFromString() {

}


// получить параметр, ассинхронно
async function getAsyncParam(param) {
  var promise = new Promise(function (resolve, reject) {
    webMI.data.read(param, function (resultParam) {
      resolve(resultParam)
    })
  })
  return promise
}





// ==============================
// тестируем элемент
async function testing(step, root) {
  var atviseValue = root
  var testingStep = null
  var testingParam = null
  var testingComment = null

  if (typeof step === "string") {
    var p = await getAsyncParam(step)
    testingStep = p.value
    console.log("step string", testingStep)
  }
  else {
    console.log("step number");
    testingStep = step
  }


  switch (testingStep) {

    case 1:
      testingParam = ''
      testingComment = "тестируем параметр, значение - строка: пустая строка"
      break
    case 2:
      testingParam = 'Привет мир!'
      testingComment = "тестируем параметр, значение - строка: " + testingParam
      break
    case 3:
      testingParam = test_vars().arr1
      testingComment = "тестируем параметр, значение - массив: " + testingParam
      break
    case 4:
      testingParam = test_vars().obj1
      testingComment = "тестируем параметр, значение - готовый объект Atvise: "
      break
    case 5:
      testingParam = 'AGENT.OBJECTS._wishco.add1.forTest.emptyStringValue'
      testingComment = "тестируем параметр, значение - переменная со значением пусто: "
      break
    case 6:
      testingParam = 'AGENT.OBJECTS._wishco.add1.forTest.numberValue'
      testingComment = "тестируем параметр, значение - переменная со значением: 27"
      break
    case 7:
      testingParam = 'AGENT.OBJECTS._wishco.add1.forTest.stringValue'
      testingComment = "тестируем параметр, значение - переменная со значением: Кактус"
      break
    case 8:
      testingParam = 'AGENT.OBJECTS._wishco.add1.forTest.globalVarStringValue'
      testingComment = "тестируем параметр, значение - переменная со значением другой переменной"
      break
    case 9:
      testingParam = 'SYSTEM.GLOBALS.TTT.sub2'
      testingComment = "тестируем параметр, значение - переменная со значением другой переменной"
      break
    case 10:
      testingParam = test_vars().arr2
      testingComment = "тестируем параметр, значение - массив числовой: " + testingParam
      break
      break

    default:
      testingParam = atviseValue
      testingComment = "берём значение из ATVISE (как бы отключаем тестирование)"
      break
  }

  console.log("======================")
  console.log("atviseValue: ", atviseValue)
  console.log("testingParam: ", testingParam)
  console.log("NEED STEP: ", testingStep)
  console.log("comment: ", testingComment)
  console.log("======================")

  getListStructure(testingParam)
}

// подстановочные значения для тестов
function test_vars() {
  var objReturn = {}
  objReturn.arr1 = '["200", "190", "180", "170", "160", "150", "140"]'
  objReturn.arr2 = '[200, 190, 180, 170, 160, 150, 140]'
  objReturn.obj1 = {
    "1": {
      "id": "pumpU8-6M2A",
      "short": "U8-6M2A",
      "text": "Насос - pumpU8-6M2A",
      "value": "SYSTEM.GLOBALS.TTT.pumps.pumpU8-6M2A"
    },
    "2": {
      "id": "pumpU8-7M",
      "short": "U8-7M",
      "text": "Насос - pumpU8-7M",
      "value": "SYSTEM.GLOBALS.TTT.pumps.pumpU8-7M"
    },
    "3": {
      "id": "pumpUNB600",
      "short": "UNB600",
      "text": "Насос - pumpUNB600",
      "value": "SYSTEM.GLOBALS.TTT.pumps.pumpUNB600"
    }
  }
  return objReturn
}