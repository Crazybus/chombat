import { UnitData } from '../sim/types';

export const units: Record<string, UnitData> = {
    "arambai": {
        "name": "Arambai",
        "hp": 60,
        "matk": 0,
        "patk": 12,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 15,
        "f": 0,
        "w": 75,
        "g": 60,
        "trainTime": 18,
        "building": 82,
        "id": "1126",
        "class": 23,
        "bonuses": {
            "11": 0,
            "17": 2,
            "1": 0,
            "27": 0,
            "21": 0,
            "39": -3
        },
        "armors": {
            "4": 0,
            "3": 1,
            "19": 0,
            "28": 0,
            "15": 0,
            "8": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "archer": {
        "name": "Archer",
        "hp": 30,
        "matk": 0,
        "patk": 4,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 15,
        "f": 0,
        "w": 25,
        "g": 45,
        "trainTime": 35,
        "building": 87,
        "id": "4",
        "class": 0,
        "bonuses": {
            "27": 3,
            "21": 0,
            "17": 0,
            "13": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "armored_elephant": {
        "name": "Armored Elephant",
        "hp": 180,
        "matk": 4,
        "patk": 0,
        "marm": -2,
        "parm": 140,
        "reload": 3.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 120,
        "w": 0,
        "g": 95,
        "trainTime": 36,
        "building": 49,
        "id": "1744",
        "class": 12,
        "bonuses": {
            "11": 90,
            "20": 0,
            "21": 0,
            "38": 0,
            "39": -3
        },
        "armors": {
            "5": 17,
            "4": -2,
            "8": 7,
            "20": 0,
            "17": 0,
            "3": 140,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "ballista_elephant": {
        "name": "Ballista Elephant",
        "hp": 250,
        "matk": 0,
        "patk": 9,
        "marm": 0,
        "parm": 3,
        "reload": 2.5,
        "range": 5.0,
        "frame_delay": 12,
        "f": 100,
        "w": 0,
        "g": 80,
        "trainTime": 25,
        "building": 82,
        "id": "1120",
        "class": 12,
        "bonuses": {
            "21": 3,
            "13": 3,
            "27": 0,
            "18": 100,
            "11": 2,
            "16": 8,
            "38": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 0,
            "8": 0,
            "3": 3,
            "19": 0,
            "5": 0,
            "20": 0,
            "31": 0,
            "37": 10
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "battering_ram": {
        "name": "Battering Ram",
        "hp": 175,
        "matk": 2,
        "patk": 0,
        "marm": -3,
        "parm": 180,
        "reload": 5.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 160,
        "g": 75,
        "trainTime": 36,
        "building": 49,
        "id": "1258",
        "class": 13,
        "bonuses": {
            "11": 150,
            "20": 40
        },
        "armors": {
            "4": -3,
            "3": 180,
            "17": 0,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "battle_elephant": {
        "name": "Battle Elephant",
        "hp": 250,
        "matk": 12,
        "patk": 0,
        "marm": 1,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 20,
        "f": 100,
        "w": 0,
        "g": 70,
        "trainTime": 24,
        "building": 101,
        "id": "1132",
        "class": 12,
        "bonuses": {
            "11": 4,
            "13": 4,
            "15": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "5": 0,
            "4": 1,
            "8": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "berserk": {
        "name": "Berserk",
        "hp": 54,
        "matk": 12,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 20,
        "trainTime": 14,
        "building": 82,
        "id": "692",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "blackwood_archer": {
        "name": "Blackwood Archer",
        "hp": 20,
        "matk": 0,
        "patk": 4,
        "marm": 0,
        "parm": 0,
        "reload": 1.5,
        "range": 5.0,
        "frame_delay": 15,
        "f": 0,
        "w": 35,
        "g": 45,
        "trainTime": 14,
        "building": 82,
        "id": "2579",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "1": 0,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0,
            "40": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "bolas_rider": {
        "name": "Bolas Rider",
        "hp": 55,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 19,
        "f": 0,
        "w": 45,
        "g": 50,
        "trainTime": 34,
        "building": 87,
        "id": "2569",
        "class": 36,
        "bonuses": {
            "11": 0,
            "17": 2,
            "1": 0,
            "27": 0,
            "21": 0,
            "39": -3,
            "8": 2,
            "30": 2
        },
        "armors": {
            "4": 0,
            "3": 1,
            "19": 0,
            "28": 0,
            "15": 0,
            "8": 0,
            "31": 0,
            "40": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "boyar": {
        "name": "Boyar",
        "hp": 100,
        "matk": 12,
        "patk": 0,
        "marm": 4,
        "parm": 2,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 70,
        "trainTime": 15,
        "building": 82,
        "id": "876",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 4,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "camel_archer": {
        "name": "Camel Archer",
        "hp": 55,
        "matk": 0,
        "patk": 7,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 15,
        "f": 0,
        "w": 50,
        "g": 60,
        "trainTime": 25,
        "building": 82,
        "id": "1007",
        "class": 36,
        "bonuses": {
            "21": 0,
            "17": 0,
            "1": 0,
            "28": 4,
            "27": 0,
            "11": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "4": 0,
            "3": 1,
            "19": 0,
            "28": 0,
            "30": 0,
            "15": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "camel_rider": {
        "name": "Camel Rider",
        "hp": 100,
        "matk": 6,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 20,
        "f": 55,
        "w": 0,
        "g": 60,
        "trainTime": 22,
        "building": 101,
        "id": "329",
        "class": 12,
        "bonuses": {
            "8": 9,
            "16": 5,
            "11": 0,
            "30": 5,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 0,
            "30": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "camel_scout": {
        "name": "Camel Scout",
        "hp": 70,
        "matk": 2,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 10,
        "f": 55,
        "w": 0,
        "g": 60,
        "trainTime": 22,
        "building": 101,
        "id": "1755",
        "class": 12,
        "bonuses": {
            "8": 0,
            "16": 0,
            "11": 0,
            "30": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 0,
            "30": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "cannon_galleon": {
        "name": "Cannon Galleon",
        "hp": 120,
        "matk": 0,
        "patk": 50,
        "marm": 0,
        "parm": 5,
        "reload": 10.0,
        "range": 13.0,
        "frame_delay": 0,
        "f": 0,
        "w": 200,
        "g": 150,
        "trainTime": 46,
        "building": 45,
        "id": "420",
        "class": 22,
        "bonuses": {
            "11": 200,
            "20": 25
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 5,
            "23": 0,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [
                47
            ],
            "buildings": []
        }
    },
    "cao_cao": {
        "name": "Cao Cao",
        "hp": 475,
        "matk": 14,
        "patk": 0,
        "marm": 3,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 500,
        "w": 0,
        "g": 500,
        "trainTime": 60,
        "building": 82,
        "id": "1954",
        "class": 12,
        "bonuses": {
            "11": 0,
            "15": 3,
            "38": 0,
            "39": -3,
            "20": 0
        },
        "armors": {
            "8": 0,
            "4": 3,
            "3": 3,
            "31": 0,
            "36": 0,
            "19": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "capped_ram": {
        "name": "Capped Ram",
        "hp": 200,
        "matk": 3,
        "patk": 0,
        "marm": -2,
        "parm": 190,
        "reload": 5.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 160,
        "g": 75,
        "trainTime": 36,
        "building": 49,
        "id": "422",
        "class": 13,
        "bonuses": {
            "11": 160,
            "20": 50
        },
        "armors": {
            "4": -2,
            "3": 190,
            "17": 1,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "caravel": {
        "name": "Caravel",
        "hp": 130,
        "matk": 0,
        "patk": 4,
        "marm": 0,
        "parm": 5,
        "reload": 3.0,
        "range": 6.0,
        "frame_delay": 0,
        "f": 0,
        "w": 90,
        "g": 43,
        "trainTime": 25,
        "building": 45,
        "id": "1004",
        "class": 22,
        "bonuses": {
            "11": 11,
            "16": 0,
            "17": 4,
            "60": 4
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 5,
            "19": 0,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "carrack": {
        "name": "Carrack",
        "hp": 135,
        "matk": 4,
        "patk": 0,
        "marm": 6,
        "parm": 1,
        "reload": 1.5,
        "range": 1.0,
        "frame_delay": 0,
        "f": 0,
        "w": 75,
        "g": 35,
        "trainTime": 27,
        "building": 45,
        "id": "2628",
        "class": 22,
        "bonuses": {
            "11": 0,
            "16": 0,
            "21": -3,
            "41": 1
        },
        "armors": {
            "16": 0,
            "4": 6,
            "3": 1
        },
        "requires": {
            "techs": [
                35
            ],
            "buildings": []
        }
    },
    "cataphract": {
        "name": "Cataphract",
        "hp": 110,
        "matk": 9,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 75,
        "trainTime": 20,
        "building": 82,
        "id": "40",
        "class": 12,
        "bonuses": {
            "1": 9,
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 12,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "catapult_galleon": {
        "name": "Catapult Galleon",
        "hp": 140,
        "matk": 0,
        "patk": 30,
        "marm": 0,
        "parm": 6,
        "reload": 6.0,
        "range": 12.0,
        "frame_delay": 0,
        "f": 0,
        "w": 225,
        "g": 100,
        "trainTime": 55,
        "building": 45,
        "id": "2633",
        "class": 22,
        "bonuses": {
            "11": 130,
            "20": 10
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 6,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "cavalry_archer": {
        "name": "Cavalry Archer",
        "hp": 50,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 35,
        "f": 0,
        "w": 40,
        "g": 60,
        "trainTime": 37,
        "building": 87,
        "id": "39",
        "class": 36,
        "bonuses": {
            "27": 2,
            "21": 0,
            "17": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "28": 0,
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "centurion": {
        "name": "Centurion",
        "hp": 110,
        "matk": 13,
        "patk": 0,
        "marm": 2,
        "parm": 3,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 75,
        "w": 0,
        "g": 85,
        "trainTime": 24,
        "building": 82,
        "id": "1790",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "chakram_thrower": {
        "name": "Chakram Thrower",
        "hp": 40,
        "matk": 0,
        "patk": 3,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 15,
        "f": 65,
        "w": 0,
        "g": 30,
        "trainTime": 15,
        "building": 82,
        "id": "1741",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 1,
            "1": 0,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "champi_runner": {
        "name": "Champi Runner",
        "hp": 40,
        "matk": 5,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 45,
        "w": 0,
        "g": 25,
        "trainTime": 30,
        "building": 12,
        "id": "2588",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 1,
            "8": 0,
            "30": 0,
            "15": 0,
            "20": 2
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "champi_scout": {
        "name": "Champi Scout",
        "hp": 35,
        "matk": 4,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 45,
        "w": 0,
        "g": 25,
        "trainTime": 30,
        "building": 12,
        "id": "2550",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 0,
            "8": 0,
            "30": 0,
            "15": 0,
            "20": 2
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "champi_warrior": {
        "name": "Champi Warrior",
        "hp": 55,
        "matk": 9,
        "patk": 0,
        "marm": 0,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 45,
        "w": 0,
        "g": 25,
        "trainTime": 21,
        "building": 12,
        "id": "2552",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0,
            "20": 3
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 3,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "champion": {
        "name": "Champion",
        "hp": 70,
        "matk": 14,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 20,
        "trainTime": 21,
        "building": 12,
        "id": "567",
        "class": 6,
        "bonuses": {
            "29": 8,
            "21": 4,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "chu_ko_nu": {
        "name": "Chu Ko Nu",
        "hp": 45,
        "matk": 0,
        "patk": 8,
        "marm": 0,
        "parm": 0,
        "reload": 3.0,
        "range": 4.0,
        "frame_delay": 19,
        "f": 0,
        "w": 40,
        "g": 35,
        "trainTime": 16,
        "building": 82,
        "id": "73",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "8": 0,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "companion_cavalry": {
        "name": "Companion Cavalry",
        "hp": 90,
        "matk": 11,
        "patk": 0,
        "marm": 1,
        "parm": 3,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 65,
        "trainTime": 26,
        "building": 82,
        "id": "2382",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "19": 5
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 3,
            "31": 0,
            "19": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "composite_bowman": {
        "name": "Composite Bowman",
        "hp": 40,
        "matk": 0,
        "patk": 4,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 12,
        "f": 0,
        "w": 35,
        "g": 45,
        "trainTime": 12,
        "building": 82,
        "id": "1800",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "17": 0
        },
        "armors": {
            "4": 1,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "condottiero": {
        "name": "Condottiero",
        "hp": 80,
        "matk": 10,
        "patk": 0,
        "marm": 1,
        "parm": 0,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 35,
        "trainTime": 18,
        "building": 12,
        "id": "882",
        "class": 6,
        "bonuses": {
            "21": 2,
            "23": 10,
            "30": 0,
            "8": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0,
            "32": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "conquistador": {
        "name": "Conquistador",
        "hp": 55,
        "matk": 0,
        "patk": 16,
        "marm": 2,
        "parm": 1,
        "reload": 2.9000000953674316,
        "range": 6.0,
        "frame_delay": 13,
        "f": 70,
        "w": 0,
        "g": 60,
        "trainTime": 24,
        "building": 82,
        "id": "771",
        "class": 23,
        "bonuses": {
            "11": 0,
            "17": 4,
            "39": -3
        },
        "armors": {
            "4": 2,
            "15": 0,
            "8": 0,
            "3": 1,
            "19": 0,
            "23": 0,
            "28": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "coustillier": {
        "name": "Coustillier",
        "hp": 115,
        "matk": 8,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 55,
        "trainTime": 15,
        "building": 82,
        "id": "1655",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "demolition_raft": {
        "name": "Demolition Raft",
        "hp": 40,
        "matk": 75,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 45,
        "g": 80,
        "trainTime": 45,
        "building": 45,
        "id": "1104",
        "class": 22,
        "bonuses": {
            "11": 180
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "demolition_ship": {
        "name": "Demolition Ship",
        "hp": 50,
        "matk": 95,
        "patk": 0,
        "marm": 1,
        "parm": 0,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 45,
        "g": 80,
        "trainTime": 31,
        "building": 45,
        "id": "527",
        "class": 22,
        "bonuses": {
            "11": 220
        },
        "armors": {
            "16": 0,
            "4": 1,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "dragon_ship": {
        "name": "Dragon Ship",
        "hp": 135,
        "matk": 0,
        "patk": 5,
        "marm": 3,
        "parm": 7,
        "reload": 0.25,
        "range": 3.0,
        "frame_delay": 0,
        "f": 0,
        "w": 75,
        "g": 45,
        "trainTime": 36,
        "building": 45,
        "id": "1302",
        "class": 22,
        "bonuses": {
            "11": 3,
            "16": 0,
            "2": 0,
            "60": 1
        },
        "armors": {
            "16": 0,
            "4": 3,
            "3": 7,
            "31": 0,
            "41": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "dromon": {
        "name": "Dromon",
        "hp": 125,
        "matk": 0,
        "patk": 8,
        "marm": 1,
        "parm": 6,
        "reload": 8.0,
        "range": 12.0,
        "frame_delay": 0,
        "f": 0,
        "w": 175,
        "g": 150,
        "trainTime": 65,
        "building": 45,
        "id": "1795",
        "class": 22,
        "bonuses": {
            "11": 34,
            "20": 2,
            "22": 15,
            "26": 9
        },
        "armors": {
            "16": 0,
            "4": 1,
            "3": 6,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "eagle_scout": {
        "name": "Eagle Scout",
        "hp": 50,
        "matk": 4,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 20,
        "w": 0,
        "g": 50,
        "trainTime": 50,
        "building": 12,
        "id": "751",
        "class": 6,
        "bonuses": {
            "25": 8,
            "8": 0,
            "20": 3,
            "21": 0,
            "16": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "29": 0,
            "1": 0,
            "4": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "eagle_warrior": {
        "name": "Eagle Warrior",
        "hp": 55,
        "matk": 7,
        "patk": 0,
        "marm": 0,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 20,
        "w": 0,
        "g": 50,
        "trainTime": 35,
        "building": 12,
        "id": "753",
        "class": 6,
        "bonuses": {
            "25": 8,
            "8": 3,
            "20": 3,
            "16": 1,
            "21": 0,
            "30": 2,
            "15": 0
        },
        "armors": {
            "29": 0,
            "1": 0,
            "4": 0,
            "3": 3,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elephant_archer": {
        "name": "Elephant Archer",
        "hp": 230,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 12,
        "f": 60,
        "w": 0,
        "g": 80,
        "trainTime": 32,
        "building": 87,
        "id": "873",
        "class": 36,
        "bonuses": {
            "21": 0,
            "27": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 2,
            "5": 0,
            "28": -4,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_arambai": {
        "name": "Elite Arambai",
        "hp": 65,
        "matk": 0,
        "patk": 14,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 15,
        "f": 0,
        "w": 75,
        "g": 60,
        "trainTime": 18,
        "building": 82,
        "id": "1128",
        "class": 23,
        "bonuses": {
            "11": 0,
            "17": 2,
            "1": 0,
            "27": 0,
            "21": 0,
            "39": -3
        },
        "armors": {
            "4": 0,
            "3": 2,
            "19": 0,
            "28": 0,
            "15": 0,
            "8": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_ballista_elephant": {
        "name": "Elite Ballista Elephant",
        "hp": 280,
        "matk": 0,
        "patk": 10,
        "marm": 0,
        "parm": 3,
        "reload": 2.5,
        "range": 5.0,
        "frame_delay": 12,
        "f": 100,
        "w": 0,
        "g": 80,
        "trainTime": 25,
        "building": 82,
        "id": "1122",
        "class": 12,
        "bonuses": {
            "21": 4,
            "13": 4,
            "27": 0,
            "18": 100,
            "11": 4,
            "16": 8,
            "38": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 0,
            "8": 0,
            "3": 3,
            "19": 0,
            "5": 0,
            "20": 0,
            "31": 0,
            "37": 10
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_battle_elephant": {
        "name": "Elite Battle Elephant",
        "hp": 300,
        "matk": 14,
        "patk": 0,
        "marm": 1,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 10,
        "f": 100,
        "w": 0,
        "g": 70,
        "trainTime": 24,
        "building": 101,
        "id": "1134",
        "class": 12,
        "bonuses": {
            "11": 7,
            "13": 7,
            "15": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "5": 0,
            "4": 1,
            "8": 0,
            "3": 3,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_berserk": {
        "name": "Elite Berserk",
        "hp": 62,
        "matk": 14,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 20,
        "trainTime": 12,
        "building": 82,
        "id": "694",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 3,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_blackwood_archer": {
        "name": "Elite Blackwood Archer",
        "hp": 25,
        "matk": 0,
        "patk": 4,
        "marm": 0,
        "parm": 0,
        "reload": 1.5,
        "range": 5.0,
        "frame_delay": 15,
        "f": 0,
        "w": 35,
        "g": 45,
        "trainTime": 14,
        "building": 82,
        "id": "2581",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "1": 0,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0,
            "40": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_bolas_rider": {
        "name": "Elite Bolas Rider",
        "hp": 65,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 19,
        "f": 0,
        "w": 45,
        "g": 50,
        "trainTime": 28,
        "building": 87,
        "id": "2571",
        "class": 36,
        "bonuses": {
            "11": 0,
            "17": 2,
            "1": 0,
            "27": 0,
            "21": 0,
            "39": -3,
            "8": 3,
            "30": 3
        },
        "armors": {
            "4": 0,
            "3": 2,
            "19": 0,
            "28": 0,
            "15": 0,
            "8": 0,
            "31": 0,
            "40": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_boyar": {
        "name": "Elite Boyar",
        "hp": 130,
        "matk": 14,
        "patk": 0,
        "marm": 8,
        "parm": 3,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 70,
        "trainTime": 15,
        "building": 82,
        "id": "878",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 8,
            "8": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_camel_archer": {
        "name": "Elite Camel Archer",
        "hp": 60,
        "matk": 0,
        "patk": 8,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 15,
        "f": 0,
        "w": 50,
        "g": 60,
        "trainTime": 25,
        "building": 82,
        "id": "1009",
        "class": 36,
        "bonuses": {
            "21": 0,
            "17": 0,
            "1": 0,
            "28": 6,
            "27": 0,
            "11": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "4": 1,
            "3": 1,
            "19": 0,
            "28": 0,
            "30": 0,
            "15": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_cannon_galleon": {
        "name": "Elite Cannon Galleon",
        "hp": 150,
        "matk": 0,
        "patk": 60,
        "marm": 0,
        "parm": 6,
        "reload": 10.0,
        "range": 15.0,
        "frame_delay": 0,
        "f": 0,
        "w": 200,
        "g": 150,
        "trainTime": 46,
        "building": 45,
        "id": "691",
        "class": 22,
        "bonuses": {
            "11": 275,
            "20": 25
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 6,
            "23": 0,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_caravel": {
        "name": "Elite Caravel",
        "hp": 150,
        "matk": 0,
        "patk": 7,
        "marm": 0,
        "parm": 6,
        "reload": 3.0,
        "range": 7.0,
        "frame_delay": 0,
        "f": 0,
        "w": 90,
        "g": 43,
        "trainTime": 25,
        "building": 45,
        "id": "1006",
        "class": 22,
        "bonuses": {
            "11": 11,
            "16": 0,
            "17": 4,
            "60": 6
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 6,
            "19": 0,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_cataphract": {
        "name": "Elite Cataphract",
        "hp": 150,
        "matk": 12,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 1.7000000476837158,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 75,
        "trainTime": 20,
        "building": 82,
        "id": "553",
        "class": 12,
        "bonuses": {
            "1": 12,
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 16,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_centurion": {
        "name": "Elite Centurion",
        "hp": 155,
        "matk": 15,
        "patk": 0,
        "marm": 3,
        "parm": 3,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 75,
        "w": 0,
        "g": 85,
        "trainTime": 24,
        "building": 82,
        "id": "1792",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 3,
            "8": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_chakram_thrower": {
        "name": "Elite Chakram Thrower",
        "hp": 50,
        "matk": 0,
        "patk": 4,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 6.0,
        "frame_delay": 15,
        "f": 65,
        "w": 0,
        "g": 30,
        "trainTime": 15,
        "building": 82,
        "id": "1743",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "1": 1,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_champi_warrior": {
        "name": "Elite Champi Warrior",
        "hp": 65,
        "matk": 11,
        "patk": 0,
        "marm": 0,
        "parm": 4,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 45,
        "w": 0,
        "g": 25,
        "trainTime": 21,
        "building": 12,
        "id": "2554",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 3,
            "8": 0,
            "30": 0,
            "15": 0,
            "20": 3
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 4,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_chu_ko_nu": {
        "name": "Elite Chu Ko Nu",
        "hp": 50,
        "matk": 0,
        "patk": 10,
        "marm": 0,
        "parm": 0,
        "reload": 3.0,
        "range": 4.0,
        "frame_delay": 19,
        "f": 0,
        "w": 40,
        "g": 35,
        "trainTime": 13,
        "building": 82,
        "id": "559",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "8": 0,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_companion_cavalry": {
        "name": "Elite Companion CAvalry",
        "hp": 120,
        "matk": 13,
        "patk": 0,
        "marm": 1,
        "parm": 4,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 65,
        "trainTime": 26,
        "building": 82,
        "id": "2383",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "19": 7
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 4,
            "31": 0,
            "19": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_composite_bowman": {
        "name": "Elite Composite Bowman",
        "hp": 45,
        "matk": 0,
        "patk": 4,
        "marm": 2,
        "parm": 0,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 12,
        "f": 0,
        "w": 35,
        "g": 45,
        "trainTime": 10,
        "building": 82,
        "id": "1802",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "17": 0
        },
        "armors": {
            "4": 2,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_conquistador": {
        "name": "Elite Conquistador",
        "hp": 70,
        "matk": 0,
        "patk": 19,
        "marm": 2,
        "parm": 2,
        "reload": 2.9000000953674316,
        "range": 6.0,
        "frame_delay": 13,
        "f": 70,
        "w": 0,
        "g": 60,
        "trainTime": 24,
        "building": 82,
        "id": "773",
        "class": 23,
        "bonuses": {
            "11": 2,
            "17": 6,
            "39": -3
        },
        "armors": {
            "4": 2,
            "15": 0,
            "8": 0,
            "3": 2,
            "19": 0,
            "23": 0,
            "28": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_coustillier": {
        "name": "Elite Coustillier",
        "hp": 145,
        "matk": 11,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 55,
        "trainTime": 14,
        "building": 82,
        "id": "1657",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_eagle_warrior": {
        "name": "Elite Eagle Warrior",
        "hp": 60,
        "matk": 9,
        "patk": 0,
        "marm": 0,
        "parm": 4,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 20,
        "w": 0,
        "g": 50,
        "trainTime": 20,
        "building": 12,
        "id": "752",
        "class": 6,
        "bonuses": {
            "25": 10,
            "8": 4,
            "16": 2,
            "20": 5,
            "21": 0,
            "30": 3,
            "15": 0
        },
        "armors": {
            "29": 0,
            "1": 0,
            "4": 0,
            "3": 4,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_elephant_archer": {
        "name": "Elite Elephant Archer",
        "hp": 280,
        "matk": 0,
        "patk": 7,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 24,
        "f": 60,
        "w": 0,
        "g": 80,
        "trainTime": 32,
        "building": 87,
        "id": "875",
        "class": 36,
        "bonuses": {
            "21": 0,
            "27": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 2,
            "5": 0,
            "28": -4,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_fire_archer": {
        "name": "Elite Fire Archer",
        "hp": 40,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 0,
        "reload": 3.5,
        "range": 10.0,
        "frame_delay": 10,
        "f": 0,
        "w": 45,
        "g": 45,
        "trainTime": 17,
        "building": 82,
        "id": "1970",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 4,
            "17": 0,
            "20": 1,
            "16": 4
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_fire_lancer": {
        "name": "Elite Fire Lancer",
        "hp": 85,
        "matk": 10,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 10,
        "f": 0,
        "w": 45,
        "g": 45,
        "trainTime": 25,
        "building": 12,
        "id": "1903",
        "class": 6,
        "bonuses": {
            "21": 1,
            "8": 15,
            "16": 12,
            "30": 12,
            "15": 0,
            "23": 0,
            "5": 15
        },
        "armors": {
            "29": 0,
            "1": 0,
            "4": 2,
            "3": 1,
            "31": 0,
            "23": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_gbeto": {
        "name": "Elite Gbeto",
        "hp": 50,
        "matk": 0,
        "patk": 13,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 6.0,
        "frame_delay": 30,
        "f": 50,
        "w": 0,
        "g": 40,
        "trainTime": 17,
        "building": 82,
        "id": "1015",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 0,
            "15": 0,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_genitour": {
        "name": "Elite Genitour",
        "hp": 55,
        "matk": 0,
        "patk": 4,
        "marm": 0,
        "parm": 4,
        "reload": 3.0,
        "range": 4.0,
        "frame_delay": 12,
        "f": 40,
        "w": 35,
        "g": 0,
        "trainTime": 23,
        "building": 87,
        "id": "1012",
        "class": 36,
        "bonuses": {
            "21": 0,
            "17": 0,
            "15": 5,
            "28": 2,
            "27": 3,
            "39": -3,
            "38": 0,
            "35": 2
        },
        "armors": {
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 4,
            "28": 1,
            "19": 0,
            "31": 0,
            "38": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_genoese_crossbowman": {
        "name": "Elite Genoese Crossbowman",
        "hp": 50,
        "matk": 0,
        "patk": 6,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 15,
        "f": 0,
        "w": 45,
        "g": 40,
        "trainTime": 14,
        "building": 82,
        "id": "868",
        "class": 0,
        "bonuses": {
            "8": 7,
            "16": 5,
            "5": 7,
            "21": 0,
            "30": 6
        },
        "armors": {
            "4": 1,
            "3": 0,
            "15": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_ghulam": {
        "name": "Elite Ghulam",
        "hp": 70,
        "matk": 11,
        "patk": 0,
        "marm": 0,
        "parm": 6,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 12,
        "f": 30,
        "w": 0,
        "g": 45,
        "trainTime": 12,
        "building": 82,
        "id": "1749",
        "class": 6,
        "bonuses": {
            "15": 6,
            "21": 2,
            "29": 2,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 6,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_guardsman": {
        "name": "Elite Guardsman",
        "hp": 60,
        "matk": 6,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 3.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 35,
        "w": 25,
        "g": 0,
        "trainTime": 22,
        "building": 12,
        "id": "359",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 1,
            "5": 28,
            "8": 32,
            "16": 17,
            "30": 26,
            "35": 7,
            "15": 0
        },
        "armors": {
            "27": 0,
            "1": 0,
            "4": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_guecha_warrior": {
        "name": "Elite Guecha Warrior",
        "hp": 50,
        "matk": 0,
        "patk": 8,
        "marm": 0,
        "parm": 5,
        "reload": 3.0,
        "range": 4.0,
        "frame_delay": 25,
        "f": 0,
        "w": 50,
        "g": 60,
        "trainTime": 17,
        "building": 82,
        "id": "2564",
        "class": 0,
        "bonuses": {
            "28": 2,
            "27": 2,
            "21": 0,
            "15": 4,
            "17": 0,
            "1": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 5,
            "31": 0,
            "38": 0,
            "19": 0,
            "40": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_hippeus": {
        "name": "Elite Hippeus",
        "hp": 100,
        "matk": 11,
        "patk": 0,
        "marm": 2,
        "parm": 5,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 30,
        "trainTime": 17,
        "building": 82,
        "id": "2108",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 5,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 5,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_hoplite": {
        "name": "Elite Hoplite",
        "hp": 70,
        "matk": 12,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 2.0,
        "range": 0.5,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 30,
        "trainTime": 25,
        "building": 12,
        "id": "2111",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_huskarl": {
        "name": "Elite Huskarl",
        "hp": 70,
        "matk": 12,
        "patk": 0,
        "marm": 0,
        "parm": 8,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 75,
        "w": 0,
        "g": 35,
        "trainTime": 13,
        "building": 82,
        "id": "555",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 3,
            "15": 10,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 8,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_hussite_wagon": {
        "name": "Elite Hussite Wagon",
        "hp": 230,
        "matk": 0,
        "patk": 13,
        "marm": 1,
        "parm": 10,
        "reload": 3.450000047683716,
        "range": 6.0,
        "frame_delay": 20,
        "f": 0,
        "w": 110,
        "g": 70,
        "trainTime": 26,
        "building": 82,
        "id": "1706",
        "class": 55,
        "bonuses": {
            "11": 2,
            "17": 3
        },
        "armors": {
            "4": 1,
            "20": 0,
            "3": 10,
            "19": 0,
            "23": 0,
            "31": 0,
            "37": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_ibirapema_warrior": {
        "name": "Elite Ibirapema Warrior",
        "hp": 90,
        "matk": 11,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 30,
        "w": 0,
        "g": 60,
        "trainTime": 24,
        "building": 12,
        "id": "2584",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 2,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_immortal": {
        "name": "Elite Immortal",
        "hp": 60,
        "matk": 12,
        "patk": 0,
        "marm": 1,
        "parm": 3,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 20,
        "trainTime": 10,
        "building": 82,
        "id": "2102",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 0,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "4": 1,
            "3": 3,
            "15": 0,
            "19": 0,
            "31": 0,
            "1": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_iron_pagoda": {
        "name": "Elite Iron Pagoda",
        "hp": 140,
        "matk": 13,
        "patk": 0,
        "marm": 2,
        "parm": 3,
        "reload": 2.1500000953674316,
        "range": 0.0,
        "frame_delay": 0,
        "f": 80,
        "w": 0,
        "g": 55,
        "trainTime": 14,
        "building": 82,
        "id": "1910",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_jaguar_warrior": {
        "name": "Elite Jaguar Warrior",
        "hp": 75,
        "matk": 19,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 30,
        "trainTime": 12,
        "building": 82,
        "id": "726",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "1": 6,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_janissary": {
        "name": "Elite Janissary",
        "hp": 40,
        "matk": 0,
        "patk": 22,
        "marm": 2,
        "parm": 0,
        "reload": 3.450000047683716,
        "range": 8.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 55,
        "trainTime": 21,
        "building": 82,
        "id": "557",
        "class": 44,
        "bonuses": {
            "11": 0,
            "17": 3
        },
        "armors": {
            "4": 2,
            "15": 0,
            "3": 0,
            "19": 0,
            "23": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_kamayuk": {
        "name": "Elite Kamayuk",
        "hp": 80,
        "matk": 8,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 1.0,
        "frame_delay": 24,
        "f": 60,
        "w": 0,
        "g": 30,
        "trainTime": 10,
        "building": 82,
        "id": "881",
        "class": 6,
        "bonuses": {
            "8": 12,
            "21": 0,
            "30": 10,
            "5": 20,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_karambit_warrior": {
        "name": "Elite Karambit Warrior",
        "hp": 40,
        "matk": 8,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 25,
        "w": 0,
        "g": 15,
        "trainTime": 6,
        "building": 82,
        "id": "1125",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 1,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_keshik": {
        "name": "Elite Keshik",
        "hp": 145,
        "matk": 11,
        "patk": 0,
        "marm": 1,
        "parm": 3,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 40,
        "trainTime": 15,
        "building": 82,
        "id": "1230",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_kipchak": {
        "name": "Elite Kipchak",
        "hp": 45,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 0,
        "reload": 2.200000047683716,
        "range": 4.0,
        "frame_delay": 21,
        "f": 0,
        "w": 60,
        "g": 35,
        "trainTime": 20,
        "building": 82,
        "id": "1233",
        "class": 36,
        "bonuses": {
            "27": 1,
            "21": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "28": 0,
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_kona": {
        "name": "Elite Kona",
        "hp": 145,
        "matk": 11,
        "patk": 0,
        "marm": 0,
        "parm": 5,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 40,
        "trainTime": 14,
        "building": 82,
        "id": "2568",
        "class": 12,
        "bonuses": {
            "20": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "23": 5
        },
        "armors": {
            "4": 0,
            "3": 5,
            "8": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_konnik": {
        "name": "Elite Konnik",
        "hp": 120,
        "matk": 14,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 2.4000000953674316,
        "range": 0.0,
        "frame_delay": 13,
        "f": 60,
        "w": 0,
        "g": 70,
        "trainTime": 16,
        "building": 82,
        "id": "1227",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_leitis": {
        "name": "Elite Leitis",
        "hp": 130,
        "matk": 16,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 50,
        "trainTime": 18,
        "building": 82,
        "id": "1236",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_liao_dao": {
        "name": "Elite Liao Dao",
        "hp": 85,
        "matk": 13,
        "patk": 0,
        "marm": 3,
        "parm": 1,
        "reload": 2.4000000953674316,
        "range": 0.0,
        "frame_delay": 0,
        "f": 40,
        "w": 0,
        "g": 40,
        "trainTime": 12,
        "building": 82,
        "id": "1922",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 3,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 3,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_longboat": {
        "name": "Elite Longboat",
        "hp": 130,
        "matk": 0,
        "patk": 7,
        "marm": 1,
        "parm": 6,
        "reload": 3.0,
        "range": 7.0,
        "frame_delay": 0,
        "f": 0,
        "w": 100,
        "g": 50,
        "trainTime": 25,
        "building": 45,
        "id": "533",
        "class": 22,
        "bonuses": {
            "11": 0,
            "16": 0,
            "17": 2,
            "60": 1
        },
        "armors": {
            "16": 0,
            "4": 1,
            "3": 6,
            "19": 0,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_longbowman": {
        "name": "Elite Longbowman",
        "hp": 40,
        "matk": 0,
        "patk": 7,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 6.0,
        "frame_delay": 10,
        "f": 0,
        "w": 35,
        "g": 40,
        "trainTime": 18,
        "building": 82,
        "id": "530",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_magyar_huszar": {
        "name": "Elite Magyar Huszar",
        "hp": 90,
        "matk": 11,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 35,
        "w": 0,
        "g": 45,
        "trainTime": 12,
        "building": 82,
        "id": "871",
        "class": 12,
        "bonuses": {
            "17": 2,
            "20": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 2,
            "8": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_mameluke": {
        "name": "Elite Mameluke",
        "hp": 80,
        "matk": 0,
        "patk": 10,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 3.0,
        "frame_delay": 12,
        "f": 55,
        "w": 0,
        "g": 85,
        "trainTime": 23,
        "building": 82,
        "id": "556",
        "class": 12,
        "bonuses": {
            "11": 0,
            "8": 12,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 1,
            "35": 0,
            "3": 0,
            "30": 0,
            "19": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_mangudai": {
        "name": "Elite Mangudai",
        "hp": 60,
        "matk": 0,
        "patk": 8,
        "marm": 1,
        "parm": 0,
        "reload": 2.0999999046325684,
        "range": 4.0,
        "frame_delay": 23,
        "f": 0,
        "w": 55,
        "g": 65,
        "trainTime": 26,
        "building": 82,
        "id": "561",
        "class": 36,
        "bonuses": {
            "27": 1,
            "21": 0,
            "17": 0,
            "20": 5,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "28": 0,
            "4": 1,
            "15": 0,
            "8": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_monaspa": {
        "name": "Elite Monaspa",
        "hp": 80,
        "matk": 14,
        "patk": 0,
        "marm": 5,
        "parm": 2,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 45,
        "trainTime": 14,
        "building": 82,
        "id": "1805",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 5,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_obuch": {
        "name": "Elite Obuch",
        "hp": 95,
        "matk": 10,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 20,
        "trainTime": 12,
        "building": 82,
        "id": "1703",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 6,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_organ_gun": {
        "name": "Elite Organ Gun",
        "hp": 70,
        "matk": 0,
        "patk": 8,
        "marm": 2,
        "parm": 6,
        "reload": 3.450000047683716,
        "range": 7.0,
        "frame_delay": 12,
        "f": 0,
        "w": 80,
        "g": 70,
        "trainTime": 21,
        "building": 82,
        "id": "1003",
        "class": 13,
        "bonuses": {
            "1": 2,
            "11": 1,
            "17": 1,
            "38": 2,
            "32": -2
        },
        "armors": {
            "4": 2,
            "20": 0,
            "3": 6,
            "19": 0,
            "23": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_pattiyodha_longbowman": {
        "name": "Elite Pattiyodha Longbowman",
        "hp": 60,
        "matk": 0,
        "patk": 8,
        "marm": 2,
        "parm": 0,
        "reload": 2.200000047683716,
        "range": 4.0,
        "frame_delay": 19,
        "f": 0,
        "w": 60,
        "g": 35,
        "trainTime": 16,
        "building": 82,
        "id": "2389",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "17": 0,
            "5": 4
        },
        "armors": {
            "4": 2,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_phalangite": {
        "name": "Elite Phalangite",
        "hp": 65,
        "matk": 0,
        "patk": 8,
        "marm": 2,
        "parm": 0,
        "reload": 2.5,
        "range": 1.7999999523162842,
        "frame_delay": 19,
        "f": 50,
        "w": 0,
        "g": 40,
        "trainTime": 15,
        "building": 12,
        "id": "2385",
        "class": 6,
        "bonuses": {
            "8": 10,
            "21": 0,
            "30": 6,
            "5": 20
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_plumed_archer": {
        "name": "Elite Plumed Archer",
        "hp": 65,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 2,
        "reload": 1.899999976158142,
        "range": 5.0,
        "frame_delay": 15,
        "f": 0,
        "w": 55,
        "g": 55,
        "trainTime": 16,
        "building": 82,
        "id": "765",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "1": 2,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_ratha": {
        "name": "Elite Ratha",
        "hp": 115,
        "matk": 0,
        "patk": 6,
        "marm": 3,
        "parm": 3,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 14,
        "f": 0,
        "w": 60,
        "g": 60,
        "trainTime": 18,
        "building": 82,
        "id": "1761",
        "class": 36,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "27": 2,
            "39": -3,
            "38": 0
        },
        "armors": {
            "4": 3,
            "8": 0,
            "3": 3,
            "15": 0,
            "19": 0,
            "28": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_rattan_archer": {
        "name": "Elite Rattan Archer",
        "hp": 45,
        "matk": 0,
        "patk": 7,
        "marm": 0,
        "parm": 6,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 23,
        "f": 0,
        "w": 50,
        "g": 45,
        "trainTime": 16,
        "building": 82,
        "id": "1131",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "1": 0,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 6,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_rhomphaia_warrior": {
        "name": "Elite Rhomphaia Warrior",
        "hp": 60,
        "matk": 10,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 40,
        "trainTime": 13,
        "building": 82,
        "id": "2387",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 8,
            "8": 22,
            "30": 18
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_samurai": {
        "name": "Elite Samurai",
        "hp": 80,
        "matk": 12,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 45,
        "w": 0,
        "g": 30,
        "trainTime": 9,
        "building": 82,
        "id": "560",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 3,
            "19": 12,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_sannahya": {
        "name": "Elite Sannahya",
        "hp": 400,
        "matk": 12,
        "patk": 0,
        "marm": 2,
        "parm": 4,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 90,
        "w": 0,
        "g": 80,
        "trainTime": 22,
        "building": 101,
        "id": "2391",
        "class": 12,
        "bonuses": {
            "21": 0,
            "13": 4,
            "15": 0,
            "38": 0,
            "39": -3,
            "20": 0
        },
        "armors": {
            "5": 0,
            "4": 2,
            "8": 0,
            "3": 4,
            "31": 0,
            "19": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_serjeant": {
        "name": "Elite Serjeant",
        "hp": 85,
        "matk": 11,
        "patk": 0,
        "marm": 6,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 25,
        "trainTime": 12,
        "building": 82,
        "id": "1659",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 3,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 6,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_shotel_warrior": {
        "name": "Elite Shotel Warrior",
        "hp": 50,
        "matk": 18,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 30,
        "trainTime": 4,
        "building": 82,
        "id": "1018",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 1,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 1,
            "19": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_shrivamsha_rider": {
        "name": "Elite Shrivamsha Rider",
        "hp": 70,
        "matk": 11,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 30,
        "trainTime": 20,
        "building": 101,
        "id": "1753",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 1,
            "8": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_skirmisher": {
        "name": "Elite Skirmisher",
        "hp": 35,
        "matk": 0,
        "patk": 3,
        "marm": 0,
        "parm": 4,
        "reload": 3.0,
        "range": 5.0,
        "frame_delay": 19,
        "f": 25,
        "w": 35,
        "g": 0,
        "trainTime": 22,
        "building": 87,
        "id": "6",
        "class": 0,
        "bonuses": {
            "28": 2,
            "27": 4,
            "21": 0,
            "15": 4,
            "17": 0,
            "35": 2
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 4,
            "31": 0,
            "38": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_steppe_lancer": {
        "name": "Elite Steppe Lancer",
        "hp": 80,
        "matk": 11,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 1.0,
        "frame_delay": 13,
        "f": 70,
        "w": 0,
        "g": 40,
        "trainTime": 20,
        "building": 101,
        "id": "1372",
        "class": 12,
        "bonuses": {
            "20": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 2,
            "8": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_strategos": {
        "name": "Elite Strategos",
        "hp": 65,
        "matk": 18,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 25,
        "trainTime": 16,
        "building": 82,
        "id": "2105",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 0,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_tarkan": {
        "name": "Elite Tarkan",
        "hp": 150,
        "matk": 11,
        "patk": 0,
        "marm": 1,
        "parm": 4,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 60,
        "trainTime": 14,
        "building": 82,
        "id": "757",
        "class": 12,
        "bonuses": {
            "26": 10,
            "11": 10,
            "15": 0,
            "13": 12,
            "22": 10,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 4,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_temple_guard": {
        "name": "Elite Temple Guard",
        "hp": 115,
        "matk": 14,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 80,
        "w": 0,
        "g": 45,
        "trainTime": 24,
        "building": 12,
        "id": "2587",
        "class": 6,
        "bonuses": {
            "8": 6,
            "30": 4,
            "5": 5,
            "16": 4,
            "21": 2
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 2,
            "19": 0,
            "31": 0,
            "29": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_teutonic_knight": {
        "name": "Elite Teutonic Knight",
        "hp": 110,
        "matk": 17,
        "patk": 0,
        "marm": 10,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 85,
        "w": 0,
        "g": 30,
        "trainTime": 12,
        "building": 82,
        "id": "554",
        "class": 6,
        "bonuses": {
            "29": 4,
            "21": 4,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 10,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_throwing_axeman": {
        "name": "Elite Throwing Axeman",
        "hp": 70,
        "matk": 0,
        "patk": 8,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 28,
        "f": 55,
        "w": 0,
        "g": 25,
        "trainTime": 13,
        "building": 82,
        "id": "531",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "15": 0,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_tiger_cavalry": {
        "name": "Elite Tiger Cavalry",
        "hp": 130,
        "matk": 13,
        "patk": 0,
        "marm": 0,
        "parm": 5,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 80,
        "trainTime": 15,
        "building": 82,
        "id": "1951",
        "class": 12,
        "bonuses": {
            "15": 7,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "8": 0,
            "3": 5,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_turtle_ship": {
        "name": "Elite Turtle Ship",
        "hp": 350,
        "matk": 0,
        "patk": 13,
        "marm": 3,
        "parm": 12,
        "reload": 2.0,
        "range": 7.0,
        "frame_delay": 1,
        "f": 0,
        "w": 190,
        "g": 130,
        "trainTime": 50,
        "building": 45,
        "id": "832",
        "class": 22,
        "bonuses": {
            "11": 7,
            "20": 3,
            "37": 3,
            "26": 7,
            "22": 6,
            "16": 0
        },
        "armors": {
            "16": 0,
            "2": 0,
            "4": 3,
            "3": 12,
            "23": 0,
            "19": 0,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_urumi_swordsman": {
        "name": "Elite Urumi Swordsman",
        "hp": 65,
        "matk": 11,
        "patk": 0,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 20,
        "trainTime": 9,
        "building": 82,
        "id": "1737",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_war_chariot": {
        "name": "Elite War Chariot",
        "hp": 125,
        "matk": 10,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 65,
        "g": 65,
        "trainTime": 24,
        "building": 101,
        "id": "2151",
        "class": 12,
        "bonuses": {
            "1": 8,
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_war_elephant": {
        "name": "Elite War Elephant",
        "hp": 600,
        "matk": 20,
        "patk": 0,
        "marm": 1,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 170,
        "w": 0,
        "g": 85,
        "trainTime": 25,
        "building": 82,
        "id": "558",
        "class": 12,
        "bonuses": {
            "11": 30,
            "13": 30,
            "15": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "5": 0,
            "4": 1,
            "8": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_war_wagon": {
        "name": "Elite War Wagon",
        "hp": 200,
        "matk": 0,
        "patk": 9,
        "marm": 0,
        "parm": 4,
        "reload": 2.5,
        "range": 5.0,
        "frame_delay": 32,
        "f": 0,
        "w": 200,
        "g": 60,
        "trainTime": 21,
        "building": 82,
        "id": "829",
        "class": 36,
        "bonuses": {
            "21": 2,
            "27": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 4,
            "19": 0,
            "28": -1,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_white_feather_guard": {
        "name": "Elite White Feather Guard",
        "hp": 100,
        "matk": 8,
        "patk": 0,
        "marm": 0,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 15,
        "trainTime": 11,
        "building": 82,
        "id": "1961",
        "class": 6,
        "bonuses": {
            "29": 4,
            "21": 2,
            "8": 8,
            "30": 7,
            "5": 8,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "elite_woad_raider": {
        "name": "Elite Woad Raider",
        "hp": 85,
        "matk": 15,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 25,
        "trainTime": 10,
        "building": 82,
        "id": "534",
        "class": 6,
        "bonuses": {
            "29": 3,
            "21": 3,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "fast_fire_ship": {
        "name": "Fast Fire Ship",
        "hp": 140,
        "matk": 0,
        "patk": 4,
        "marm": 3,
        "parm": 7,
        "reload": 0.25,
        "range": 2.5,
        "frame_delay": 0,
        "f": 0,
        "w": 75,
        "g": 45,
        "trainTime": 27,
        "building": 45,
        "id": "532",
        "class": 22,
        "bonuses": {
            "11": 3,
            "16": 0,
            "2": 0,
            "60": 1
        },
        "armors": {
            "16": 0,
            "4": 3,
            "3": 7,
            "31": 0,
            "41": 0
        },
        "requires": {
            "techs": [
                35
            ],
            "buildings": []
        }
    },
    "fire_archer": {
        "name": "Fire Archer",
        "hp": 35,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 0,
        "reload": 3.5,
        "range": 9.0,
        "frame_delay": 10,
        "f": 0,
        "w": 45,
        "g": 45,
        "trainTime": 17,
        "building": 82,
        "id": "1968",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 4,
            "17": 0,
            "20": 1,
            "16": 3
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "fire_galley": {
        "name": "Fire Galley",
        "hp": 110,
        "matk": 0,
        "patk": 2,
        "marm": 1,
        "parm": 4,
        "reload": 0.25,
        "range": 2.5,
        "frame_delay": 0,
        "f": 0,
        "w": 75,
        "g": 45,
        "trainTime": 49,
        "building": 45,
        "id": "1103",
        "class": 22,
        "bonuses": {
            "11": 1,
            "16": 0,
            "2": 0,
            "60": 1
        },
        "armors": {
            "16": 0,
            "4": 1,
            "3": 4,
            "31": 0,
            "41": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "fire_lancer": {
        "name": "Fire Lancer",
        "hp": 65,
        "matk": 9,
        "patk": 0,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 10,
        "f": 0,
        "w": 45,
        "g": 45,
        "trainTime": 35,
        "building": 12,
        "id": "1901",
        "class": 6,
        "bonuses": {
            "21": 1,
            "8": 5,
            "16": 4,
            "30": 4,
            "15": 0,
            "23": 0,
            "5": 5
        },
        "armors": {
            "29": 0,
            "1": 0,
            "4": 1,
            "3": 0,
            "31": 0,
            "23": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "fire_ship": {
        "name": "Fire Ship",
        "hp": 120,
        "matk": 0,
        "patk": 3,
        "marm": 2,
        "parm": 4,
        "reload": 0.25,
        "range": 2.5,
        "frame_delay": 0,
        "f": 0,
        "w": 75,
        "g": 45,
        "trainTime": 27,
        "building": 45,
        "id": "529",
        "class": 22,
        "bonuses": {
            "11": 2,
            "16": 0,
            "2": 0,
            "60": 1
        },
        "armors": {
            "16": 0,
            "4": 2,
            "3": 4,
            "31": 0,
            "41": 0
        },
        "requires": {
            "techs": [
                34
            ],
            "buildings": []
        }
    },
    "fishing_ship": {
        "name": "Fishing Ship",
        "hp": 50,
        "matk": 0,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 75,
        "g": 0,
        "trainTime": 40,
        "building": 45,
        "id": "13",
        "class": 21,
        "bonuses": {},
        "armors": {
            "34": 0,
            "4": 1,
            "3": 1,
            "31": 0,
            "16": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "flaming_camel": {
        "name": "Flaming Camel",
        "hp": 55,
        "matk": 20,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 75,
        "w": 0,
        "g": 30,
        "trainTime": 30,
        "building": 49,
        "id": "1263",
        "class": 35,
        "bonuses": {
            "11": 200,
            "8": 50,
            "30": 50,
            "5": 130,
            "20": 25,
            "21": 0
        },
        "armors": {
            "4": 0,
            "3": 0,
            "19": 0,
            "30": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "galleon": {
        "name": "Galleon",
        "hp": 155,
        "matk": 0,
        "patk": 9,
        "marm": 0,
        "parm": 6,
        "reload": 3.0,
        "range": 7.0,
        "frame_delay": 0,
        "f": 0,
        "w": 90,
        "g": 30,
        "trainTime": 27,
        "building": 45,
        "id": "442",
        "class": 22,
        "bonuses": {
            "11": 6,
            "16": 0,
            "17": 3,
            "60": 9
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 6,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [
                35
            ],
            "buildings": []
        }
    },
    "galley": {
        "name": "Galley",
        "hp": 110,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 3,
        "reload": 3.0,
        "range": 5.0,
        "frame_delay": 0,
        "f": 0,
        "w": 90,
        "g": 30,
        "trainTime": 45,
        "building": 45,
        "id": "539",
        "class": 22,
        "bonuses": {
            "11": 6,
            "16": 0,
            "17": 3,
            "60": 5
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 3,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "gbeto": {
        "name": "Gbeto",
        "hp": 40,
        "matk": 0,
        "patk": 10,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 30,
        "f": 50,
        "w": 0,
        "g": 40,
        "trainTime": 17,
        "building": 82,
        "id": "1013",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 0,
            "15": 0,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "genitour": {
        "name": "Genitour",
        "hp": 50,
        "matk": 0,
        "patk": 3,
        "marm": 0,
        "parm": 4,
        "reload": 3.0,
        "range": 4.0,
        "frame_delay": 12,
        "f": 40,
        "w": 35,
        "g": 0,
        "trainTime": 25,
        "building": 87,
        "id": "1010",
        "class": 36,
        "bonuses": {
            "21": 0,
            "17": 0,
            "15": 4,
            "28": 0,
            "27": 3,
            "39": -3,
            "38": 0,
            "35": 2
        },
        "armors": {
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 4,
            "28": 0,
            "19": 0,
            "31": 0,
            "38": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "genoese_crossbowman": {
        "name": "Genoese Crossbowman",
        "hp": 45,
        "matk": 0,
        "patk": 6,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 15,
        "f": 0,
        "w": 45,
        "g": 40,
        "trainTime": 14,
        "building": 82,
        "id": "866",
        "class": 0,
        "bonuses": {
            "8": 5,
            "16": 4,
            "5": 5,
            "21": 0,
            "30": 4
        },
        "armors": {
            "4": 1,
            "3": 0,
            "15": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "ghulam": {
        "name": "Ghulam",
        "hp": 60,
        "matk": 9,
        "patk": 0,
        "marm": 0,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 12,
        "f": 30,
        "w": 0,
        "g": 45,
        "trainTime": 12,
        "building": 82,
        "id": "1747",
        "class": 6,
        "bonuses": {
            "15": 5,
            "21": 2,
            "29": 2,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "grenadier": {
        "name": "Grenadier",
        "hp": 40,
        "matk": 0,
        "patk": 12,
        "marm": 1,
        "parm": 1,
        "reload": 3.450000047683716,
        "range": 6.0,
        "frame_delay": 14,
        "f": 35,
        "w": 0,
        "g": 65,
        "trainTime": 21,
        "building": 87,
        "id": "1911",
        "class": 44,
        "bonuses": {
            "27": 1,
            "21": 4,
            "17": 3,
            "1": 9,
            "32": -9
        },
        "armors": {
            "4": 1,
            "15": 0,
            "3": 1,
            "19": 0,
            "31": 0,
            "23": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "guardsman": {
        "name": "Guardsman",
        "hp": 55,
        "matk": 4,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 3.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 35,
        "w": 25,
        "g": 0,
        "trainTime": 22,
        "building": 12,
        "id": "358",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 1,
            "5": 25,
            "8": 22,
            "16": 16,
            "30": 18,
            "35": 7,
            "15": 0
        },
        "armors": {
            "27": 0,
            "1": 0,
            "4": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "guecha_warrior": {
        "name": "Guecha Warrior",
        "hp": 50,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 3,
        "reload": 3.0,
        "range": 3.0,
        "frame_delay": 25,
        "f": 0,
        "w": 50,
        "g": 60,
        "trainTime": 17,
        "building": 82,
        "id": "2562",
        "class": 0,
        "bonuses": {
            "28": 2,
            "27": 2,
            "21": 0,
            "15": 3,
            "17": 0,
            "1": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 3,
            "31": 0,
            "38": 0,
            "19": 0,
            "40": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "hand_cannoneer": {
        "name": "Hand Cannoneer",
        "hp": 40,
        "matk": 0,
        "patk": 17,
        "marm": 1,
        "parm": 0,
        "reload": 3.450000047683716,
        "range": 7.0,
        "frame_delay": 15,
        "f": 45,
        "w": 0,
        "g": 50,
        "trainTime": 34,
        "building": 87,
        "id": "5",
        "class": 44,
        "bonuses": {
            "27": 1,
            "11": 0,
            "1": 10,
            "17": 2,
            "32": -10
        },
        "armors": {
            "4": 1,
            "15": 0,
            "3": 0,
            "23": 0,
            "31": 0
        },
        "requires": {
            "techs": [
                47
            ],
            "buildings": []
        }
    },
    "heavy_camel_rider": {
        "name": "Heavy Camel Rider",
        "hp": 120,
        "matk": 7,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 20,
        "f": 55,
        "w": 0,
        "g": 60,
        "trainTime": 22,
        "building": 101,
        "id": "330",
        "class": 12,
        "bonuses": {
            "8": 18,
            "16": 9,
            "11": 0,
            "30": 9,
            "21": 0,
            "35": 7,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 0,
            "30": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "heavy_cavalry_archer": {
        "name": "Heavy Cavalry Archer",
        "hp": 60,
        "matk": 0,
        "patk": 7,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 46,
        "f": 0,
        "w": 40,
        "g": 60,
        "trainTime": 30,
        "building": 87,
        "id": "474",
        "class": 36,
        "bonuses": {
            "27": 4,
            "21": 0,
            "17": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "28": 0,
            "4": 1,
            "15": 0,
            "8": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "heavy_demolition_ship": {
        "name": "Heavy Demolition Ship",
        "hp": 70,
        "matk": 120,
        "patk": 0,
        "marm": 2,
        "parm": 0,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 45,
        "g": 80,
        "trainTime": 31,
        "building": 45,
        "id": "528",
        "class": 22,
        "bonuses": {
            "11": 280
        },
        "armors": {
            "16": 0,
            "4": 2,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "heavy_hei_guang_cavalry": {
        "name": "Heavy Hei Guang Cavalry",
        "hp": 90,
        "matk": 12,
        "patk": 0,
        "marm": 4,
        "parm": 3,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 65,
        "trainTime": 28,
        "building": 101,
        "id": "1946",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "1": 1,
            "31": 0
        },
        "armors": {
            "4": 4,
            "8": 0,
            "3": 3,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "heavy_rocket_cart": {
        "name": "Heavy Rocket Cart",
        "hp": 65,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 8,
        "reload": 5.349999904632568,
        "range": 8.0,
        "frame_delay": 1,
        "f": 0,
        "w": 135,
        "g": 155,
        "trainTime": 40,
        "building": 49,
        "id": "1907",
        "class": 13,
        "bonuses": {
            "11": 12,
            "20": 2,
            "37": 5,
            "26": 7,
            "22": 7
        },
        "armors": {
            "4": 0,
            "3": 8,
            "20": 0,
            "31": 0,
            "23": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "heavy_scorpion": {
        "name": "Heavy Scorpion",
        "hp": 60,
        "matk": 0,
        "patk": 14,
        "marm": 1,
        "parm": 8,
        "reload": 3.5999999046325684,
        "range": 7.0,
        "frame_delay": 6,
        "f": 0,
        "w": 75,
        "g": 75,
        "trainTime": 30,
        "building": 49,
        "id": "542",
        "class": 55,
        "bonuses": {
            "11": 6,
            "5": 10,
            "17": 2,
            "1": 2
        },
        "armors": {
            "4": 1,
            "3": 8,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "hei_guang_cavalry": {
        "name": "Hei Guang Cavalry",
        "hp": 60,
        "matk": 11,
        "patk": 0,
        "marm": 4,
        "parm": 3,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 65,
        "trainTime": 28,
        "building": 101,
        "id": "1944",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "1": 0,
            "31": 0
        },
        "armors": {
            "4": 4,
            "8": 0,
            "3": 3,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "hippeus": {
        "name": "Hippeus",
        "hp": 90,
        "matk": 9,
        "patk": 0,
        "marm": 2,
        "parm": 4,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 30,
        "trainTime": 19,
        "building": 82,
        "id": "2107",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 4,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 4,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "hoplite": {
        "name": "Hoplite",
        "hp": 55,
        "matk": 10,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.5,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 30,
        "trainTime": 28,
        "building": 12,
        "id": "2110",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "houfnice": {
        "name": "Houfnice",
        "hp": 90,
        "matk": 0,
        "patk": 50,
        "marm": 2,
        "parm": 6,
        "reload": 6.5,
        "range": 12.0,
        "frame_delay": 7,
        "f": 0,
        "w": 225,
        "g": 225,
        "trainTime": 56,
        "building": 49,
        "id": "1709",
        "class": 13,
        "bonuses": {
            "11": 250,
            "16": 50,
            "20": 20,
            "13": 50,
            "37": 50
        },
        "armors": {
            "4": 2,
            "3": 6,
            "20": 0,
            "23": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "hulk": {
        "name": "Hulk",
        "hp": 90,
        "matk": 4,
        "patk": 0,
        "marm": 4,
        "parm": 1,
        "reload": 1.75,
        "range": 1.0,
        "frame_delay": 0,
        "f": 0,
        "w": 75,
        "g": 35,
        "trainTime": 42,
        "building": 45,
        "id": "2626",
        "class": 22,
        "bonuses": {
            "11": 0,
            "16": 0,
            "21": -3,
            "41": 1
        },
        "armors": {
            "16": 0,
            "4": 4,
            "3": 1
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "huskarl": {
        "name": "Huskarl",
        "hp": 60,
        "matk": 10,
        "patk": 0,
        "marm": 0,
        "parm": 6,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 75,
        "w": 0,
        "g": 35,
        "trainTime": 13,
        "building": 82,
        "id": "41",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "15": 0,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 6,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "hussar": {
        "name": "Hussar",
        "hp": 75,
        "matk": 7,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 10,
        "f": 80,
        "w": 0,
        "g": 0,
        "trainTime": 30,
        "building": 101,
        "id": "441",
        "class": 12,
        "bonuses": {
            "25": 12,
            "11": 0,
            "21": 0,
            "15": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "8": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "hussite_wagon": {
        "name": "Hussite Wagon",
        "hp": 160,
        "matk": 0,
        "patk": 10,
        "marm": 0,
        "parm": 7,
        "reload": 3.450000047683716,
        "range": 6.0,
        "frame_delay": 20,
        "f": 0,
        "w": 110,
        "g": 70,
        "trainTime": 30,
        "building": 82,
        "id": "1704",
        "class": 55,
        "bonuses": {
            "11": 1,
            "17": 3
        },
        "armors": {
            "4": 0,
            "20": 0,
            "3": 7,
            "19": 0,
            "23": 0,
            "31": 0,
            "37": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "ibirapema_warrior": {
        "name": "Ibirapema Warrior",
        "hp": 80,
        "matk": 8,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 30,
        "w": 0,
        "g": 60,
        "trainTime": 24,
        "building": 12,
        "id": "2582",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 1,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "immortal": {
        "name": "Immortal",
        "hp": 50,
        "matk": 10,
        "patk": 0,
        "marm": 0,
        "parm": 3,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 20,
        "trainTime": 12,
        "building": 82,
        "id": "2101",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 0,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "4": 0,
            "3": 3,
            "15": 0,
            "19": 0,
            "31": 0,
            "1": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "imperial_camel_rider": {
        "name": "Imperial Camel Rider",
        "hp": 140,
        "matk": 8,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 20,
        "f": 55,
        "w": 0,
        "g": 60,
        "trainTime": 20,
        "building": 101,
        "id": "207",
        "class": 12,
        "bonuses": {
            "8": 18,
            "16": 9,
            "11": 0,
            "30": 9,
            "21": 0,
            "35": 7,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 0,
            "30": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "imperial_cavalry": {
        "name": "Imperial Cavalry",
        "hp": 160,
        "matk": 14,
        "patk": 0,
        "marm": 2,
        "parm": 3,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 13,
        "f": 60,
        "w": 0,
        "g": 75,
        "trainTime": 30,
        "building": 101,
        "id": "569",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 3,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "imperial_skirmisher": {
        "name": "Imperial Skirmisher",
        "hp": 35,
        "matk": 0,
        "patk": 4,
        "marm": 0,
        "parm": 5,
        "reload": 3.0,
        "range": 5.0,
        "frame_delay": 19,
        "f": 25,
        "w": 35,
        "g": 0,
        "trainTime": 22,
        "building": 87,
        "id": "1155",
        "class": 0,
        "bonuses": {
            "28": 3,
            "27": 4,
            "21": 0,
            "15": 5,
            "17": 0,
            "35": 3
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 5,
            "31": 0,
            "38": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "iron_pagoda": {
        "name": "Iron Pagoda",
        "hp": 115,
        "matk": 12,
        "patk": 0,
        "marm": 1,
        "parm": 3,
        "reload": 2.1500000953674316,
        "range": 0.0,
        "frame_delay": 0,
        "f": 80,
        "w": 0,
        "g": 55,
        "trainTime": 14,
        "building": 82,
        "id": "1908",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "jaguar_warrior": {
        "name": "Jaguar Warrior",
        "hp": 65,
        "matk": 15,
        "patk": 0,
        "marm": 1,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 30,
        "trainTime": 12,
        "building": 82,
        "id": "725",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "1": 5,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "janissary": {
        "name": "Janissary",
        "hp": 35,
        "matk": 0,
        "patk": 17,
        "marm": 1,
        "parm": 0,
        "reload": 3.450000047683716,
        "range": 7.0,
        "frame_delay": 12,
        "f": 60,
        "w": 0,
        "g": 55,
        "trainTime": 21,
        "building": 82,
        "id": "46",
        "class": 44,
        "bonuses": {
            "11": 0,
            "17": 2
        },
        "armors": {
            "4": 1,
            "15": 0,
            "3": 0,
            "19": 0,
            "23": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "jian_swordsman": {
        "name": "Jian Swordsman",
        "hp": 70,
        "matk": 8,
        "patk": 0,
        "marm": 0,
        "parm": 5,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 45,
        "w": 0,
        "g": 50,
        "trainTime": 35,
        "building": 12,
        "id": "1974",
        "class": 6,
        "bonuses": {
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 4
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 5,
            "31": 0,
            "29": 0,
            "19": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "kamayuk": {
        "name": "Kamayuk",
        "hp": 70,
        "matk": 7,
        "patk": 0,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 1.0,
        "frame_delay": 24,
        "f": 60,
        "w": 0,
        "g": 30,
        "trainTime": 10,
        "building": 82,
        "id": "879",
        "class": 6,
        "bonuses": {
            "8": 8,
            "21": 0,
            "30": 6,
            "5": 20,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "karambit_warrior": {
        "name": "Karambit Warrior",
        "hp": 30,
        "matk": 7,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 25,
        "w": 0,
        "g": 15,
        "trainTime": 6,
        "building": 82,
        "id": "1123",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 0,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "keshik": {
        "name": "Keshik",
        "hp": 120,
        "matk": 9,
        "patk": 0,
        "marm": 1,
        "parm": 2,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 40,
        "trainTime": 17,
        "building": 82,
        "id": "1228",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "kipchak": {
        "name": "Kipchak",
        "hp": 40,
        "matk": 0,
        "patk": 4,
        "marm": 0,
        "parm": 0,
        "reload": 2.200000047683716,
        "range": 4.0,
        "frame_delay": 21,
        "f": 0,
        "w": 60,
        "g": 35,
        "trainTime": 20,
        "building": 82,
        "id": "1231",
        "class": 36,
        "bonuses": {
            "27": 1,
            "21": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "28": 0,
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "knight": {
        "name": "Knight",
        "hp": 100,
        "matk": 10,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 13,
        "f": 60,
        "w": 0,
        "g": 75,
        "trainTime": 30,
        "building": 101,
        "id": "38",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "kona": {
        "name": "Kona",
        "hp": 125,
        "matk": 9,
        "patk": 0,
        "marm": 0,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 40,
        "trainTime": 14,
        "building": 82,
        "id": "2566",
        "class": 12,
        "bonuses": {
            "20": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "23": 5
        },
        "armors": {
            "4": 0,
            "3": 3,
            "19": 0,
            "8": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "konnik": {
        "name": "Konnik",
        "hp": 100,
        "matk": 12,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 2.4000000953674316,
        "range": 0.0,
        "frame_delay": 13,
        "f": 60,
        "w": 0,
        "g": 70,
        "trainTime": 16,
        "building": 82,
        "id": "1225",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "laminated_bowman": {
        "name": "Laminated Bowman",
        "hp": 35,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 15,
        "f": 0,
        "w": 25,
        "g": 45,
        "trainTime": 27,
        "building": 87,
        "id": "24",
        "class": 0,
        "bonuses": {
            "27": 3,
            "21": 0,
            "17": 0,
            "13": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "legionary": {
        "name": "Legionary",
        "hp": 75,
        "matk": 12,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 20,
        "trainTime": 21,
        "building": 12,
        "id": "1793",
        "class": 6,
        "bonuses": {
            "29": 8,
            "21": 4,
            "1": 4,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "leitis": {
        "name": "Leitis",
        "hp": 100,
        "matk": 13,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 50,
        "trainTime": 20,
        "building": 82,
        "id": "1234",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "liao_dao": {
        "name": "Liao Dao",
        "hp": 75,
        "matk": 9,
        "patk": 0,
        "marm": 3,
        "parm": 1,
        "reload": 2.4000000953674316,
        "range": 0.0,
        "frame_delay": 0,
        "f": 40,
        "w": 0,
        "g": 40,
        "trainTime": 12,
        "building": 82,
        "id": "1920",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 3,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "light_cavalry": {
        "name": "Light Cavalry",
        "hp": 60,
        "matk": 7,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 10,
        "f": 80,
        "w": 0,
        "g": 0,
        "trainTime": 30,
        "building": 101,
        "id": "546",
        "class": 12,
        "bonuses": {
            "25": 10,
            "11": 0,
            "21": 0,
            "15": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "8": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "liu_bei": {
        "name": "Liu Bei",
        "hp": 425,
        "matk": 15,
        "patk": 0,
        "marm": 3,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 500,
        "w": 0,
        "g": 500,
        "trainTime": 60,
        "building": 82,
        "id": "1966",
        "class": 6,
        "bonuses": {
            "11": 0,
            "29": 3,
            "38": 0,
            "20": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 3,
            "3": 3,
            "31": 0,
            "36": 0,
            "19": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "long_swordsman": {
        "name": "Long Swordsman",
        "hp": 60,
        "matk": 9,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 20,
        "trainTime": 21,
        "building": 12,
        "id": "77",
        "class": 6,
        "bonuses": {
            "29": 6,
            "21": 3,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "longboat": {
        "name": "Longboat",
        "hp": 125,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 3,
        "reload": 3.0,
        "range": 6.0,
        "frame_delay": 0,
        "f": 0,
        "w": 100,
        "g": 50,
        "trainTime": 25,
        "building": 45,
        "id": "250",
        "class": 22,
        "bonuses": {
            "11": 0,
            "16": 0,
            "17": 2,
            "60": 1
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 3,
            "19": 0,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "longbowman": {
        "name": "Longbowman",
        "hp": 35,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 10,
        "f": 0,
        "w": 35,
        "g": 40,
        "trainTime": 18,
        "building": 82,
        "id": "8",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "lou_chuan": {
        "name": "Lou Chuan",
        "hp": 175,
        "matk": 0,
        "patk": 25,
        "marm": 0,
        "parm": 9,
        "reload": 5.5,
        "range": 13.0,
        "frame_delay": 18,
        "f": 0,
        "w": 250,
        "g": 225,
        "trainTime": 60,
        "building": 45,
        "id": "1948",
        "class": 22,
        "bonuses": {
            "11": 230,
            "20": 10
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 9,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "magyar_huszar": {
        "name": "Magyar Huszar",
        "hp": 80,
        "matk": 10,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 35,
        "w": 0,
        "g": 45,
        "trainTime": 12,
        "building": 82,
        "id": "869",
        "class": 12,
        "bonuses": {
            "17": 1,
            "20": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 2,
            "19": 0,
            "8": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "mameluke": {
        "name": "Mameluke",
        "hp": 80,
        "matk": 0,
        "patk": 8,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 3.0,
        "frame_delay": 24,
        "f": 55,
        "w": 0,
        "g": 85,
        "trainTime": 23,
        "building": 82,
        "id": "282",
        "class": 12,
        "bonuses": {
            "11": 0,
            "8": 9,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "35": 0,
            "3": 0,
            "30": 0,
            "19": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "man_at_arms": {
        "name": "Man-at-Arms",
        "hp": 45,
        "matk": 6,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 20,
        "trainTime": 21,
        "building": 12,
        "id": "75",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 1,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "mangonel": {
        "name": "Mangonel",
        "hp": 50,
        "matk": 0,
        "patk": 40,
        "marm": 0,
        "parm": 6,
        "reload": 6.0,
        "range": 7.0,
        "frame_delay": 0,
        "f": 0,
        "w": 160,
        "g": 135,
        "trainTime": 46,
        "building": 49,
        "id": "280",
        "class": 13,
        "bonuses": {
            "11": 35,
            "20": 12,
            "37": 40,
            "25": -1
        },
        "armors": {
            "4": 0,
            "3": 6,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "mangudai": {
        "name": "Mangudai",
        "hp": 60,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 0,
        "reload": 2.0999999046325684,
        "range": 4.0,
        "frame_delay": 23,
        "f": 0,
        "w": 55,
        "g": 65,
        "trainTime": 26,
        "building": 82,
        "id": "11",
        "class": 36,
        "bonuses": {
            "27": 1,
            "21": 0,
            "17": 0,
            "20": 3,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "28": 0,
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "militia": {
        "name": "Militia",
        "hp": 40,
        "matk": 4,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 20,
        "trainTime": 21,
        "building": 12,
        "id": "74",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 0,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 1,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "monaspa": {
        "name": "Monaspa",
        "hp": 70,
        "matk": 12,
        "patk": 0,
        "marm": 3,
        "parm": 2,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 45,
        "trainTime": 14,
        "building": 82,
        "id": "1803",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 3,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "mounted_trebuchet": {
        "name": "Mounted Trebuchet",
        "hp": 75,
        "matk": 0,
        "patk": 30,
        "marm": 2,
        "parm": 4,
        "reload": 6.5,
        "range": 10.0,
        "frame_delay": 21,
        "f": 175,
        "w": 0,
        "g": 175,
        "trainTime": 46,
        "building": 49,
        "id": "1923",
        "class": 12,
        "bonuses": {
            "11": 10,
            "20": 0,
            "37": 30,
            "31": 0
        },
        "armors": {
            "4": 2,
            "3": 4,
            "20": 0,
            "31": 0,
            "19": 0,
            "37": 0,
            "30": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "obuch": {
        "name": "Obuch",
        "hp": 80,
        "matk": 8,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 20,
        "trainTime": 12,
        "building": 82,
        "id": "1701",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 4,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "onager": {
        "name": "Onager",
        "hp": 60,
        "matk": 0,
        "patk": 50,
        "marm": 0,
        "parm": 7,
        "reload": 6.0,
        "range": 8.0,
        "frame_delay": 0,
        "f": 0,
        "w": 160,
        "g": 135,
        "trainTime": 46,
        "building": 49,
        "id": "550",
        "class": 13,
        "bonuses": {
            "11": 45,
            "20": 12,
            "37": 50
        },
        "armors": {
            "4": 0,
            "3": 7,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "organ_gun": {
        "name": "Organ Gun",
        "hp": 50,
        "matk": 0,
        "patk": 6,
        "marm": 2,
        "parm": 4,
        "reload": 3.450000047683716,
        "range": 7.0,
        "frame_delay": 12,
        "f": 0,
        "w": 80,
        "g": 70,
        "trainTime": 25,
        "building": 82,
        "id": "1001",
        "class": 13,
        "bonuses": {
            "1": 2,
            "11": 0,
            "17": 1,
            "38": 2,
            "32": -2
        },
        "armors": {
            "4": 2,
            "20": 0,
            "3": 4,
            "19": 0,
            "23": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "palintonon_packed": {
        "name": "Palintonon (Packed)",
        "hp": 150,
        "matk": 0,
        "patk": 200,
        "marm": 2,
        "parm": 8,
        "reload": 10.0,
        "range": 16.0,
        "frame_delay": 0,
        "f": 0,
        "w": 200,
        "g": 200,
        "trainTime": 50,
        "building": 82,
        "id": "331",
        "class": 51,
        "bonuses": {
            "11": 250
        },
        "armors": {
            "4": 2,
            "3": 8,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "pattiyodha_longbowman": {
        "name": "Pattiyodha Longbowman",
        "hp": 50,
        "matk": 0,
        "patk": 7,
        "marm": 0,
        "parm": 0,
        "reload": 2.200000047683716,
        "range": 4.0,
        "frame_delay": 19,
        "f": 0,
        "w": 60,
        "g": 35,
        "trainTime": 16,
        "building": 82,
        "id": "2388",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "17": 0,
            "5": 4
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "petard": {
        "name": "Petard",
        "hp": 50,
        "matk": 25,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 20,
        "trainTime": 25,
        "building": 82,
        "id": "440",
        "class": 35,
        "bonuses": {
            "26": 100,
            "11": 500,
            "20": 60,
            "22": 900
        },
        "armors": {
            "4": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "phalangite": {
        "name": "Phalangite",
        "hp": 50,
        "matk": 0,
        "patk": 6,
        "marm": 1,
        "parm": 0,
        "reload": 2.5,
        "range": 1.7999999523162842,
        "frame_delay": 19,
        "f": 50,
        "w": 0,
        "g": 40,
        "trainTime": 19,
        "building": 12,
        "id": "2384",
        "class": 6,
        "bonuses": {
            "8": 6,
            "21": 0,
            "30": 4,
            "5": 20
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "plumed_archer": {
        "name": "Plumed Archer",
        "hp": 50,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 1,
        "reload": 1.899999976158142,
        "range": 4.0,
        "frame_delay": 15,
        "f": 0,
        "w": 55,
        "g": 55,
        "trainTime": 16,
        "building": 82,
        "id": "763",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "1": 1,
            "17": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "ratha": {
        "name": "Ratha",
        "hp": 100,
        "matk": 0,
        "patk": 5,
        "marm": 3,
        "parm": 1,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 14,
        "f": 0,
        "w": 60,
        "g": 60,
        "trainTime": 20,
        "building": 82,
        "id": "1759",
        "class": 36,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "27": 1,
            "39": -3,
            "38": 0
        },
        "armors": {
            "4": 3,
            "8": 0,
            "3": 1,
            "15": 0,
            "19": 0,
            "28": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "rattan_archer": {
        "name": "Rattan Archer",
        "hp": 40,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 4,
        "reload": 2.0,
        "range": 4.0,
        "frame_delay": 23,
        "f": 0,
        "w": 50,
        "g": 45,
        "trainTime": 16,
        "building": 82,
        "id": "1129",
        "class": 0,
        "bonuses": {
            "27": 2,
            "21": 0,
            "17": 0,
            "1": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 4,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "recurve_bowman": {
        "name": "Recurve Bowman",
        "hp": 40,
        "matk": 0,
        "patk": 6,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 20,
        "f": 0,
        "w": 25,
        "g": 45,
        "trainTime": 27,
        "building": 87,
        "id": "492",
        "class": 0,
        "bonuses": {
            "27": 3,
            "21": 0,
            "17": 0,
            "13": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "rhomphaia_warrior": {
        "name": "Rhomphaia Warrior",
        "hp": 60,
        "matk": 8,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 40,
        "trainTime": 13,
        "building": 82,
        "id": "2386",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 6,
            "8": 14,
            "30": 12
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "rocket_cart": {
        "name": "Rocket Cart",
        "hp": 45,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 6,
        "reload": 5.5,
        "range": 7.0,
        "frame_delay": 1,
        "f": 0,
        "w": 135,
        "g": 155,
        "trainTime": 40,
        "building": 49,
        "id": "1904",
        "class": 13,
        "bonuses": {
            "11": 7,
            "20": 2,
            "37": 5,
            "26": 7,
            "22": 6
        },
        "armors": {
            "4": 0,
            "3": 6,
            "20": 0,
            "31": 0,
            "23": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "samurai": {
        "name": "Samurai",
        "hp": 70,
        "matk": 10,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 45,
        "w": 0,
        "g": 30,
        "trainTime": 9,
        "building": 82,
        "id": "291",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "19": 10,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "sannahya": {
        "name": "Sannahya",
        "hp": 300,
        "matk": 10,
        "patk": 0,
        "marm": 1,
        "parm": 3,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 90,
        "w": 0,
        "g": 80,
        "trainTime": 26,
        "building": 101,
        "id": "2390",
        "class": 12,
        "bonuses": {
            "21": 0,
            "13": 4,
            "15": 0,
            "38": 0,
            "39": -3,
            "20": 0
        },
        "armors": {
            "5": 0,
            "4": 1,
            "8": 0,
            "3": 3,
            "31": 0,
            "19": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "savar": {
        "name": "Savar",
        "hp": 145,
        "matk": 14,
        "patk": 0,
        "marm": 3,
        "parm": 4,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 13,
        "f": 60,
        "w": 0,
        "g": 75,
        "trainTime": 30,
        "building": 101,
        "id": "1813",
        "class": 12,
        "bonuses": {
            "15": 2,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 3,
            "8": 0,
            "3": 4,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "scorpion": {
        "name": "Scorpion",
        "hp": 40,
        "matk": 0,
        "patk": 11,
        "marm": 0,
        "parm": 7,
        "reload": 3.5999999046325684,
        "range": 7.0,
        "frame_delay": 12,
        "f": 0,
        "w": 75,
        "g": 75,
        "trainTime": 30,
        "building": 49,
        "id": "279",
        "class": 55,
        "bonuses": {
            "11": 3,
            "5": 7,
            "17": 1,
            "1": 1
        },
        "armors": {
            "4": 0,
            "3": 7,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "scout_cavalry": {
        "name": "Scout Cavalry",
        "hp": 45,
        "matk": 3,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 12,
        "f": 80,
        "w": 0,
        "g": 0,
        "trainTime": 30,
        "building": 101,
        "id": "448",
        "class": 47,
        "bonuses": {
            "25": 6,
            "11": 0,
            "21": 0,
            "15": 0,
            "38": 0,
            "39": -3,
            "20": 0
        },
        "armors": {
            "4": 0,
            "8": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "serjeant": {
        "name": "Serjeant",
        "hp": 50,
        "matk": 5,
        "patk": 0,
        "marm": 2,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 25,
        "trainTime": 12,
        "building": 82,
        "id": "1658",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 2,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "shock_cavalry": {
        "name": "Shock Cavalry",
        "hp": 120,
        "matk": 12,
        "patk": 0,
        "marm": 2,
        "parm": 2,
        "reload": 1.7999999523162842,
        "range": 0.0,
        "frame_delay": 26,
        "f": 60,
        "w": 0,
        "g": 75,
        "trainTime": 30,
        "building": 101,
        "id": "283",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 2,
            "8": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "shotel_warrior": {
        "name": "Shotel Warrior",
        "hp": 45,
        "matk": 16,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 30,
        "trainTime": 8,
        "building": 82,
        "id": "1016",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 0,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 0,
            "19": 0,
            "31": 0,
            "39": -3
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "shrivamsha_rider": {
        "name": "Shrivamsha Rider",
        "hp": 55,
        "matk": 8,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 30,
        "trainTime": 20,
        "building": 101,
        "id": "1751",
        "class": 12,
        "bonuses": {
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 1,
            "8": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "siege_ballista": {
        "name": "Siege Ballista",
        "hp": 80,
        "matk": 0,
        "patk": 40,
        "marm": 2,
        "parm": 5,
        "reload": 6.5,
        "range": 12.0,
        "frame_delay": 7,
        "f": 0,
        "w": 225,
        "g": 225,
        "trainTime": 56,
        "building": 49,
        "id": "36",
        "class": 13,
        "bonuses": {
            "11": 200,
            "16": 40,
            "20": 20,
            "13": 40,
            "37": 40
        },
        "armors": {
            "4": 2,
            "3": 5,
            "20": 0,
            "23": 0,
            "31": 0
        },
        "requires": {
            "techs": [
                47
            ],
            "buildings": []
        }
    },
    "siege_elephant": {
        "name": "Siege Elephant",
        "hp": 220,
        "matk": 4,
        "patk": 0,
        "marm": -2,
        "parm": 150,
        "reload": 3.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 120,
        "w": 0,
        "g": 95,
        "trainTime": 36,
        "building": 49,
        "id": "1746",
        "class": 12,
        "bonuses": {
            "11": 105,
            "20": 0,
            "21": 0,
            "38": 0,
            "39": -3
        },
        "armors": {
            "5": 20,
            "4": -2,
            "8": 10,
            "20": 0,
            "17": 0,
            "3": 150,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "siege_onager": {
        "name": "Siege Onager",
        "hp": 70,
        "matk": 0,
        "patk": 75,
        "marm": 0,
        "parm": 8,
        "reload": 6.0,
        "range": 8.0,
        "frame_delay": 0,
        "f": 0,
        "w": 160,
        "g": 135,
        "trainTime": 46,
        "building": 49,
        "id": "588",
        "class": 13,
        "bonuses": {
            "11": 60,
            "20": 12,
            "37": 50
        },
        "armors": {
            "4": 0,
            "3": 8,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "siege_ram": {
        "name": "Siege Ram",
        "hp": 270,
        "matk": 4,
        "patk": 0,
        "marm": -1,
        "parm": 195,
        "reload": 5.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 160,
        "g": 75,
        "trainTime": 36,
        "building": 49,
        "id": "548",
        "class": 13,
        "bonuses": {
            "11": 200,
            "20": 65
        },
        "armors": {
            "4": -1,
            "3": 195,
            "17": 2,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "siege_tower": {
        "name": "Siege Tower",
        "hp": 175,
        "matk": 0,
        "patk": 0,
        "marm": -2,
        "parm": 100,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 100,
        "g": 120,
        "trainTime": 36,
        "building": 49,
        "id": "1105",
        "class": 13,
        "bonuses": {},
        "armors": {
            "4": -2,
            "3": 100,
            "17": 0,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "skirmisher": {
        "name": "Skirmisher",
        "hp": 30,
        "matk": 0,
        "patk": 2,
        "marm": 0,
        "parm": 3,
        "reload": 3.0,
        "range": 4.0,
        "frame_delay": 19,
        "f": 25,
        "w": 35,
        "g": 0,
        "trainTime": 26,
        "building": 87,
        "id": "7",
        "class": 0,
        "bonuses": {
            "28": 0,
            "27": 3,
            "21": 0,
            "15": 3,
            "17": 0,
            "35": 2
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 3,
            "31": 0,
            "38": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "slinger": {
        "name": "Slinger",
        "hp": 35,
        "matk": 0,
        "patk": 4,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 5.0,
        "frame_delay": 14,
        "f": 70,
        "w": 10,
        "g": 0,
        "trainTime": 25,
        "building": 87,
        "id": "185",
        "class": 0,
        "bonuses": {
            "1": 4,
            "27": 1,
            "25": 4,
            "20": 3,
            "21": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "3": 0,
            "31": 0,
            "38": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "spearman": {
        "name": "Spearman",
        "hp": 45,
        "matk": 3,
        "patk": 0,
        "marm": 0,
        "parm": 0,
        "reload": 3.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 35,
        "w": 25,
        "g": 0,
        "trainTime": 22,
        "building": 12,
        "id": "93",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 1,
            "5": 15,
            "8": 15,
            "16": 9,
            "30": 12,
            "35": 0,
            "15": 0
        },
        "armors": {
            "27": 0,
            "1": 0,
            "4": 0,
            "3": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "steppe_lancer": {
        "name": "Steppe Lancer",
        "hp": 60,
        "matk": 9,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 1.0,
        "frame_delay": 13,
        "f": 70,
        "w": 0,
        "g": 40,
        "trainTime": 24,
        "building": 101,
        "id": "1370",
        "class": 12,
        "bonuses": {
            "20": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 0,
            "3": 1,
            "8": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "strategos": {
        "name": "Strategos",
        "hp": 60,
        "matk": 15,
        "patk": 0,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 55,
        "w": 0,
        "g": 25,
        "trainTime": 16,
        "building": 82,
        "id": "2104",
        "class": 6,
        "bonuses": {
            "29": 0,
            "21": 0,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "sun_jian": {
        "name": "Sun Jian",
        "hp": 400,
        "matk": 15,
        "patk": 0,
        "marm": 4,
        "parm": 4,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 500,
        "w": 0,
        "g": 500,
        "trainTime": 60,
        "building": 82,
        "id": "1978",
        "class": 12,
        "bonuses": {
            "11": 0,
            "15": 0,
            "38": 0,
            "39": -3,
            "20": 0
        },
        "armors": {
            "8": 0,
            "4": 4,
            "3": 4,
            "31": 0,
            "36": 0,
            "19": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "tarkan": {
        "name": "Tarkan",
        "hp": 100,
        "matk": 8,
        "patk": 0,
        "marm": 1,
        "parm": 3,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 60,
        "trainTime": 14,
        "building": 82,
        "id": "755",
        "class": 12,
        "bonuses": {
            "26": 10,
            "11": 8,
            "15": 0,
            "13": 12,
            "22": 8,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 3,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "temple_guard": {
        "name": "Temple Guard",
        "hp": 100,
        "matk": 12,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 80,
        "w": 0,
        "g": 45,
        "trainTime": 28,
        "building": 12,
        "id": "2586",
        "class": 6,
        "bonuses": {
            "8": 3,
            "30": 2,
            "5": 3,
            "16": 2,
            "21": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "19": 0,
            "31": 0,
            "29": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "teutonic_knight": {
        "name": "Teutonic Knight",
        "hp": 90,
        "matk": 14,
        "patk": 0,
        "marm": 7,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 85,
        "w": 0,
        "g": 30,
        "trainTime": 12,
        "building": 82,
        "id": "25",
        "class": 6,
        "bonuses": {
            "29": 4,
            "21": 4,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 7,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "thirisadai": {
        "name": "Thirisadai",
        "hp": 250,
        "matk": 0,
        "patk": 10,
        "marm": 2,
        "parm": 11,
        "reload": 3.450000047683716,
        "range": 7.0,
        "frame_delay": 0,
        "f": 0,
        "w": 180,
        "g": 60,
        "trainTime": 40,
        "building": 45,
        "id": "1750",
        "class": 22,
        "bonuses": {
            "11": 7,
            "16": 0,
            "17": 4,
            "60": 7
        },
        "armors": {
            "16": 0,
            "2": 0,
            "4": 2,
            "3": 11,
            "19": 0,
            "31": 0,
            "60": 5
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "throwing_axeman": {
        "name": "Throwing Axeman",
        "hp": 60,
        "matk": 0,
        "patk": 7,
        "marm": 0,
        "parm": 0,
        "reload": 2.0,
        "range": 3.0,
        "frame_delay": 28,
        "f": 55,
        "w": 0,
        "g": 25,
        "trainTime": 13,
        "building": 82,
        "id": "281",
        "class": 6,
        "bonuses": {
            "29": 1,
            "21": 1,
            "15": 0,
            "8": 0,
            "30": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "tiger_cavalry": {
        "name": "Tiger Cavalry",
        "hp": 115,
        "matk": 11,
        "patk": 0,
        "marm": 0,
        "parm": 4,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 80,
        "trainTime": 15,
        "building": 82,
        "id": "1949",
        "class": 12,
        "bonuses": {
            "15": 6,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 0,
            "8": 0,
            "3": 4,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "traction_trebuchet": {
        "name": "Traction Trebuchet",
        "hp": 115,
        "matk": 0,
        "patk": 50,
        "marm": 1,
        "parm": 8,
        "reload": 11.0,
        "range": 14.0,
        "frame_delay": 20,
        "f": 0,
        "w": 175,
        "g": 210,
        "trainTime": 70,
        "building": 49,
        "id": "1942",
        "class": 13,
        "bonuses": {
            "11": 230,
            "20": 0,
            "37": 0
        },
        "armors": {
            "4": 1,
            "3": 8,
            "17": 0,
            "20": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "trade_cog": {
        "name": "Trade Cog",
        "hp": 80,
        "matk": 0,
        "patk": 0,
        "marm": 0,
        "parm": 6,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 100,
        "g": 50,
        "trainTime": 36,
        "building": 45,
        "id": "17",
        "class": 2,
        "bonuses": {},
        "armors": {
            "16": 0,
            "4": 0,
            "3": 6,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "transport_ship": {
        "name": "Transport Ship",
        "hp": 70,
        "matk": 0,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 0.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 125,
        "g": 0,
        "trainTime": 46,
        "building": 45,
        "id": "545",
        "class": 20,
        "bonuses": {},
        "armors": {
            "16": 0,
            "4": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "turtle_ship": {
        "name": "Turtle Ship",
        "hp": 275,
        "matk": 0,
        "patk": 9,
        "marm": 2,
        "parm": 7,
        "reload": 2.0,
        "range": 6.0,
        "frame_delay": 1,
        "f": 0,
        "w": 190,
        "g": 130,
        "trainTime": 50,
        "building": 45,
        "id": "831",
        "class": 22,
        "bonuses": {
            "11": 7,
            "20": 2,
            "37": 2,
            "26": 7,
            "22": 6,
            "16": 0
        },
        "armors": {
            "16": 0,
            "2": 0,
            "4": 2,
            "3": 7,
            "23": 0,
            "19": 0,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "two_handed_swordsman": {
        "name": "Two-Handed Swordsman",
        "hp": 65,
        "matk": 12,
        "patk": 0,
        "marm": 1,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 50,
        "w": 0,
        "g": 20,
        "trainTime": 21,
        "building": 12,
        "id": "473",
        "class": 6,
        "bonuses": {
            "29": 8,
            "21": 4,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 1,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "urumi_swordsman": {
        "name": "Urumi Swordsman",
        "hp": 55,
        "matk": 9,
        "patk": 0,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 65,
        "w": 0,
        "g": 20,
        "trainTime": 9,
        "building": 82,
        "id": "1735",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 1,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 1,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "war_chariot": {
        "name": "War Chariot",
        "hp": 65,
        "matk": 0,
        "patk": 8,
        "marm": 0,
        "parm": 5,
        "reload": 6.5,
        "range": 6.0,
        "frame_delay": 3,
        "f": 65,
        "w": 0,
        "g": 90,
        "trainTime": 28,
        "building": 49,
        "id": "1962",
        "class": 12,
        "bonuses": {
            "11": 2,
            "21": 0,
            "27": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 0,
            "8": 0,
            "3": 5,
            "20": 0,
            "19": 0,
            "31": 0,
            "37": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "war_chariot_2150": {
        "name": "War Chariot",
        "hp": 100,
        "matk": 8,
        "patk": 0,
        "marm": 1,
        "parm": 0,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 0,
        "w": 65,
        "g": 65,
        "trainTime": 24,
        "building": 101,
        "id": "2150",
        "class": 12,
        "bonuses": {
            "1": 5,
            "15": 0,
            "11": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "31": 0
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "war_elephant": {
        "name": "War Elephant",
        "hp": 450,
        "matk": 15,
        "patk": 0,
        "marm": 1,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 170,
        "w": 0,
        "g": 85,
        "trainTime": 25,
        "building": 82,
        "id": "239",
        "class": 12,
        "bonuses": {
            "11": 30,
            "13": 30,
            "15": 0,
            "21": 0,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "5": 0,
            "4": 1,
            "8": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "war_galley": {
        "name": "War Galley",
        "hp": 125,
        "matk": 0,
        "patk": 7,
        "marm": 0,
        "parm": 4,
        "reload": 3.0,
        "range": 6.0,
        "frame_delay": 0,
        "f": 0,
        "w": 90,
        "g": 30,
        "trainTime": 27,
        "building": 45,
        "id": "21",
        "class": 22,
        "bonuses": {
            "11": 6,
            "16": 0,
            "17": 3,
            "60": 5
        },
        "armors": {
            "16": 0,
            "4": 0,
            "3": 4,
            "31": 0,
            "60": 0
        },
        "requires": {
            "techs": [
                34
            ],
            "buildings": []
        }
    },
    "war_hulk": {
        "name": "War Hulk",
        "hp": 115,
        "matk": 4,
        "patk": 0,
        "marm": 5,
        "parm": 1,
        "reload": 1.5,
        "range": 1.0,
        "frame_delay": 0,
        "f": 0,
        "w": 75,
        "g": 35,
        "trainTime": 27,
        "building": 45,
        "id": "2627",
        "class": 22,
        "bonuses": {
            "11": 0,
            "16": 0,
            "21": -3,
            "41": 1
        },
        "armors": {
            "16": 0,
            "4": 5,
            "3": 1
        },
        "requires": {
            "techs": [
                34
            ],
            "buildings": []
        }
    },
    "war_wagon": {
        "name": "War Wagon",
        "hp": 150,
        "matk": 0,
        "patk": 9,
        "marm": 0,
        "parm": 2,
        "reload": 2.5,
        "range": 4.0,
        "frame_delay": 32,
        "f": 0,
        "w": 200,
        "g": 60,
        "trainTime": 21,
        "building": 82,
        "id": "827",
        "class": 36,
        "bonuses": {
            "21": 2,
            "27": 0,
            "39": -3,
            "15": 0,
            "38": 0
        },
        "armors": {
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 2,
            "19": 0,
            "28": -1,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "white_feather_guard": {
        "name": "White Feather Guard",
        "hp": 95,
        "matk": 7,
        "patk": 0,
        "marm": 0,
        "parm": 2,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 60,
        "w": 0,
        "g": 15,
        "trainTime": 11,
        "building": 82,
        "id": "1959",
        "class": 6,
        "bonuses": {
            "29": 4,
            "21": 2,
            "8": 8,
            "30": 6,
            "5": 8,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 2,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "winged_hussar": {
        "name": "Winged Hussar",
        "hp": 80,
        "matk": 9,
        "patk": 0,
        "marm": 1,
        "parm": 2,
        "reload": 1.899999976158142,
        "range": 0.0,
        "frame_delay": 10,
        "f": 80,
        "w": 0,
        "g": 0,
        "trainTime": 30,
        "building": 101,
        "id": "1707",
        "class": 12,
        "bonuses": {
            "25": 14,
            "11": 0,
            "21": 0,
            "15": 0,
            "23": 4,
            "38": 0,
            "39": -3,
            "20": 0,
            "31": 0
        },
        "armors": {
            "4": 1,
            "8": 0,
            "3": 2,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "woad_raider": {
        "name": "Woad Raider",
        "hp": 70,
        "matk": 11,
        "patk": 0,
        "marm": 0,
        "parm": 1,
        "reload": 2.0,
        "range": 0.0,
        "frame_delay": 0,
        "f": 70,
        "w": 0,
        "g": 25,
        "trainTime": 10,
        "building": 82,
        "id": "232",
        "class": 6,
        "bonuses": {
            "29": 2,
            "21": 2,
            "8": 0,
            "30": 0,
            "15": 0
        },
        "armors": {
            "1": 0,
            "4": 0,
            "3": 1,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "xianbei_raider": {
        "name": "Xianbei Raider",
        "hp": 30,
        "matk": 0,
        "patk": 5,
        "marm": 0,
        "parm": 0,
        "reload": 1.7999999523162842,
        "range": 4.0,
        "frame_delay": 35,
        "f": 0,
        "w": 65,
        "g": 25,
        "trainTime": 29,
        "building": 87,
        "id": "1952",
        "class": 36,
        "bonuses": {
            "27": 3,
            "21": 0,
            "17": 0,
            "39": -3,
            "15": 0,
            "1": 1
        },
        "armors": {
            "28": 0,
            "4": 0,
            "15": 0,
            "8": 0,
            "3": 0,
            "19": 0,
            "31": 0
        },
        "requires": {
            "techs": [],
            "buildings": []
        }
    }
};