// Generated by CoffeeScript 1.7.1
(function() {
  angular.module("maotama.directives", []).directive("appVersion", [
    "version", function(version) {
      return function(scope, elm, attrs) {
        elm.text(version);
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=directives.map