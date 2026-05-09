#!/usr/bin/env python3
"""
Fetch all US ALPR cameras from OpenStreetMap via Overpass API.
Runs on Hetzner — saves output directly to /opt/citeback-ai/data/
Generates both alpr-us.json and alpr-by-state.json
"""

import json, time, sys, os, urllib.request, urllib.parse

STATES = {
  'AL': '30.14,-88.48,35.01,-84.89',
  'AK': '54.56,-169.12,71.5,-129.98',
  'AZ': '31.33,-114.82,37.0,-109.05',
  'AR': '33.0,-94.62,36.5,-89.64',
  'CA': '32.53,-124.48,42.01,-114.13',
  'CO': '36.99,-109.06,41.0,-102.04',
  'CT': '40.95,-73.73,42.05,-71.78',
  'DE': '38.45,-75.79,39.84,-75.05',
  'FL': '24.52,-87.63,31.0,-80.03',
  'GA': '30.36,-85.61,35.0,-80.84',
  'HI': '18.91,-160.25,22.24,-154.8',
  'ID': '41.99,-117.24,49.0,-111.04',
  'IL': '36.97,-91.51,42.51,-87.02',
  'IN': '37.77,-88.1,41.77,-84.78',
  'IA': '40.38,-96.64,43.5,-90.14',
  'KS': '36.99,-102.05,40.0,-94.59',
  'KY': '36.5,-89.57,39.15,-81.96',
  'LA': '28.92,-94.04,33.02,-88.82',
  'ME': '43.06,-71.08,47.46,-66.95',
  'MD': '37.91,-79.49,39.72,-74.99',
  'MA': '41.24,-73.51,42.89,-69.93',
  'MI': '41.7,-90.42,48.31,-82.41',
  'MN': '43.5,-97.24,49.38,-89.49',
  'MS': '30.17,-91.66,35.01,-88.1',
  'MO': '35.99,-95.77,40.61,-89.1',
  'MT': '44.36,-116.05,49.0,-104.04',
  'NE': '40.0,-104.05,43.0,-95.31',
  'NV': '35.0,-120.01,42.0,-114.04',
  'NH': '42.7,-72.56,45.31,-70.61',
  'NJ': '38.93,-75.56,41.36,-73.89',
  'NM': '31.33,-109.05,37.0,-103.0',
  'NY': '40.5,-79.76,45.02,-71.86',
  'NC': '33.84,-84.32,36.59,-75.46',
  'ND': '45.94,-104.05,49.0,-96.55',
  'OH': '38.4,-84.82,41.98,-80.52',
  'OK': '33.62,-103.0,37.0,-94.43',
  'OR': '41.99,-124.62,46.24,-116.46',
  'PA': '39.72,-80.52,42.27,-74.69',
  'RI': '41.15,-71.9,42.02,-71.12',
  'SC': '32.03,-83.35,35.22,-78.55',
  'SD': '42.48,-104.06,45.95,-96.44',
  'TN': '34.99,-90.31,36.68,-81.65',
  'TX': '25.84,-106.65,36.5,-93.51',
  'UT': '37.0,-114.05,42.0,-109.04',
  'VT': '42.73,-73.44,45.02,-71.5',
  'VA': '36.54,-83.68,39.47,-75.24',
  'WA': '45.54,-124.77,49.0,-116.91',
  'WV': '37.2,-82.65,40.64,-77.72',
  'WI': '42.5,-92.9,47.08,-86.25',
  'WY': '40.99,-111.06,45.01,-104.05',
  'DC': '38.79,-77.12,38.99,-76.91',
}

DATA_DIR = '/opt/citeback-ai/data'
OUT_FILE = os.path.join(DATA_DIR, 'alpr-us.json')
BY_STATE_FILE = os.path.join(DATA_DIR, 'alpr-by-state.json')
CACHE_DIR = '/tmp/alpr_cache'
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

def fetch_state(state, bbox, retries=3):
    cache_file = f'{CACHE_DIR}/{state}.json'
    if os.path.exists(cache_file):
        with open(cache_file) as f:
            data = json.load(f)
        print(f'  {state}: {len(data)} cameras (cached)')
        return data, state

    query = f'[out:json][timeout:40][bbox:{bbox}];(node["surveillance:type"="ALPR"];node["surveillance:type"="ANPR"];node["surveillance:type"="alpr"];);out body;'
    url = 'https://overpass-api.de/api/interpreter'

    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({'data': query}).encode())
            req.add_header('User-Agent', 'Citeback ALPR Mapper / OSM Data Collection')
            with urllib.request.urlopen(req, timeout=50) as resp:
                raw = resp.read()
            d = json.loads(raw)
            cameras = [
                {'id': e['id'], 'lat': e['lat'], 'lon': e['lon'], 'tags': e.get('tags', {}), 'st': state}
                for e in d.get('elements', []) if 'lat' in e
            ]
            with open(cache_file, 'w') as f:
                json.dump(cameras, f)
            print(f'  {state}: {len(cameras)} cameras')
            return cameras, state
        except Exception as ex:
            print(f'  {state}: attempt {attempt+1} failed — {ex}')
            if attempt < retries - 1:
                time.sleep(5)
    print(f'  {state}: FAILED after {retries} attempts')
    return [], state

all_cameras = {}
state_counts = {}
total_states = len(STATES)

print(f'Fetching ALPR cameras for all {total_states} states + DC...\n')

for i, (state, bbox) in enumerate(STATES.items(), 1):
    print(f'[{i}/{total_states}] {state}', end=' ')
    sys.stdout.flush()
    cameras, st = fetch_state(state, bbox)
    state_counts[st] = len(cameras)
    for c in cameras:
        all_cameras[c['id']] = c  # deduplicate by OSM node ID
    time.sleep(2)  # be polite to the API

cameras_list = list(all_cameras.values())
total = len(cameras_list)
print(f'\n✓ Total unique cameras: {total}')

with open(OUT_FILE, 'w') as f:
    json.dump(cameras_list, f)
size_kb = os.path.getsize(OUT_FILE) // 1024
print(f'✓ Saved alpr-us.json ({size_kb} KB)')

with open(BY_STATE_FILE, 'w') as f:
    json.dump(state_counts, f)
print(f'✓ Saved alpr-by-state.json')

print(f'\nDone! Total: {total} cameras across {total_states} states.')
print(f'CAMERA_COUNT={total}')
