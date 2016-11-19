export function *connected(next) {
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
}

export function *notConnected(next) {
    if(this.session.user != null) {
        this.redirect("/main/lobby");
    }
    else {
        yield next;
    }
}

export function *inGame(next) {
    if(this.session.user.ingame) {
        yield next;
    }
    else {
        this.redirect("/main/lobby");
    }
}
