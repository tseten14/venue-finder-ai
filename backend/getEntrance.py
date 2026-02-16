'''
This file locates entrances based on standardized versions of GTFS data from various agencies.

Example Usage:
    python3 getEntrance.py "Ogilvie Transportation Center"
    python3 getEntrance.py "Clinton" (add bounding box coordinates)
    python3 getEntrance.py "Back Bay"
    python3 getEntrance.py "Downtown Berkeley"

Input: 
    1. Station name query (string)
    2. (4 arguments) Bounding box coordinates: latMin, latMax, lonMin, lonMax (floats)
    
Output:
    Series of entrance coordinates, with associated attached station name and data source.
    
Data Sources:
    1. BART (San Francisco Bay Area)
    2. CTA (Chicago)
    3. LA Metro (Los Angeles)
    4. MBTA (Boston)
    5. Metra (Chicago)
    6. MTA (New York City)
    7. Paris Metro (Paris)
    8. SFMTA (San Francisco)
    9. TFL (London)
    10. WMATA (Washington D.C.) 
'''

import sys
import pandas as pd
from rapidfuzz import process, fuzz

# retrieve query and bounding box from command line
boundingBox = []
if len(sys.argv) > 2:
    boundingBox = sys.argv[2:6]
else:
    boundingBox = [float('-inf'), float('inf'), float('-inf'), float('inf')]
    print("Warning: Bounding Box excluded. May lead to inaccurate results.")
    
query = sys.argv[1]

# determine matching sources by bounding box
# essentially, check which regions this query may be in, don't check other sources
sources = pd.read_csv("data/bounding.txt")
sourceMatches = sources[(sources["latMin"] > boundingBox[0]) & 
                  (sources["latMax"] < boundingBox[1]) & 
                  (sources["lonMin"] > boundingBox[2]) & 
                  (sources["lonMax"] < boundingBox[3])]["file"].tolist()


allMatches = []
resultSources = 0

for exploreSource in sourceMatches:
    sourceCsv = pd.read_csv("data/" + exploreSource)
    
    # filter matches by bounding box
    filteredCsv = sourceCsv[(sourceCsv["lat"] > boundingBox[0]) &
                            (sourceCsv["lat"] < boundingBox[1]) &
                            (sourceCsv["lon"] > boundingBox[2]) &
                            (sourceCsv["lon"] < boundingBox[3])]
    
    if (filteredCsv.empty):
        continue
    
    # filter matches by top name match
    nameMatches = process.extract(
        query,
        filteredCsv["stationName"].tolist(),
        scorer=fuzz.token_sort_ratio,
        limit=1, 
        score_cutoff=60
    )
    
    if (len(nameMatches) == 0):
        continue
    
    allMatches.append([exploreSource + " — " + nameMatches[0][0]])
    matchCoordinates = filteredCsv[filteredCsv["stationName"] == nameMatches[0][0]][["lat", "lon"]].values.tolist()
    allMatches.extend(matchCoordinates)
    resultSources += 1

if (resultSources == 0):
    print("No results found.")
elif (resultSources > 1):
    print("Warning: Multiple sources fulfilled query. Verify results.")

for match in allMatches:
    if len(match) == 2:
        print(f"({match[0]}, {match[1]})")
    else:
        print(match[0])