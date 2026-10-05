const potencyButtonUnlockLevels = [0, 0, 1, 5, 10, 30, 75, 150, 275, Infinity];
const potencyButtonBaseGains = [10, 30, 75, 150, 500, 1000, 2000, 5000, 10000];
const potencyButtonBaseCooldowns = [30, 180, 600, 1800, 7200, 14400, 28800, 64800, 129600]; // Cooldowns in seconds
const potencyButtonBackgroundColors = ["#daabf0", "#bdabf0", "#abacf0", "#abc1f0", "#abe0f0", "#abc1f0", "#bdabf0", "#c5abf0"]
const potencyButtonColors = ["#4f1ca1", "#341ca1", "#1c25a1", "#1c3fa1", "#1c51a1", "#1c3fa1", "#1c25a1", "#341ca1"]

const towerNames = ["Verdant Tower", "Bog Tower", "Dust Tower", "Brimstone tower", "Obsidian tower", "Midas tower", "Aether tower"];
const towerUnlockLevels = [2, 6, 12, 20, 60, 120, 220, Infinity];
const towerBaseWaitTimes = [300, 1200, 2400, 4800, 10800, 18000, 28800];
const towerBerryGains = [
    // Each tower has arrays for each berry of the format [berry no. (starts at 1), probability, min, max]
    [ // Verdant tower
        [1, 1, 2, 5],
        [2, 0.5, 1, 4],
        [3, 0.08, 1, 2]
    ],
    [ // Bog tower
        [1, 1, 2, 4],
        [2, 1, 1, 5],
        [3, 0.2, 1, 3],
        [4, 0.04, 1, 1],
    ],
    [ // Dust tower
        [1, 0.5, 1, 3],
        [2, 1, 3, 7],
        [3, 0.5, 1, 4],
        [4, 0.15, 1, 2],
    ],
    [ // Brimstone tower
        [2, 1, 2, 5],
        [3, 1, 2, 5],
        [4, 0.4, 1, 4],
        [5, 0.1, 1, 2],
    ],
    [ // Obsidian tower
        [2, 0.6, 1, 4],
        [3, 1, 2, 7],
        [4, 0.65, 1, 5],
        [5, 0.2, 1, 2],
        [6, 0.05, 1, 1],
    ],
    [ // Midas tower
        [3, 1, 1, 5],
        [4, 1, 2, 6],
        [5, 0.45, 1, 4],
        [6, 0.15, 1, 2],
        [7, 0.05, 1, 1],
    ],
    [ // Aether tower
        [4, 0.8, 1, 4],
        [5, 1, 2, 7],
        [6, 0.6, 1, 5],
        [7, 0.2, 1, 3],
    ]
];
const towerItemGains = [
    // Each tower has [item probability, common probability, uncommon probability, ...]
    // All rarity probabilities must add up to 1
    [0.15, 0.7, 0.25, 0.05, 0, 0, 0, 0], // Verdant tower
    [0.2, 0.3, 0.5, 0.18, 0.02, 0, 0, 0], // Bog tower
    [0.25, 0.2, 0.4, 0.3, 0.09, 0.01, 0, 0], // Dust tower
    [0.25, 0.1, 0.25, 0.42, 0.15, 0.08, 0, 0], // Brimstone tower
    [0.25, 0, 0.18, 0.45, 0.24, 0.1, 0.03, 0], // Obsidian tower
    [0.25, 0, 0.06, 0.4, 0.32, 0.16, 0.05, 0.01], // Midas tower
    [0.25, 0, 0, 0.26, 0.45, 0.2, 0.08, 0.01], // Aether tower
];

const numberOfChests = 6;
const chestNames = ["Bronze chest", "Silver chest", "Gold chest", "Jade chest", "Void chest", "Adamantium chest"]
const chestUnlockLevels = [3, 8, 15, 40, 85, 175, Infinity];
const chestCosts = [
    [10, 2, 0, 0, 0, 0, 0], // Bronze chest
    [5, 10, 2, 0, 0, 0, 0], // Silver chest
    [0, 5, 10, 2, 0, 0, 0], // Gold chest
    [0, 0, 5, 10, 2, 0, 0], // Jade chest
    [0, 0, 0, 5, 10, 2, 0], // Void chest
    [0, 0, 0, 0, 5, 10, 2], // Adamantium chest
]
const chestRarityProbabilities = [
    // All rarity probabilities must add up to 1
    [0.75, 0.2, 0.04, 0.01, 0, 0, 0], //Bronze chest
    [0.42, 0.35, 0.15, 0.06, 0.015, 0.005, 0], //Silver chest
    [0.15, 0.4, 0.27, 0.14, 0.03, 0.01, 0], //Gold chest
    [0.08, 0.25, 0.35, 0.26, 0.045, 0.015, 0], //Jade chest
    [0, 0.15, 0.35, 0.4, 0.07, 0.025, 0.005], //Void chest
    [0, 0.1, 0.3, 0.43, 0.12, 0.04, 0.01], //Adamantium chest
]

const numberOfBerries = 7;
const berryNames = ["green", "blue", "red", "yellow", "purple", "silver", "pearlescent"];

const numberOfRarities = 7;
const rarities = ["common", "uncommon", "rare", "very rare", "legendary", "mythical", "phantasmagoria"];
const rarityColors = ["#bbb", "#5c5", "#44f", "#80f", "#fb0", "#f00", "#4ff"];
const artifacts = [
    //incPotencyGain, decPotencyCooldowns, incTowerItemChance, decTowerWait, decChestCost
    //incChest1Items, incChest2Items, etc.
    //incBerry1, incBerry2, etc.
    //incRarity1, incRarity2, etc.
    {id: 1, name: "old scroll", rarity: "common", incPotencyGain: 0.06},
    {id: 2, name: "mystical scroll", rarity: "uncommon", incPotencyGain: 0.16, decPotencyCooldowns: 0.025},
    {id: 3, name: "jade scroll", rarity: "rare", incPotencyGain: 0.25, decPotencyCooldowns: 0.06},
    {id: 4, name: "chain", rarity: "common", incPotencyGain: 0.06, incRarity2: 0.1},
    {id: 5, name: "torch", rarity: "common", incRarity1: 0.2, incRarity2: 0.16},
    {id: 6, name: "lantern", rarity: "uncommon", incRarity2: 0.16, incRarity3: 0.24},
    {id: 7, name: "frost lantern", rarity: "rare", incRarity3: 0.2, incRarity4: 0.3},
    {id: 8, name: "hellfire lantern", rarity: "very rare", incRarity4: 0.3, incRarity5: 0.24, incRarity6: 0.08},
    {id: 9, name: "shovel", rarity: "common", incPotencyGain: 0.04, incBerry1: 0.2},
    {id: 10, name: "pickaxe", rarity: "uncommon", incPotencyGain: 0.12, incBerry1: 0.4, incBerry2: 0.1},
    {id: 11, name: "thick gloves", rarity: "uncommon", decPotencyCooldowns: 0.06, incBerry3: 0.2},
    {id: 12, name: "gauntlets", rarity: "rare", decPotencyCooldowns: 0.12, incBerry4: 0.15},
    {id: 13, name: "royal gauntlets", rarity: "very rare", decPotencyCooldowns: 0.2, incBerry4: 0.25, incBerry5: 0.15},
    {id: 14, name: "seashell", rarity: "common", decPotencyCooldowns: 0.05},
    {id: 15, name: "nautilus shell", rarity: "uncommon", decPotencyCooldowns: 0.14, decTowerWait: 0.07},
    {id: 16, name: "arrowhead", rarity: "common", decTowerWait: 0.05},
    {id: 17, name: "small bell", rarity: "common", decTowerWait: 0.035, incRarity3: 0.08},
    {id: 18, name: "lucky button", rarity: "common", incBerry1: 0.4, incRarity1: 0.4},
    {id: 19, name: "lucky horseshoe", rarity: "uncommon", incBerry2: 0.3, incRarity2: 0.3},
    {id: 20, name: "lucky coin", rarity: "rare", incBerry3: 0.3, incRarity3: 0.3},
    {id: 21, name: "dragon scale", rarity: "rare", decTowerWait: 0.05, incBerry3: 0.1, incBerry4: 0.1},
    {id: 22, name: "bronze ring", rarity: "common", decPotencyCooldowns: 0.03, decTowerWait: 0.03},
    {id: 23, name: "silver ring", rarity: "uncommon", decTowerWait: 0.06, decChestCost: 0.1},
    {id: 24, name: "gold ring", rarity: "rare", decTowerWait: 0.1, decChestCost: 0.2},
    {id: 25, name: "jade ring", rarity: "very rare", decTowerWait: 0.16, decChestCost: 0.3, incBerry2: 0.4},
    {id: 26, name: "skull ring", rarity: "rare", decPotencyCooldowns: 0.1, decChestCost: 0.15},
    {id: 27, name: "golden skull ring", rarity: "legendary", decPotencyCooldowns: 0.28, decChestCost: 0.4, incBerry3: 0.4},
    {id: 28, name: "jade skull ring", rarity: "mythical", decPotencyCooldowns: 0.4, decChestCost: 0.5, incBerry4: 0.5},
    {id: 29, name: "fire ring", rarity: "rare", decTowerWait: 0.1, incBerry3: 0.3},
    {id: 30, name: "arcane ring", rarity: "very rare", decTowerWait: 0.12, incBerry5: 0.16},
    {id: 31, name: "toxic ring", rarity: "very rare", decTowerWait: 0.12, incBerry1: 0.5},
    {id: 32, name: "emerald pendant", rarity: "uncommon", incBerry1: 0.5},
    {id: 33, name: "sapphire pendant", rarity: "rare", incBerry2: 0.5},
    {id: 34, name: "ruby pendant", rarity: "rare", incBerry3: 0.5},
    {id: 35, name: "topaz pendant", rarity: "very rare", incBerry4: 0.5},
    {id: 36, name: "amethyst pendant", rarity: "very rare", incBerry5: 0.5},
    {id: 37, name: "diamond pendant", rarity: "legendary", incBerry6: 0.5},
    {id: 38, name: "opal pendant", rarity: "legendary", incBerry7: 0.5},
    {id: 39, name: "bomb", rarity: "uncommon", incPotencyGain: 0.1, incChest1Items: 1},
    {id: 40, name: "golden bomb", rarity: "legendary", incPotencyGain: 0.35, incChest1Items: 2, incChest2Items: 1},
    {id: 41, name: "claw", rarity: "common", incRarity3: 0.08, incRarity4: 0.08},
    {id: 42, name: "spyglass", rarity: "common", decTowerWait: 0.03, incBerry2: 0.1},
    {id: 43, name: "satchel", rarity: "uncommon", incTowerItemChance: 0.15},
    {id: 44, name: "bag of holding", rarity: "very rare", incTowerItemChance: 0.4},
    {id: 45, name: "skeleton key", rarity: "rare", decTowerWait: 0.15},
    {id: 46, name: "marble", rarity: "common", incBerry1: 0.12, incTowerItemChance: 0.06},
    {id: 47, name: "ankh", rarity: "very rare", incPotencyGain: 0.3, incRarity4: 0.24, incRarity6: 0.04},
    {id: 48, name: "lucky clover", rarity: "very rare", incBerry4: 0.3, incRarity4: 0.3},
    {id: 49, name: "tusk", rarity: "common", incRarity3: 0.16},
    {id: 50, name: "dice", rarity: "uncommon", incRarity6: 0.12},
    {id: 51, name: "hourglass", rarity: "uncommon", decPotencyCooldowns: 0.08, decTowerWait: 0.1},
    {id: 52, name: "magic orb", rarity: "uncommon", incChest1Items: 1},
    {id: 53, name: "power orb", rarity: "rare", incChest1Items: 1, incChest2Items: 1},
    {id: 54, name: "D20", rarity: "mythical", incRarity6: 0.5, incBerry6: 0.3},
    {id: 55, name: "prism", rarity: "mythical", incPotencyGain: 0.5, decChestCost: 0.2, incBerry3: 0.2},
    {id: 56, name: "golden skull", rarity: "legendary", decTowerWait: 0.25, incChest2Items: 1, incChest3Items: 1},
    {id: 57, name: "cataclysm orb", rarity: "legendary", incChest1Items: 2, incChest2Items: 2, incChest3Items: 1},
    {id: 58, name: "fossil", rarity: "common", incPotencyGain: 0.05, incRarity3: 0.15},
    {id: 59, name: "fish fossil", rarity: "uncommon", incPotencyGain: 0.08, incRarity3: 0.2, incRarity4: 0.15},
    {id: 60, name: "acorn", rarity: "common", decPotencyCooldowns: 0.04, incBerry1: 0.2},
    {id: 61, name: "golden chalice", rarity: "legendary", decPotencyCooldowns: 0.25, decTowerWait: 0.25, incBerry4: 0.3},
    {id: 62, name: "chalice of the void", rarity: "mythical", decPotencyCooldowns: 0.35, decTowerWait: 0.35, incBerry4: 0.5, incBerry5: 0.3},
    {id: 63, name: "holy water", rarity: "very rare", incPotencyGain: 0.25, incChest4Items: 1},
    {id: 64, name: "andromedan epitaph", rarity: "mythical", incChest4Items: 2, incChest5Items: 1, incBerry5: 0.3},
    {id: 65, name: "ice staff", rarity: "legendary", decPotencyCooldowns: 0.4},
    {id: 66, name: "leaf staff", rarity: "legendary", decTowerWait: 0.4},
    {id: 67, name: "fire staff", rarity: "legendary", incPotencyGain: 0.45},
    {id: 68, name: "immortal heart", rarity: "mythical", decTowerWait: 0.55, decChestCost: 0.3, incChest3Items: 1},
    {id: 69, name: "corrupted crown", rarity: "mythical", decPotencyCooldowns: 0.45, incTowerItemChance: 0.6, incBerry5: 0.3, incBerry6: 0.3},
    {id: 70, name: "judgement beetle one", rarity: "phantasmagoria", incPotencyGain: 1, decPotencyCooldowns: 0.7},
    {id: 71, name: "judgement beetle two", rarity: "phantasmagoria", decTowerWait: 0.7, incTowerItemChance: 1.2},
    {id: 72, name: "judgement beetle three", rarity: "phantasmagoria", decChestCost: 0.5, incChest4Items: 2, incChest5Items: 2, incRarity5: 1},
    {id: 73, name: "judgement beetle four", rarity: "phantasmagoria", incBerry4: 0.8, incBerry5: 0.6, incBerry6: 0.5, incBerry7: 0.4},
];
const modifiers = [
    // Adds decPotencyGain, incPotencyCooldowns
    {id: 1, name: "damaged", probWeight: 20, decPotencyGain: 0.05},
    {id: 2, name: "pristine", probWeight: 20, incPotencyGain: 0.05},
    {id: 3, name: "glowing", probWeight: 10, incPotencyGain: 0.06, incTowerItemChance: 0.1},
    {id: 4, name: "earthen", probWeight: 8, incPotencyGain: 0.08, incBerry1: 0.2, incBerry2: 0.2},
    {id: 5, name: "charged", probWeight: 6, incChest1Items: 2, incChest2Items: 1},
    {id: 6, name: "eldritch", probWeight: 10, decPotencyCooldowns: 0.12, decTowerWait: 0.1},
    {id: 7, name: "ghostly", probWeight: 10, decTowerWait: 0.05, incRarity3: 0.15},
    {id: 8, name: "demonic", probWeight: 7, incPotencyGain: 0.3, incPotencyCooldowns: 0.15},
    {id: 9, name: "angelic", probWeight: 7, decPotencyGain: 0.15, decPotencyCooldowns: 0.3},
    {id: 10, name: "prismatic", probWeight: 8, incRarity2: 0.2, incRarity4: 0.1, incRarity6: 0.03},
    {id: 11, name: "voidborn", probWeight: 6, decPotencyGain: 0.3, incRarity3: 0.5, incRarity5: 0.3},
    {id: 12, name: "elite", probWeight: 4, incPotencyGain: 0.2, incTowerItemChance: 0.1, incChest2Items: 1},
    {id: 13, name: "godly", probWeight: 2, incPotencyGain: 0.35, incTowerItemChance: 0.2, incChest3Items: 1},
    // Berry-related
    {id: 14, name: "emerald", probWeight: 10, incBerry1: 0.25},
    {id: 15, name: "sapphire", probWeight: 8, incBerry2: 0.25},
    {id: 16, name: "ruby", probWeight: 6.5, incBerry3: 0.25},
    {id: 17, name: "topaz", probWeight: 5, incBerry4: 0.25},
    {id: 18, name: "amethyst", probWeight: 4, incBerry5: 0.25},
    {id: 19, name: "diamond", probWeight: 3, incBerry6: 0.25},
    {id: 20, name: "opal", probWeight: 2, incBerry7: 0.25},
];

const maxMasteryUpgrades = [4,4];