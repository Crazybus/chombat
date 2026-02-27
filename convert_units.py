#!/usr/bin/env python3
import json
import os
from genieutils.datfile import DatFile

# Mapping for well-known techs (for the shortcuts UI)
TECH_MAP = {
    "Forging": 67, "Iron Casting": 68, "Blast Furnace": 75,
    "Scale Mail Armor": 74, "Chain Mail Armor": 76, "Plate Mail Armor": 77,
    "Scale Barding Armor": 81, "Chain Barding Armor": 82, "Plate Barding Armor": 80,
    "Fletching": 199, "Bodkin Arrow": 200, "Bracer": 201,
    "Padded Archer Armor": 211, "Leather Archer Armor": 212, "Ring Archer Armor": 219,
    "Bloodlines": 435, "Thumb Ring": 437, "Ballistics": 93, "Chemistry": 47, "Husbandry": 39,
    "Feudal Age": 102, "Castle Age": 101, "Imperial Age": 103
}

STANDARD_BUILDINGS = {12, 10, 87, 101, 45, 82, 30, 49, 1251, 1665}

RES_FOOD = 0
RES_WOOD = 1
RES_STONE = 2
RES_GOLD = 3
ARM_PIERCE = 3

def get_cost(resource_costs):
    cost = {"f": 0, "w": 0, "g": 0, "s": 0}
    for c in resource_costs:
        if c.type == RES_FOOD: cost["f"] = int(c.amount)
        elif c.type == RES_WOOD: cost["w"] = int(c.amount)
        elif c.type == RES_GOLD: cost["g"] = int(c.amount)
        elif c.type == RES_STONE: cost["s"] = int(c.amount)
    return cost

def clean_key(name):
    return name.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_').replace('.', '').replace("'", '').replace('/', '_')

def load_extra_data():
    dir_path = 'dat/CivTechTrees'
    if not os.path.exists(dir_path):
        dir_path = 'chombat/dat/CivTechTrees'
    
    unit_names = {}
    tech_names = {}
    building_names = {}
    valid_unit_ids = set()
    valid_tech_ids = set()
    valid_building_ids = set()
    prereqs = {}
    
    if os.path.exists(dir_path):
        for filename in sorted(os.listdir(dir_path)):
            if filename.endswith('.json'):
                with open(os.path.join(dir_path, filename), 'r') as f:
                    try:
                        data = json.load(f)
                        for key in ['civ_techs_buildings', 'civ_techs_units']:
                            for node in data.get(key, []):
                                node_id = str(node.get('Node ID'))
                                name = node.get('Name')
                                ntype = node.get('Node Type')
                                
                                is_unit = ntype in ['Unit', 'UnitUpgrade', 'UniqueUnit', 'RegionalUnit']
                                is_tech = ntype in ['Research']
                                is_building = ntype in ['BuildingTech', 'BuildingNonTech']
                                
                                if node_id and name:
                                    if is_unit:
                                        valid_unit_ids.add(node_id)
                                        if node_id not in unit_names or len(name) > len(unit_names[node_id]): unit_names[node_id] = name
                                    elif is_tech:
                                        valid_tech_ids.add(node_id)
                                        if node_id not in tech_names or len(name) > len(tech_names[node_id]): tech_names[node_id] = name
                                    elif is_building:
                                        valid_building_ids.add(node_id)
                                        if node_id not in building_names or len(name) > len(building_names[node_id]): building_names[node_id] = name
                                
                                # Prereqs
                                p_ids = node.get('Prerequisite IDs', [])
                                p_types = node.get('Prerequisite Types', [])
                                if node_id not in prereqs: prereqs[node_id] = {'techs': [], 'buildings': []}
                                for pid, ptype in zip(p_ids, p_types):
                                    if pid <= 0: continue
                                    if ptype == 'Tech':
                                        if pid not in prereqs[node_id]['techs']: prereqs[node_id]['techs'].append(pid)
                                    elif ptype in ['Building', 'BuildingTech']:
                                        if pid not in prereqs[node_id]['buildings']: prereqs[node_id]['buildings'].append(pid)
                    except Exception as e:
                        print(f"Error reading {filename}: {e}")
    return unit_names, tech_names, building_names, valid_unit_ids, valid_tech_ids, valid_building_ids, prereqs

def convert():
    dat_path = 'dat/empires2_x2_p1.dat'
    if not os.path.exists(dat_path):
        dat_path = 'chombat/dat/empires2_x2_p1.dat'

    print(f"Loading extra data from Tech Trees...")
    unit_names, tech_names, building_names, valid_unit_ids, valid_tech_ids, valid_building_ids, prereqs = load_extra_data()

    print(f"Loading {dat_path}...")
    dat = DatFile.parse(dat_path)
    
    units_out = {}
    techs_out = {}
    buildings_out = {}
    
    # Extract Units & Buildings from ALL civs
    processed_ids = set()
    for civ in dat.civs:
        for unit in civ.units:
            if not unit: continue
            uid = str(unit.base_id)
            if uid in processed_ids: continue
            
            # Unit extraction
            if uid in valid_unit_ids and unit.creatable and unit.type_50:
                if getattr(unit, 'hide_in_editor', 0) == 1: continue
                locations = unit.creatable.train_locations
                if not locations or locations[0].unit_id == -1: continue
                if locations[0].unit_id not in STANDARD_BUILDINGS: continue

                atk = unit.type_50.displayed_attack
                parm = 0
                for arm in unit.type_50.armours:
                    if arm.class_ == ARM_PIERCE: parm = arm.amount
                marm = unit.type_50.displayed_melee_armour
                patk = atk if unit.type_50.max_range > 1 else 0
                matk = 0 if unit.type_50.max_range > 1 else atk

                cost = get_cost(unit.creatable.resource_costs)
                name = unit_names.get(uid, unit.name)
                key = clean_key(name)
                if key in units_out: key = f"{key}_{uid}"
                units_out[key] = {
                    "name": name, "hp": unit.hit_points, "matk": matk, "patk": patk, "marm": marm, "parm": parm,
                    "reload": unit.type_50.reload_time, "range": unit.type_50.max_range,
                    "frame_delay": getattr(unit.type_50, 'frame_delay', 0),
                    "f": cost["f"], "w": cost["w"], "g": cost["g"],
                    "trainTime": locations[0].train_time, "building": locations[0].unit_id,
                    "id": uid, "class": unit.class_, "requires": prereqs.get(uid, {'techs': [], 'buildings': []})
                }
                processed_ids.add(uid)
            
            # Building extraction
            elif uid in valid_building_ids and unit.creatable:
                cost = get_cost(unit.creatable.resource_costs)
                name = building_names.get(uid, unit.name)
                key = clean_key(name)
                if key in buildings_out: key = f"{key}_{uid}"
                buildings_out[key] = {
                    "name": name, "f": cost["f"], "w": cost["w"], "g": cost["g"], "s": cost["s"],
                    "time": 50, # Default to 50s as suggested
                    "id": uid, "requires": prereqs.get(uid, {'techs': [], 'buildings': []})
                }
                processed_ids.add(uid)

    # Extract Techs
    for tid, tech in enumerate(dat.techs):
        if not tech or not tech.name or tech.name.startswith('Fake'): continue
        locations = tech.research_locations
        if not locations: continue
        cost = get_cost(tech.resource_costs)
        tid_str = str(tid)
        name = tech_names.get(tid_str, tech.name)
        key = clean_key(name)
        if key in techs_out: key = f"{key}_{tid}"
        techs_out[key] = {
            "name": name, "f": cost["f"], "w": cost["w"], "g": cost["g"],
            "time": locations[0].research_time, "building": locations[0].location_id,
            "id": tid, "requires": prereqs.get(tid_str, {'techs': [], 'buildings': []})
        }

    units_out = dict(sorted(units_out.items(), key=lambda x: x[1]['name']))
    techs_out = dict(sorted(techs_out.items(), key=lambda x: x[1]['name']))
    buildings_out = dict(sorted(buildings_out.items(), key=lambda x: x[1]['name']))

    script_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(script_dir, 'units.js'), 'w') as f:
        f.write("const units = " + json.dumps(units_out, indent=4) + ";")
    with open(os.path.join(script_dir, 'techs.js'), 'w') as f:
        f.write("const techs = " + json.dumps(techs_out, indent=4) + ";\n\n")
        f.write("const TECH_MAP = " + json.dumps(TECH_MAP, indent=4) + ";")
    with open(os.path.join(script_dir, 'buildings.js'), 'w') as f:
        f.write("const buildings = " + json.dumps(buildings_out, indent=4) + ";")

    print(f"Successfully converted {len(units_out)} units, {len(techs_out)} techs, and {len(buildings_out)} buildings.")

if __name__ == "__main__":
    convert()
