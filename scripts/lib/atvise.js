console.log('component running...')

var IS_EMPTY = "isEmpty" // пусто
var IS_BASIC = "isBasic" // обычное значение (string, number и пр...)
var IS_ARRAY = "isArray" // обычный массив значений
var IS_ATVISE_ARRAY = "isArrayAtvise" // массив объектов Atvise

//---------------------------------------------------	
var idListItem = -1 // последний заданный идентификатор для элемента списка (-1 еще не задан)
var root = webMI.query["listsignal"]
console.log("root", root)
//---------------------------------------------------	
async function getListStructure(listRoot) {
  // console.log("listRoot", listRoot)
  var objResult = []
  var rootParam = listRoot
  var paramArray = await getRootObjFromRootParam(rootParam) // получить массив параметров, из разных типов параметров

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


// получить root объект исходя из типа параметра
async function getRootObjFromRootParam(param) {

  var objParam = await getTypeAndValueFromParam(param)
  var objResult = { caption: {}, items: [] }
  objResult.caption = { id: "caption", text: webMI.query["caption"], value: webMI.query["caption"] }

  switch (objParam.type) {
    case IS_EMPTY:
      break

    case IS_BASIC:
      var item = { id: getId(), text: objParam.value, value: objParam.value }
      objResult.items = [item]
      break

    case IS_ARRAY:
      var items = objParam.value.map(el => {
        return { id: getId(), text: el, value: el }
      })
      objResult.items = items
      break

    case IS_ATVISE_ARRAY:
      var arr = objParam.value
      var items = await convertAtviseArrayToNormalArray(arr)
      console.log("1111111111111111111");
      console.log("items", items);
      objResult.items = items
      break
  }

  console.log("objParam", objParam);

  return objResult

}


async function convertAtviseArrayToNormalArray(atviseArray) {

  async function gogi(el) {
    obj = await getTypeAndValueFromParam(el.value)
    var resultMapEl = null
    var type = obj.type
    console.log("obj.type", type)

    if (type === IS_EMPTY) resultMapEl = el

    if (type === IS_BASIC) resultMapEl = el

    if (type === IS_ARRAY) {
      var arrValue = obj.value.map((_el) => {
        return { id: getId(), text: _el, value: _el }
      })
      console.log("IS_ARRAY!!!!!!!!!!!!!!!!!!!!!!!!!!", obj.value);
      console.log({ ...el, value: arrValue });
      console.log("IS_ARRAY!!!!!!!!!!!!!!!!!!!!!!!!!!", obj.value);
      resultMapEl = { ...el, value: arrValue }
    }

    if (type === IS_ATVISE_ARRAY) {
      resultMapEl = { val: 1111, value: 11111111111 }
    }
    console.log("resultMapElresultMapElresultMapElresultMapElresultMapEl", resultMapEl);
    return resultMapEl
  }

  var result = await atviseArray.map(gogi)
  console.log("objobjobjobjobjobjobjobjobjobjobjobjobj", obj);
  console.log("convertAtviseArrayToNormalArray", result);

  return result

}


// получить тип и значение по входному параметру
async function getTypeAndValueFromParam(param) {
  // возможные возвращаемые типы:
  // isEmpty - пусто
  // isArrayAtvise - массив объектов Atvise
  // isArray - обычный массив значений
  // isBasic - обычное значение (string, number и пр...)

  if (param === "") return { type: IS_EMPTY, value: "" } // если в компоненте, значение равно пустой строки (параметр не задан)
  if (typeof param === "object") return { type: IS_ATVISE_ARRAY, value: param } // если в компоненте, значение параметра задано при помощи 'Use Global Parameters', то это обычный array массив объектов

  var parse = parseJSON_ToArray(param) // если параметр из строки является массив, получаем 'массив' иначе получаем 'null'
  if (parse) return { type: IS_ARRAY, value: parse } // если в компоненте, значение параметра задано как строка, со значением Массив, например '[1,2,3,4]'

  var varFromParam1 // инициализация первой переменной, переменная хранит значение или флаг отсутствия её значения
  varFromParam1 = (await getAsyncParam(param)).value // если входящий параметр переменная, это её значение / иначе входящий параметр не переменная и возвращаем 'null'

  if ((!varFromParam1) && (varFromParam1 !== "")) return { type: IS_BASIC, value: param } // если входящий параметр не переменная, и выше отсекли другие варианты, то параметр является: string number и пр... всё в basic
  if (varFromParam1 === "") return { type: IS_EMPTY, value: "" } // если входящий параметр переменная и значение равно пустой строки (параметр не задан)
  if (typeof varFromParam1 === "number") return { type: IS_BASIC, value: varFromParam1 } // если входящий параметр переменная и значение равно числу

  parse = parseJSON_ToArray(varFromParam1) // если входящий параметр переменная и значение является массивом, получаем 'массив' иначе получаем 'null'
  if (parse) { // если переменная содержит массив
    return { type: IS_ARRAY, value: parse }
  }
  parse = parseAtviseJSON_ToArray(varFromParam1) // если входящий параметр переменная и значение является массивом Atvise, получаем 'массив' иначе получаем 'null'
  if (parse) { // если переменная содержит массив
    return { type: IS_ATVISE_ARRAY, value: parse }
  }

  var varFromParam2 = varFromParam1 && (await getAsyncParam(varFromParam1)).value || null // если входящий параметр переменная, и у неё строка, тоже переменная, то тут её значение / иначе null
  if (!varFromParam2) { // если вторая переменная не задана, то возвращаем значение первой переменной с базовой структурой (string, number и пр.)
    return { type: IS_BASIC, value: varFromParam1 }
  }

  if (varFromParam2 === "") return { type: IS_EMPTY, value: "" } // если вторая переменная задана и значение равно пустой строки (параметр не задан)
  if (typeof varFromParam2 === "number") return { type: IS_BASIC, value: varFromParam1 } // если вторая переменная задана и значение равно числу
  parse = parseJSON_ToArray(varFromParam2) // если во второй переменной значение является массивом, получаем 'массив' иначе получаем 'null'
  if (parse) {
    return { type: IS_ARRAY, value: parse } // если переменная содержит массив
  }
  parse = parseAtviseJSON_ToArray(varFromParam2) // если во второй переменной значение является массивом Atvise, получаем 'массив' иначе получаем 'null'
  if (parse) {
    return { type: IS_ATVISE_ARRAY, value: parse } // если переменная содержит массив
  }
  return { type: IS_BASIC, value: varFromParam2 }
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
  return Array.isArray(parseResult) ? parseResult : null // возвращаем массив или null
}

function parseAtviseJSON_ToArray(param) {
  var parseResult
  try {
    parseResult = param.map((el) => {
      var arr = JSON.parse("{" + el + "}")
      return Object.values(arr)[0]
    })
  } catch (error) {
    parseResult = ""
  }
  return Array.isArray(parseResult) ? parseResult : null // возвращаем массив или null
}

// получить параметр, ассинхронно
async function getAsyncParam(param) {
  var promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      webMI.data.read(param, (resultParam) => {
        resolve(resultParam)
      })
    }, 10)

  })
  // console.log(promise);
  // return promise
  return promise.then((res) => {
    console.log("res55555555555555555555555", res);
    return res
  }
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
      testingParam = 'AGENT.OBJECTS._wishco.add1.forTest.ArrayStringValue'
      testingComment = "тестируем параметр, значение - переменная со значением: строка-массив значений"
      break
    case 9:
      testingParam = 'AGENT.OBJECTS._wishco.add1.forTest.globalVarStringValue'
      testingComment = "тестируем параметр, значение - переменная со значением другой переменной"
      break
    case 10:
      testingParam = 'SYSTEM.GLOBALS.TTT.sub2'
      testingComment = "тестируем параметр, значение - переменная со значением из глобального объекта"
      break
    case 11:
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

 // старый вариант

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


  // var res1 = await getTypeAndValueFromParam(param)
  // console.log("+++++++++++")
  // console.log("getTypeParam: ", res1)
  // console.log("+++++++++++")

