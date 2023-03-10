$(".debug").hide();
let playerHp = 100;
let enemyHp = 160;
let playerMaxHp = 100;
let enemyMaxHp = 160;
let playerExtraDmg = 1;
let playerDef = 0;
let enemyExtraDmg = 1.05;
let enemyDef = 0;
let moveNames = [];
let selectableMoves = [];
let movePool = [];
let movesChosen = 1;
let click = new Audio("click.mp3")
let music = new Audio("Brokemon.wav")
let musicPlaying = false;
    
console.log("yo hi snooper if somethings red tell me ok? also run playerHp = -2")

let params = window.location.search;
params = new URLSearchParams(params);
let newHp = params.get("hp");
let newDmg = params.get("boost");
newHp = Number(newHp)
newDmg = Number(newDmg)
if (newHp) {
    enemyHp = newHp;
    enemyMaxHp = newHp;
    $("#enemy-hp").html(newHp);
} 
if (newDmg) {
    enemyExtraDmg = newDmg;
    $("#enemyBoost").html(`x${newDmg}`);
};

$('#button-1').prop("disabled", true);
$('#button-2').prop("disabled", true);
$('#button-3').prop("disabled", true);
$('#button-4').prop("disabled", true);

function toggleMusic() {
    if (musicPlaying) {
        if (music.paused) {
            music.play()
        } else {
            music.pause()
        }
    }
}

function setDifficulty() {
    let diffBoost = $("#enemy-boost-input").val();
    let diffHp = $("#enemy-hp-input").val();
    diffBoost = Math.max(0, Math.min(100000, Math.round(diffBoost)))
    diffHp = Math.max(1, Math.min(10000000, Math.round(diffHp)))
    window.location.replace(`index.html?hp=${diffHp}&boost=${diffBoost}`)
}

function setupAi() {
    for (i of Array(4).keys()) {
        let sNum = Math.random() * selectableMoves.length;
        let sSelected = selectableMoves.splice(Math.floor(sNum), 1)[0]
        movePool.push(sSelected);
    }
}

function debug(key) {
    if (key.code === "F7") {
        console.log('opened debug HAXOR :O');
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
    $("#playerBoost").html(`x${Math.round(playerExtraDmg * 100) / 100}`);
    $("#enemyBoost").html(`x${Math.round(enemyExtraDmg * 100) / 100}`);
    if (playerExtraDmg < 1) {
        $("#playerBoost").switchClass("boost", "nerf", 1000, "easeInOutQuad");
    } else if (playerExtraDmg >= 1) {
        console.log("cool")
        $("#playerBoost").switchClass("nerf", "boost", 1000, "easeInOutQuad");
    }
    if (enemyExtraDmg < 1) {
        $("#enemyBoost").switchClass("boost", "nerf", 1000, "easeInOutQuad");
    } else if (enemyExtraDmg >= 1) {
        $("#enemyBoost").switchClass("nerf", "boost", 1000, "easeInOutQuad");
    }
    $("#player-defense").html(playerDef);
    $("#enemy-defense").html(enemyDef);
}

function display(top, bottom) {
    $("#top-bar").html("| " + top);
    $("#bottom-bar").html("| " + bottom);
}

function moveAi() {
    let num = Math.random() * movePool.length;
    let selected = movePool[Math.floor(num)];
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

function evalUse(name, user) {
    eval(`${name}.useMove("${user}")`)
}

class Move {
    constructor(name, dmg, target, effect, effectType, heal, codeName, specialMsg) {
        this.name = name;
        this.dmg = dmg;
        if (target != "attack") {
            this.target = target;
            this.effect = effect;
        } else {
            this.target = "attack";
        }
        this.heal = heal;
        this.effectType = effectType;
        this.codeName = codeName;
        moveNames.push(codeName);
        selectableMoves = [...moveNames];
        this.addFunction = `${codeName}.addToMoves()`;
        this.useFunction = `${codeName}.useMove("player")`;
        $("#key").before(`<button class="move-select" id="add-${codeName}" onclick="${this.addFunction}">${name}</button>`);
        if (dmg > 0 && target === "attack") {
            $(`#add-${codeName}`).addClass("damageMove");
        } else if (dmg > 0) {
            $(`#add-${codeName}`).addClass("specialDmgMove");
        } else if (target != "attack") {
            $(`#add-${codeName}`).addClass("statusMove");
        } else if (heal > 0) {
            $(`#add-${codeName}`).addClass("healMove");
        }
        this.specialMsg = specialMsg;
    }
    
    addToMoves() {
        click.play();
        $(`#button-${movesChosen}`).html(this.name);
        $(`#button-${movesChosen}`).attr("onclick", `${this.useFunction}`)
        movesChosen += 1;
        $(`#add-${this.codeName}`).remove();
        if (movesChosen === 5) {
            $("#moveSelector").remove();
            music.play()
            music.loop = true;
            musicPlaying = true;
            loop1();
        }
    }

    useMove(user) {
        switch (user) {
            case "player":
                click.play();
                let pDamageDealt = this.dmg * playerExtraDmg;
                let randomDamageBoost = Math.random() / 5
                randomDamageBoost += 0.9
                pDamageDealt *= randomDamageBoost
                if (this.dmg > 0) {
                    console.log("indeedee")
                    pDamageDealt -= enemyDef
                    pDamageDealt = Math.max(pDamageDealt, (pDamageDealt + enemyDef) / 2)
                }
                enemyHp -= pDamageDealt;
                playerHp += this.heal * playerExtraDmg;
                console.log(this.codeName)
                playerHp = Math.min(playerHp, playerMaxHp);
                enemyHp = Math.min(enemyHp, enemyMaxHp)
                if (this.target === "user") {
                    if (this.effectType === 1) {
                        playerExtraDmg += this.effect;
                        playerExtraDmg = Math.max(playerExtraDmg, 0.5);
                    } else if (this.effectType === 2) {
                        playerDef += this.effect;
                    }
                } else if (this.target === "enemy") {
                    if (this.effectType === 1) {
                        enemyExtraDmg += this.effect;
                        enemyExtraDmg = Math.max(enemyExtraDmg, 0.5);
                    } else if (this.effectType === 2) {
                        enemyDef += this.effect;
                    }
                }

                if (this.dmg > 0 && this.heal >= 0) {
                    if (this.target != "attack" || this.heal > 0) {
                        display(`You used ${this.name}!`, `It dealt ${Math.round(pDamageDealt)} damage and some other stuff.`)
                    } else {
                        display(`You used ${this.name}!`, `It dealt ${Math.round(pDamageDealt)} damage.`)
                    }
                } else if (this.target === "user") {
                    if (this.effectType === 1) {
                        display(`You used ${this.name}!`, `Your attack increased by ${this.effect * 100}%.`)
                    } else {
                        display(`You used ${this.name}!`, `Your defense increased by ${this.effect}.`)
                    }
                } else if (this.target === "enemy") {
                    if (this.effectType === 1) {
                        display(`You used ${this.name}!`, `The opponent's attack decreased by ${this.effect * -100}%.`)
                    } else {
                        display(`You used ${this.name}!`, `The opponent's defense decreased by ${this.effect * -1}.`)
                    }
                } else if (this.heal > 0) {
                    display(`You used ${this.name}!`, `It brought your HP back up to ${Math.round(playerHp)}.`)
                } else if (this.heal < 0) {
                    display(`You use ${this.name}!`,  `It dealt ${Math.round(pDamageDealt)} damage with ${Math.round(this.heal * playerExtraDmg * -1)} recoil.`)
                }

                if (this.specialMsg) {
                    console.log("sure")
                    switch (this.codeName) {
                        case "beast":
                            display("MRBEASTTTT", "You healed both yourself and your enemy.");
                            break;
                        case "saiyan":
                            display("SUPER SAIYAN!!!", "*insert japanese here*")
                            break;  
                    }
                }

                toggleButtons();
                setTimeout(loop2, 1500)
                break;
            case "enemy":
                let eDamageDealt = this.dmg * enemyExtraDmg;
                let eRandomDamageBoost = Math.random() / 5
                eRandomDamageBoost  += 0.9
                eDamageDealt *= eRandomDamageBoost
                if (this.dmg > 0) {
                    eDamageDealt -= playerDef;
                    eDamageDealt = Math.max(eDamageDealt, (eDamageDealt + playerDef) / 2);
                };
                playerHp -= eDamageDealt;
                enemyHp += this.heal * enemyExtraDmg;
                enemyHp = Math.min(enemyHp, enemyMaxHp);
                playerHp = Math.min(playerHp, playerMaxHp);
                if (this.target === "user") {
                    if (this.effectType === 1) {
                        enemyExtraDmg += this.effect;
                        enemyExtraDmg = Math.max(enemyExtraDmg, 0.5);
                    } else if (this.effectType === 2) {
                        enemyDef += this.effect;
                    }
                } else if (this.target === "enemy") {
                    if (this.effectType === 1) {
                        playerExtraDmg += this.effect;
                        playerExtraDmg = Math.max(playerExtraDmg, 0.5);
                    } else if (this.effectType === 2) {
                        playerDef += this.effect;
                    }
                }
                if (this.dmg > 0 && this.heal >= 0) {
                    if (this.target != "attack" || this.heal > 0) {
                        display(`The opponent used ${this.name}!`, `It dealt ${Math.round(eDamageDealt)} damage and some other stuff.`)   
                    } else {
                        display(`The opponent used ${this.name}!`, `It dealt ${Math.round(eDamageDealt)} damage.`)
                    }
                } else if (this.target === "user") {
                    if (this.effectType === 1) {
                        display(`The opponent used ${this.name}!`, `The opponent's attack increased by ${this.effect * 100}%.`)
                    } else {
                        display(`The opponent used ${this.name}!`, `The opponent's defense increased by ${this.effect * 1}.`)
                    }
                } else if (this.target === "enemy") {
                    if (this.effectType === 1) {
                        display(`The opponent used ${this.name}!`, `Your attack decreased by ${this.effect * -100}%.`)
                    } else {
                        display(`The opponent used ${this.name}!`, `Your defense decreased by ${this.effect * -1}.`)
                    }
                } else if (this.heal > 0) {
                    display(`The opponent used ${this.name}!`, `It brought its HP back up to ${Math.round(enemyHp)}.`)
                } else if (this.heal < 0) {
                    display(`The opponent used ${this.name}!`,  `It dealt ${Math.round(eDamageDealt)} damage with ${Math.round(this.heal * enemyExtraDmg * -1)} recoil.`)
                }

                if (this.specialMsg) {
                    switch (this.codeName) {
                        case "beast":
                            display("MRBEASTTTT", "Both the enemy and you were healed.");
                            break;
                        case "saiyan":
                            display("ENEMY GO SUPER SAIYAN!!!", "*insert japanese here*")
                            break;
                    }
                }

                break;
        }
    roundAndUpdate()
    }

}

// let name = new Move("name", dmg, "effectTarget", effectPower, effectType, heal, "codename", hasSpeicalDisplay)
let bonk = new Move("Bonk", 40, "attack", 0, 0, 0, "bonk", false);
let stronk = new Move("Stronkify", 0, "user", 0.15, 1, 0, "stronk", false);
let belittle = new Move("Belittle", 0, "enemy", -0.15, 1, 0, "belittle", false);
let tickle = new Move("Tickle", 10, "enemy", -0.1, 1, 0, "tickle", false);
let lick = new Move("Lick Wounds", 0, "attack", 0, 0, 30, "lick", false);
let hyperbonk = new Move("HYPERBONK", 50, "attack", 0, 0, -40, "hyperbonk", false);
let triangulate = new Move("Triangulate &#x1f913;", 15, "user", 0.05, 1, 10, "triangulate", false);
let munch = new Move("Gremlin Munch", 30, "attack", 0, 0, 15, "munch", false);
let beast = new Move("MRBEASTTTT", -20, "attack", 0, 0, 40, "beast", true);
let saiyan = new Move("Super Saiyan", 0, "user", 0.3, 1, -30, "saiyan", true);
let rock = new Move("El Rock", 0, "user", 5, 2, 0, "rock", false);
let pickaxe = new Move("Diamond Pickaxe", 0, "enemy", -4, 2, 0, "pickaxe", false);
let l = new Move("L", 25, "enemy", -0.05, 1, 0, "l", false);
// Kalob was a special child. He belittled people so they could not lick their wounds using a baseball bat to bonk them
document.addEventListener("keydown", debug);
setupAi()
