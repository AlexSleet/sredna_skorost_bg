# Bulgarian Highway Sections - Geocoding Verification (Updated)

This document contains all 16 highway sections with their geocoded coordinates using improved A1 Trakia highway-specific geocoding and Google Maps verification links.

**Data Source:** Average speed zone descriptions from Facebook post:
https://www.facebook.com/100001126297074/posts/24018681411086067/?mibextid=rS40aB7S9Ucbxw6v

## Files Location
- **JSON Data:** `enriched_highway_sections_1754491067.json`
- **CSV Data:** `enriched_highway_sections_1754491067.csv`

## Summary (Updated Results)
- ✅ **16/16 sections successfully geocoded** (with highway-specific filtering)
- ❌ **0/16 distances verified** (geocoding issues - many results returned generic highway coordinates)
- ⚠️ **All sections need manual coordinate verification** - API returned too generic locations

---

## 1. Вакарел – Ихтиман
**Expected Distance:** 19km | **Actual:** 202.4km ❌

**Start Point:** [Между Вакарел](https://maps.google.com/?q=42.5510779,23.7019207)
- Coordinates: `42.5510779, 23.7019207`
- Found: Avtomagistrala "Trakiya", Vakarel, Bulgaria

**End Point:** [Ихтиман](https://maps.google.com/?q=42.2964251,25.4788783)
- Coordinates: `42.2964251, 25.4788783`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.5510779,23.7019207/42.2964251,25.4788783)**

---

## 2. Разклон за Костенец – Разклон за Мухово (вкл. тунел "Траянови врата")
**Expected Distance:** 23km | **Actual:** 32.7km ❌

**Start Point:** [От разклона за Костенец](https://maps.google.com/?q=42.3090467,23.859738)
- Coordinates: `42.3090467, 23.859738`
- Found: gr. Kostenets, Bulgaria

**End Point:** [До разклона за Мухово](https://maps.google.com/?q=42.4211437,23.9958465)
- Coordinates: `42.4211437, 23.9958465`
- Found: 2061 Muhovo, Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.3090467,23.859738/42.4211437,23.9958465)**

---

## 3. Разклон за Костенец – Тунел "Траянови врата"
**Expected Distance:** 9km | **Actual:** 14.4km ❌

**Start Point:** [От разклона за Костенец](https://maps.google.com/?q=42.3090467,23.859738)
- Coordinates: `42.3090467, 23.859738`
- Found: gr. Kostenets, Bulgaria

**End Point:** [До тунел "Траянови врата"](https://maps.google.com/?q=42.3548764,23.9177036)
- Coordinates: `42.3548764, 23.9177036`
- Found: Avtomagistrala "Trakiya", 2034 Dolna Vasilitsa, Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.3090467,23.859738/42.3548764,23.9177036)**

---

## 4. Разклон за Велинград – Разклон за Калугерово
**Expected Distance:** 10km | **Actual:** 48.7km ❌

**Start Point:** [От разклона за Велинград](https://maps.google.com/?q=42.027516,23.99161)
- Coordinates: `42.027516, 23.99161`
- Found: Velingrad, Bulgaria

**End Point:** [До разклона за Калугерово](https://maps.google.com/?q=42.32678,24.169936)
- Coordinates: `42.32678, 24.169936`
- Found: 4462 Kalugerovo, Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.027516,23.99161/42.32678,24.169936)**

---

## 5. Пътен възел Пазарджик – Пътен възел Цалапица
**Expected Distance:** 22km | **Actual:** 0.0km ❌

**Start Point:** [От пътен възел Пазарджик](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пътен възел Цалапица](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 6. Пътен възел Пазарджик – Пътен възел Пловдив Запад
**Expected Distance:** 28km | **Actual:** 0.0km ❌

**Start Point:** [От пътен възел Пазарджик](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пътен възел Пловдив Запад](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 7. Пътен възел Пазарджик – Пътен възел Пловдив Север
**Expected Distance:** 35km | **Actual:** 0.0km ❌

**Start Point:** [От пътен възел Пазарджик](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пътен възел Пловдив Север](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 8. Пътен възел Пловдив Изток – Пютен възел Белозем
**Expected Distance:** 25km | **Actual:** 0.0km ❌

**Start Point:** [От пътен възел Пловдив Изток](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пютен възел Белозем](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 9. Пютен възел Оризово – Пютен възел Чирпан
**Expected Distance:** 9km | **Actual:** 0.0km ❌

**Start Point:** [От пютен възел Оризово](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пютен възел Чирпан](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 10. Пютен възел Чирпан – Първия разклон за Стара Загора
**Expected Distance:** 9km | **Actual:** 50.3km ❌

**Start Point:** [От пютен възел Чирпан](https://maps.google.com/?q=42.200642,25.330496)
- Coordinates: `42.200642, 25.330496`
- Found: Tsentar, бул. Георги Димитров 24, 6200 Chirpan, Bulgaria

**End Point:** [До първия разклон за Стара Загора](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.200642,25.330496/42.1928311,24.3336233)**

---

## 11. Пютен възел Стара Загора – Пютен възел Нова Загора
**Expected Distance:** 30km | **Actual:** 0.0km ❌

**Start Point:** [От пютен възел Стара Загора](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пютен възел Нова Загора](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 12. Пютен възел Нова Загора – Пютен възел Сливен
**Expected Distance:** 36km | **Actual:** 0.0km ❌

**Start Point:** [От пютен възел Нова Загора](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пютен възел Сливен](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 13. Пютен възел Сливен – Пютен възел Зимница
**Expected Distance:** 13km | **Actual:** 0.0km ❌

**Start Point:** [От пютен възел Сливен](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пютен възел Зимница](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 14. Пютен възел Карнобат – Пютен възел Българово
**Expected Distance:** 26km | **Actual:** 0.0km ❌

**Start Point:** [От пютен възел Карнобат](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До пютен възел Българово](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.1928311,24.3336233)**

---

## 15. Пютен възел Българово – Разклон за Айтос
**Expected Distance:** 30km | **Actual:** 200.8km ❌

**Start Point:** [От пютен възел Българово](https://maps.google.com/?q=42.1928311,24.3336233)
- Coordinates: `42.1928311, 24.3336233`
- Found: Avtomagistrala "Trakiya", Bulgaria

**End Point:** [До разклона за Айтос](https://maps.google.com/?q=42.6986806,27.0569307)
- Coordinates: `42.6986806, 27.0569307`
- Found: 8334, Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.1928311,24.3336233/42.6986806,27.0569307)**

---

## 16. Разклон за Айтос – Северен обход на Бургас
**Expected Distance:** 8km | **Actual:** 58.4km ❌

**Start Point:** [От разклона за Айтос](https://maps.google.com/?q=42.6986806,27.0569307)
- Coordinates: `42.6986806, 27.0569307`
- Found: 8334, Bulgaria

**End Point:** [До новото трасе на Северен обход на Бургас](https://maps.google.com/?q=42.5059113,27.4689603)
- Coordinates: `42.5059113, 27.4689603`
- Found: Avtomagistrala "Trakiya", Burgas, Bulgaria

**🗺️ [View Route on Google Maps](https://www.google.com/maps/dir/42.6986806,27.0569307/42.5059113,27.4689603)**

---

## Notes
- All coordinates are successfully geocoded using improved Google Maps API with A1 highway filtering
- **Critical Issue:** Many locations returned generic "Avtomagistrala Trakiya, Bulgaria" coordinates instead of specific interchanges
- Distance discrepancies indicate the need for more specific highway junction/interchange descriptions
- Manual coordinate verification is strongly recommended for accurate speed camera placement
- Click any coordinate link to view the exact location on Google Maps
- Use the route links to verify the actual driving directions between points

## Recommendations
1. **Manual coordinate verification** for each highway interchange/junction
2. Use more specific location queries like "A1 Pazardjik interchange" instead of generic descriptions
3. Consider using highway kilometer markers for more precise positioning
4. Verify coordinates against actual highway infrastructure maps