'use strict';

// var QJ = require('qj');
// var extend = require('extend');
// var Payment = require('payment');


var Card = function (opts) {
  
  if (opts === undefined) {

  }
  else {
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
  }

  return Card;

};

Card.prototype.bindVal = function (el, out, opts) {
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
    var isFunction = (typeof opts.join === "function");
    if (!isFunction) {
      joiner = opts.join;
      opts.join = function () {
        return joiner;
      };
    }
    outDefaults = (function () {
      var j, len, results;
      results = [];
      for (j = 0, len = out.length; j < len; j++) {
        o = out[j];
        results.push(o.textContent);
      }
      return results;
    })();
    QJ.on(el, 'focus', function () {
      return QJ.addClass(out, 'ssm-card-focused');
    });
    QJ.on(el, 'blur', function () {
      return QJ.removeClass(out, 'ssm-card-focused');
    });
    QJ.on(el, 'keyup change paste', function (e) {
      var elem, filter, i, j, join, k, len, len1, outEl, outVal, ref, results, val;
      val = (function () {
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



Card.prototype.cardTemplate = '' + '<div class="ssm-card-container">' + '<div class="ssm-card">' + '<div class="ssm-card-front">' + '<div class="ssm-card-logo ssm-card-visa"></div>' + '<div class="ssm-card-logo ssm-card-mastercard"></div>' + '<div class="ssm-card-logo ssm-card-maestro"></div>' + '<div class="ssm-card-logo ssm-card-amex"></div>' + '<div class="ssm-card-logo ssm-card-discover"></div>' + '<div class="ssm-card-logo ssm-card-dinersclub"></div>' + '<div class="ssm-card-lower">' + '<div class="ssm-card-shiny"></div>' + '<div class="ssm-card-cvc ssm-card-display">{{cvc}}</div>' + '<div class="ssm-card-number ssm-card-display">{{number}}</div>' + '<div class="ssm-card-name ssm-card-display">{{name}}</div>' + '<div class="ssm-card-expiry ssm-card-display" data-before="{{monthYear}}" data-after="{{validDate}}">{{expiry}}</div>' + '</div>' + '</div>' + '<div class="ssm-card-back">' + '<div class="ssm-card-bar"></div>' + '<div class="ssm-card-cvc ssm-card-display">{{cvc}}</div>' + '<div class="ssm-card-shiny"></div>' + '</div>' + '</div>' + '</div>';

Card.prototype.template = function (tpl, data) {
  return tpl.replace(/\{\{(.*?)\}\}/g, function (match, key, str) {
    return data[key];
  });
};

Card.prototype.cardTypes = ['ssm-card-amex', 'ssm-card-dinersclub', 'ssm-card-discover','ssm-card-maestro', 'ssm-card-mastercard', 'ssm-card-visa'];

Card.prototype.defaults = {
  formatting: true,
  formSelectors: {
    numberInput: 'input[name="number"]',
    expiryInput: 'input[name="expiry"]',
    cvcInput: 'input[name="cvc"]',
    nameInput: 'input[name="name"]'
  },
  cardSelectors: {
    cardContainer: '.ssm-card-container',
    card: '.ssm-card',
    numberDisplay: '.ssm-card-number',
    expiryDisplay: '.ssm-card-expiry',
    cvcDisplay: '.ssm-card-cvc',
    nameDisplay: '.ssm-card-name'
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
    valid: 'ng-valid',
    invalid: 'ng-invalid'
  },
  debug: false
};

Card.prototype.render = function () {
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
      QJ.addClass(this.$card, 'ssm-card-safari');
    }
  }
  if (/MSIE 10\./i.test(navigator.userAgent)) {
    QJ.addClass(this.$card, 'ssm-card-ie-10');
  }
  if (/rv:11.0/i.test(navigator.userAgent)) {
    return QJ.addClass(this.$card, 'ssm-card-ie-11');
  }
};

Card.prototype.attachHandlers = function () {
  var expiryFilters;
  this.bindVal(this.$numberInput, this.$numberDisplay, {
    fill: false,
    filters: this.validToggler('cardNumber')
  });
  QJ.on(this.$numberInput, 'payment.cardType', this.handle('setCardType'));
  expiryFilters = [
    function (val) {
      return val.replace(/(\s+)/g, '');
    }
  ];
  expiryFilters.push(this.validToggler('cardExpiry'));
  this.bindVal(this.$expiryInput, this.$expiryDisplay, {
    join: function (text) {
      if (text[0].length === 2 || text[1]) {
        return "/";
      } else {
        return "";
      }
    },
    filters: expiryFilters
  });
  this.bindVal(this.$cvcInput, this.$cvcDisplay, {
    filters: this.validToggler('cardCVC')
  });
  QJ.on(this.$cvcInput, 'focus', this.handle('flipCard'));
  QJ.on(this.$cvcInput, 'blur', this.handle('unflipCard'));
  return this.bindVal(this.$nameInput, this.$nameDisplay, {
    fill: false,
    filters: this.validToggler('cardHolderName'),
    join: ' '
  });
};

Card.prototype.handleInitialPlaceholders = function () {
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

Card.prototype.handle = function (fn) {
  return (function (_this) {
    return function (e) {
      var args;
      args = Array.prototype.slice.call(arguments);
      args.unshift(e.target);
      return _this.handlers[fn].apply(_this, args);
    };
  })(this);
};

Card.prototype.validToggler = function (validatorName) {
  var isValid;
  if (validatorName === "cardExpiry") {
    isValid = function (val) {
      var objVal;
      objVal = Payment.fns.cardExpiryVal(val);
      return Payment.fns.validateCardExpiry(objVal.month, objVal.year);
    };
  } else if (validatorName === "cardCVC") {
    isValid = (function (_this) {
      return function (val) {
        return Payment.fns.validateCardCVC(val, _this.cardType);
      };
    })(this);
  } else if (validatorName === "cardNumber") {
    isValid = function (val) {
      return Payment.fns.validateCardNumber(val);
    };
  } else if (validatorName === "cardHolderName") {
    isValid = function (val) {
      return val !== "";
    };
  }
  return (function (_this) {
    return function (val, $in, $out) {
      var result;
      result = isValid(val);
      _this.toggleValidClass($in, result);
      _this.toggleValidClass($out, result);
      return val;
    };
  })(this);
};

Card.prototype.toggleValidClass = function (el, test) {
  QJ.toggleClass(el, this.options.classes.valid, test);
  return QJ.toggleClass(el, this.options.classes.invalid, !test);
};

Card.prototype.handlers = {
  setCardType: function ($el, e) {
    var cardType;
    cardType = e.data;
    if (!QJ.hasClass(this.$card, cardType)) {
      QJ.removeClass(this.$card, 'ssm-card-unknown');
      QJ.removeClass(this.$card, this.cardTypes.join(' '));
      QJ.addClass(this.$card, "ssm-card-" + cardType);
      QJ.toggleClass(this.$card, 'ssm-card-identified', cardType !== 'unknown');
      this.cardType = cardType;
      return this.cardType;
    }
  },
  flipCard: function () {
    return QJ.addClass(this.$card, 'ssm-card-flipped');
  },
  unflipCard: function () {
    return QJ.removeClass(this.$card, 'ssm-card-flipped');
  }
};

