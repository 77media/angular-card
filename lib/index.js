'use strict';

var Card, QJ, extend, Payment;

Card = (function(opts) {
  var bindVal;
  this.options = extend(true, this.defaults, opts);
    if (!this.options.form) {
      console.log("Please provide a form");
      return;
    }
    this.$el = QJ(this.options.form);
    if (!this.options.container) {
      console.log("Please provide a container");
      return;
    }
    this.$container = QJ(this.options.container);
    this.render();
    this.attachHandlers();
    this.handleInitialPlaceholders();

  Card.prototype.cardTemplate = '' + '<div class="jp-card-container">' + '<div class="jp-card">' + '<div class="jp-card-front">' + '<div class="jp-card-logo jp-card-elo">' + '<div class="e">e</div>' + '<div class="l">l</div>' + '<div class="o">o</div>' + '</div>' + '<div class="jp-card-logo jp-card-visa">visa</div>' + '<div class="jp-card-logo jp-card-mastercard">MasterCard</div>' + '<div class="jp-card-logo jp-card-maestro">Maestro</div>' + '<div class="jp-card-logo jp-card-amex"></div>' + '<div class="jp-card-logo jp-card-discover">discover</div>' + '<div class="jp-card-logo jp-card-dankort"><div class="dk"><div class="d"></div><div class="k"></div></div></div>' + '<div class="jp-card-lower">' + '<div class="jp-card-shiny"></div>' + '<div class="jp-card-cvc jp-card-display">{{cvc}}</div>' + '<div class="jp-card-number jp-card-display">{{number}}</div>' + '<div class="jp-card-name jp-card-display">{{name}}</div>' + '<div class="jp-card-expiry jp-card-display" data-before="{{monthYear}}" data-after="{{validDate}}">{{expiry}}</div>' + '</div>' + '</div>' + '<div class="jp-card-back">' + '<div class="jp-card-bar"></div>' + '<div class="jp-card-cvc jp-card-display">{{cvc}}</div>' + '<div class="jp-card-shiny"></div>' + '</div>' + '</div>' + '</div>';

  Card.prototype.template = function(tpl, data) {
    return tpl.replace(/\{\{(.*?)\}\}/g, function(match, key, str) {
      return data[key];
    });
  };

  Card.prototype.cardTypes = ['jp-card-amex', 'jp-card-dankort', 'jp-card-dinersclub', 'jp-card-discover', 'jp-card-jcb', 'jp-card-laser', 'jp-card-maestro', 'jp-card-mastercard', 'jp-card-unionpay', 'jp-card-visa', 'jp-card-visaelectron', 'jp-card-elo'];

  Card.prototype.defaults = {
    formatting: true,
    formSelectors: {
      numberInput: 'input[name="number"]',
      expiryInput: 'input[name="expiry"]',
      cvcInput: 'input[name="cvc"]',
      nameInput: 'input[name="name"]'
    },
    cardSelectors: {
      cardContainer: '.jp-card-container',
      card: '.jp-card',
      numberDisplay: '.jp-card-number',
      expiryDisplay: '.jp-card-expiry',
      cvcDisplay: '.jp-card-cvc',
      nameDisplay: '.jp-card-name'
    },
    messages: {
      validDate: 'valid\nthru',
      monthYear: 'month/year'
    },
    placeholders: {
      number: '&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;',
      cvc: '&bull;&bull;&bull;',
      expiry: '&bull;&bull;/&bull;&bull;',
      name: 'Full Name'
    },
    classes: {
      valid: 'jp-card-valid',
      invalid: 'jp-card-invalid'
    },
    debug: false
  };



  Card.prototype.render = function() {
    var $cardContainer, baseWidth, name, obj, ref, ref1, selector, ua;
    QJ.append(this.$container, this.template(this.cardTemplate, extend({}, this.options.messages, this.options.placeholders)));
    ref = this.options.cardSelectors;
    for (name in ref) {
      selector = ref[name];
      this["$" + name] = QJ.find(this.$container, selector);
    }
    ref1 = this.options.formSelectors;
    for (name in ref1) {
      selector = ref1[name];
      selector = this.options[name] ? this.options[name] : selector;
      obj = QJ.find(this.$el, selector);
      if (!obj.length && this.options.debug) {
        console.error("Card can't find a " + name + " in your form.");
      }
      this["$" + name] = obj;
    }
    if (this.options.formatting) {
      Payment.formatCardNumber(this.$numberInput);
      Payment.formatCardCVC(this.$cvcInput);
      Payment.formatCardExpiry(this.$expiryInput);
    }
    if (this.options.width) {
      $cardContainer = QJ(this.options.cardSelectors.cardContainer)[0];
      baseWidth = parseInt($cardContainer.clientWidth);
      $cardContainer.style.transform = "scale(" + (this.options.width / baseWidth) + ")";
    }
    if (typeof navigator !== "undefined" && navigator !== null ? navigator.userAgent : void 0) {
      ua = navigator.userAgent.toLowerCase();
      if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1) {
        QJ.addClass(this.$card, 'jp-card-safari');
      }
    }
    if (/MSIE 10\./i.test(navigator.userAgent)) {
      QJ.addClass(this.$card, 'jp-card-ie-10');
    }
    if (/rv:11.0/i.test(navigator.userAgent)) {
      return QJ.addClass(this.$card, 'jp-card-ie-11');
    }
  };

  Card.prototype.attachHandlers = function() {
    var expiryFilters;
    bindVal(this.$numberInput, this.$numberDisplay, {
      fill: false,
      filters: this.validToggler('cardNumber')
    });
    QJ.on(this.$numberInput, 'payment.cardType', this.handle('setCardType'));
    expiryFilters = [
      function(val) {
        return val.replace(/(\s+)/g, '');
      }
    ];
    expiryFilters.push(this.validToggler('cardExpiry'));
    bindVal(this.$expiryInput, this.$expiryDisplay, {
      join: function(text) {
        if (text[0].length === 2 || text[1]) {
          return "/";
        } else {
          return "";
        }
      },
      filters: expiryFilters
    });
    bindVal(this.$cvcInput, this.$cvcDisplay, {
      filters: this.validToggler('cardCVC')
    });
    QJ.on(this.$cvcInput, 'focus', this.handle('flipCard'));
    QJ.on(this.$cvcInput, 'blur', this.handle('unflipCard'));
    return bindVal(this.$nameInput, this.$nameDisplay, {
      fill: false,
      filters: this.validToggler('cardHolderName'),
      join: ' '
    });
  };

  Card.prototype.handleInitialPlaceholders = function() {
    var el, name, ref, results, selector;
    ref = this.options.formSelectors;
    results = [];
    for (name in ref) {
      selector = ref[name];
      el = this["$" + name];
      if (QJ.val(el)) {
        QJ.trigger(el, 'paste');
        results.push(QJ.trigger(el, 'keyup'));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Card.prototype.handle = function(fn) {
    return (function(_this) {
      return function(e) {
        var args;
        args = Array.prototype.slice.call(arguments);
        args.unshift(e.target);
        return _this.handlers[fn].apply(_this, args);
      };
    })(this);
  };

  Card.prototype.validToggler = function(validatorName) {
    var isValid;
    if (validatorName === "cardExpiry") {
      isValid = function(val) {
        var objVal;
        objVal = Payment.fns.cardExpiryVal(val);
        return Payment.fns.validateCardExpiry(objVal.month, objVal.year);
      };
    } else if (validatorName === "cardCVC") {
      isValid = (function(_this) {
        return function(val) {
          return Payment.fns.validateCardCVC(val, _this.cardType);
        };
      })(this);
    } else if (validatorName === "cardNumber") {
      isValid = function(val) {
        return Payment.fns.validateCardNumber(val);
      };
    } else if (validatorName === "cardHolderName") {
      isValid = function(val) {
        return val !== "";
      };
    }
    return (function(_this) {
      return function(val, $in, $out) {
        var result;
        result = isValid(val);
        _this.toggleValidClass($in, result);
        _this.toggleValidClass($out, result);
        return val;
      };
    })(this);
  };

  Card.prototype.toggleValidClass = function(el, test) {
    QJ.toggleClass(el, this.options.classes.valid, test);
    return QJ.toggleClass(el, this.options.classes.invalid, !test);
  };

  Card.prototype.handlers = {
    setCardType: function($el, e) {
      var cardType;
      cardType = e.data;
      if (!QJ.hasClass(this.$card, cardType)) {
        QJ.removeClass(this.$card, 'jp-card-unknown');
        QJ.removeClass(this.$card, this.cardTypes.join(' '));
        QJ.addClass(this.$card, "jp-card-" + cardType);
        QJ.toggleClass(this.$card, 'jp-card-identified', cardType !== 'unknown');
        this.cardType = cardType;
        return this.cardType;
      }
    },
    flipCard: function() {
      return QJ.addClass(this.$card, 'jp-card-flipped');
    },
    unflipCard: function() {
      return QJ.removeClass(this.$card, 'jp-card-flipped');
    }
  };

  bindVal = function(el, out, opts) {
    var joiner, o, outDefaults;
    if (opts === null) {
      opts = {};
    }
    opts.fill = opts.fill || false;
    opts.filters = opts.filters || [];
    if (!(opts.filters instanceof Array)) {
      opts.filters = [opts.filters];
    }
    opts.join = opts.join || "";
    var isFunction = typeof opts.join === "function";
    if (!isFunction) {
      joiner = opts.join;
      opts.join = function() {
        return joiner;
      };
    }
    outDefaults = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = out.length; j < len; j++) {
        o = out[j];
        results.push(o.textContent);
      }
      return results;
    })();
    QJ.on(el, 'focus', function() {
      return QJ.addClass(out, 'jp-card-focused');
    });
    QJ.on(el, 'blur', function() {
      return QJ.removeClass(out, 'jp-card-focused');
    });
    QJ.on(el, 'keyup change paste', function(e) {
      var elem, filter, i, j, join, k, len, len1, outEl, outVal, ref, results, val;
      val = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = el.length; j < len; j++) {
          elem = el[j];
          results.push(QJ.val(elem));
        }
        return results;
      })();
      join = opts.join(val);
      val = val.join(join);
      if (val === join) {
        val = "";
      }
      ref = opts.filters;
      for (j = 0, len = ref.length; j < len; j++) {
        filter = ref[j];
        val = filter(val, el, out);
      }
      results = [];
      for (i = k = 0, len1 = out.length; k < len1; i = ++k) {
        outEl = out[i];
        if (opts.fill) {
          outVal = val + outDefaults[i].substring(val.length);
        } else {
          outVal = val || outDefaults[i];
        }
        results.push(outEl.textContent = outVal);
      }
      return results;
    });
    return el;
  };

  return Card;

})();

module.exports = Card;

global.Card = Card;
var hasRequire = typeof require === 'function';

(function (window, document, Card, angular, undefined) {
  'use strict';
  angular
    .module('ssm.card', [])

  .controller('CardCtrl', ['$scope', function ($scope) {
  }])

  .directive('card', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      scope: {
        cardContainer: '@', // required
        width: '@',
        placeholders: '=',
        options: '=',
        messages: '=',
      },
      controller: 'CardCtrl',
      link: function (scope, element, attributes, cardCtrl) {
        var defaultPlaceholders = {
          number: '•••• •••• •••• ••••',
          name: 'Full Name',
          expiry: '••/••',
          cvc: '•••'
        };
        var defaultMessages = {
          validDate: 'valid\nthru',
          monthYear: 'month/year',
        };
        var defaultOptions = {
          debug: false,
          formatting: true
        };

        var placeholders = angular.extend(defaultPlaceholders, scope.placeholders);
        var messages = angular.extend(defaultMessages, scope.messages);
        var options = angular.extend(defaultOptions, scope.options);

        var opts = {
          form: '[name="' + attributes.name + '"]',

          // a selector or jQuery object for the container
          // where you want the card to appear
          container: scope.cardContainer, // *required*

          formSelectors: {},

          width: scope.width || 350,

          // Strings for translation - optional
          messages: {
            validDate: messages.validDate,
            monthYear: messages.monthYear
          },

          // Default placeholders for rendered fields - options
          placeholders: {
            number: placeholders.number,
            name: placeholders.name,
            expiry: placeholders.expiry,
            cvc: placeholders.cvc
          },

          formatting: options.formatting, // optional - default true
          debug: options.debug // if true, will log helpful messages for setting up Card
        };

        if (cardCtrl.numberInput && cardCtrl.numberInput.length > 0) {
          opts.formSelectors.numberInput = 'input[name="' + cardCtrl.numberInput[0].name + '"]';
        }
        if (cardCtrl.expiryInput && cardCtrl.expiryInput.length > 0) {
          opts.formSelectors.expiryInput = 'input[name="' + cardCtrl.expiryInput[0].name + '"]';
        }
        if (cardCtrl.cvcInput && cardCtrl.cvcInput.length > 0) {
          opts.formSelectors.cvcInput = 'input[name="' + cardCtrl.cvcInput[0].name + '"]';
        }
        if (cardCtrl.nameInput && cardCtrl.nameInput.length > 0) {
          opts.formSelectors.nameInput = 'input[name="' + cardCtrl.nameInput[0].name + '"]';
        }

        new Card(opts);
      }
    };
  }])

  .directive('cardNumber', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      require: [
        '^card',
        'ngModel'
      ],
      link: function (scope, element, attributes, ctrls) {
        var cardCtrl = ctrls[0];
        cardCtrl.numberInput = element;
        scope.$watch('ngModel', function (newVal, oldVal) {
          if (!oldVal && !newVal) {
            return;
          }
          if (oldVal === newVal && !newVal) {
            return;
          }

          var evt = document.createEvent('HTMLEvents');
          evt.initEvent('keyup', false, true);
          element[0].dispatchEvent(evt);
        });
      }
    };
  }])

  .directive('cardName', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      require: [
        '^card',
        'ngModel'
      ],
      link: function (scope, element, attributes, ctrls) {
        var cardCtrl = ctrls[0];
        cardCtrl.nameInput = element;
        scope.$watch('ngModel', function (newVal, oldVal) {
          if (!oldVal && !newVal) {
            return;
          }
          if (oldVal === newVal && !newVal) {
            return;
          }

          var evt = document.createEvent('HTMLEvents');
          evt.initEvent('keyup', false, true);
          element[0].dispatchEvent(evt);
        });
      }
    };
  }])

  .directive('cardExpiry', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      require: [
        '^card',
        'ngModel'
      ],
      link: function (scope, element, attributes, ctrls) {
        var cardCtrl = ctrls[0];
        cardCtrl.expiryInput = element;
        scope.$watch('ngModel', function (newVal, oldVal) {
          if (!oldVal && !newVal) {
            return;
          }
          if (oldVal === newVal && !newVal) {
            return;
          }

          var evt = document.createEvent('HTMLEvents');
          evt.initEvent('keyup', false, true);
          element[0].dispatchEvent(evt);
        });
      }
    };
  }])

  .directive('cardCvc', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      require: [
        '^card',
        'ngModel'
      ],
      link: function (scope, element, attributes, ctrls) {
        var cardCtrl = ctrls[0];
        cardCtrl.cvcInput = element;
        scope.$watch('ngModel', function (newVal, oldVal) {
          if (!oldVal && !newVal) {
            return;
          }
          if (oldVal === newVal && !newVal) {
            return;
          }

          var evt = document.createEvent('HTMLEvents');
          evt.initEvent('keyup', false, true);
          element[0].dispatchEvent(evt);
        });
      }
    };
  }]);

})(window, window.document, hasRequire ? require('card') : window.Card, hasRequire ? require('angular') : window.angular);

if(typeof module !== 'undefined') {
  module.exports = 'ssm.card';
}

'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target === null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options !== null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};
'use strict';

var Payment, QJ, cardFromNumber, cardFromType, cards, defaultFormat, formatBackCardNumber, formatBackExpiry, formatCardNumber, formatExpiry, formatForwardExpiry, formatForwardSlash, formatMonthExpiry, hasTextSelected, luhnCheck, reFormatCardNumber, restrictCVC, restrictCardNumber, restrictCombinedExpiry, restrictExpiry, restrictMonthExpiry, restrictNumeric, restrictYearExpiry, setCardType, getIndex;


getIndex = [].getIndex || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

defaultFormat = /(\d{1,4})/g;

cards = [
  {
    type: 'amex',
    pattern: /^3[47]/,
    format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
    length: [15],
    cvcLength: [4],
    luhn: true
  }, {
    type: 'dankort',
    pattern: /^5019/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'dinersclub',
    pattern: /^(36|38|30[0-5])/,
    format: defaultFormat,
    length: [14],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'discover',
    pattern: /^(6011|65|64[4-9]|622)/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'jcb',
    pattern: /^35/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'laser',
    pattern: /^(6706|6771|6709)/,
    format: defaultFormat,
    length: [16, 17, 18, 19],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'maestro',
    pattern: /^(5018|5020|5038|6304|6703|6759|676[1-3])/,
    format: defaultFormat,
    length: [12, 13, 14, 15, 16, 17, 18, 19],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'mastercard',
    pattern: /^5[1-5]/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'unionpay',
    pattern: /^62/,
    format: defaultFormat,
    length: [16, 17, 18, 19],
    cvcLength: [3],
    luhn: false
  }, {
    type: 'visaelectron',
    pattern: /^4(026|17500|405|508|844|91[37])/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'elo',
    pattern: /^4011|438935|45(1416|76|7393)|50(4175|6699|67|90[4-7])|63(6297|6368)/,
    format: defaultFormat,
    length: [16],
    cvcLength: [3],
    luhn: true
  }, {
    type: 'visa',
    pattern: /^4/,
    format: defaultFormat,
    length: [13, 16, 19],
    cvcLength: [3],
    luhn: true
  }
];

cardFromNumber = function (num) {
  var card, i, len;
  num = (num + '').replace(/\D/g, '');
  for (i = 0, len = cards.length; i < len; i++) {
    card = cards[i];
    if (card.pattern.test(num)) {
      return card;
    }
  }
};

cardFromType = function (type) {
  var card, i, len;
  for (i = 0, len = cards.length; i < len; i++) {
    card = cards[i];
    if (card.type === type) {
      return card;
    }
  }
};

luhnCheck = function (num) {
  var digit, digits, i, len, odd, sum;
  odd = true;
  sum = 0;
  digits = (num + '').split('').reverse();
  for (i = 0, len = digits.length; i < len; i++) {
    digit = digits[i];
    digit = parseInt(digit, 10);
    if ((odd = !odd)) {
      digit *= 2;
    }
    if (digit > 9) {
      digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

hasTextSelected = function (target) {
  var e, ref;
  try {
    if ((target.selectionStart !== null) && target.selectionStart !== target.selectionEnd) {
      return true;
    }
    if ((typeof document !== "undefined" && document !== null ? (ref = document.selection) !== null ? ref.createRange : void 0 : void 0) !== null) {
      if (document.selection.createRange().text) {
        return true;
      }
    }
  } catch (err) {
    e = err;
    false;
  }
  return false;
};

reFormatCardNumber = function (e) {
  return setTimeout((function (_this) {
    return function () {
      var target, value;
      target = e.target;
      value = QJ.val(target);
      value = Payment.fns.formatCardNumber(value);
      QJ.val(target, value);
      return QJ.trigger(target, 'change');
    };
  })(this));
};

formatCardNumber = function (e) {
  var card, digit, length, re, target, upperLength, value;
  digit = String.fromCharCode(e.which);
  if (!/^\d+$/.test(digit)) {
    return;
  }
  target = e.target;
  value = QJ.val(target);
  card = cardFromNumber(value + digit);
  length = (value.replace(/\D/g, '') + digit).length;
  upperLength = 16;
  if (card) {
    upperLength = card.length[card.length.length - 1];
  }
  if (length >= upperLength) {
    return;
  }
  if (hasTextSelected(target)) {
    return;
  }
  if (card && card.type === 'amex') {
    re = /^(\d{4}|\d{4}\s\d{6})$/;
  } else {
    re = /(?:^|\s)(\d{4})$/;
  }
  if (re.test(value)) {
    e.preventDefault();
    return QJ.val(target, value + ' ' + digit);
  } else if (re.test(value + digit)) {
    e.preventDefault();
    return QJ.val(target, value + digit + ' ');
  }
};

formatBackCardNumber = function (e) {
  var target, value;
  target = e.target;
  value = QJ.val(target);
  if (e.meta) {
    return;
  }
  if (e.which !== 8) {
    return;
  }
  if (hasTextSelected(target)) {
    return;
  }
  if (/\d\s$/.test(value)) {
    e.preventDefault();
    return QJ.val(target, value.replace(/\d\s$/, ''));
  } else if (/\s\d?$/.test(value)) {
    e.preventDefault();
    return QJ.val(target, value.replace(/\s\d?$/, ''));
  }
};

formatExpiry = function (e) {
  var digit, target, val;
  digit = String.fromCharCode(e.which);
  if (!/^\d+$/.test(digit)) {
    return;
  }
  target = e.target;
  val = QJ.val(target) + digit;
  if (/^\d$/.test(val) && (val !== '0' && val !== '1')) {
    e.preventDefault();
    return QJ.val(target, "0" + val + " / ");
  } else if (/^\d\d$/.test(val)) {
    e.preventDefault();
    return QJ.val(target, val + " / ");
  }
};

formatMonthExpiry = function (e) {
  var digit, target, val;
  digit = String.fromCharCode(e.which);
  if (!/^\d+$/.test(digit)) {
    return;
  }
  target = e.target;
  val = QJ.val(target) + digit;
  if (/^\d$/.test(val) && (val !== '0' && val !== '1')) {
    e.preventDefault();
    return QJ.val(target, "0" + val);
  } else if (/^\d\d$/.test(val)) {
    e.preventDefault();
    return QJ.val(target, "" + val);
  }
};

formatForwardExpiry = function (e) {
  var digit, target, val;
  digit = String.fromCharCode(e.which);
  if (!/^\d+$/.test(digit)) {
    return;
  }
  target = e.target;
  val = QJ.val(target);
  if (/^\d\d$/.test(val)) {
    return QJ.val(target, val + " / ");
  }
};

formatForwardSlash = function (e) {
  var slash, target, val;
  slash = String.fromCharCode(e.which);
  if (slash !== '/') {
    return;
  }
  target = e.target;
  val = QJ.val(target);
  if (/^\d$/.test(val) && val !== '0') {
    return QJ.val(target, "0" + val + " / ");
  }
};

formatBackExpiry = function (e) {
  var target, value;
  if (e.metaKey) {
    return;
  }
  target = e.target;
  value = QJ.val(target);
  if (e.which !== 8) {
    return;
  }
  if (hasTextSelected(target)) {
    return;
  }
  if (/\d(\s|\/)+$/.test(value)) {
    e.preventDefault();
    return QJ.val(target, value.replace(/\d(\s|\/)*$/, ''));
  } else if (/\s\/\s?\d?$/.test(value)) {
    e.preventDefault();
    return QJ.val(target, value.replace(/\s\/\s?\d?$/, ''));
  }
};

restrictNumeric = function (e) {
  var input;
  if (e.metaKey || e.ctrlKey) {
    return true;
  }
  if (e.which === 32) {
    return e.preventDefault();
  }
  if (e.which === 0) {
    return true;
  }
  if (e.which < 33) {
    return true;
  }
  input = String.fromCharCode(e.which);
  if (!/[\d\s]/.test(input)) {
    return e.preventDefault();
  }
};

restrictCardNumber = function (e) {
  var card, digit, target, value;
  target = e.target;
  digit = String.fromCharCode(e.which);
  if (!/^\d+$/.test(digit)) {
    return;
  }
  if (hasTextSelected(target)) {
    return;
  }
  value = (QJ.val(target) + digit).replace(/\D/g, '');
  card = cardFromNumber(value);
  if (card) {
    var isLongEnough = value.length <= card.length[card.length.length - 1];
    if (!isLongEnough) {
      return e.preventDefault();
    }
  } else {
    var isTooLong = value.length <= 16;
    if (!isTooLong) {
      return e.preventDefault();
    }
  }
};

restrictExpiry = function (e, length) {
  var digit, target, value;
  target = e.target;
  digit = String.fromCharCode(e.which);
  if (!/^\d+$/.test(digit)) {
    return;
  }
  if (hasTextSelected(target)) {
    return;
  }
  value = QJ.val(target) + digit;
  value = value.replace(/\D/g, '');
  if (value.length > length) {
    return e.preventDefault();
  }
};

restrictCombinedExpiry = function (e) {
  return restrictExpiry(e, 6);
};

restrictMonthExpiry = function (e) {
  return restrictExpiry(e, 2);
};

restrictYearExpiry = function (e) {
  return restrictExpiry(e, 4);
};

restrictCVC = function (e) {
  var digit, target, val;
  target = e.target;
  digit = String.fromCharCode(e.which);
  if (!/^\d+$/.test(digit)) {
    return;
  }
  if (hasTextSelected(target)) {
    return;
  }
  val = QJ.val(target) + digit;
  var isLessThanFour = val.length <= 4;
  if (!isLessThanFour) {
    return e.preventDefault();
  }
};

setCardType = function (e) {
  var allTypes, card, cardType, target, val;
  target = e.target;
  val = QJ.val(target);
  cardType = Payment.fns.cardType(val) || 'unknown';
  if (!QJ.hasClass(target, cardType)) {
    allTypes = (function () {
      var i, len, results;
      results = [];
      for (i = 0, len = cards.length; i < len; i++) {
        card = cards[i];
        results.push(card.type);
      }
      return results;
    })();
    QJ.removeClass(target, 'unknown');
    QJ.removeClass(target, allTypes.join(' '));
    QJ.addClass(target, cardType);
    QJ.toggleClass(target, 'identified', cardType !== 'unknown');
    return QJ.trigger(target, 'payment.cardType', cardType);
  }
};

Payment = (function () {
  function Payment() { }

  Payment.fns = {
    cardExpiryVal: function (value) {
      var month, prefix, ref, year;
      value = value.replace(/\s/g, '');
      ref = value.split('/', 2), month = ref[0], year = ref[1];
      if ((year !== null ? year.length : void 0) === 2 && /^\d+$/.test(year)) {
        prefix = (new Date()).getFullYear();
        prefix = prefix.toString().slice(0, 2);
        year = prefix + year;
      }
      month = parseInt(month, 10);
      year = parseInt(year, 10);
      return {
        month: month,
        year: year
      };
    },
    validateCardNumber: function (num) {
      var card, ref;
      num = (num + '').replace(/\s+|-/g, '');
      if (!/^\d+$/.test(num)) {
        return false;
      }
      card = cardFromNumber(num);
      if (!card) {
        return false;
      }
      return (ref = num.length, getIndex.call(card.length, ref) >= 0) && (card.luhn === false || luhnCheck(num));
    },
    validateCardExpiry: function (month, year) {
      var currentTime, expiry, prefix, ref;
      if (typeof month === 'object' && 'month' in month) {
        ref = month, month = ref.month, year = ref.year;
      }
      if (!(month && year)) {
        return false;
      }
      month = QJ.trim(month);
      year = QJ.trim(year);
      if (!/^\d+$/.test(month)) {
        return false;
      }
      if (!/^\d+$/.test(year)) {
        return false;
      }
      month = parseInt(month, 10);
      if (!(month && month <= 12)) {
        return false;
      }
      if (year.length === 2) {
        prefix = (new Date()).getFullYear();
        prefix = prefix.toString().slice(0, 2);
        year = prefix + year;
      }
      expiry = new Date(year, month);
      currentTime = new Date();
      expiry.setMonth(expiry.getMonth() - 1);
      expiry.setMonth(expiry.getMonth() + 1, 1);
      return expiry > currentTime;
    },
    validateCardCVC: function (cvc, type) {
      var ref, ref1;
      cvc = QJ.trim(cvc);
      if (!/^\d+$/.test(cvc)) {
        return false;
      }
      if (type && cardFromType(type)) {
        return ref = cvc.length, getIndex.call((ref1 = cardFromType(type)) !== null ? ref1.cvcLength : void 0, ref) >= 0;
      } else {
        return cvc.length >= 3 && cvc.length <= 4;
      }
    },
    cardType: function (num) {
      var ref;
      if (!num) {
        return null;
      }
      return ((ref = cardFromNumber(num)) !== null ? ref.type : void 0) || null;
    },
    formatCardNumber: function (num) {
      var card, groups, ref, upperLength;
      card = cardFromNumber(num);
      if (!card) {
        return num;
      }
      upperLength = card.length[card.length.length - 1];
      num = num.replace(/\D/g, '');
      num = num.slice(0, +upperLength + 1 || 9e9);
      if (card.format.global) {
        return (ref = num.match(card.format)) !== null ? ref.join(' ') : void 0;
      } else {
        groups = card.format.exec(num);
        if (groups !== null) {
          groups.shift();
        }
        return groups !== null ? groups.join(' ') : void 0;
      }
    }
  };

  Payment.restrictNumeric = function (el) {
    return QJ.on(el, 'keypress', restrictNumeric);
  };

  Payment.cardExpiryVal = function (el) {
    return Payment.fns.cardExpiryVal(QJ.val(el));
  };

  Payment.formatCardCVC = function (el) {
    Payment.restrictNumeric(el);
    QJ.on(el, 'keypress', restrictCVC);
    return el;
  };

  Payment.formatCardExpiry = function (el) {
    var month, year;
    Payment.restrictNumeric(el);
    if (el.length && el.length === 2) {
      month = el[0], year = el[1];
      this.formatCardExpiryMultiple(month, year);
    } else {
      QJ.on(el, 'keypress', restrictCombinedExpiry);
      QJ.on(el, 'keypress', formatExpiry);
      QJ.on(el, 'keypress', formatForwardSlash);
      QJ.on(el, 'keypress', formatForwardExpiry);
      QJ.on(el, 'keydown', formatBackExpiry);
    }
    return el;
  };

  Payment.formatCardExpiryMultiple = function (month, year) {
    QJ.on(month, 'keypress', restrictMonthExpiry);
    QJ.on(month, 'keypress', formatMonthExpiry);
    return QJ.on(year, 'keypress', restrictYearExpiry);
  };

  Payment.formatCardNumber = function (el) {
    Payment.restrictNumeric(el);
    QJ.on(el, 'keypress', restrictCardNumber);
    QJ.on(el, 'keypress', formatCardNumber);
    QJ.on(el, 'keydown', formatBackCardNumber);
    QJ.on(el, 'keyup', setCardType);
    QJ.on(el, 'paste', reFormatCardNumber);
    return el;
  };

  Payment.getCardArray = function () {
    return cards;
  };

  Payment.setCardArray = function (cardArray) {
    cards = cardArray;
    return true;
  };

  Payment.addToCardArray = function (cardObject) {
    return cards.push(cardObject);
  };

  Payment.removeFromCardArray = function (type) {
    var key, value;
    for (key in cards) {
      value = cards[key];
      if (value.type === type) {
        cards.splice(key, 1);
      }
    }
    return true;
  };

  return Payment;

})();

module.exports = Payment;

global.Payment = Payment;

'use strict';

var QJ, rreturn, rtrim;

QJ = function(selector) {
  if (QJ.isDOMElement(selector)) {
    return selector;
  }
  return document.querySelectorAll(selector);
};

QJ.isDOMElement = function(el) {
  return el && (el.nodeName !== null);
};

rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

QJ.trim = function(text) {
  if (text === null) {
    return "";
  } else {
    return (text + "").replace(rtrim, "");
  }
};

rreturn = /\r/g;

QJ.val = function(el, val) {
  var ret;
  if (arguments.length > 1) {
    return el.value = val;
  } else {
    ret = el.value;
    if (typeof ret === "string") {
      return ret.replace(rreturn, "");
    } else {
      if (ret === null) {
        return "";
      } else {
        return ret;
      }
    }
  }
};

QJ.preventDefault = function(eventObject) {
  if (typeof eventObject.preventDefault === "function") {
    eventObject.preventDefault();
    return;
  }
  eventObject.returnValue = false;
  return false;
};

QJ.normalizeEvent = function(e) {
  var original;
  original = e;
  e = {
    which: original.which !== null ? original.which : void 0,
    target: original.target || original.srcElement,
    preventDefault: function() {
      return QJ.preventDefault(original);
    },
    originalEvent: original,
    data: original.data || original.detail
  };
  if (e.which === null) {
    e.which = original.charCode !== null ? original.charCode : original.keyCode;
  }
  return e;
};

QJ.on = function(element, eventName, callback) {
  var el, i, j, len, len1, multEventName, originalCallback, ref;
  if (element.length) {
    for (i = 0, len = element.length; i < len; i++) {
      el = element[i];
      QJ.on(el, eventName, callback);
    }
    return;
  }
  if (eventName.match(" ")) {
    ref = eventName.split(" ");
    for (j = 0, len1 = ref.length; j < len1; j++) {
      multEventName = ref[j];
      QJ.on(element, multEventName, callback);
    }
    return;
  }
  originalCallback = callback;
  callback = function(e) {
    e = QJ.normalizeEvent(e);
    return originalCallback(e);
  };
  if (element.addEventListener) {
    return element.addEventListener(eventName, callback, false);
  }
  if (element.attachEvent) {
    eventName = "on" + eventName;
    return element.attachEvent(eventName, callback);
  }
  element['on' + eventName] = callback;
};

QJ.addClass = function(el, className) {
  var e;
  if (el.length) {
    return (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = el.length; i < len; i++) {
        e = el[i];
        results.push(QJ.addClass(e, className));
      }
      return results;
    })();
  }
  if (el.classList) {
    return el.classList.add(className);
  } else {
    return el.className += ' ' + className;
  }
};

QJ.hasClass = function(el, className) {
  var e, hasClass, i, len;
  if (el.length) {
    hasClass = true;
    for (i = 0, len = el.length; i < len; i++) {
      e = el[i];
      hasClass = hasClass && QJ.hasClass(e, className);
    }
    return hasClass;
  }
  if (el.classList) {
    return el.classList.contains(className);
  } else {
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
  }
};

QJ.removeClass = function(el, className) {
  var cls, e, i, len, ref, results;
  if (el.length) {
    return (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = el.length; i < len; i++) {
        e = el[i];
        results.push(QJ.removeClass(e, className));
      }
      return results;
    })();
  }
  if (el.classList) {
    ref = className.split(' ');
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      cls = ref[i];
      results.push(el.classList.remove(cls));
    }
    return results;
  } else {
    return el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
};

QJ.toggleClass = function(el, className, bool) {
  var e;
  if (el.length) {
    return (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = el.length; i < len; i++) {
        e = el[i];
        results.push(QJ.toggleClass(e, className, bool));
      }
      return results;
    })();
  }
  if (bool) {
    if (!QJ.hasClass(el, className)) {
      return QJ.addClass(el, className);
    }
  } else {
    return QJ.removeClass(el, className);
  }
};

QJ.append = function(el, toAppend) {
  var e;
  if (el.length) {
    return (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = el.length; i < len; i++) {
        e = el[i];
        results.push(QJ.append(e, toAppend));
      }
      return results;
    })();
  }
  return el.insertAdjacentHTML('beforeend', toAppend);
};

QJ.find = function(el, selector) {
  if (el instanceof NodeList || el instanceof Array) {
    el = el[0];
  }
  return el.querySelectorAll(selector);
};

QJ.trigger = function(el, name, data) {
  var e, ev;
  try {
    ev = new CustomEvent(name, {
      detail: data
    });
  } catch (err) {
    e = err;
    ev = document.createEvent('CustomEvent');
    if (ev.initCustomEvent) {
      ev.initCustomEvent(name, true, true, data);
    } else {
      ev.initEvent(name, true, true, data);
    }
  }
  return el.dispatchEvent(ev);
};

module.exports = QJ;