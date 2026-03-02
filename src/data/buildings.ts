import { BuildingData } from '../sim/types';

export const buildings: Record<string, BuildingData> = {
    "archery_range": {
        "name": "Archery Range",
        "f": 0,
        "w": 175,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "87",
        "age": 2,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "barracks": {
        "name": "Barracks",
        "f": 0,
        "w": 175,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "12",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "blacksmith": {
        "name": "Blacksmith",
        "f": 0,
        "w": 150,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "103",
        "age": 2,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "bombard_tower": {
        "name": "Bombard Tower",
        "f": 0,
        "w": 0,
        "g": 100,
        "s": 125,
        "time": 50,
        "id": "236",
        "age": 4,
        "requires": {
            "techs": [
                64
            ],
            "buildings": []
        }
    },
    "castle": {
        "name": "Castle",
        "f": 0,
        "w": 0,
        "g": 0,
        "s": 650,
        "time": 50,
        "id": "82",
        "age": 3,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "dock": {
        "name": "Dock",
        "f": 0,
        "w": 150,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "45",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "farm": {
        "name": "Farm",
        "f": 0,
        "w": 60,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "50",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "fish_trap": {
        "name": "Fish Trap",
        "f": 0,
        "w": 100,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "199",
        "age": 2,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "fortified_wall": {
        "name": "Fortified Wall",
        "f": 0,
        "w": 0,
        "g": 0,
        "s": 5,
        "time": 50,
        "id": "155",
        "age": 3,
        "requires": {
            "techs": [
                194
            ],
            "buildings": []
        }
    },
    "gate": {
        "name": "Gate",
        "f": 0,
        "w": 0,
        "g": 0,
        "s": 30,
        "time": 50,
        "id": "487",
        "age": 2,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "guard_tower": {
        "name": "Guard Tower",
        "f": 0,
        "w": 35,
        "g": 0,
        "s": 125,
        "time": 50,
        "id": "234",
        "age": 3,
        "requires": {
            "techs": [
                140
            ],
            "buildings": []
        }
    },
    "house": {
        "name": "House",
        "f": 0,
        "w": 25,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "70",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "keep": {
        "name": "Keep",
        "f": 0,
        "w": 35,
        "g": 0,
        "s": 125,
        "time": 50,
        "id": "235",
        "age": 4,
        "requires": {
            "techs": [
                63
            ],
            "buildings": []
        }
    },
    "lumber_camp": {
        "name": "Lumber Camp",
        "f": 0,
        "w": 100,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "562",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "market": {
        "name": "Market",
        "f": 0,
        "w": 175,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "84",
        "age": 2,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "mill": {
        "name": "Mill",
        "f": 0,
        "w": 100,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "68",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "mining_camp": {
        "name": "Mining Camp",
        "f": 0,
        "w": 100,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "584",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "monastery": {
        "name": "Monastery",
        "f": 0,
        "w": 175,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "104",
        "age": 3,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "outpost": {
        "name": "Outpost",
        "f": 0,
        "w": 25,
        "g": 0,
        "s": 5,
        "time": 50,
        "id": "598",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "palisade_gate": {
        "name": "Palisade Gate",
        "f": 0,
        "w": 30,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "792",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "palisade_wall": {
        "name": "Palisade Wall",
        "f": 0,
        "w": 3,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "72",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "siege_workshop": {
        "name": "Siege Workshop",
        "f": 0,
        "w": 200,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "49",
        "age": 3,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "stable": {
        "name": "Stable",
        "f": 0,
        "w": 175,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "101",
        "age": 2,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "stone_wall": {
        "name": "Stone Wall",
        "f": 0,
        "w": 0,
        "g": 0,
        "s": 5,
        "time": 50,
        "id": "117",
        "age": 2,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "town_center": {
        "name": "Town Center",
        "f": 0,
        "w": 275,
        "g": 0,
        "s": 100,
        "time": 50,
        "id": "109",
        "age": 1,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "town_center_621": {
        "name": "Town Center",
        "f": 0,
        "w": 275,
        "g": 0,
        "s": 100,
        "time": 50,
        "id": "621",
        "age": 3,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "university": {
        "name": "University",
        "f": 0,
        "w": 200,
        "g": 0,
        "s": 0,
        "time": 50,
        "id": "209",
        "age": 3,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "watch_tower": {
        "name": "Watch Tower",
        "f": 0,
        "w": 35,
        "g": 0,
        "s": 125,
        "time": 50,
        "id": "79",
        "age": 2,
        "requires": {
            "techs": [],
            "buildings": []
        }
    },
    "wonder": {
        "name": "Wonder",
        "f": 0,
        "w": 1000,
        "g": 1000,
        "s": 1000,
        "time": 50,
        "id": "276",
        "age": 4,
        "requires": {
            "techs": [],
            "buildings": []
        }
    }
};