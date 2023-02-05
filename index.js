$(".debug").hide();
let playerHp = 100;
let enemyHp = 140;
let playerExtraDmg = 1;
let enemyExtraDmg = 1.1;
let moveNames = []
let isntFirefox = typeof InstallTrigger === 'undefined';
let isntSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
isntSafari = !isntSafari

if (isntFirefox && isntSafari) {
    alert("Please use Firefox/Safari or else the buttons commit die.")
} else if (!isntFirefox) {
    console.log("^^ that is because feature checking")
};
console.log("yo hi snooper if somethings red tell me ok? also run playerHp = -2")

let params = window.location.search;
params = new URLSearchParams(params);
let newHp = params.get("hp");
let newDmg = params.get("boost");
newHp = Number(newHp)
newDmg = Number(newDmg)
if (newHp) {
    enemyHp = newHp;
    $("#enemy-hp").html(newHp);
} if (newDmg) {
    enemyExtraDmg = newDmg;
};

$('#button-1').prop("disabled", true);
$('#button-2').prop("disabled", true);
$('#button-3').prop("disabled", true);
$('#button-4').prop("disabled", true);

function debug(key) {
    console.log('run')
    if (key.code === "F7") {
        console.log('yes');
        $(".debug").show();
    }
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
        display("You lost.", "sad")
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
                let randomDamageBoost = Math.random() / 5
                randomDamageBoost += 0.9
                pDamageDealt *= randomDamageBoost
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
                let eRandomDamageBoost = Math.random() / 5
                eRandomDamageBoost  += 0.9
                eDamageDealt *= eRandomDamageBoost
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

document.addEventListener("keydown", debug)
setTimeout(loop1, 1000)