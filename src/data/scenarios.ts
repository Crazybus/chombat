export const scenarios = {
    "champi_vs_scouts": {
        "name": "Champi Scout vs FU Feudal Scouts",
        "a": {
            "nm": "Champi Scout",
            "c": "11",
            "age": "1",
            "h": "35",
            "am": "4",
            "aa": "0",
            "ar": "2",
            "rl": "2",
            "af": "45",
            "ag": "25",
            "tl": [
                {
                    "t": "villagers",
                    "n": "Villager",
                    "d": "25",
                    "c": "12",
                    "co": "50",
                    "b": true,
                    "v": "12"
                },
                {
                    "t": "building",
                    "n": "Barracks",
                    "d": "50",
                    "c": "1",
                    "co": "175",
                    "v": "1",
                    "i": "barracks"
                },
                {
                    "t": "production",
                    "n": "Champis",
                    "d": "0",
                    "c": "1",
                    "co": "0",
                    "b": true,
                    "v": "1",
                    "tr": "30"
                }
            ]
        },
        "b": {
            "nm": "Scout Cavalry",
            "c": "5",
            "age": "2",
            "h": "45",
            "am": "5",
            "ar": "2",
            "rl": "2",
            "af": "80",
            "aw": "0",
            "tl": [
                {
                    "t": "villagers",
                    "n": "Villager",
                    "d": "25",
                    "c": "18",
                    "co": "50",
                    "b": true,
                    "v": "0"
                },
                {
                    "t": "building",
                    "n": "Barracks",
                    "d": "50",
                    "c": "1",
                    "co": "175",
                    "v": "1",
                    "i": "barracks"
                },
                {
                    "t": "tech",
                    "n": "Feudal Age",
                    "d": "130",
                    "c": "1",
                    "co": "500",
                    "b": true,
                    "v": "0",
                    "i": "101",
                    "bt": "109"
                },
                {
                    "t": "building",
                    "n": "Stable",
                    "d": "50",
                    "c": "1",
                    "co": "175",
                    "b": true,
                    "v": "1",
                    "i": "stable"
                },
                {
                    "t": "production",
                    "n": "Scouts",
                    "d": "0",
                    "c": "1",
                    "co": "0",
                    "v": "1",
                    "tr": "30"
                },
                {
                    "t": "building",
                    "n": "Blacksmith",
                    "d": "50",
                    "c": "1",
                    "co": "150",
                    "v": "1",
                    "i": "blacksmith"
                },
                {
                    "t": "tech",
                    "n": "Forging",
                    "d": "50",
                    "c": "1",
                    "co": "150",
                    "v": "0",
                    "i": "67",
                    "bt": "103"
                },
                {
                    "t": "tech",
                    "n": "Scale Barding Armor",
                    "d": "45",
                    "c": "1",
                    "co": "150",
                    "v": "0",
                    "i": "81",
                    "bt": "103"
                },
                {
                    "t": "tech",
                    "n": "Bloodlines",
                    "d": "50",
                    "c": "1",
                    "co": "250",
                    "b": true,
                    "v": "0",
                    "i": "435",
                    "bt": "101"
                }
            ],
            "bn": [
                {
                    "i": "67",
                    "e": [
                        false,
                        true
                    ]
                },
                {
                    "i": "81",
                    "e": [
                        true,
                        true
                    ]
                },
                {
                    "i": "435",
                    "e": [
                        true
                    ]
                }
            ]
        },
        "desc": "All in dark age champi scout rush vs a theoretical perfect 18 pop constant scout production into fully upgraded feudal scouts."
    },
};

export const featuredScenarios = ['champi_vs_scouts', 'test'];
