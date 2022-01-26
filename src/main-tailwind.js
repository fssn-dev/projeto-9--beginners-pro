const BODY = document.querySelector("body")
const WRAPPER = document.getElementById("cardHolder")
const TOP = document.getElementById("btn-back-to-top")
const PAGE_LEFT = document.getElementById("pageLeft")
const PAGE_RIGHT = document.getElementById("pageRight")
const PAGE_OF = document.getElementById("pageOf")
const SCRIPT = document.querySelector("script")
const SEARCH_NAME = document.getElementById("searchName")
const SEARCH_EXPANSION = document.getElementById("searchExpansion")
const SEARCH_CARDS = document.getElementById("searchCards")
const EXPANSION_BUTTON = document.getElementById("expansionButton")
const EXP_DIV = document.getElementById("expDiv")

const HOLDER = []

let pageCounter = 0
let cardSet
let currentPageArray = HOLDER
let currentPopulate = populateBig

//inicia a tela de loading
let loadingWrapper = document.createElement("div")
loadingWrapper.setAttribute("id", "loadingWrapper")
loadingWrapper.setAttribute("class", "flex justify-center flex-col items-center text-center pt-[3%]")
BODY.insertBefore(loadingWrapper, SCRIPT)
let loading = document.getElementById("loadingWrapper")
loading.innerHTML = LoadingTemplateTailwind()

fetchAPI()

window.addEventListener("scroll", () => {
    scrollFunction()
})

SEARCH_NAME.addEventListener("click", () => {

    //reseta o botão expansion
    SEARCH_EXPANSION.setAttribute("class", "buttonSearchSide searchPos2")
    SEARCH_CARDS.setAttribute("style", "display:none;")
    SEARCH_EXPANSION.setAttribute("style", "display:flex;right:15px")

    // exibe o botão cards no lugar de name
    SEARCH_NAME.setAttribute("style", "display:none;")
    SEARCH_CARDS.setAttribute("class", "buttonSearchSide searchPos1")
    SEARCH_CARDS.setAttribute("style", "display:flex;right:30px")

    //remove grid de cartas
    clearGrid()
    //remove carta gerada pela busca por nome
    clearSearchByName()

    clearErrorMessage()

    document.getElementById("expDiv").setAttribute("class", "hidden flex-row flex-wrap ml-[7%]")
    WRAPPER.setAttribute("class", "flex flex-col flex-wrap justify-center items-center ml-[-7%]")

    //limpa a quantidade de páginas
    PAGE_OF.innerText = ""

    //esconde as setas de navegação
    PAGE_LEFT.setAttribute("style", "display:none")
    PAGE_RIGHT.setAttribute("style", "display:none")

    //alterna o display da barra de busca adequada
    document.getElementById("expansionSearch").setAttribute("style", "display:none")
    document.getElementById("nameSearch").setAttribute("style", "display:flex")

})

//lógica do botão da pesquisa por nome carregado por onclick no documento HTML
function searchForName() {

    clearGrid()
    clearSearchByName()

    let message = `<h1 id="errName" style="width: max-content;">CARD NOT FOUND</h1>`

    let result = HOLDER.find(card => {
        return card.name == `${document
            .getElementById("nameInput").value}`
    })



    if (!!!result) {
        WRAPPER.innerHTML = WRAPPER.innerHTML.replace(message, "")
        WRAPPER.innerHTML += message
    } else {
        WRAPPER.innerHTML = WRAPPER.innerHTML.replace(message, "")
        WRAPPER.innerHTML += CardByNameTemplateTailwind("", result)
        CardByNameTailwindPosition()
    }

}

SEARCH_EXPANSION.addEventListener("click", () => {

    //reseta o botão name
    SEARCH_NAME.setAttribute("class", "buttonSearchSide searchPos1")
    SEARCH_CARDS.setAttribute("style", "display:none;")
    SEARCH_NAME.setAttribute("style", "display:flex;")

    //exibe o botão cards no lugar de expansion
    SEARCH_EXPANSION.setAttribute("style", "display:none;")
    SEARCH_CARDS.setAttribute("class", "buttonSearchSide searchPos2")
    SEARCH_CARDS.setAttribute("style", "display:flex;")

    clearGrid()
    clearSearchByName()

    clearErrorMessage()

    WRAPPER.setAttribute("class", "flex flex-col flex-wrap justify-center items-center ml-[-7%]")

    currentPopulate = populateExpansion

    let div = document.getElementById("expDiv")
    div.setAttribute("class", "flex flex-row flex-wrap ml-[7%]")
    // EXP_DIV.setAttribute("class", "flex flex-row flex-wrap ml-[7%]")

    PAGE_OF.innerText = ""

    //reseta as setas de navegação
    PAGE_LEFT.setAttribute("style", "display:initial")
    PAGE_RIGHT.setAttribute("style", "display:initial")

    document.getElementById("nameSearch").setAttribute("style", "display:none")
    document.getElementById("expansionSearch").setAttribute("style", "display:flex")

})

function searchForExpansion() {

    clearGrid()
    clearSearchByName()

    let message = `<h1 id="errExp" style="width: max-content;">EXPANSION NOT FOUND</h1>`

    cardSet = HOLDER.filter(card => {
        return card.cardSet == `${document.getElementById("expansionInput").value}`
    })

    //variável altera o vetor a ser usado para gerar o número de páginas
    currentPageArray = cardSet

    //altera a função de template a ser usada no momento
    currentPopulate = populateExpansion

    //gera o número de páginas
    setPageFooter(currentPageArray)

    if (!!!cardSet.length) {
        WRAPPER.innerHTML = WRAPPER.innerHTML.replace(message, "")
        WRAPPER.innerHTML += message
    } else {
        WRAPPER.innerHTML = WRAPPER.innerHTML.replace(message, "")
        currentPopulate(pageCounter, cardSet)
    }

}

function clearErrorMessage() {

    try {
        document.getElementById("errName").remove()
    } catch { }

    try {
        document.getElementById("errExp").remove()
    } catch { }
}

SEARCH_CARDS.addEventListener("click", () => {

    SEARCH_NAME.setAttribute("class", "buttonSearchSide searchPos1")
    SEARCH_EXPANSION.setAttribute("class", "buttonSearchSide searchPos2")
    SEARCH_CARDS.setAttribute("style", "display:none;")
    SEARCH_NAME.setAttribute("style", "display:flex;")
    SEARCH_EXPANSION.setAttribute("style", "display:flex;")

    document.getElementById("expDiv").setAttribute("class", "hidden flex-row flex-wrap ml-[7%]")
    WRAPPER.setAttribute("class", "flex flex-row flex-wrap justify-center ml-[-7%]")

    document.getElementById("expansionSearch").setAttribute("style", "display:none")
    document.getElementById("nameSearch").setAttribute("style", "display:none")

    PAGE_LEFT.setAttribute("style", "display:initial")
    PAGE_RIGHT.setAttribute("style", "display:initial")

    currentPageArray = HOLDER
    currentPopulate = populateBig

    setPageFooter(HOLDER)

    clearErrorMessage()
    clearSearchByName()
    currentPopulate(pageCounter, HOLDER)

})

TOP.addEventListener("click", () =>
    topFunction()
)

PAGE_LEFT.addEventListener("click", () => {

    //previne a navegação à páginas negativas
    if (pageCounter != 0) {
        pageCounter--
        currentPopulate(pageCounter, currentPageArray)
    } else {
        return
    }

    setPageFooter(currentPageArray)
})

PAGE_RIGHT.addEventListener("click", () => {

    //previne a navegação à páginas além da ultima página com cartas
    if (pageCounter != setPageFooter(currentPageArray) - 1) {
        pageCounter++
        setPageFooter(currentPageArray)
        currentPopulate(pageCounter, currentPageArray)
    } else {
        return
    }

})

async function fetchAPI() {

    try {
        const response = await fetch("https://omgvamp-hearthstone-v1.p.rapidapi.com/cards", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "omgvamp-hearthstone-v1.p.rapidapi.com",
                "x-rapidapi-key": "INSERT KEY HERE"
            }
        })

        const cards = await response.json()

        for (let key in cards) {
            if (Object.prototype.hasOwnProperty.call(cards, key)) {
                let valor = cards[key];
                await valor.forEach(card => {
                    // Aqui começa a aferição de padrões, que será colocado abaixo
                    if (card.img !== null && card.img !== undefined) {
                        // Faça as ações aqui
                        HOLDER.push(card)

                    }
                })
            }
        }

        displayInstructions()

    } catch {
        e => {
            console.log(`Fetch error: ${e}`)
        }
    }
}

//mostra o botão TOP quando o usuário navega para baixo
function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        TOP.setAttribute("class", "flex w-[3rem] h-[3rem] mb-[10%] bg-red-500 text-white cursor-pointer p-15 rounded text-lg justify-center items-center")
    } else {
        TOP.setAttribute("class", "hidden w-[3rem] h-[3rem] mb-[10%] bg-red-500 text-white cursor-pointer p-15 rounded text-lg justify-center items-center")

    }
}

//função que move a página de volta ao topo
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

//inicia as funcionalidades da página após a conclusão do fetch
function displayInstructions() {

    //remove a tela de loading
    removeLoadingScreen()

    //popula a página com as cartas
    populateBig(pageCounter, HOLDER)

    //mostra o menu lateral
    displaySideMenu()

    //gera o número de páginas
    setPageFooter(HOLDER)
}

function removeLoadingScreen() {
    loading.remove()
}

function displaySideMenu() {
    let sideMenu = document.getElementById("sideMenuWrapper")
    sideMenu.setAttribute("class", "flex fixed z-99 flex-col border-none outline-none items-center")
}

function setPageFooter(array) {
    PAGE_OF.innerText = `${pageCounter + 1} of ${Math.ceil(array.length / 25)}`
    return Math.ceil(array.length / 25)
}


function LoadingTemplateTailwind() {
    return `
        <div>
            <h1 class="text-4xl">PLEASE WAIT</h1>
            <h2 class="text-3xl">LOADING RESOURCES</h2>
        </div>
        <div id="spinnerWrapper">
        <span class="flex h-auto w-auto flex-row">
            <span class="animate-ping h-4 w-4 mx-3 mt-2 rounded-full bg-white opacity-75"></span>
            <span class="animate-ping h-4 w-4 mx-3 mt-2 rounded-full bg-white opacity-75"></span>
            <span class="animate-ping h-4 w-4 mx-3 mt-2 rounded-full bg-white opacity-75"></span>
            <span class="animate-ping h-4 w-4 mx-3 mt-2 rounded-full bg-white opacity-75"></span>
            <span class="animate-ping h-4 w-4 mx-3 mt-2 rounded-full bg-white opacity-75"></span>
        </span>
        </div>
    `
}

function populateBig(pageCounter, array) {

    let lower = pageCounter * 25
    let upper = (pageCounter + 1) * 25

    clearGrid()

    for (lower; lower < upper; lower++) {
        try {
            WRAPPER.innerHTML += CardTemplateTailwind(lower, array[lower])
        } catch {
            //catch para remover erro caso a quantidade de cartas for menor que o número calculado
            //na variável upper
        }
    }
}
function populateExpansion(pageCounter, array) {
    let lower = pageCounter * 25
    let upper = (pageCounter + 1) * 25

    clearGrid()

    for (lower; lower < upper; lower++) {
        try {
            document.getElementById("expDiv").innerHTML += CardTemplateTailwind(lower, array[lower])
        } catch {
            //catch para remover erro caso a quantidade de cartas for menor que o número calculado
            //na variável upper
        }
    }
}

function clearGrid() {
    let elements = Array.from(document.getElementsByClassName("flex flex-col CTP"))
    elements.forEach(element => element.remove())
}

function clearSearchByName() {

    if (!!!document.getElementById("singleCardWrapper")) {
        return
    } else {
        let element = Array.of(document.getElementById("singleCardWrapper"))
        element.forEach(tag => tag.remove())
    }
}

function CardTemplateTailwind(counter, array) {
    return `
    <div class="flex flex-col CTP">
        <div class="feature-icon">
            <img id="cardImg${counter}" class="h-auto w-[80%]" src="${array.img}">
        </div>
        <h4 id="cardName${counter}" class="CTPP">${array.name}</h4>
        <p id="cardExpansion${counter}" class="CTPP"><span>Expansion:</span> ${array.cardSet} </p>
        ${checkCost(counter, array)}
        ${checkPlayerClass(counter, array)}
        ${checkText(counter, array)}
        ${checkRace(counter, array)}
        ${checkMechanics(counter, array)}
        ${checkAttack(counter, array)}
        ${checkHealth(counter, array)}
        ${checkType(counter, array)}
    </div>
    `
}

function CardByNameTemplateTailwind(counter, array) {
    return `
    <div id="singleCardWrapper" class="flex mt-[4%]">
        <div style="">
            <img id="cardImg${counter}" src="${array.img}" class="w-[16rem] mt-[-15%]">
        </div>
        <div style="padding: -3%;">
            <h4 id="cardName${counter}" class="text-3xl">${array.name}</h4>
        <p id="cardExpansion${counter}" ><span>Expansion:</span> ${array.cardSet}</p>
        ${checkCost(counter, array)}
        ${checkPlayerClass(counter, array)}
        ${checkText(counter, array)}
        ${checkRace(counter, array)}
        ${checkMechanics(counter, array)}
        ${checkAttack(counter, array)}
        ${checkHealth(counter, array)}
        ${checkType(counter, array)}
        ${checkFlavor(counter, array)}
        ${checkArtist(counter, array)}
        </div>
    </div>
    `
}

function CardByNameTailwindPosition() {
    let p = Array.from(document.querySelectorAll("p"))
    p.pop()
    p.forEach(element => {
        element.setAttribute("class", "")
    })
}

function checkCost(counter, array) {
    if (array.hasOwnProperty("cost")) {
        return `<p id="cardCost${counter}" class="CTPP"><span>Cost:</span> ${array.cost} </p>`
    } else {
        return ""
    }
}

function checkPlayerClass(counter, array) {
    if (array.hasOwnProperty("playerClass")) {
        return `<p id="playerClass${counter}" class="CTPP"><span>Class:</span> ${array.playerClass} </p>`
    } else {
        return ""
    }
}

function checkText(counter, array) {
    if (array.hasOwnProperty("text")) {
        return `<p id="cardText${counter}" class="CTPP"><span>Text:</span> ${replaceText(array.text)} </p>`
    } else {
        return ""
    }
}

function replaceText(string) {

    let regex1 = /(\S#\S)|(\S_\S)|(\S\$\S)|(\S\\n\S)|(\S\[x\]\S)/g
    let regex2 = /(# )|(_ )|(\$ )|(\\n )|(\[x\] )/g
    let regex3 = /(#)|(_)|(\$)|(\\n)|(\[x\])/g

    let string2

    if (string.search(regex1) != -1) {
        string2 = string.replace(regex1, `${string.match(regex1)[0][0]} ${string.match(regex1)[0][2]}`)
    } else {
        string2 = string
    }

    if (string2.search(regex2) != -1) {
        string2 = string2.replace(regex2, "")
    }

    if (string.search(regex3) != -1) {
        string2 = string2.replace(regex3, "")
    }

    return string2

}

function checkRace(counter, array) {
    if (array.hasOwnProperty("race")) {
        return `<p id="cardRace${counter}" class="CTPP"><span>Race:</span> ${array.race} </p>`
    } else {
        return ""
    }
}

function checkMechanics(counter, array) {
    if (array.hasOwnProperty("mechanics")) {
        if (array.mechanics.length == 1) {
            return `<p id="cardMechanics${counter}" class="CTPP"><span>Mechanics:</span> ${array.mechanics[0].name} </p>`
        } else {
            let holder = []
            array.mechanics.forEach(mechanic => { holder.push(mechanic.name) })
            return `<p id="cardMechanics${counter}" class="CTPP"><span>Mechanics:</span> ${holder.join().replace(",", " / ")} </p>`
        }
    } else {
        return ""
    }
}

function checkAttack(counter, array) {
    if (array.hasOwnProperty("attack")) {
        return `<p id="cardAttack${counter}" class="CTPP"><span>Attack:</span> ${array.attack} </p>`
    } else {
        return ""
    }
}

function checkHealth(counter, array) {
    if (array.hasOwnProperty("health")) {
        return `<p id="cardHealth${counter}" class="CTPP"><span>Health:</span> ${array.health} </p>`
    } else {
        return ""
    }
}

function checkType(counter, array) {
    if (array.hasOwnProperty("type")) {
        return `<p id="cardType${counter}" class="CTPP"><span>Type:</span> ${array.type} </p>`
    } else {
        return ""
    }
}

function checkFlavor(counter, array) {
    if (array.hasOwnProperty("flavor")) {
        return `<p id="cardFlavor${counter}" class="CTPP"><span>Flavor:</span> ${array.flavor} </p>`
    } else {
        return ""
    }
}
function checkArtist(counter, array) {
    if (array.hasOwnProperty("artist")) {
        return `<p id="cardArtist${counter}" class="CTPP"><span>Artist:</span> ${array.artist} </p>`
    } else {
        return ""
    }
}