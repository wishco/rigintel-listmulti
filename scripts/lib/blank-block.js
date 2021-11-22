// createBlankBlock: глобальная функция, возвращаем объект, с цепочкой прототипирования
// формируем: data атрибуты
// формируем: BEM
function createBlankBlock(className) {

  var dataAttr = function () {
    this._attrPrefix = 'data'
    this._attrSeparator = '-'
    this.getAttribute = function (...param) {
      var stringBefore = this._attrPrefix + this._attrSeparator + this.className
      var arrayFormat = param.map(el => this._attrSeparator + el)
      var str = [...arrayFormat].join('')
      return stringBefore + str
    }
  }

  var bem = function () {
    this._prefixClass = '.'
    this._el = '__'
    this._modif = '_'

    this.getClassName = function (element = '', modificator = '') {
      var result = this._prefixClass + this.getClass(element, modificator)
      return result
    }
    this.getClass = function (element = '', modificator = '') {
      var result = this.className
      if (element) result += this._el + element
      if (modificator) result += this._modif + modificator
      return result
    }

  }

  var dinamic = function () {
    this.active = 'active'
    this.getClassNameActive = function (element = '', modificator = '') {
      var result = this.getClassName(element, modificator) + ' ' + this._prefixClass + this.active
      console.log('getClassNameActive', this.getClassName('', 'vvvv') + ' ' + this._prefixClass + this.active);
      return result
    }
  }


  var chain1 = new dinamic()
  var chain2 = new dataAttr()
  chain2.__proto__ = chain1
  var chain3 = new bem()
  chain3.__proto__ = chain2
  var result = chain3
  result.className = className
  return result
}


// this контекст объекта 'hero'

// --> методы объекта <--
// this.getAttribute() -- получить атрибут (кол-во параметров не ограничено)
// getAttribute() ---------------- результат, строка: 'data-hero' 
// getAttribute(x1) -------------- результат, строка: 'data-hero-x1' 
// getAttribute(x1,x2) ----------- результат, строка: 'data-hero-x1-x2' 
// getAttribute(x1,x2,x3) -------- результат, строка: 'data-hero-x1-x2-x3' 

// this.getClassName() -- получить имя класса (кол-во параметров от 0 до 2)
// getClassName() ---------------- результат, строка: '.hero'
// getClassName(x1) -------------- результат, строка: '.hero__x1'
// getClassName(x1, x2) ---------- результат, строка: '.hero__x1_x2'
// getClassName('', x2) ---------- результат, строка: '.hero_x2'

// this.getClass() -- получить класс (кол-во параметров от 0 до 2)
// getClass() -------------------- результат, строка: 'hero'
// getClass(x1) ------------------ результат, строка: 'hero__x1'
// getClass(x1, x2) -------------- результат, строка: 'hero__x1_x2'
// getClass('', x2) -------------- результат, строка: 'hero_x2'

// this.getClassNameActive() ---- получить имена двух классов через пробел: 1) текущего класса и класс активного состояния (кол-во параметров от 0 до 2)
// getClassNameActive() ---------- результат, строка: '.hero .active'
// getClassNameActive(x1) -------- результат, строка: '.hero__x1 .active'
// getClassNameActive(x1, x2) ---- результат, строка: '.hero__x1_x2 .active'
// getClassNameActive('', x2) ---- результат, строка: '.hero_x2 .active'

// --> свойства объекта <--
// this.active ------------------- результат, строка: 'active'
// this.className ---------------- результат, строка: 'hero'