module.exports = {
    connected : function *(next) {
        if(this.session.user != null) {
            yield next;
        }
        else {
            this.redirect("/main/authentification");
        }
    },
    notConnected : function *(next) {
        if(this.session.user != null) {
            this.redirect("/main/lobby");
        }
        else {
            yield next;
        }
    }
}
