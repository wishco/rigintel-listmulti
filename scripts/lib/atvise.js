console.log('component running...')

//---------------------------------------------------	
var root = webMI.query["listsignal"]
console.log("root", root)
//---------------------------------------------------	
async function getListStructure(listRoot) {
  console.log("listRoot", listRoot)
  var objResult = {}


  var param = listRoot
  if (typeof param === "object") console.log("aaaaaaaaaaa");
  // var paramRoot = await getAsyncParam(param)
  //  var isSub
  //  var paramValue = paramRoot.value && paramRoot.value || param






  //  console.log("paramValue", paramValue)
}

//---------------------------------------------------	
getListStructure(root)
//---------------------------------------------------






async function getAsyncParam(param) {
  var promise = new Promise(function (resolve, reject) {
    webMI.data.read(param, function (resultParam) {
      resolve(resultParam)
    })
  })
  return promise
}











