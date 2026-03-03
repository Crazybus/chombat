export const archer_vs_skirm = {
    "name": "Archer vs Skirm",
    "desc": "Switching into skirmishers to counter an existing archer mass",
    "a": {
        "ps": "archer",
        "nm": "Archer",
        "c": 10,
        "age": "2",
        "tl": [
            { "t": "villagers", "n": "Villagers", "v": 1, "d": 25, "lim": false },
            { "t": "tech", "n": "Feudal Age", "d": 130, "c": 1, "co": 500, "i": "101", "bt": 109, "b": true, "lim": true },
            {
                "t": "building",
                "n": "Archery Range",
                "d": 50,
                "c": 1,
                "co": 175,
                "prod": true,
                "i": "87"
            },
            {
                "t": "production",
                "n": "Initial Production",
                "d": 0,
                "c": 1,
                "co": 0,
                "tr": 35,
                "v": 0
            }
        ],
        "bn": [
            { "i": "199", "e": [true] },
            { "i": "211", "e": [true] }
        ]
    },
    "b": {
        "ps": "skirmisher",
        "nm": "Skirmisher",
        "c": 6,
        "age": "2",
        "tl": [
            { "t": "villagers", "n": "Villagers", "v": 1, "d": 25, "lim": false },
            { "t": "tech", "n": "Feudal Age", "d": 130, "c": 1, "co": 500, "i": "101", "bt": 109, "b": true, "lim": true },
            {
                "t": "building",
                "n": "Archery Range",
                "d": 50,
                "c": 1,
                "co": 175,
                "prod": true,
                "i": "87"
            },
            {
                "t": "production",
                "n": "Initial Production",
                "d": 200,
                "c": 1,
                "co": 0,
                "b": true,
                "tr": 26,
                "v": 0
            }
        ],
        "bn": [
            { "i": "199", "e": [true] },
            { "i": "211", "e": [true] }
        ]
    }
};
