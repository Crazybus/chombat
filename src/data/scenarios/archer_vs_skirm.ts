export const archer_vs_skirm = {
    "name": "Archer vs Skirm",
    "desc": "Switching into skirmishers to counter an existing archer mass",
    "a": {
        "ps": "archer",
        "nm": "Archer",
        "c": 10,
        "age": "2",
        "tl": [
            {
                "t": "building",
                "n": "Archery Range",
                "d": 50,
                "c": 1,
                "co": 175,
                "prod": true,
                "i": "archery_range"
            },
            {
                "t": "production",
                "n": "Initial Production",
                "d": 0,
                "c": 1,
                "co": 0,
                "tr": 35
            }
        ],
        "bn": [
            {
                "i": "199",
                "e": [
                    true,
                    false,
                    true
                ]
            },
            {
                "i": "211",
                "e": [
                    true,
                    true
                ]
            }
        ]
    },
    "b": {
        "ps": "skirmisher",
        "nm": "Skirmisher",
        "c": 6,
        "age": "2",
        "tl": [
            {
                "t": "building",
                "n": "Archery Range",
                "d": 50,
                "c": 1,
                "co": 175,
                "prod": true,
                "i": "archery_range"
            },
            {
                "t": "production",
                "n": "Initial Production",
                "d": 200,
                "c": 1,
                "co": 0,
                "b": true,
                "tr": 26
            }
        ],
        "bn": [
            {
                "i": "199",
                "e": [
                    true,
                    false,
                    true
                ]
            },
            {
                "i": "211",
                "e": [
                    true,
                    true
                ]
            }
        ]
    }
};
