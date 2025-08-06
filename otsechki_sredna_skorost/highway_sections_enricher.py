#!/usr/bin/env python3
"""
Highway Sections Enricher
Enriches Bulgarian highway sections data with Google Maps API coordinates and distance verification.
"""

import json
import csv
import requests
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class EnrichedSection:
    section_name: str
    length_km: int
    start_point: str
    end_point: str
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    end_lat: Optional[float] = None
    end_lng: Optional[float] = None
    actual_distance_km: Optional[float] = None
    distance_verified: Optional[bool] = None
    route_geometry: Optional[str] = None
    geocoding_status: str = "pending"
    directions_status: str = "pending"


class HighwaySectionsEnricher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.geocoding_base_url = "https://maps.googleapis.com/maps/api/geocode/json"
        self.directions_base_url = "https://maps.googleapis.com/maps/api/directions/json"
        self.rate_limit_delay = 0.1  # 100ms between API calls
        
    def geocode_location(self, location: str, region: str = "bg") -> Tuple[Optional[float], Optional[float]]:
        """Geocode a location string to lat/lng coordinates."""
        params = {
            "address": f"{location}, Bulgaria",
            "region": region,
            "key": self.api_key
        }
        
        try:
            response = requests.get(self.geocoding_base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "OK" and data["results"]:
                location_data = data["results"][0]["geometry"]["location"]
                return location_data["lat"], location_data["lng"]
            else:
                print(f"Geocoding failed for '{location}': {data.get('status', 'Unknown error')}")
                return None, None
                
        except requests.RequestException as e:
            print(f"API request failed for '{location}': {e}")
            return None, None
    
    def get_directions(self, start_lat: float, start_lng: float, 
                      end_lat: float, end_lng: float) -> Dict:
        """Get directions between two lat/lng points."""
        params = {
            "origin": f"{start_lat},{start_lng}",
            "destination": f"{end_lat},{end_lng}",
            "region": "bg",
            "key": self.api_key
        }
        
        try:
            response = requests.get(self.directions_base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "OK" and data["routes"]:
                route = data["routes"][0]
                distance_m = route["legs"][0]["distance"]["value"]
                distance_km = distance_m / 1000
                
                return {
                    "distance_km": distance_km,
                    "geometry": route["overview_polyline"]["points"],
                    "status": "OK"
                }
            else:
                print(f"Directions failed: {data.get('status', 'Unknown error')}")
                return {"status": data.get("status", "ERROR")}
                
        except requests.RequestException as e:
            print(f"Directions API request failed: {e}")
            return {"status": "REQUEST_FAILED"}
    
    def enrich_section(self, section_data: Dict) -> EnrichedSection:
        """Enrich a single highway section with coordinates and verification."""
        section = EnrichedSection(**section_data)
        
        print(f"Processing: {section.section_name}")
        
        # Geocode start point
        start_lat, start_lng = self.geocode_location(section.start_point)
        time.sleep(self.rate_limit_delay)
        
        # Geocode end point
        end_lat, end_lng = self.geocode_location(section.end_point)
        time.sleep(self.rate_limit_delay)
        
        if start_lat and start_lng and end_lat and end_lng:
            section.start_lat = start_lat
            section.start_lng = start_lng
            section.end_lat = end_lat
            section.end_lng = end_lng
            section.geocoding_status = "success"
            
            # Get directions for distance verification
            directions = self.get_directions(start_lat, start_lng, end_lat, end_lng)
            time.sleep(self.rate_limit_delay)
            
            if directions["status"] == "OK":
                section.actual_distance_km = directions["distance_km"]
                section.route_geometry = directions["geometry"]
                section.directions_status = "success"
                
                # Verify distance (within 20% tolerance)
                tolerance = 0.2
                expected = section.length_km
                actual = section.actual_distance_km
                section.distance_verified = abs(actual - expected) <= (expected * tolerance)
                
                print(f"  ✓ Expected: {expected}km, Actual: {actual:.1f}km, Verified: {section.distance_verified}")
            else:
                section.directions_status = f"failed_{directions['status']}"
                print(f"  ✗ Directions failed: {directions['status']}")
        else:
            section.geocoding_status = "failed"
            print(f"  ✗ Geocoding failed")
        
        return section
    
    def enrich_all_sections(self, sections_data: List[Dict]) -> List[EnrichedSection]:
        """Enrich all highway sections."""
        enriched_sections = []
        
        print(f"Processing {len(sections_data)} highway sections...")
        
        for i, section_data in enumerate(sections_data, 1):
            print(f"\n[{i}/{len(sections_data)}] ", end="")
            enriched_section = self.enrich_section(section_data)
            enriched_sections.append(enriched_section)
        
        return enriched_sections
    
    def export_to_json(self, enriched_sections: List[EnrichedSection], filename: str):
        """Export enriched data to JSON."""
        data = []
        for section in enriched_sections:
            section_dict = {
                "section_name": section.section_name,
                "length_km": section.length_km,
                "start_point": section.start_point,
                "end_point": section.end_point,
                "start_coordinates": {
                    "lat": section.start_lat,
                    "lng": section.start_lng
                } if section.start_lat else None,
                "end_coordinates": {
                    "lat": section.end_lat,
                    "lng": section.end_lng
                } if section.end_lat else None,
                "verification": {
                    "expected_distance_km": section.length_km,
                    "actual_distance_km": section.actual_distance_km,
                    "distance_verified": section.distance_verified
                },
                "route_geometry": section.route_geometry,
                "status": {
                    "geocoding": section.geocoding_status,
                    "directions": section.directions_status
                }
            }
            data.append(section_dict)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ JSON exported to: {filename}")
    
    def export_to_csv(self, enriched_sections: List[EnrichedSection], filename: str):
        """Export enriched data to CSV."""
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                'Section Name', 'Expected Length (km)', 'Start Point', 'End Point',
                'Start Lat', 'Start Lng', 'End Lat', 'End Lng',
                'Actual Distance (km)', 'Distance Verified',
                'Geocoding Status', 'Directions Status'
            ])
            
            # Data
            for section in enriched_sections:
                writer.writerow([
                    section.section_name,
                    section.length_km,
                    section.start_point,
                    section.end_point,
                    section.start_lat,
                    section.start_lng,
                    section.end_lat,
                    section.end_lng,
                    section.actual_distance_km,
                    section.distance_verified,
                    section.geocoding_status,
                    section.directions_status
                ])
        
        print(f"✓ CSV exported to: {filename}")


def main():
    # Original highway sections data
    sections_data = [
        {
            "section_name": "Вакарел – Ихтиман",
            "length_km": 19,
            "start_point": "Между Вакарел",
            "end_point": "Ихтиман"
        },
        {
            "section_name": "Разклон за Костенец – Разклон за Мухово (вкл. тунел \"Траянови врата\")",
            "length_km": 23,
            "start_point": "От разклона за Костенец",
            "end_point": "До разклона за Мухово"
        },
        {
            "section_name": "Разклон за Костенец – Тунел \"Траянови врата\"",
            "length_km": 9,
            "start_point": "От разклона за Костенец",
            "end_point": "До тунел \"Траянови врата\""
        },
        {
            "section_name": "Разклон за Велинград – Разклон за Калугерово",
            "length_km": 10,
            "start_point": "От разклона за Велинград",
            "end_point": "До разклона за Калугерово"
        },
        {
            "section_name": "Пътен възел Пазарджик – Пътен възел Цалапица",
            "length_km": 22,
            "start_point": "От пътен възел Пазарджик",
            "end_point": "До пътен възел Цалапица"
        },
        {
            "section_name": "Пътен възел Пазарджик – Пътен възел Пловдив Запад",
            "length_km": 28,
            "start_point": "От пътен възел Пазарджик",
            "end_point": "До пътен възел Пловдив Запад"
        },
        {
            "section_name": "Пътен възел Пазарджик – Пътен възел Пловдив Север",
            "length_km": 35,
            "start_point": "От пътен възел Пазарджик",
            "end_point": "До пътен възел Пловдив Север"
        },
        {
            "section_name": "Пътен възел Пловдив Изток – Пютен възел Белозем",
            "length_km": 25,
            "start_point": "От пътен възел Пловдив Изток",
            "end_point": "До пютен възел Белозем"
        },
        {
            "section_name": "Пютен възел Оризово – Пютен възел Чирпан",
            "length_km": 9,
            "start_point": "От пютен възел Оризово",
            "end_point": "До пютен възел Чирпан"
        },
        {
            "section_name": "Пютен възел Чирпан – Първия разклон за Стара Загора",
            "length_km": 9,
            "start_point": "От пютен възел Чирпан",
            "end_point": "До първия разклон за Стара Загора"
        },
        {
            "section_name": "Пютен възел Стара Загора – Пютен възел Нова Загора",
            "length_km": 30,
            "start_point": "От пютен възел Стара Загора",
            "end_point": "До пютен възел Нова Загора"
        },
        {
            "section_name": "Пютен възел Нова Загора – Пютен възел Сливен",
            "length_km": 36,
            "start_point": "От пютен възел Нова Загора",
            "end_point": "До пютен възел Сливен"
        },
        {
            "section_name": "Пютен възел Сливен – Пютен възел Зимница",
            "length_km": 13,
            "start_point": "От пютен възел Сливен",
            "end_point": "До пютен възел Зимница"
        },
        {
            "section_name": "Пютен възел Карнобат – Пютен възел Българово",
            "length_km": 26,
            "start_point": "От пютен възел Карнобат",
            "end_point": "До пютен възел Българово"
        },
        {
            "section_name": "Пютен възел Българово – Разклон за Айтос",
            "length_km": 30,
            "start_point": "От пютен възел Българово",
            "end_point": "До разклона за Айтос"
        },
        {
            "section_name": "Разклон за Айтос – Северен обход на Бургас",
            "length_km": 8,
            "start_point": "От разклона за Айтос",
            "end_point": "До новото трасе на Северен обход на Бургас"
        }
    ]
    
    # Get API key from user
    api_key = input("Enter your Google Maps API key: ").strip()
    if not api_key:
        print("Error: API key is required!")
        return
    
    # Initialize enricher
    enricher = HighwaySectionsEnricher(api_key)
    
    # Enrich all sections
    enriched_sections = enricher.enrich_all_sections(sections_data)
    
    # Export results
    timestamp = int(time.time())
    json_filename = f"enriched_highway_sections_{timestamp}.json"
    csv_filename = f"enriched_highway_sections_{timestamp}.csv"
    
    enricher.export_to_json(enriched_sections, json_filename)
    enricher.export_to_csv(enriched_sections, csv_filename)
    
    # Print summary
    print(f"\n=== SUMMARY ===")
    successful_geocoding = sum(1 for s in enriched_sections if s.geocoding_status == "success")
    successful_directions = sum(1 for s in enriched_sections if s.directions_status == "success")
    verified_distances = sum(1 for s in enriched_sections if s.distance_verified is True)
    
    print(f"Total sections: {len(enriched_sections)}")
    print(f"Successful geocoding: {successful_geocoding}/{len(enriched_sections)}")
    print(f"Successful directions: {successful_directions}/{len(enriched_sections)}")
    print(f"Distance verified: {verified_distances}/{successful_directions}")
    

if __name__ == "__main__":
    main()