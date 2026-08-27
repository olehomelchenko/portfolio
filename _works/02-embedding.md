---
title: "Як поставити графік у текст"
example: true
---

Ця робота показує чотири записи. Кожен — один рядок у тексті.

**Специфікація з теки `specs`.**

![Підпис під графіком](specs/demo-bar.vl.json)

**Два графіки в одному ряду.** Два рядки підряд, без порожнього рядка
між ними.

![Ліворуч](specs/demo-bar.vl.json)
![Праворуч](specs/demo-line.vl.json)

**Специфікація просто в тексті.** Файл не потрібен.

```vega-lite
{
  "title": { "text": "Графік, написаний у тексті роботи", "anchor": "start", "fontSize": 15 },
  "height": 160,
  "data": {
    "values": [
      { "крок": "Крок 1", "значення": 12 },
      { "крок": "Крок 2", "значення": 26 },
      { "крок": "Крок 3", "значення": 19 }
    ]
  },
  "mark": { "type": "bar", "color": "#003964" },
  "encoding": {
    "x": {
      "field": "крок",
      "type": "nominal",
      "title": null,
      "sort": null,
      "axis": { "labelAngle": 0 }
    },
    "y": { "field": "значення", "type": "quantitative", "title": null }
  }
}
```

**Графік із Tableau Public.** Нижче стоїть приклад Tableau,
не моя робота. Замініть адресу своєю.

![Приклад Tableau Public](https://public.tableau.com/views/RegionalSampleWorkbook/Storms "650")
