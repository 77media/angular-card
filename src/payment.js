'use strict';

//var QJ = require('qj');

var getIndex = [].getIndex || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

var defaultFormat = /(\d{1,4})/g;

var cards = [
  {
    type: 'amex',
    pattern: /^3[47]/,
    format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
    length: [15],
    cvcLength: [4],
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
    type: 'visa',
    pattern: /^4/,
    format: defaultFormat,
    length: [13, 16, 19],
    cvcLength: [3],
    luhn: true
  }
];

var cardFromNumber = function (num) {
  var card, i, len;
  num = (num + '').replace(/\D/g, '');
  for (i = 0, len = cards.length; i < len; i++) {
    card = cards[i];
    if (card.pattern.test(num)) {
      return card;
    }
  }
};

var cardFromType = function (type) {
  var card, i, len;
  for (i = 0, len = cards.length; i < len; i++) {
    card = cards[i];
    if (card.type === type) {
      return card;
    }
  }
};

var luhnCheck = function (num) {
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

var hasTextSelected = function (target) {
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
    return false;
  }
  return false;
};

var formatCardNumber = function (e) {
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

var formatBackCardNumber = function (e) {
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

var formatExpiry = function (e) {
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

var formatMonthExpiry = function (e) {
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

var formatForwardExpiry = function (e) {
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

var formatForwardSlash = function (e) {
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

var formatBackExpiry = function (e) {
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

var restrictNumeric = function (e) {
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

var restrictCardNumber = function (e) {
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

var restrictExpiry = function (e, length) {
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

var restrictCombinedExpiry = function (e) {
  return restrictExpiry(e, 6);
};

var restrictMonthExpiry = function (e) {
  return restrictExpiry(e, 2);
};

var restrictYearExpiry = function (e) {
  return restrictExpiry(e, 4);
};

var restrictCVC = function (e) {
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

var Payment = function () { };

var reFormatCardNumber = function (e) {
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

var setCardType = function (e) {
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

Payment.fns = {
  cardExpiryVal: function (value) {
    var month, prefix, ref, year;
    value = value.replace(/\s/g, '');
    ref = value.split('/', 2);
    month = ref[0];
    year = ref[1];
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
      ref = month;
      month = ref.month;
      year = ref.year;
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
    month = el[0];
    year = el[1];
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