import json
import os

def convert():
    # External data file
    halfon_path = '/Users/mick/tmp/halfon/data/units_buildings_techs.de.json'
    
    # Files relative to chombat root
    empires_path = 'dat/empires.json'
    output_path = 'units.js'

    # Standard buildings where units are trained
    # 12: Barracks, 10: Archery Range, 101: Stable, 45: Dock, 82: Castle, 
    # 30: Monastery, 49: Siege Workshop, 1251: Krepost, 1665: Donjon
    standard_buildings = {12, 10, 101, 45, 82, 30, 49, 1251, 1665}

    print(f"Loading {halfon_path}...")
    with open(halfon_path, 'r') as f:
        halfon_data = json.load(f)
    
    print(f"Loading {empires_path} (this may take a while)...")
    with open(empires_path, 'r') as f:
        empires_data = json.load(f)
    
    # Use Britons (civ 1) as reference
    britons_units = empires_data['civs'][1]['units']
    unit_map = {str(u['id']): u for u in britons_units if u is not None}
    
    presets = {}
    
    for uid, data in halfon_data['units_buildings'].items():
        if data['type'] != 70: # Only units
            continue
        
        if data['hit_points'] <= 0:
            continue
            
        local_name = data.get('localised_name')
        if not local_name or local_name.startswith('OLD-') or 'Unused' in local_name:
            continue
            
        raw_u = unit_map.get(uid)
        if not raw_u:
            continue
            
        if not raw_u.get('type_50'):
            continue

        # FILTER: Exclude units hidden in editor (usually campaign/internal)
        if raw_u.get('hide_in_editor') == 1:
            continue

        # FILTER: Must be creatable
        if not raw_u.get('creatable'):
            continue

        # FILTER: Heuristic for standard units - must be trained at a standard building
        # OR be a very common base unit (like Militia/Scout which might have odd data)
        locations = raw_u['creatable'].get('train_locations', [])
        is_standard = any(loc.get('unit_id') in standard_buildings for loc in locations)
        
        # Exception for units that might not have locations in the Britons civ (like unique units)
        # but are clearly meant for ranked play. We'll allow Unique Units (class 0, 6, 12 etc with high IDs)
        # but the best filter is usually the presence of ANY train location.
        if not is_standard and not locations:
            continue

        matk = 0
        patk = 0
        attacks = raw_u['type_50'].get('attacks', [])
        for atk in attacks:
            if atk['class_'] == 4: # Melee
                matk = atk['amount']
            elif atk['class_'] == 3: # Pierce
                patk = atk['amount']
        
        if matk == 0 and patk == 0:
            if raw_u['type_50']['max_range'] > 1:
                patk = raw_u['type_50'].get('displayed_attack', 0)
            else:
                matk = raw_u['type_50'].get('displayed_attack', 0)

        marm = 0
        parm = 0
        armours = raw_u['type_50'].get('armours', [])
        for arm in armours:
            if arm['class_'] == 4: # Melee
                marm = arm['amount']
            elif arm['class_'] == 3: # Pierce
                parm = arm['amount']

        train_time = 0
        if locations:
            train_time = locations[0].get('train_time', 0)

        # Standardize key
        key = local_name.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_').replace('.', '').replace("'", '')
        
        # Avoid duplicate keys by appending ID if needed
        if key in presets:
            key = f"{key}_{uid}"

        presets[key] = {
            "name": local_name,
            "hp": data['hit_points'],
            "matk": matk,
            "patk": patk,
            "marm": marm,
            "parm": parm,
            "reload": raw_u['type_50'].get('reload_time', 2.0),
            "range": raw_u['type_50'].get('max_range', 0),
            "f": data['cost']['food'],
            "w": data['cost']['wood'],
            "g": data['cost']['gold'],
            "trainTime": train_time
        }

    # Sort presets by name for the JS file
    sorted_presets = dict(sorted(presets.items(), key=lambda item: item[1]['name']))

    with open(output_path, 'w') as f:
        f.write("const units = " + json.dumps(sorted_presets, indent=4) + ";")
    
    print(f"Successfully converted {len(sorted_presets)} units to {output_path}")

if __name__ == "__main__":
    convert()
