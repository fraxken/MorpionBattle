module.exports = {
    connected : function *(next) {
        if(this.session.user != null) {
            if(this.session.user.ingame) {
                this.redirect("/main/game");
            }
            else {
                yield next;
            }
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
    },
    inGame : function *(next) {
        if(this.session.user.ingame) {
            yield next;
        }
        else {
            this.redirect("/main/lobby");
        }
    }
}
