export const knights_vs_pikes = {
    "name": "Knights vs Pikes",
    "desc": "3 barracks pikes to catch up to a player with double stable knights and 8 on the field. Was Nili wrong all along?",
    "a": {
        "ps": "knight",
        "nm": "Knight",
        "c": 20,
        "age": "3",
        "tl": [
            { "t": "villagers", "n": "Villagers", "v": 1, "d": 25, "lim": false },
            { "t": "tech", "n": "Feudal Age", "d": 130, "c": 1, "co": 500, "i": "101", "bt": 109, "b": true, "lim": true },
            { "t": "tech", "n": "Castle Age", "d": 160, "c": 1, "co": 1000, "i": "102", "bt": 109, "b": true, "lim": true },
            { "t": "building", "n": "Stable", "d": 50, "c": 2, "co": 350, "prod": true, "i": "101" },
            { "t": "production", "n": "Knight Production", "v": 0, "tr": 30, "lim": false }
        ],
        "bn": [
            { "i": "67", "e": [true] },
            { "i": "81", "e": [true] },
            { "i": "435", "e": [true] }
        ]
    },
    "b": {
        "ps": "pikeman",
        "nm": "Pikeman",
        "c": 20,
        "age": "3",
        "tl": [
            { "t": "villagers", "n": "Villagers", "v": 1, "d": 25, "lim": false },
            { "t": "tech", "n": "Feudal Age", "d": 130, "c": 1, "co": 500, "i": "101", "bt": 109, "b": true, "lim": true },
            { "t": "tech", "n": "Castle Age", "d": 160, "c": 1, "co": 1000, "i": "102", "bt": 109, "b": true, "lim": true },
            { "t": "building", "n": "Barracks", "d": 50, "c": 3, "co": 525, "prod": true, "i": "87" },
            { "t": "tech", "n": "Pikeman", "d": 45, "c": 1, "co": 215, "i": "213", "bt": 87, "b": true, "lim": true },
            { "t": "production", "n": "Pikeman Production", "v": 0, "tr": 22, "lim": false }
        ],
        "bn": [
            { "i": "67", "e": [true] },
            { "i": "74", "e": [true] }
        ]
    }
};
