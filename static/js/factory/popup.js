(function () {
    var popup = angular.module("ngPopup", []);

    popup.service('popup', function () {
        this.open = false;
        this.template = "popups/creategame";
        var self = this;
        this.updateTemplate = function(name) {
            self.template = "popups/"+name;
            self.open = true;
        }
        this.changeState = function(value) {
            if(value != undefined && typeof value != "boolean") return;
            self.open = value ? value : (self.open ? false : true);
        }
        this.getTemplate = function() {
            return self.template;
        }
    });
    
})();
