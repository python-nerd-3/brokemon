let playerHp = 100;
let enemyHp = 140;
let playerExtraDmg = 1;
let enemyExtraDmg = 1.1;
let moveNames = []

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleButtons() {
    $('#button-1').prop('disabled', (i, v) => !v);
    $('#button-2').prop('disabled', (i, v) => !v);
    $('#button-3').prop('disabled', (i, v) => !v);
    $('#button-4').prop('disabled', (i, v) => !v);

}

function roundAndUpdate() {
    playerHp = Math.round(playerHp);
    enemyHp = Math.round(enemyHp);
    $("#enemy-hp").html(enemyHp);
    $("#player-hp").html(playerHp);
    if (enemyHp <= 0) {
        $("#enemy-hp").html("<span class='dead'>Dead</span>")
    }
    if (playerHp <= 0) {
        $("#player-hp").html("<span class='dead'>Dead</span>")
    }
}

function display(top, bottom) {
    $("#top-bar").html("| " + top);
    $("#bottom-bar").html("| " + bottom);
}

function moveAi() {
    let num = Math.random() * moveNames.length;
    let selected = moveNames[Math.floor(num)];
    eval(`${selected}.useMove("enemy")`)
}

function loop1() {
    if (playerHp > 0 && enemyHp > 0) {
        display("Your turn!", "")
        toggleButtons()
    } else {
        setTimeout(handleWin, 1000)
    }
}

function loop2() {
    if(playerHp > 0 && enemyHp > 0) {
        display("Enemy turn!", "")
        setTimeout(loop3, 1000)
    } else {
        setTimeout(handleWin, 1000)
    }
}

function loop3() {
    moveAi()
    setTimeout(loop1, 1500)
}

function handleWin() {
    if (playerHp >= enemyHp) {
        display("You win!", "Good job!")
    } else {
        display("You lose.", "You had to have done that deliberately.")
    }
}

class Move {
    constructor(name, dmg, target, effect) {
        this.name = name;
        this.dmg = dmg;
        if (target != "$D") {
            this.target = target;
            this.effect = effect;
        }
        moveNames.push(name.toLowerCase())
    }
    
    useMove(user) {
        switch (user) {
            case "player":
                let pDamageDealt = this.dmg * playerExtraDmg;
                enemyHp -= pDamageDealt;
                if (this.target === "user") {
                    playerExtraDmg += this.effect;
                } else if (this.target === "enemy") {
                    enemyExtraDmg += this.effect;
                }

                if (this.dmg != 0) {
                    display(`You used ${this.name}!`, `It dealt ${Math.round(pDamageDealt)} damage.`)
                } else if (this.target === "user") {
                    display(`You used ${this.name}!`, `Your attack increased by ${this.effect * 100}%.`)
                } else if (this.target === "enemy") {
                    display(`You used ${this.name}!`, `The opponent's attack decreased by ${this.effect * -100}%.`)
                }
                toggleButtons();
                setTimeout(loop2, 1500)
                break;
            case "enemy":
                let eDamageDealt = this.dmg * enemyExtraDmg;
                playerHp -= eDamageDealt;
                if (this.target === "user") {
                    enemyExtraDmg += this.effect;
                } else if (this.target === "enemy") {
                    playerExtraDmg += this.effect;
                }

                if (this.dmg != 0) {
                    display(`The opponent used ${this.name}!`, `It dealt ${Math.round(eDamageDealt)} damage.`)
                } else if (this.target === "user") {
                    display(`The opponent used ${this.name}!`, `The opponent's attack increased by ${this.effect * 100}%.`)
                } else if (this.target === "enemy") {
                    display(`The opponent used used ${this.name}!`, `Your  attack decreased by ${this.effect * -100}%.`)
                }

                break;
        }
    roundAndUpdate()
    }

}

let bonk = new Move("Bonk", 40, "$D", 0);
let stronkify = new Move("Stronkify", 0, "user", 0.2);
let belittle = new Move("Belittle", 0, "enemy", -0.15);
let tickle = new Move("Tickle", 10, "$D", 0);
// Kalob was a special child

setTimeout(loop1, 1000)