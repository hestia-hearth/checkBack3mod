let game;
function reset() {
    game = {
        lastSave: Date.now(),
        lastUpdate: Date.now(),
        potency: 0,
        power: 0,
        mastery: 0,
        potencyButtonsUnlocked: 2,
        potencyCooldowns: [0, 0],
        towersUnlocked: 0,
        towerTimers: [-1, -1, -1, -1, -1, -1, -1],
        chestsUnlocked: 0,
        chestQuantityBases: [1, 1, 1, 1, 1, 1],
        chestQuantityRanges: [1, 1, 1, 1, 1, 1],
        rarityAutoDiscard: [false, false, false, false, false, false, false],
        artifactsDiscovered: [],
        berries: [0, 0, 0, 0, 0, 0, 0],
        berriesDiscovered: [],
        activeSlots: 2,
        activeItems: [],
        activeEffects: {
            incPotencyGain: 1,
            decPotencyCooldowns: 1,
            incTowerItemChance: 1,
            decTowerWait: 1,
            decChestCost: 1,
            incChestItems: [],
            incRarity: [],
            incBerry: [],
        },
        inventorySlots: 2,
        inventoryItems: [],
        itemGainQueue: [],
        vases: 0,
        totalMasteryPoints: 0,
        unspentMasteryPoints: 0,
        masteryUpgradesBought: [0, 0, 0],
        masteryUpgradeCosts: [10, 4, 6],
    };
    previousPower = game.power;
    previousMastery = game.mastery;
    artifactDisplayIndex = 0;
    artifactDisplayNumber = 0;
}
reset();

//If the user confirms the hard reset, resets all variables, saves and refreshes the page
function hardReset() {
    if (confirm("Are you sure you want to reset? You will lose everything!")) {
        reset()
        save()
        location.reload()
    }
}

function save() {
    //console.log("saving")
    game.lastSave = Date.now();
    localStorage.setItem("checkBack3Save", JSON.stringify(game));
}

function setAutoSave() {
    setInterval(save, 5000);
    autosaveStarted = true;
}
//setInterval(save, 5000)

function load() {
	reset()
	let loadgame = JSON.parse(localStorage.getItem("checkBack3Save"))
	if (loadgame != null) {loadGame(loadgame)}
}

load()

function exportGame() {
    save()
    navigator.clipboard.writeText(btoa(JSON.stringify(game))).then(function() {
        alert("Copied to clipboard!")
    }, function() {
        alert("Error copying to clipboard, try again...")
    });
}

function importGame() {
    loadgame = JSON.parse(atob(prompt("Input your save here:")))
    if (loadgame && loadgame != null && loadgame != "") {
        reset()
        loadGame(loadgame)
        save()
        location.reload()
    }
    else {
        alert("Invalid input.")
    }
}

function loadGame(loadgame) {
    //Sets each variable in 'game' to the equivalent variable in 'loadgame' (the saved file)
    let loadKeys = Object.keys(loadgame);
    for (i=0; i<loadKeys.length; i++) {
        if (loadgame[loadKeys[i]] != "undefined") {
        let thisKey = loadKeys[i];
        if (Array.isArray(loadgame[thisKey])) { //Check if the current variable is an array
        //Check if the array in the save file is shorter than the array in the game
        if (loadgame[thisKey].length < game[thisKey].length) {
            game[loadKeys[i]] = game[thisKey].map((x, index) => {
                return loadgame[thisKey][index] !== undefined ? loadgame[thisKey][index] : x;
            });
            } else {
            game[loadKeys[i]] = loadgame[thisKey].map((x) => {
                return x;
            });
            }
        }
        //else {game[Object.keys(game)[i]] = loadgame[loadKeys[i]]}
        else {game[loadKeys[i]] = loadgame[loadKeys[i]]}
        }
    }
}

// Keybinds

let shiftKeyPressed = false;
document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "Escape":
            if (document.getElementById("itemGainOverlay").style.display === "block" && game.itemGainQueue[0]?.type === "artifact") {
                nextItemGain();
            }
            break;
        case "Shift":
            if (!shiftKeyPressed) {
                shiftKeyPressed = true;
                updateBars();
            }
            break;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
        shiftKeyPressed = false;
        updateBars();
    }
});

// Drag and drop variables
let isDragging = false;
let draggedItemInfo = { type: null, index: -1, item: null };
let draggedElement = null;

document.addEventListener('mousemove', (e) => {
    if (isDragging && draggedElement) {
        draggedElement.style.left = e.clientX + 'px';
        draggedElement.style.top = e.clientY + 'px';
    }
});

document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;

    isDragging = false;
    if (draggedElement) {
        draggedElement.style.display = 'none';
        // Temporarily hide the dragged element to correctly identify the element underneath
        let targetElement = document.elementFromPoint(e.clientX, e.clientY);
        document.body.removeChild(draggedElement);
        draggedElement = null;

        let targetType = null;
        let targetIndex = -1;

        // Find the target slot
        if (targetElement) {
            if (targetElement.classList.contains('activeItemDiv')) {
                targetType = 'active';
                targetIndex = Array.from(document.getElementsByClassName('activeItemDiv')).indexOf(targetElement);
            } else if (targetElement.classList.contains('inventoryItemDiv')) {
                targetType = 'inventory';
                targetIndex = Array.from(document.getElementsByClassName('inventoryItemDiv')).indexOf(targetElement);
            }
        }

        if (targetType && targetIndex !== -1) {
            // Perform the swap
            const sourceItem = draggedItemInfo.item;
            const sourceType = draggedItemInfo.type;
            const sourceIndex = draggedItemInfo.index;

            const targetItem = (targetType === 'active') ? game.activeItems[targetIndex] : game.inventoryItems[targetIndex];

            // Set source slot with target item
            if (sourceType === 'active') {
                game.activeItems[sourceIndex] = targetItem;
            } else {
                game.inventoryItems[sourceIndex] = targetItem;
            }

            // Set target slot with source item
            if (targetType === 'active') {
                game.activeItems[targetIndex] = sourceItem;
            } else {
                game.inventoryItems[targetIndex] = sourceItem;
            }

            calculateActiveEffects();
            updateItemSlots();
        }
    }
    draggedItemInfo = { type: null, index: -1, item: null };
});

function updateUnlocks() {
    // Unlock new potency buttons if the power threshold is reached
    while (game.power >= potencyButtonUnlockLevels[game.potencyButtonsUnlocked]) game.potencyButtonsUnlocked++;
    document.getElementById("potencyButtonUnlockText").innerText = "Next button unlocks at " + potencyButtonUnlockLevels[game.potencyButtonsUnlocked] + " power";
    // Unlock new towers if the power threshold is reached
    while (game.power >= towerUnlockLevels[game.towersUnlocked]) game.towersUnlocked++;
    document.getElementById("towerUnlockText").innerText = "Next tower unlocks at " + towerUnlockLevels[game.towersUnlocked] + " power";
    while (document.getElementsByClassName('towerDiv').length < game.towersUnlocked) {
        // Create a new tower div
        let towerIndex = document.getElementsByClassName('towerDiv').length;
        if (game.towerTimers[towerIndex] == -1) game.towerTimers[towerIndex] = 0;
        const newDiv = document.createElement('div');
        newDiv.className = "towerDiv";
        newDiv.onclick = () => collectTower(towerIndex+1);
        newDiv.onmouseover = () => displayTowerInfo(towerIndex);
        newDiv.onmouseout = hideTowerInfo;
        newDiv.innerHTML = "<img src='img/tower" + (towerIndex+1) + ".png' style='width: 64px' alt='Tower " + (towerIndex+1) + "'>"
        newDiv.innerHTML += "<p style='display: inline-block; vertical-align: top'><span style='font-size: 32px'>" + towerNames[towerIndex] + "</span><br><span class='towerStartText'></span></p>"
        document.getElementById("towerDivOuter").appendChild(newDiv);
        updateTowers();
    }
    // Unlock new chests if the power threshold is reached
    while (game.power >= chestUnlockLevels[game.chestsUnlocked]) game.chestsUnlocked++;
    document.getElementById("chestUnlockText").innerText = "Next chest unlocks at " + chestUnlockLevels[game.chestsUnlocked] + " power";
    while (document.getElementsByClassName('chestDiv').length < game.chestsUnlocked) {
        // Create a new chest div
        let chestIndex = document.getElementsByClassName('chestDiv').length;
        const newDiv = document.createElement('div');
        newDiv.className = "chestDiv";
        newDiv.onclick = () => {openChest(chestIndex)};
        newDiv.onmouseover = () => displayChestInfo(chestIndex);
        newDiv.onmouseout = hideChestInfo;
        newDiv.innerHTML = "<img src='img/chest" + (chestIndex+1) + ".png' style='width: 64px' alt='Chest " + (chestIndex+1) + "'>"
        newDiv.innerHTML += "<p style='display: inline-block; vertical-align: top'><span style='font-size: 32px'>" + chestNames[chestIndex] + "</span><br><span class='chestText'></span></p>"
        document.getElementById("chestDivOuter").appendChild(newDiv);
        updateChests();
    }
    //Mastery stuff
    if (game.mastery > 0) unlockMastery();
}
updateUnlocks()

function unlockMastery() {
    document.getElementById("masteryBar").style.display = "block";
    document.getElementById("masteryDiv").style.display = "block";
    document.getElementById("powerBar").style.top = "8vh";
    document.getElementById("potencyBar").style.top = "16vh";
    document.getElementById("chestInfoDiv").style.top = "24vh";
    document.getElementById("chestInfoDiv").style.height = "74vh"
    document.getElementById("towerInfoDiv").style.top = "24vh";
    document.getElementById("towerInfoDiv").style.height = "74vh"
    for (let i=0; i<4; i++) {
        document.getElementsByClassName("gameDiv")[i].style.top = "24vh";
    }
    document.getElementsByClassName("gameDiv")[0].style.height = "48vh";
    document.getElementsByClassName("gameDiv")[1].style.height = "74vh";
    document.getElementsByClassName("gameDiv")[2].style.height = "74vh";
    document.getElementsByClassName("gameDiv")[3].style.height = "56vh";
}

function updateBars() {
    // Potency bar
    potencyToNextPower = powerToPotency(game.power + 1) - powerToPotency(game.power);
    progressToNextPower = game.potency - powerToPotency(game.power);
    document.getElementById("potencyBarInner").style.width = (progressToNextPower / potencyToNextPower * 100) + "%";
    if (shiftKeyPressed) {document.getElementById("potencyBarText").innerText = "Total potency: " + format(Math.floor(game.potency))}
    else {document.getElementById("potencyBarText").innerText = "Potency: " + format(Math.floor(progressToNextPower)) + "/" + format(Math.ceil(potencyToNextPower))}
    // Power bar
    let powerToCurrentMastery = masteryToPower(game.mastery);
    let powerToNextMastery = masteryToPower(game.mastery+1);
    document.getElementById("powerBarInner").style.width = ((game.power - powerToCurrentMastery) / (powerToNextMastery - powerToCurrentMastery) * 100) + "%";
    document.getElementById("powerBarText").innerText = "Power: " + format(game.power) + "/" + format(Math.round(powerToNextMastery));
    // Mastery bar
    if (game.mastery > 0) {
        document.getElementById("masteryBarText").innerText = "Mastery: " + format(game.mastery);
    }
}
updateBars();

function updateBerries() {
    let berryText = ""
    for (let i=0; i<numberOfBerries; i++) {
        if (game.berriesDiscovered[i]) {
            berryText += `<img src='img/berry${i+1}.png'> ${capitalizeFirstLetter(berryNames[i])} berries: ${format(game.berries[i])}<br>`;
        }
    }
    document.getElementById("berryTextDiv").innerHTML = berryText;
}
updateBerries();

function updatePotencyButtons() {
    while (document.getElementsByClassName('potencyButton').length < game.potencyButtonsUnlocked) {
        const newButton = document.createElement('button');
        newButton.className = 'potencyButton';
        let buttonIndex = document.getElementsByClassName('potencyButton').length;
        newButton.onclick = () => gainPotency(buttonIndex + 1);
        document.getElementById("potencyButtonDiv").appendChild(newButton);
    }
    for (let i=0; i<game.potencyButtonsUnlocked; i++) {
        if (game.potencyCooldowns[i] > 0) {
            document.getElementsByClassName("potencyButton")[i].innerText = "Check back in " + numberToTime(game.potencyCooldowns[i])
            document.getElementsByClassName("potencyButton")[i].disabled = true;
            document.getElementsByClassName("potencyButton")[i].style.backgroundColor = "#aaa";
            document.getElementsByClassName("potencyButton")[i].style.color = "#555";
            document.getElementsByClassName("potencyButton")[i].style.border = "3px solid #555";
        }
        else {
            document.getElementsByClassName("potencyButton")[i].innerText = "Summon " + format(Math.floor(potencyButtonBaseGains[i] * game.activeEffects.incPotencyGain * 1.2 ** game.masteryUpgradesBought[2])) + " potency"
            document.getElementsByClassName("potencyButton")[i].disabled = false;
            document.getElementsByClassName("potencyButton")[i].style.backgroundColor = potencyButtonBackgroundColors[i % potencyButtonBackgroundColors.length];
            document.getElementsByClassName("potencyButton")[i].style.color = potencyButtonColors[i % potencyButtonColors.length];
            document.getElementsByClassName("potencyButton")[i].style.border = "3px solid " + potencyButtonColors[i % potencyButtonColors.length];;
        }
    }
}
updatePotencyButtons();

function updateTowers() {
    for (let i=0; i<game.towersUnlocked; i++) {
        if (!document.getElementsByClassName("towerStartText")[i]) continue; // Skip if the tower text element doesn't exist
        if (game.towerTimers[i] > 0) {
            document.getElementsByClassName("towerStartText")[i].innerText = "Check back in " + numberToTime(game.towerTimers[i]);
            document.getElementsByClassName("towerStartText")[i].style.color = "#bbb";
        }
        else {
            document.getElementsByClassName("towerStartText")[i].innerText = "Ready to collect!";
            document.getElementsByClassName("towerStartText")[i].style.color = "#bef";
        }
    }
}

function updateChests() {
    for (let i=0; i<game.chestsUnlocked; i++) {
        
        if (!document.getElementsByClassName("chestText")[i]) continue; // Skip if the tower text element doesn't exist
        document.getElementsByClassName("chestText")[i].innerText = "Costs ";
        for (let j=0; j<numberOfRarities; j++) {
            if (chestCosts[i][j] == 0) continue;
            let modifiedCost = Math.ceil(chestCosts[i][j] * game.activeEffects.decChestCost);
            document.getElementsByClassName("chestText")[i].innerHTML += "<img src='img/berry" + (j+1) + ".png'><span style='color: " + (game.berries[j] < modifiedCost ? "#f88" : "#fff") + "'>" + modifiedCost + "</span> ";
        }
    }
}

function updateItemSlots() {
    let totalActiveSlots = 2 + game.masteryUpgradesBought[0];
    let totalStorageSlots = 2 + game.masteryUpgradesBought[1];

    const activeItemCompareDiv = document.getElementById("activeItemCompareDiv");
    while (document.getElementsByClassName("activeItemDiv").length < totalActiveSlots) {
        let index = document.getElementsByClassName("activeItemDiv").length;
        const newDiv = document.createElement("div");
        newDiv.className = "activeItemDiv";
        newDiv.onmouseover = () => displayActiveTooltip(index + 1);
        newDiv.onmouseout = hideTooltip;
        document.getElementById("activeItemDivOuter").appendChild(newDiv);

        const newCompareDiv = document.createElement("div");
        newCompareDiv.className = "activeItemCompare";
        newCompareDiv.onmouseover = () => displayActiveTooltip(index + 1);
        newCompareDiv.onmouseout = hideTooltip;
        newCompareDiv.onclick = () => {setActiveItem(index + 1, game.itemGainQueue[0]); nextItemGain(); event.stopPropagation()}
        activeItemCompareDiv.appendChild(newCompareDiv);
    }

    const inventoryItemCompareDiv = document.getElementById("inventoryItemCompareDiv");
    while (document.getElementsByClassName("inventoryItemDiv").length < totalStorageSlots) {
        let index = document.getElementsByClassName("inventoryItemDiv").length;
        const newDiv = document.createElement("div");
        newDiv.className = "inventoryItemDiv";
        newDiv.onmouseover = () => displayInventoryTooltip(index + 1);
        newDiv.onmouseout = hideTooltip;
        document.getElementById("inventoryItemDivOuter").appendChild(newDiv);

        const newCompareDiv = document.createElement("div");
        newCompareDiv.className = "inventoryItemCompare";
        newCompareDiv.onmouseover = () => displayInventoryTooltip(index + 1);
        newCompareDiv.onmouseout = hideTooltip;
        newCompareDiv.onclick = () => {setInventoryItem(index + 1, game.itemGainQueue[0]); nextItemGain(); event.stopPropagation()}
        inventoryItemCompareDiv.appendChild(newCompareDiv);
    }

    const setupSlot = (slotElement, item, type, index) => {
        if (slotElement) {
            slotElement.style.backgroundImage = item ? `url('img/item${item.id}.png')` : "none";
            
            slotElement.onmousedown = (e) => {
                if (!item) return;
                e.preventDefault();

                isDragging = true;
                draggedItemInfo = { type: type, index: index, item: item };

                draggedElement = document.createElement('div');
                draggedElement.style.position = 'fixed';
                draggedElement.style.zIndex = '1000';
                draggedElement.style.left = e.clientX + 'px';
                draggedElement.style.top = e.clientY + 'px';
                draggedElement.style.width = '64px';
                draggedElement.style.height = '64px';
                draggedElement.style.imageRendering = 'pixelated';
                draggedElement.style.backgroundImage = `url('img/item${item.id}.png')`;
                draggedElement.style.backgroundSize = 'cover';
                draggedElement.style.pointerEvents = 'none'; // Make it transparent to mouse events
                draggedElement.style.transform = 'translate(-50%, -50%)'; // Center on cursor
                document.body.appendChild(draggedElement);
            };
        }
    };

    const activeItemSlots = document.getElementsByClassName("activeItemDiv");
    for (let i = 0; i < activeItemSlots.length; i++) {
        const item = game.activeItems[i];
        setupSlot(activeItemSlots[i], item, 'active', i);

        const compareSlot = document.getElementsByClassName("activeItemCompare")[i];
        if (compareSlot) {
            compareSlot.style.backgroundImage = item ? `url('img/item${item.id}.png')` : "none";
        }
    }

    const inventorySlots = document.getElementsByClassName("inventoryItemDiv");
    for (let i = 0; i < inventorySlots.length; i++) {
        const item = game.inventoryItems[i];
        setupSlot(inventorySlots[i], item, 'inventory', i);

        const inventoryCompareSlot = document.getElementsByClassName("inventoryItemCompare")[i];
        if (inventoryCompareSlot) {
            inventoryCompareSlot.style.backgroundImage = item ? `url('img/item${item.id}.png')` : "none";
        }
    }
}
updateItemSlots();

function updateVases() {
    if (game.vases > 0) {
        document.getElementById("vaseDiv").style.display = "block";
        document.getElementById("vaseText").innerText = `You have ${game.vases} vase${game.vases != 1 ? "s" : ""}, multiplying potency gain by x${(1.25 ** game.vases).toFixed(2)}`;
        for (let i=0; i<6; i++) {
            if (game.vases > i) {document.getElementsByClassName("vase")[i].style.opacity = "1";}
            else {document.getElementsByClassName("vase")[i].style.opacity = "0";}
        }
    }
    else {
        document.getElementById("vaseDiv").style.display = "none";
    }
}
updateVases();

function updateMastery() {
    document.getElementById("unspentMasteryPoints").innerText = game.unspentMasteryPoints;
    document.getElementsByClassName("masteryPointUpgrade")[0].disabled = (game.masteryUpgradesBought[0] >= maxMasteryUpgrades[0]);
    document.getElementsByClassName("masteryPointUpgrade")[0].innerHTML = "Increase active artifact slots (" + game.masteryUpgradesBought[0] + "/" + maxMasteryUpgrades[0] + ")<br>" + (game.masteryUpgradesBought[0]+2) + " -> " + (game.masteryUpgradesBought[0]+3) + "<br>Costs " + game.masteryUpgradeCosts[0] + " points";
    document.getElementsByClassName("masteryPointUpgrade")[1].disabled = (game.masteryUpgradesBought[1] >= maxMasteryUpgrades[1]);
    document.getElementsByClassName("masteryPointUpgrade")[1].innerHTML = "Increase storage slots (" + game.masteryUpgradesBought[1] + "/" + maxMasteryUpgrades[1] + ")<br>" + (game.masteryUpgradesBought[1]+2) + " -> " + (game.masteryUpgradesBought[1]+3) + "<br>Costs " + game.masteryUpgradeCosts[1] + " points";
    document.getElementsByClassName("masteryPointUpgrade")[2].innerHTML = "Increase potency gain<br>x" + toFixedFloor(1.2 ** game.masteryUpgradesBought[2], 2) + " -> x" + toFixedFloor(1.2 ** (game.masteryUpgradesBought[2]+1), 2) + "<br>Costs " + game.masteryUpgradeCosts[2] + " points";
}
updateMastery();

function cooldownUpdate() {
    let dt = Date.now() - game.lastUpdate;
    let secondsPassed = dt / 1000;
    for (let i = 0; i < game.potencyButtonsUnlocked; i++) {
        if (game.potencyCooldowns[i] > 0) {
            game.potencyCooldowns[i] = Math.max(0, game.potencyCooldowns[i] - secondsPassed);
        }
        if (game.potencyCooldowns[i] < 0) {
            game.potencyCooldowns[i] = 0;
        }
    }
    for (let i = 0; i < game.towersUnlocked; i++) {
        if (game.towerTimers[i] > 0) {
            game.towerTimers[i] = Math.max(0, game.towerTimers[i] - secondsPassed);
        }
        if (game.towerTimers[i] < 0) {
            game.towerTimers[i] = 0;
        }
    }
    game.lastUpdate = Date.now();
    updatePotencyButtons();
    updateTowers();
}
setInterval(cooldownUpdate, 100);

function gainPotency(x, visualUpdate = true) { // Starts at 1
    if (game.potencyCooldowns[x-1] > 0) return;
    game.potency += Math.floor(potencyButtonBaseGains[x-1] * game.activeEffects.incPotencyGain * 1.2 ** game.masteryUpgradesBought[2]);
    game.potencyCooldowns[x-1] = Math.ceil(potencyButtonBaseCooldowns[x-1] / game.activeEffects.decPotencyCooldowns);
    // Updating power
    game.power = potencyToPower(Math.max(Math.floor(game.potency), 0));
    if (game.power > previousPower) {
        updateUnlocks();
        previousPower = game.power;
    }

    // Updating mastery
    game.mastery = powerToMastery(Math.max(game.power, 0));
    if (game.mastery > previousMastery) {
        previousMastery = game.mastery;
        let intendedMasteryPoints = game.mastery * 10;
        let pointDifference = intendedMasteryPoints - game.totalMasteryPoints;
        game.totalMasteryPoints += pointDifference;
        game.unspentMasteryPoints += pointDifference;
        updateUnlocks();
        updateMastery();
    }

    updateBars();
    updatePotencyButtons();
}

function gainAllPotency() {
    for (let i=0; i<game.potencyButtonsUnlocked; i++) {
        if (game.potencyCooldowns[i] > 0) continue;
        gainPotency(i+1, false);
    }
    updateBars();
    updatePotencyButtons();
}

function displayTowerInfo(x) {
    document.getElementById("towerInfoDiv").style.display = "block";
    document.getElementById("towerInfoImage").src = "img/tower" + (x+1) + ".png";
    document.getElementById("towerInfoImage").alt = "Tower " + (x+1);
    document.getElementById("towerInfoTitle").innerText = towerNames[x];
    document.getElementById("towerInfo").innerText = "";
    for (let i=0; i<towerBerryGains[x].length; i++) {
        let berryIndex = towerBerryGains[x][i][0];
        let multiplier = game.activeEffects.incBerry[berryIndex - 1] || 1;
        if (multiplier < 1) multiplier = 1;

        let minBerries = Math.floor(towerBerryGains[x][i][2] * multiplier);
        let maxBerries = Math.floor(towerBerryGains[x][i][3] * multiplier);

        document.getElementById("towerInfo").innerHTML += Math.round(towerBerryGains[x][i][1] * 100) + "% chance of " + minBerries + "-" + maxBerries + " <img src='img/berry" + berryIndex + ".png'><b>" + (capitalizeFirstLetter(berryNames[berryIndex-1])) + " berries</b><br>"
    }
    document.getElementById("towerInfo").innerHTML += "<br>" + Math.min(Math.round(towerItemGains[x][0] * game.activeEffects.incTowerItemChance * 100), 100) + "% item chance<br>"
    for (let i=0; i<numberOfRarities; i++) {
        if (towerItemGains[x][i+1] == 0) continue;
        document.getElementById("towerInfo").innerHTML += "&nbsp;└ " + rarities[i] + " - " + Math.round(towerItemGains[x][i+1] * 100) + "%<br>"
    }
}

function hideTowerInfo() {
    document.getElementById("towerInfoDiv").style.display = "none";
}

function collectTower(x) { // Starts at 1
    if (game.towerTimers[x-1] > 0) return;
    // Reset time
    game.towerTimers[x-1] = Math.ceil(towerBaseWaitTimes[x-1] / game.activeEffects.decTowerWait);
    // Gaining berries
    let anyBerriesGained = false;
    let berriesGainedList = [0, 0, 0, 0, 0, 0, 0];
    for (let i=0; i<towerBerryGains[x-1].length; i++) {
        if (Math.random() > towerBerryGains[x-1][i][1]) continue;
        anyBerriesGained = true;

        let berryInfo = towerBerryGains[x-1][i];
        let berryIndex = berryInfo[0];
        let multiplier = game.activeEffects.incBerry[berryIndex - 1] || 1;
        if (multiplier < 1) multiplier = 1;

        let minBerries = Math.floor(berryInfo[2] * multiplier);
        let maxBerries = Math.floor(berryInfo[3] * multiplier);

        let berriesToGain = Math.floor(Math.random() * (maxBerries - minBerries + 1) + minBerries);
        if (berriesToGain > 0) game.berriesDiscovered[berryIndex-1] = true;
        game.berries[berryIndex-1] += berriesToGain;
        berriesGainedList[berryIndex-1] = berriesToGain;
    }
    if (anyBerriesGained) {
        game.itemGainQueue.push({type:"berries", quantities:berriesGainedList});
        displayItemGain(game.itemGainQueue[0]); 
    }
    // Gaining items
    if (Math.random() < towerItemGains[x-1][0] * game.activeEffects.incTowerItemChance) {
        let rarityProbabilities = towerItemGains[x-1].slice(1);
        let { artifact: chosenArtifact, modifier: chosenModifier } = generateArtifact(rarityProbabilities);
        if (!chosenArtifact) return; // No artifact generated

        if (!game.artifactsDiscovered[chosenArtifact.id]) {
            game.artifactsDiscovered[chosenArtifact.id] = 0;
            chosenArtifact.undiscovered = true;
        }
        game.artifactsDiscovered[chosenArtifact.id]++;
        
        // Diamond - tripled effects
        if (game.artifactsDiscovered[chosenArtifact.id] >= 50) {
            const excludedKeys = ['id', 'name', 'rarity', 'type', 'modifier', 'decPotencyCooldowns', 'decTowerWait', 'decChestCost'];
            for (const key in chosenArtifact) {
                if (typeof chosenArtifact[key] === 'number' && !excludedKeys.includes(key)) {
                    chosenArtifact[key] *= 3; // Triple the effect
                }
            }
        }
        // Gold - doubled effects
        else if (game.artifactsDiscovered[chosenArtifact.id] >= 10) {
           const excludedKeys = ['id', 'name', 'rarity', 'type', 'modifier', 'decPotencyCooldowns', 'decTowerWait', 'decChestCost'];
            for (const key in chosenArtifact) {
                if (typeof chosenArtifact[key] === 'number' && !excludedKeys.includes(key)) {
                    chosenArtifact[key] *= 2; // Double the effect
                }
            }
        }
        // Adding modifier effects
        if (chosenModifier) {
            chosenArtifact.modifier = chosenModifier.id;
            for (const key in chosenModifier) {
                if (key !== 'id' && key !== 'name' && key !== 'probWeight') {
                    if (chosenArtifact.hasOwnProperty(key)) {
                        chosenArtifact[key] += chosenModifier[key];
                    } else {
                        chosenArtifact[key] = chosenModifier[key];
                    }
                }
            }
        }

        chosenArtifact.type = "artifact";
        game.itemGainQueue.push(chosenArtifact);
        artifactDisplayNumber = 1;
        artifactDisplayIndex = 1;
    }
    if (game.itemGainQueue.length > 0) {
        displayItemGain(game.itemGainQueue[0]); 
    }
    updateTowers();
    updateChests();
    updateBerries();
}

function displayChestInfo(x) {
    document.getElementById("chestInfoDiv").style.display = "block";
    document.getElementById("chestInfoImage").src = "img/chest" + (x+1) + ".png";
    document.getElementById("chestInfoImage").alt = "Chest " + (x+1);
    document.getElementById("chestInfoTitle").innerText = chestNames[x];
    let minItems = game.chestQuantityBases[x];
    let maxItems = game.chestQuantityBases[x] + game.chestQuantityRanges[x] + (game.activeEffects.incChestItems[x] || 0);
    document.getElementById("chestInfo").innerHTML = "Gives " + minItems + "-" + maxItems + " items<br>";

    // Calculate effective probabilities after applying item effects
    let effectiveProbs = [...chestRarityProbabilities[x]];
    let totalProb = 0;
    for (let i = 0; i < effectiveProbs.length; i++) {
        // Apply the multiplier for the current rarity
        let multiplier = game.activeEffects.incRarity[i] || 1;
        if (multiplier < 1) multiplier = 1;
        effectiveProbs[i] *= multiplier;
        totalProb += effectiveProbs[i];
    }
    // Normalize probabilities so they sum to 1
    if (totalProb > 0) {
        for (let i = 0; i < effectiveProbs.length; i++) {
            effectiveProbs[i] /= totalProb;
        }
    }

    for (let i=0; i<effectiveProbs.length; i++) {
        if (chestRarityProbabilities[x][i] == 0) continue;
        document.getElementById("chestInfo").innerHTML += "<span style='color: " + rarityColors[i] + "'>" + rarities[i] + "</span> - " + toFixedFloor(effectiveProbs[i] * 100, 1) + "%<br>";
    }
}

function hideChestInfo() {
    document.getElementById("chestInfoDiv").style.display = "none";
}

function openChest(x) { // Starts at 0
    if (game.chestQuantityBases[x] <= 0) return;
    // Check if the player has enough berries to open the chest
    for (let i=0; i<numberOfRarities; i++) {
        let modifiedCost = Math.ceil(chestCosts[x][i] * game.activeEffects.decChestCost);
        if (game.berries[i] < modifiedCost) {
            return;
        }
    }
    // Deduct the cost of the chest
    for (let i=0; i<numberOfRarities; i++) {
        let modifiedCost = Math.ceil(chestCosts[x][i] * game.activeEffects.decChestCost);
        game.berries[i] -= modifiedCost;
    }
    // Determine the number of items to gain
    let modifiedRange = game.chestQuantityRanges[x] + (game.activeEffects.incChestItems[x] || 0);
    let itemCount = Math.floor(Math.random() * (modifiedRange + 1) + game.chestQuantityBases[x]);
    // Calculate effective probabilities after applying item effects
    let effectiveProbs = [...chestRarityProbabilities[x]];
    let totalProb = 0;
    for (let i = 0; i < effectiveProbs.length; i++) {
        // Apply the multiplier for the current rarity
        let multiplier = game.activeEffects.incRarity[i] || 1;
        if (multiplier < 1) multiplier = 1;
        effectiveProbs[i] *= multiplier;
        totalProb += effectiveProbs[i];
    }
    // Normalize probabilities so they sum to 1
    if (totalProb > 0) {
        for (let i = 0; i < effectiveProbs.length; i++) {
            effectiveProbs[i] /= totalProb;
        }
    }

    for (let i=0; i<itemCount; i++) {
        let { artifact: chosenArtifact, modifier: chosenModifier } = generateArtifact(effectiveProbs);
        if (!chosenArtifact) continue; // Skip if no artifact was generated

        if (!game.artifactsDiscovered[chosenArtifact.id]) {
            game.artifactsDiscovered[chosenArtifact.id] = 0;
            chosenArtifact.undiscovered = true;
        }
        game.artifactsDiscovered[chosenArtifact.id]++;

        // Diamond - tripled effects
        if (game.artifactsDiscovered[chosenArtifact.id] >= 50) {
            const excludedKeys = ['id', 'name', 'rarity', 'type', 'modifier', 'decPotencyCooldowns', 'decTowerWait', 'decChestCost'];
            for (const key in chosenArtifact) {
                if (typeof chosenArtifact[key] === 'number' && !excludedKeys.includes(key)) {
                    chosenArtifact[key] *= 3; // Triple the effect
                }
            }
        }
        // Gold - doubled effects
        else if (game.artifactsDiscovered[chosenArtifact.id] >= 10) {
           const excludedKeys = ['id', 'name', 'rarity', 'type', 'modifier', 'decPotencyCooldowns', 'decTowerWait', 'decChestCost'];
            for (const key in chosenArtifact) {
                if (typeof chosenArtifact[key] === 'number' && !excludedKeys.includes(key)) {
                    chosenArtifact[key] *= 2; // Double the effect
                }
            }
        }
        // Adding modifier effects
        if (chosenModifier) {
            chosenArtifact.modifier = chosenModifier.id;
            for (const key in chosenModifier) {
                if (key !== 'id' && key !== 'name' && key !== 'probWeight') {
                    if (chosenArtifact.hasOwnProperty(key)) {
                        chosenArtifact[key] += chosenModifier[key];
                    } else {
                        chosenArtifact[key] = chosenModifier[key];
                    }
                }
            }
        }

        chosenArtifact.type = "artifact";
        game.itemGainQueue.push(chosenArtifact);
    }
    artifactDisplayNumber = itemCount;
    artifactDisplayIndex = 1;
    // Vases (1 in 500 chance)
    if (1/Math.random() > 500 && game.vases < 6) {
        game.itemGainQueue.push({type: "vase"});
    }
    if (game.itemGainQueue.length > 0) {
        displayItemGain(game.itemGainQueue[0]);
    }
    updateChests();
    updateBerries();
}

function displayArtifactList() {
    document.getElementById("artifactListDiv").style.display = "block";
    document.getElementById("artifactList").innerHTML = "";
    let artifactRarityBuckets = [[],[],[],[],[],[],[]];
    let artifactList = "";
    // Add each artifact to its rarity bucket
    for (let i=0; i<artifacts.length; i++) {
        for (let j=0; j<numberOfRarities; j++) {
            if (rarities[j] == artifacts[i].rarity) {
                artifactRarityBuckets[j].push(artifacts[i]);
                break;
            }
        }
    }
    // Display each artifact in order of rarity
    const fragment = document.createDocumentFragment(); // Use a fragment to build the list off-DOM
    for (let i=0; i<numberOfRarities; i++) {
        let discoveredCount = 0;
        const rarityContainer = document.createElement('div');
        
        for (let j=0; j<artifactRarityBuckets[i].length; j++) {
            const artifact = artifactRarityBuckets[i][j];
            const isDiscovered = (game.artifactsDiscovered[artifact.id] > 0);
            if (isDiscovered) {
                discoveredCount++;
            }

            const iconDiv = document.createElement('div');
            iconDiv.className = 'artifactListIcon';
            iconDiv.style.border = `4px outset ${rarityColors[i]}`;

            if (isDiscovered) {
                iconDiv.style.backgroundImage = `url("img/item${artifact.id}.png")`;
                const currentArtifact = artifacts[artifact.id - 1];
                iconDiv.addEventListener('mouseover', () => displayTooltip(`${capitalizeFirstLetter(currentArtifact.name)} - ${game.artifactsDiscovered[artifact.id]} seen`, getArtifactInfo(currentArtifact)));
                iconDiv.addEventListener('mouseout', hideTooltip);
                if (game.artifactsDiscovered[artifact.id] >= 50) {
                    iconDiv.style.backgroundColor = '#9ee'; // Diamond background
                }
                else if (game.artifactsDiscovered[artifact.id] >= 10) {
                    iconDiv.style.backgroundColor = '#fd0'; // Gold background
                }
                else {
                    iconDiv.style.backgroundColor = '#777'; // Normal background
                }
            } else {
                iconDiv.style.backgroundColor = '#222';
            }
            rarityContainer.appendChild(iconDiv);
        }

        const header = document.createElement('p');
        header.innerHTML = `${capitalizeFirstLetter(rarities[i])}<br>${discoveredCount}/${artifactRarityBuckets[i].length} discovered`;
        
        fragment.appendChild(header);
        fragment.appendChild(rarityContainer);
        fragment.appendChild(document.createElement('br'));
    }   
    document.getElementById("artifactList").appendChild(fragment); // Append the fragment to the DOM once
}

function hideArtifactList() {
    document.getElementById("artifactListDiv").style.display = "none";
}

function generateArtifact(rarityProbabilties) {
    let artifactRarityBuckets = [[],[],[],[],[],[],[]];
    // Add each artifact to its rarity bucket
    for (let i=0; i<artifacts.length; i++) {
        for (let j=0; j<numberOfRarities; j++) {
            if (rarities[j] == artifacts[i].rarity) {
                artifactRarityBuckets[j].push(artifacts[i]);
                break;
            }
        }
    }
    // Pick a random rarity based on the probabilities
    let randomValue = Math.random();
    let cumulativeProbability = 0;
    let selectedRarity = -1;
    for (let i=0; i<rarityProbabilties.length; i++) {
        cumulativeProbability += rarityProbabilties[i];
        if (randomValue < cumulativeProbability) {
            selectedRarity = i;
            break;
        }
    }
    let randomIndex;
    // Pick a random artifact from the selected rarity bucket
    if (selectedRarity === -1 || artifactRarityBuckets[selectedRarity].length === 0) {
        console.error("No artifacts available for rarity " + selectedRarity);
        return { artifact: null, modifier: null };
    } else {
        randomIndex = Math.floor(Math.random() * artifactRarityBuckets[selectedRarity].length);
    }
    
    let artifact = {...artifactRarityBuckets[selectedRarity][randomIndex]};
    if (game.rarityAutoDiscard[rarities.indexOf(artifact.rarity)] == true) {
        artifact = null;
    }
    let chosenModifier = null;

    // 20% chance to get a modifier
    if (Math.random() <= 0.2) {
        let totalModifierWeight = modifiers.reduce((sum, mod) => sum + mod.probWeight, 0);
        let randomWeight = Math.random() * totalModifierWeight;

        for (const modifier of modifiers) {
            randomWeight -= modifier.probWeight;
            if (randomWeight <= 0) {
                chosenModifier = modifier;
                break;
            }
        }
    }
    
    return { artifact: artifact, modifier: chosenModifier };
}

function displayItemGain(item) {
    document.getElementById("itemGainOverlay").style.display = "block";
    if (item.type == "berries") {
        document.getElementById("itemGainText").innerText = "You got berries!";
        let berryList = ""
        for (let i=0; i<numberOfBerries; i++) {
            if (item.quantities[i] == 0) continue;
            berryList += item.quantities[i] + " <img src='img/berry" + (i+1) + ".png'> " + capitalizeFirstLetter(berryNames[i]) + " berries<br>";
        }
        berryList += "<br><span style='color: #999'>Click anywhere to continue</span>"
        document.getElementById("itemGainSubtext").innerHTML = berryList;
        document.getElementById("itemGainSubtext2").innerText = "";
        document.getElementById("itemGainSubtext3").innerText = "";
        document.getElementById("itemGainIcon").style.display = "none";
        document.getElementById("activeItemCompareDiv").style.display = "none";
        document.getElementById("inventoryItemCompareDiv").style.display = "none";
        document.getElementById("discardItemButton").style.display = "none";
    }
    else if (item.type == "artifact") {
        document.getElementById("itemGainText").innerText = "You got an artifact! (" + artifactDisplayIndex + "/" + artifactDisplayNumber + ")";
        if (item.modifier) {
            document.getElementById("itemGainSubtext").innerHTML = "<span style='color: #ff8'>" + capitalizeFirstLetter(modifiers[item.modifier-1].name) + "</span> " + item.name + "<br><span style='color: " + rarityColors[rarities.indexOf(item.rarity)] + "'>" + capitalizeFirstLetter(item.rarity) + "</span>";
        }
        else {
            document.getElementById("itemGainSubtext").innerHTML = capitalizeFirstLetter(item.name) + "<br><span style='color: " + rarityColors[rarities.indexOf(item.rarity)] + "'>" + capitalizeFirstLetter(item.rarity) + "</span>";
        }
        if (item.undiscovered) {
            document.getElementById("itemGainSubtext").innerHTML += " - <span style='color: #8ff'>first discovery!</span>";
        }
        else {
            document.getElementById("itemGainSubtext").innerHTML += " - seen " + game.artifactsDiscovered[item.id] + " times";
        }
        document.getElementById("itemGainIcon").style.display = "block";
        document.getElementById("itemGainIcon").style.backgroundImage = "url('img/item" + item.id + ".png')";
        document.getElementById("itemGainIcon").style.border = "6px outset " + rarityColors[rarities.indexOf(item.rarity)];
        document.getElementById("itemGainSubtext2").innerHTML = getArtifactInfo(item);
        document.getElementById("itemGainSubtext3").innerText = "Select an item slot to set/replace:";
        document.getElementById("activeItemCompareDiv").style.display = "block";
        document.getElementById("inventoryItemCompareDiv").style.display = "block";
        document.getElementById("discardItemButton").style.display = "block";
    }
    else if (item.type == "vase") {
        game.vases++;
        updateVases();
        calculateActiveEffects();
        document.getElementById("itemGainText").innerText = "You got a super rare vase!";
        document.getElementById("itemGainSubtext").innerHTML = "<img src='img/vase" + game.vases + ".png' style='width: 128px'>";
        document.getElementById("itemGainSubtext2").innerText = "";
        document.getElementById("itemGainSubtext3").innerText = "";
        document.getElementById("itemGainIcon").style.display = "none";
        document.getElementById("activeItemCompareDiv").style.display = "none";
        document.getElementById("inventoryItemCompareDiv").style.display = "none";
        document.getElementById("discardItemButton").style.display = "none";
    }
}

function nextQueueItem() {
    if (game.itemGainQueue[0].type == "artifact") return;
    game.itemGainQueue.shift();
    if (game.itemGainQueue.length > 0) displayItemGain(game.itemGainQueue[0]);
    else {document.getElementById("itemGainOverlay").style.display = "none";}
}

function nextItemGain() {
    if (game.itemGainQueue[0].type == "artifact") artifactDisplayIndex++;
    game.itemGainQueue.shift();
    if (game.itemGainQueue.length > 0) displayItemGain(game.itemGainQueue[0]);
    else {document.getElementById("itemGainOverlay").style.display = "none";}
}



function getArtifactInfo(x) {
    let infoText = "";
    // Maps property keys to description-generating functions
    const descriptions = {
        incPotencyGain: v => `Increases <span style='color: #a4f'>potency gain</span> by ${(v * 100).toFixed(1)}%<br>`,
        decPotencyGain: v => `<span style='color: #f88'>Decreases potency gain</span> by ${(v * 100).toFixed(1)}%<br>`,
        decPotencyCooldowns: v => `Decreases <span style='color: #c8f'>potency cooldowns</span> by ${(v * 100).toFixed(1)}%<br>`,
        incPotencyCooldowns: v => `<span style='color: #f88'>Increases potency cooldowns</span> by ${(v * 100).toFixed(1)}%<br>`,
        incTowerItemChance: v => `Increases <span style='color: #4af'>tower item chance</span> by ${(v * 100).toFixed(1)}%<br>`,
        decTowerWait: v => `Decreases <span style='color: #8cf'>tower times</span> by ${(v * 100).toFixed(1)}%<br>`,
        decChestCost: v => `Decreases <span style='color: #8f8'>chest costs</span> by ${(v * 100).toFixed(1)}%<br>`,
    };

    for (const key in descriptions) {
        if (x[key]) infoText += descriptions[key](x[key]);
    }

    for (let i = 0; i < numberOfChests; i++) {
        if (x[`incChest${i + 1}Items`]) infoText += `Increases ${chestNames[i]} max items by ${x[`incChest${i + 1}Items`]}<br>`;
    }

    for (let i = 0; i < numberOfRarities; i++) {
        if (x[`incRarity${i + 1}`]) {
            infoText += `Increases <span style='color: ${rarityColors[i]}'>${rarities[i]}</span> item chance by ${(x[`incRarity${i + 1}`] * 100).toFixed(1)}%<br>`;
        }
    }

    for (let i = 0; i < numberOfBerries; i++) {
        if (x[`incBerry${i + 1}`]) {
            infoText += `Increases <img src='img/berry${i+1}.png'> ${berryNames[i]} berry gain by ${(x[`incBerry${i + 1}`] * 100).toFixed(1)}%<br>`;
        }
    }

    return infoText;
}

function setActiveItem(slot, item) {
    // Sets the active item to the specified item in the specified slot
    game.activeItems[slot-1] = item;
    calculateActiveEffects();
    updateItemSlots();
}
function removeActiveItem(slot) {
    // Removes the active item in the specified slot
    game.activeItems[slot-1] = null;
    calculateActiveEffects();
    updateItemSlots();
}

function setInventoryItem(slot, item) {
    // Sets the inventory item to the specified item in the specified slot
    game.inventoryItems[slot-1] = item;
    updateItemSlots();
}
function removeInventoryItem(slot) {
    // Removes the inventory item in the specified slot
    game.inventoryItems[slot-1] = null;
    updateItemSlots();
}

function calculateActiveEffects() {
    // Reset bonuses to their default values
    game.activeEffects = {
        incPotencyGain: 1,
        decPotencyCooldowns: 1,
        incTowerItemChance: 1,
        decTowerWait: 1,
        decChestCost: 1,
        incChestItems: [],
        incRarity: [],
        incBerry: [],
    };

    game.activeEffects.incPotencyGain *= 1.25 ** game.vases; // Vases

    // Apply bonuses from active items
    for (const item of game.activeItems) {
        if (!item) continue;
        if (item.incPotencyGain) game.activeEffects.incPotencyGain *= (1 + item.incPotencyGain);
        if (item.decPotencyGain) game.activeEffects.incPotencyGain /= (1 + item.decPotencyGain);
        if (item.decPotencyCooldowns) game.activeEffects.decPotencyCooldowns *= (1 + item.decPotencyCooldowns);
        if (item.incPotencyCooldowns) game.activeEffects.decPotencyCooldowns /= (1 + item.incPotencyCooldowns);
        if (item.incTowerItemChance) game.activeEffects.incTowerItemChance *= (1 + item.incTowerItemChance);
        if (item.decTowerWait) game.activeEffects.decTowerWait *= (1 + item.decTowerWait);
        if (item.decChestCost) game.activeEffects.decChestCost *= (1 - item.decChestCost);
        for (let i = 0; i < numberOfChests; i++) {
            if (item[`incChest${i + 1}Items`]) {
                if (!game.activeEffects.incChestItems[i]) game.activeEffects.incChestItems[i] = 0;
                game.activeEffects.incChestItems[i] += item[`incChest${i + 1}Items`];
            }
        }
        for (let i = 0; i < numberOfRarities; i++) {
            if (item[`incRarity${i + 1}`]) {
                if (!game.activeEffects.incRarity[i]) game.activeEffects.incRarity[i] = 1;
                game.activeEffects.incRarity[i] *= (1 + item[`incRarity${i + 1}`]);
            }
        }
        for (let i = 0; i < numberOfBerries; i++) {
            if (item[`incBerry${i + 1}`]) {
                if (!game.activeEffects.incBerry[i]) game.activeEffects.incBerry[i] = 1;
                game.activeEffects.incBerry[i] *= (1 + item[`incBerry${i + 1}`]);
            }
        }
    }

    updateChests();
    updatePotencyButtons();
    updateTowers();
}

let tooltipDisplayed = false;
function displayTooltip(title, text) {
    // Don't display tooltip if item is being dragged
    if (isDragging) return;
    document.getElementById("itemTooltip").style.display = "block";
    document.getElementById("itemTooltipTitle").innerHTML = title;
    document.getElementById("itemTooltipText").innerHTML = text;
    tooltipDisplayed = true;
}

function hideTooltip() {
    document.getElementById("itemTooltip").style.display = "none";
    tooltipDisplayed = false;

}

// Event listeners for tooltips
document.addEventListener('mousemove', function(e) {
    let tooltip = document.getElementById("itemTooltip");
    if (tooltipDisplayed) {
        tooltip.style.left = (e.clientX + 5) + 'px';
        tooltip.style.top = (e.clientY + 5) + 'px';
    }
});

function displayActiveTooltip(slot) {
    let item = game.activeItems[slot-1];
    if (item) {
        if (item.modifier) {
            displayTooltip(capitalizeFirstLetter(modifiers[item.modifier-1].name) + " " + item.name + " (<span style='color: " + rarityColors[rarities.indexOf(item.rarity)] + "'>" + item.rarity + "</span>)", getArtifactInfo(item));
        }
        else {
            displayTooltip(capitalizeFirstLetter(item.name) + " (<span style='color: " + rarityColors[rarities.indexOf(item.rarity)] + "'>" + item.rarity + "</span>)", getArtifactInfo(item));
        }
    }
    else {displayTooltip("", "No item");}
}

function displayInventoryTooltip(slot) {
    let item = game.inventoryItems[slot-1];
    if (item) {
        if (item.modifier) {
            displayTooltip(capitalizeFirstLetter(modifiers[item.modifier-1].name) + " " + item.name + " (<span style='color: " + rarityColors[rarities.indexOf(item.rarity)] + "'>" + item.rarity + "</span>)", getArtifactInfo(item));
        }
        else {
            displayTooltip(capitalizeFirstLetter(item.name) + " (<span style='color: " + rarityColors[rarities.indexOf(item.rarity)] + "'>" + item.rarity + "</span>)", getArtifactInfo(item));
        }
    }
    else {displayTooltip("", "No item");}
}

// Mastery upgrades
function buyMasteryUpgrade(x) { // Starts at 1
    if (x <= 2 && game.masteryUpgradesBought[x-1] >= maxMasteryUpgrades[x-1]) return;
    if (game.unspentMasteryPoints >= game.masteryUpgradeCosts[x-1]) {
        game.unspentMasteryPoints -= game.masteryUpgradeCosts[x-1];
        game.masteryUpgradesBought[x-1]++;
        if (x==1) {game.masteryUpgradeCosts[x-1] = Math.floor(1.5 ** game.masteryUpgradesBought[x-1] * 10);}
        else if (x==2) {game.masteryUpgradeCosts[x-1] = Math.floor(1.5 ** game.masteryUpgradesBought[x-1] * 4);}
        else {game.masteryUpgradeCosts[x-1] = Math.floor(1.5 ** game.masteryUpgradesBought[x-1] * 6);}
        updateItemSlots();
        updateMastery();
    }
}

// Helper functions
function format(num) {
    if (num >= 1000000000) {return num.toExponential(2);}
    else if (num >= 10000) {return num.toLocaleString('en-US');}
    else {return num.toString();}
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function toFixedFloor(x, precision) {
    return (Math.floor(x * 10 ** precision + 1e-8) / 10 ** precision).toFixed(precision);
}
function potencyToPower(x) {return Math.floor((x / 50) ** 0.6)}
function powerToPotency(x) {return x ** (1/0.6) * 50}
function powerToMastery(x) {return Math.floor(x / 50)}
function masteryToPower(x) {return x * 50}
function numberToTime(x) {
    if (x <= 0) return "0s";
    xCeil = Math.ceil(x);
    result = "";
    if (xCeil>=7200) result += Math.floor(xCeil/3600) + "h ";
    else if (xCeil>=3600) result += Math.floor(xCeil/3600) + "h ";
    if (Math.floor(xCeil/60)%60 == 1) result += (Math.floor(xCeil/60)%60) + "m ";
    else if (Math.floor(xCeil/60)%60 != 0) result += (Math.floor(xCeil/60)%60) + "m ";
    if (xCeil%60 == 1) result += Math.floor(xCeil%60) + "s ";
    else if (xCeil%60 != 0) result += Math.floor(xCeil%60) + "s ";
    return result;
}