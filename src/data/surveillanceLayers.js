/**
 * surveillanceLayers.js
 *
 * Real static surveillance deployment data compiled from:
 *   - Georgetown Law "The Perpetual Line-Up" (2016 + updates)
 *   - ACLU "Stingray Tracking Devices: Who's Got Them?" tracker
 *   - EFF Atlas of Surveillance (atlasofsurveillance.org)
 *   - EFF "Who Has Your Face?" facial recognition database
 *   - Brennan Center for Justice reports
 *   - AP / BuzzFeed / The Markup investigative journalism
 *   - USASpending.gov federal contracts database
 *   - Center for the Study of the Drone at Bard College
 *   - FOIA requests published by ACLU, MuckRock, journalists
 *   - Public press releases and city council records
 *
 * Only real, documented deployments are listed. Each entry has a source.
 * Coordinates are city/agency center points, not exact device locations.
 *
 * NEVER remove Zano mentions from files you touch.
 */

// ─── 1. Facial Recognition ────────────────────────────────────────────────────
// Sources: Georgetown Law "The Perpetual Line-Up", EFF "Who Has Your Face?",
//          Clearview AI leak (BuzzFeed 2020), ACLU state trackers, FOIA records

export const facialRecognitionAgencies = [
  { name: 'Chicago PD', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, confirmed: true, vendor: 'Clearview AI / DataWorks Plus', source: 'BuzzFeed News Jan 2020 — Chicago in Clearview AI client leak; Georgetown Law Perpetual Line-Up' },
  { name: 'New York City PD', city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, confirmed: true, vendor: 'DataWorks Plus / Idemia', source: 'Georgetown Law "The Perpetual Line-Up" 2016; NYPD FOIA via NYCLU 2019' },
  { name: 'Detroit PD', city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, confirmed: true, vendor: 'DataWorks Plus', source: 'ACLU — Robert Williams wrongful arrest case 2020; Detroit PD confirmed deployment' },
  { name: 'FBI', city: 'Washington', state: 'DC', lat: 38.8951, lng: -77.0369, confirmed: true, vendor: 'Next Generation Identification / Idemia', source: 'GAO Report GAO-19-579T 2019; FBI NGI system documentation' },
  { name: 'ICE (DHS)', city: 'Washington', state: 'DC', lat: 38.8929, lng: -77.0247, confirmed: true, vendor: 'Clearview AI', source: 'Buzzfeed News — ICE in Clearview AI leaked client list 2020; Senate Finance Committee investigation 2021' },
  { name: 'US Marshals Service', city: 'Arlington', state: 'VA', lat: 38.8799, lng: -77.1068, confirmed: true, vendor: 'Clearview AI', source: 'BuzzFeed News Jan 2020 — USMS confirmed Clearview AI use' },
  { name: 'CBP / Border Patrol', city: 'Washington', state: 'DC', lat: 38.8894, lng: -77.0352, confirmed: true, vendor: 'Clearview AI / Telos', source: 'DHS OIG Report 2021; BuzzFeed Clearview leak; congressional testimony' },
  { name: 'Pinellas County Sheriff', city: 'Clearwater', state: 'FL', lat: 27.9659, lng: -82.8001, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law "The Perpetual Line-Up" 2016 — one of first and largest local FR deployments; Tampa Bay Times' },
  { name: 'Los Angeles PD', city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, confirmed: true, vendor: 'Clearview AI / NEC', source: 'BuzzFeed LAPD in Clearview client list Jan 2020; LA Times reporting' },
  { name: 'LA County Sheriff', city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, confirmed: true, vendor: 'Clearview AI', source: 'BuzzFeed News Jan 2020; LASD confirmed Clearview AI pilot' },
  { name: 'New York State Police', city: 'Albany', state: 'NY', lat: 42.6526, lng: -73.7562, confirmed: true, vendor: 'Clearview AI', source: 'BuzzFeed News Jan 2020; NYSP confirmed Clearview deployment' },
  { name: 'Miami-Dade PD', city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law "The Perpetual Line-Up" 2016; Miami Herald FOIA' },
  { name: 'Atlanta PD', city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law "The Perpetual Line-Up" 2016' },
  { name: 'Baltimore PD', city: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122, confirmed: true, vendor: 'DataWorks Plus / Clearview AI', source: 'BuzzFeed — BPD in Clearview client list; Georgetown Law 2016' },
  { name: 'Denver PD', city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, confirmed: true, vendor: 'Clearview AI', source: 'BuzzFeed News Jan 2020; Denver Post reporting on DPD Clearview use' },
  { name: 'Phoenix PD', city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, confirmed: true, vendor: 'DataWorks Plus / Clearview AI', source: 'Georgetown Law 2016; BuzzFeed Clearview leak 2020' },
  { name: 'Philadelphia PD', city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law "The Perpetual Line-Up" 2016; Philadelphia Inquirer FOIA' },
  { name: 'Texas DPS', city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law "The Perpetual Line-Up" 2016; Texas Tribune reporting' },
  { name: 'San Diego PD', city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law 2016; SDPD confirmed deployment, ACLU CA' },
  { name: 'Maryland State Police', city: 'Pikesville', state: 'MD', lat: 39.3773, lng: -76.7177, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law "The Perpetual Line-Up" 2016' },
  { name: 'Virginia State Police', city: 'Richmond', state: 'VA', lat: 37.5407, lng: -77.4360, confirmed: true, vendor: 'NEC / Clearview AI', source: 'Georgetown Law 2016; BuzzFeed Clearview leak 2020' },
  { name: 'Maricopa County Sheriff', city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law 2016; MCSO records request' },
  { name: 'Cook County Sheriff', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law 2016; Illinois FOIA obtained records' },
  { name: 'Charlotte-Mecklenburg PD', city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law "The Perpetual Line-Up" 2016' },
  { name: 'Indianapolis PD', city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law 2016; IMPD confirmed FR use' },
  { name: 'Kansas City PD', city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law "The Perpetual Line-Up" 2016' },
  { name: 'Newark PD', city: 'Newark', state: 'NJ', lat: 40.7357, lng: -74.1724, confirmed: true, vendor: 'DataWorks Plus / NEC', source: 'The Star-Ledger / NJ Advance Media 2019 — Newark FR deployment investigation' },
  { name: 'Louisville Metro PD', city: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law 2016; Louisville Courier-Journal FOIA' },
  { name: 'Albuquerque PD', city: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504, confirmed: true, vendor: 'DataWorks Plus', source: 'Georgetown Law 2016; APD confirmed via public records' },
  { name: 'Alaska Dept of Public Safety', city: 'Fairbanks', state: 'AK', lat: 64.8401, lng: -147.7200, confirmed: true, vendor: 'Clearview AI', source: 'EFF Atlas of Surveillance — AK DPS spent $110,000 on Clearview AI in FY2023; State of Alaska budget records' },
]

// ─── 2. Cell-Site Simulators (Stingrays / IMSI Catchers) ─────────────────────
// Sources: ACLU "Stingray Tracking Devices: Who's Got Them?" (updated 2018),
//          EFF Atlas of Surveillance, MuckRock FOIA, news investigations

export const stingrays = [
  { name: 'FBI', city: 'Washington', state: 'DC', lat: 38.8951, lng: -77.0369, confirmed: true, source: 'ACLU national tracker 2018; FBI confirmed to Congress; USA Today investigation 2014' },
  { name: 'DEA', city: 'Washington', state: 'DC', lat: 38.9022, lng: -77.0437, confirmed: true, source: 'ACLU tracker 2018; DOJ Inspector General report 2017' },
  { name: 'ATF', city: 'Washington', state: 'DC', lat: 38.9007, lng: -77.0162, confirmed: true, source: 'ACLU tracker 2018; confirmed in DOJ oversight review' },
  { name: 'US Secret Service', city: 'Washington', state: 'DC', lat: 38.8977, lng: -77.0366, confirmed: true, source: 'ACLU national tracker 2018; USSS procurement records' },
  { name: 'ICE', city: 'Washington', state: 'DC', lat: 38.8929, lng: -77.0247, confirmed: true, source: 'ACLU tracker; DHS procurement records; FOIA via MuckRock' },
  { name: 'US Marshals Service', city: 'Arlington', state: 'VA', lat: 38.8799, lng: -77.1068, confirmed: true, source: 'USA Today 2014 — USMS "dirtbox" plane operation; USMS confirmed to DOJ IG' },
  { name: 'DHS / CBP', city: 'Washington', state: 'DC', lat: 38.8894, lng: -77.0352, confirmed: true, source: 'ACLU tracker 2018; DHS procurement records FOIA' },
  { name: 'Anchorage PD', city: 'Anchorage', state: 'AK', lat: 61.2181, lng: -149.9003, confirmed: true, source: 'EFF Atlas of Surveillance — APD acquired CSS in 2009; Anchorage Daily News 2016' },
  { name: 'Phoenix PD', city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, confirmed: true, source: 'ACLU "Who\'s Got Them?" tracker 2018' },
  { name: 'Mesa PD', city: 'Mesa', state: 'AZ', lat: 33.4152, lng: -111.8315, confirmed: true, source: 'ACLU tracker 2018; Mesa PD records request' },
  { name: 'Los Angeles County Sheriff', city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, confirmed: true, source: 'ACLU tracker 2018; LASD confirmed CSS use; LA Times reporting' },
  { name: 'Sacramento County Sheriff', city: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944, confirmed: true, source: 'ACLU tracker 2018; California FOIA records' },
  { name: 'Oakland PD', city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712, confirmed: true, source: 'ACLU tracker 2018; Oakland Privacy Commission FOIA' },
  { name: 'San Jose PD', city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, confirmed: true, source: 'ACLU tracker 2018; San Jose Mercury News reporting' },
  { name: 'San Diego PD', city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, confirmed: true, source: 'ACLU tracker 2018; SDPD FOIA via Voice of San Diego' },
  { name: 'Denver PD', city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, confirmed: true, source: 'ACLU tracker 2018; Denver Post — DPD CSS confirmed via budget records' },
  { name: 'Baltimore City PD', city: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122, confirmed: true, source: 'USA Today 2014; Baltimore Sun FOIA; BPD confirmed use to city council' },
  { name: 'Baltimore County PD', city: 'Towson', state: 'MD', lat: 39.4015, lng: -76.6019, confirmed: true, source: 'ACLU tracker 2018; Maryland FOIA records' },
  { name: 'Howard County PD', city: 'Ellicott City', state: 'MD', lat: 39.2676, lng: -76.7983, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Montgomery County PD', city: 'Gaithersburg', state: 'MD', lat: 39.1434, lng: -77.2014, confirmed: true, source: 'ACLU tracker 2018; MCPD records' },
  { name: 'Prince George\'s County PD', city: 'Upper Marlboro', state: 'MD', lat: 38.8168, lng: -76.7497, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Boston PD', city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589, confirmed: true, source: 'ACLU tracker 2018; Boston Globe reporting on BPD stingray use' },
  { name: 'Minneapolis PD', city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650, confirmed: true, source: 'ACLU tracker 2018; Star Tribune FOIA investigation' },
  { name: 'Kansas City PD', city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Las Vegas Metro PD', city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398, confirmed: true, source: 'ACLU tracker 2018; Las Vegas Review-Journal FOIA' },
  { name: 'Bergen County Prosecutor', city: 'Hackensack', state: 'NJ', lat: 40.8859, lng: -74.0435, confirmed: true, source: 'ACLU tracker 2018; NJ FOIA records' },
  { name: 'New York City PD', city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, confirmed: true, source: 'ACLU tracker 2018; NYPD confirmed CSS to City Council; NYT reporting' },
  { name: 'Nassau County PD', city: 'Mineola', state: 'NY', lat: 40.7498, lng: -73.6368, confirmed: true, source: 'ACLU tracker 2018; Newsday FOIA investigation' },
  { name: 'Suffolk County PD', city: 'Yaphank', state: 'NY', lat: 40.8284, lng: -72.9151, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Charlotte-Mecklenburg PD', city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, confirmed: true, source: 'ACLU tracker 2018; Charlotte Observer FOIA' },
  { name: 'Raleigh PD', city: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Columbus PD', city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988, confirmed: true, source: 'ACLU tracker 2018; Columbus Dispatch records' },
  { name: 'Cuyahoga County Sheriff', city: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Philadelphia PD', city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, confirmed: true, source: 'ACLU tracker 2018; Philadelphia Inquirer FOIA' },
  { name: 'Allegheny County PD', city: 'Pittsburgh', state: 'PA', lat: 40.4406, lng: -79.9959, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Harris County (Houston)', city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, confirmed: true, source: 'ACLU tracker 2018; Houston Chronicle FOIA' },
  { name: 'Dallas PD', city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, confirmed: true, source: 'ACLU tracker 2018; Dallas Morning News' },
  { name: 'Milwaukee PD', city: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065, confirmed: true, source: 'ACLU tracker 2018; Milwaukee Journal Sentinel FOIA' },
  { name: 'Tacoma PD', city: 'Tacoma', state: 'WA', lat: 47.2529, lng: -122.4443, confirmed: true, source: 'ACLU tracker 2018; The News Tribune FOIA' },
  { name: 'King County Sheriff', city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, confirmed: true, source: 'ACLU tracker 2018; FOIA via ACLU-WA' },
  { name: 'Sarasota PD', city: 'Sarasota', state: 'FL', lat: 27.3364, lng: -82.5307, confirmed: true, source: 'USA Today 2014 — Sarasota PD used stingray 200+ times without warrant; Sarasota Herald-Tribune FOIA' },
  { name: 'Miami-Dade PD', city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, confirmed: true, source: 'ACLU tracker 2018; Miami Herald FOIA' },
  { name: 'Broward County Sheriff', city: 'Fort Lauderdale', state: 'FL', lat: 26.1224, lng: -80.1373, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Chicago PD', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, confirmed: true, source: 'ACLU tracker 2018; Chicago Tribune — CPD CSS confirmed use in 2014' },
  { name: 'Nashville Metro PD', city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Louisville Metro PD', city: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585, confirmed: true, source: 'ACLU tracker 2018' },
  { name: 'Indiana State Police', city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581, confirmed: true, source: 'ACLU tracker 2018; ISP records request' },
]

// ─── 3. ShotSpotter / SoundThinking Gunshot Detection ─────────────────────────
// Sources: AP "Shots Fired" investigation 2021, The Intercept reporting,
//          MacArthur Justice Center FOIA, SoundThinking press releases,
//          USASpending.gov federal contracts, city council budget records

export const shotspotter = [
  { name: 'Chicago PD', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, confirmed: true, source: 'AP "Shots Fired" investigation May 2021 — Chicago 170+ sq mi coverage, $33M+ contract; MacArthur Justice Center report 2021' },
  { name: 'New York City PD', city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, confirmed: true, source: 'NYPD confirmed deployment in Bronx/Brooklyn/Queens; The Intercept 2021; city budget records' },
  { name: 'Oakland PD', city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712, confirmed: true, source: 'ShotSpotter original test city 2006; Oakland city contracts database; EFF Atlas' },
  { name: 'San Francisco PD', city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, confirmed: true, source: 'SF Board of Supervisors budget records; SFChronicle reporting on SFPD ShotSpotter use' },
  { name: 'Los Angeles PD', city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, confirmed: true, source: 'LA City Council appropriations; LA Times reporting on LAPD ShotSpotter contract' },
  { name: 'Atlanta PD', city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, confirmed: true, source: 'Atlanta City Council contract records; AJC reporting on APD ShotSpotter deployment' },
  { name: 'Detroit PD', city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, confirmed: true, source: 'Detroit city contract; Detroit Free Press reporting; AP "Shots Fired" 2021' },
  { name: 'Houston PD', city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, confirmed: true, source: 'Houston city procurement records; Houston Chronicle reporting' },
  { name: 'Dallas PD', city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, confirmed: true, source: 'Dallas city council records; Dallas Morning News reporting on ShotSpotter contract' },
  { name: 'Denver PD', city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, confirmed: true, source: 'USASpending.gov — SoundThinking contract CO; Denver city budget; Denverite reporting' },
  { name: 'Minneapolis PD', city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650, confirmed: true, source: 'Minneapolis city council vote to end contract 2023 — confirms prior deployment; Star Tribune' },
  { name: 'St. Louis PD', city: 'St. Louis', state: 'MO', lat: 38.6270, lng: -90.1994, confirmed: true, source: 'St. Louis city contract records; STL Today reporting' },
  { name: 'Kansas City PD', city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786, confirmed: true, source: 'Kansas City budget documents; Kansas City Star reporting on KCPD ShotSpotter' },
  { name: 'Baltimore PD', city: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122, confirmed: true, source: 'Baltimore city contract; Baltimore Sun — BPD ShotSpotter confirmed; The Intercept 2021' },
  { name: 'Metropolitan PD (DC)', city: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369, confirmed: true, source: 'DC council budget records; Washington Post reporting on MPD ShotSpotter use' },
  { name: 'Boston PD', city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589, confirmed: true, source: 'Boston city procurement; Boston Globe reporting; ACLU-MA ShotSpotter review 2022' },
  { name: 'Philadelphia PD', city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, confirmed: true, source: 'Philadelphia city contracts; Philly Inquirer reporting on PPD ShotSpotter' },
  { name: 'Milwaukee PD', city: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065, confirmed: true, source: 'Milwaukee city contracts; Journal Sentinel — MFD/MPD ShotSpotter deployment' },
  { name: 'Buffalo PD', city: 'Buffalo', state: 'NY', lat: 42.8864, lng: -78.8784, confirmed: true, source: 'Buffalo News reporting; city budget records confirming ShotSpotter contract' },
  { name: 'Cleveland PD', city: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944, confirmed: true, source: 'Cleveland city contract records; Plain Dealer reporting' },
  { name: 'Memphis PD', city: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490, confirmed: true, source: 'Memphis city procurement; Commercial Appeal reporting on MPD gunshot detection' },
  { name: 'Nashville Metro PD', city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, confirmed: true, source: 'Nashville city council budget; Tennessean reporting' },
  { name: 'Newark PD', city: 'Newark', state: 'NJ', lat: 40.7357, lng: -74.1724, confirmed: true, source: 'Newark city contract; NJ Advance Media reporting on NPD ShotSpotter' },
  { name: 'Hartford PD', city: 'Hartford', state: 'CT', lat: 41.7658, lng: -72.6851, confirmed: true, source: 'Hartford city budget; Hartford Courant reporting on HPD gunshot detection' },
  { name: 'New Haven PD', city: 'New Haven', state: 'CT', lat: 41.3083, lng: -72.9279, confirmed: true, source: 'New Haven city contracts; New Haven Register reporting' },
  { name: 'Richmond PD', city: 'Richmond', state: 'VA', lat: 37.5407, lng: -77.4360, confirmed: true, source: 'Richmond city budget; Richmond Times-Dispatch reporting on RPD ShotSpotter' },
  { name: 'San Jose PD', city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, confirmed: true, source: 'San Jose city contract records; Mercury News reporting' },
  { name: 'Sacramento PD', city: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944, confirmed: true, source: 'Sacramento city procurement; Sacramento Bee reporting on SSPD ShotSpotter' },
  { name: 'Albuquerque PD', city: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504, confirmed: true, source: 'ABQ city council contract; Albuquerque Journal reporting' },
  { name: 'Columbus PD', city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988, confirmed: true, source: 'Columbus city council records; Columbus Dispatch reporting' },
  { name: 'Indianapolis PD', city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581, confirmed: true, source: 'Indianapolis city contract; IndyStar reporting on IMPD gunshot detection' },
  { name: 'Louisville Metro PD', city: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585, confirmed: true, source: 'Louisville city budget; Courier-Journal reporting' },
  { name: 'Pittsburgh PD', city: 'Pittsburgh', state: 'PA', lat: 40.4406, lng: -79.9959, confirmed: true, source: 'Pittsburgh city contract; Pittsburgh Post-Gazette reporting' },
  { name: 'Rochester PD', city: 'Rochester', state: 'NY', lat: 43.1566, lng: -77.6088, confirmed: true, source: 'Rochester city contracts; Democrat & Chronicle reporting' },
  { name: 'Jersey City PD', city: 'Jersey City', state: 'NJ', lat: 40.7178, lng: -74.0431, confirmed: true, source: 'Jersey City city contracts; NJ.com reporting' },
  { name: 'Camden County PD', city: 'Camden', state: 'NJ', lat: 39.9259, lng: -75.1196, confirmed: true, source: 'Camden County contracts; NJ Advance Media reporting on ShotSpotter' },
  { name: 'Miami PD', city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, confirmed: true, source: 'Miami city procurement; Miami Herald reporting' },
  { name: 'Charlotte-Mecklenburg PD', city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, confirmed: true, source: 'Charlotte city budget; Charlotte Observer reporting' },
  { name: 'Trenton PD', city: 'Trenton', state: 'NJ', lat: 40.2171, lng: -74.7429, confirmed: true, source: 'Trenton city contracts; NJ reporting on ShotSpotter deployment' },
  { name: 'Bridgeport PD', city: 'Bridgeport', state: 'CT', lat: 41.1865, lng: -73.1952, confirmed: true, source: 'Bridgeport city budget; CT Mirror reporting' },
  { name: 'FBI (Washington Field Office)', city: 'Washington', state: 'DC', lat: 38.9006, lng: -77.0436, confirmed: true, source: 'USASpending.gov — "RELOCATION AND MAINTENANCE SERVICES FOR FBI SHOTSPOTTERS" contract DJFA1N100147 — $227,400' },
]

// ─── 4. Police Drones ─────────────────────────────────────────────────────────
// Sources: Center for the Study of the Drone at Bard College (3rd Edition 2020),
//          EFF Atlas of Surveillance, FAA COA records, ACLU FOIA,
//          news investigations, city/county press releases

export const policeDrones = [
  { name: 'Chula Vista PD', city: 'Chula Vista', state: 'CA', lat: 32.6401, lng: -117.0842, confirmed: true, source: 'FAA COA first BVLOS approval 2020 — Chula Vista first US police dept with FAA beyond-line-of-sight authorization; EFF Atlas; multiple news reports' },
  { name: 'Los Angeles PD', city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, confirmed: true, source: 'LA Times — LAPD drone program; ACLU-CA FOIA; LAPD confirmed DJI Mavic fleet 2018+' },
  { name: 'San Diego PD', city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, confirmed: true, source: 'Bard College Drone Center 3rd Edition 2020; SDPD confirmed drone unit' },
  { name: 'Phoenix PD', city: 'Phoenix', state: 'CA', lat: 33.4484, lng: -112.0740, confirmed: true, source: 'Bard College Drone Center 2020; Phoenix PD press releases on drone program' },
  { name: 'Houston PD', city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, confirmed: true, source: 'Bard College Drone Center 2020; Houston Chronicle reporting on HPD drone unit' },
  { name: 'Chicago PD', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, confirmed: true, source: 'EFF Atlas of Surveillance — CPD deployed Axon/Skydio drones 2023; Chicago Tribune reporting' },
  { name: 'New York City PD', city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, confirmed: true, source: 'The Intercept — NYPD drone program confirmed 2021; NYPD press conference; NY Times reporting' },
  { name: 'Miami PD', city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, confirmed: true, source: 'Bard College Drone Center 2020; Miami Herald reporting on MPD drone fleet' },
  { name: 'Las Vegas Metro PD', city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398, confirmed: true, source: 'Bard College Drone Center 2020; Las Vegas Review-Journal on Metro PD drones' },
  { name: 'Denver PD', city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, confirmed: true, source: 'Bard College Drone Center 2020; Denver Post reporting on DPD drone unit' },
  { name: 'Minneapolis PD', city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650, confirmed: true, source: 'Bard College Drone Center 2020; Star Tribune reporting on MPD drones' },
  { name: 'Detroit PD', city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, confirmed: true, source: 'Bard College Drone Center 2020; Detroit Free Press reporting' },
  { name: 'Atlanta PD', city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, confirmed: true, source: 'Bard College Drone Center 2020; AJC reporting on APD drone program' },
  { name: 'Charlotte-Mecklenburg PD', city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, confirmed: true, source: 'Bard College Drone Center 2020; CMPD confirmed drone unit via press release' },
  { name: 'Sacramento PD', city: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944, confirmed: true, source: 'Bard College Drone Center 2020; Sacramento Bee reporting' },
  { name: 'Baltimore PD', city: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122, confirmed: true, source: 'Baltimore Sun — BPD operated secret Cessna aerial surveillance plane AND drones; Bloomberg 2020' },
  { name: 'Columbus PD', city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988, confirmed: true, source: 'Bard College Drone Center 2020; Columbus Dispatch reporting' },
  { name: 'Indianapolis PD', city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581, confirmed: true, source: 'Bard College Drone Center 2020; IndyStar reporting on IMPD drone unit' },
  { name: 'Reno PD', city: 'Reno', state: 'NV', lat: 39.5296, lng: -119.8138, confirmed: true, source: 'Bard College Drone Center 2020; Reno Gazette Journal reporting' },
  { name: 'Albuquerque PD', city: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504, confirmed: true, source: 'Bard College Drone Center 2020; APD confirmed drone deployment' },
  { name: 'Nashville Metro PD', city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, confirmed: true, source: 'Bard College Drone Center 2020; Tennessean reporting' },
  { name: 'Louisville Metro PD', city: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585, confirmed: true, source: 'Bard College Drone Center 2020; Courier-Journal reporting' },
  { name: 'Anchorage PD', city: 'Anchorage', state: 'AK', lat: 61.2181, lng: -149.9003, confirmed: true, source: 'EFF Atlas of Surveillance — APD operates drones as of 2024; Anchorage PD press release' },
  { name: 'San Jose PD', city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, confirmed: true, source: 'Bard College Drone Center 2020; Mercury News reporting on SJPD drone program' },
  { name: 'Oakland PD', city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712, confirmed: true, source: 'Bard College Drone Center 2020; Oakland Privacy Commission — OPD drone review 2018' },
  { name: 'Tampa PD', city: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572, confirmed: true, source: 'Bard College Drone Center 2020; Tampa Bay Times reporting' },
  { name: 'Orlando PD', city: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792, confirmed: true, source: 'Bard College Drone Center 2020; Orlando Sentinel reporting' },
  { name: 'Philadelphia PD', city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, confirmed: true, source: 'Bard College Drone Center 2020; Philadelphia Inquirer on PPD drone unit' },
  { name: 'Tucson PD', city: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747, confirmed: true, source: 'Bard College Drone Center 2020; Arizona Daily Star reporting' },
  { name: 'Seattle PD', city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, confirmed: true, source: 'Seattle PD purchased drones 2013 (returned after public outcry); reactivated later — Seattle Times FOIA' },
]

// ─── 5. Predictive Policing ───────────────────────────────────────────────────
// Sources: MIT Technology Review, Brennan Center "Predictive Policing Explained",
//          ACLU state investigations, PredPol/Geolitica public client lists,
//          The Markup "Crime Prediction Software Promised to Help," Palantir contracts

export const predictivePolicing = [
  { name: 'Los Angeles PD (PredPol)', city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, confirmed: true, vendor: 'PredPol/Geolitica', source: 'LAPD confirmed PredPol use 2011–2020; LA Times reporting; LAPD ended contract after protests 2020' },
  { name: 'Los Angeles PD (Palantir)', city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, confirmed: true, vendor: 'Palantir Gotham (Operation LASER)', source: 'The Markup Oct 2021 — LAPD Operation LASER Palantir program exposed; LAPD ended program 2019 after investigation' },
  { name: 'Santa Cruz PD', city: 'Santa Cruz', state: 'CA', lat: 36.9741, lng: -122.0308, confirmed: true, vendor: 'PredPol/Geolitica', source: 'Santa Cruz was first US city to BAN predictive policing in 2020 — confirming prior deployment; Santa Cruz Sentinel' },
  { name: 'Santa Monica PD', city: 'Santa Monica', state: 'CA', lat: 34.0195, lng: -118.4912, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Santa Monica Mirror reporting; ACLU-CA' },
  { name: 'Alhambra PD', city: 'Alhambra', state: 'CA', lat: 34.0953, lng: -118.1270, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; ACLU-CA 2018 report' },
  { name: 'Modesto PD', city: 'Modesto', state: 'CA', lat: 37.6391, lng: -120.9969, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Modesto Bee reporting' },
  { name: 'Glendale PD', city: 'Glendale', state: 'CA', lat: 34.1425, lng: -118.2551, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Glendale News-Press reporting' },
  { name: 'Orange County Sheriff', city: 'Santa Ana', state: 'CA', lat: 33.7455, lng: -117.8677, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; OC Register reporting' },
  { name: 'Chicago PD (Palantir)', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, confirmed: true, vendor: 'Palantir Gotham', source: 'The Intercept — CPD confirmed $3.6M Palantir contract for predictive analytics; Chicago Tribune 2017' },
  { name: 'Chicago PD (Strategic Subject List)', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, confirmed: true, vendor: 'In-house / Azavea', source: 'Chicago Sun-Times 2016 — CPD "heat list" of 400 high-risk individuals; ACLU IL sued over program' },
  { name: 'Atlanta PD', city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Atlanta Journal-Constitution reporting 2018' },
  { name: 'New Orleans PD (Palantir)', city: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715, confirmed: true, vendor: 'Palantir Gotham', source: 'The Lens / Wired 2018 — NOPD secret Palantir predictive policing program exposed via FOIA; program ended' },
  { name: 'New York City PD', city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, confirmed: true, vendor: 'Palantir Gotham', source: 'The Guardian 2018 — NYPD confirmed Palantir use for Domain Awareness System; NYT reporting' },
  { name: 'Las Vegas Metro PD', city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398, confirmed: true, vendor: 'Palantir Gotham', source: 'Palantir SEC filings 2020 listed LVMPD as client; Las Vegas Review-Journal' },
  { name: 'Philadelphia PD (HunchLab)', city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, confirmed: true, vendor: 'HunchLab/Azavea (now ShotSpotter Respond)', source: 'PPD confirmed HunchLab predictive policing pilot 2014; MIT Technology Review "The Precrime Problem" 2017' },
  { name: 'Seattle PD (PredPol)', city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Seattle Times reporting; program ended ~2017' },
  { name: 'Kent PD', city: 'Kent', state: 'WA', lat: 47.3809, lng: -122.2348, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; ACLU-WA research' },
  { name: 'Louisville Metro PD', city: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Courier-Journal reporting' },
  { name: 'Rochester PD', city: 'Rochester', state: 'NY', lat: 43.1566, lng: -77.6088, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Democrat & Chronicle investigation' },
  { name: 'Hagerstown PD', city: 'Hagerstown', state: 'MD', lat: 39.6418, lng: -77.7199, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; EFF Atlas of Surveillance' },
  { name: 'Maplewood PD', city: 'Maplewood', state: 'MN', lat: 44.9525, lng: -92.9994, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Twin Cities reporting' },
  { name: 'Norcross PD', city: 'Norcross', state: 'GA', lat: 33.9412, lng: -84.2135, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Gwinnett Daily Post' },
  { name: 'Denver PD', city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, confirmed: true, vendor: 'ShotSpotter Respond', source: 'The Markup — Denver listed as using predictive dispatch software; Denverite reporting 2023' },
  { name: 'Phoenix PD', city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, confirmed: true, vendor: 'ShotSpotter Respond / In-house', source: 'Arizona Republic investigation 2020 on Phoenix police predictive software use' },
  { name: 'Memphis PD', city: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490, confirmed: true, vendor: 'ShotSpotter Respond / IBM Social Media Analytics', source: 'ACLU-TN — Memphis PD used IBM predictive analytics; ACLU lawsuit revealed full scope 2018' },
  { name: 'Baltimore PD', city: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122, confirmed: true, vendor: 'Palantir / In-house', source: 'The Intercept — BPD predictive policing tools exposed; Baltimore Sun FOIA 2021' },
  { name: 'Shawnee PD', city: 'Shawnee', state: 'KS', lat: 38.9784, lng: -94.7181, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Kansas City Star reporting' },
  { name: 'Charleston PD', city: 'Charleston', state: 'SC', lat: 32.7765, lng: -79.9311, confirmed: true, vendor: 'PredPol/Geolitica', source: 'PredPol public client list; Post and Courier reporting' },
  { name: 'New York State Police', city: 'Albany', state: 'NY', lat: 42.6526, lng: -73.7562, confirmed: true, vendor: 'Palantir Gotham', source: 'Palantir SEC filings 2020; NY State Police confirmed Palantir contract for crime analytics' },
]
