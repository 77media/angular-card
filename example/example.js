angular.module('app', ['ssm.card'])

  .controller('ExampleCtrl', ['$scope', function ($scope) {

    var card1 = {
      name: 'Mike Brown',
      number: '5555 4444 3333 1111',
      expiry: '11 / 2018',
      cvc: '123'
    };
    var card2 = {
      name: 'Bill Smith',
      number: '4321 4321 4321 4321',
      expiry: '02 / 2018',
      cvc: '591'
    };

    var selectedCard = 1;
    $scope.card = {};

    $scope.changeCard = function () {
      if (selectedCard === 1) {
        $scope.card = card2;
        selectedCard = 2;
      } else {
        $scope.card = card1;
        selectedCard = 1;
      }
    };

    $scope.clear = function () {
      $scope.card = {};
    };


    $scope.cardPlaceholders = {
      name: 'Your Full Name',
      number: 'xxxx xxxx xxxx xxxx',
      expiry: 'MM/YYYY',
      cvc: 'xxx'
    };

    $scope.cardMessages = {
      validDate: 'valid\nthru',
      monthYear: ''
    };

    $scope.cardOptions = {
      debug: false,
      formatting: true
    };

    $scope.submitForm = function (form) {
      //Force the field validation
      angular.forEach(form, function (obj) {
        if (angular.isObject(obj) && angular.isDefined(obj.$setDirty)) {
          obj.$setDirty();
        }
      })

      if (form.$valid) {
        var card = $scope.card;
        var message = "Form is valid.";
        message += "\nCard number: " + card.number;
        message += "\nName: " + card.name;
        var parts = card.expiry.split('/');
        message += "\nExpiry Month: " + parts[0].trim();
        message += "\nExpiry Year: " + parts[1].trim();
        message += "\nCVC: " + card.cvc;
        alert(message);

      };
    };

  }]);
