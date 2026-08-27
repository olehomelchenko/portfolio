---
title: "Власна візуалізація"
example: true
---

Superstore Dashboard

![Dashboard Week 6](https://public.tableau.com/views/Week6Dashboard_17878491996440/Dashboard1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link "650")



```vega-lite

{
  "width": 560,
  "height": 380,
  "title": "Як змінювалась тривалість життя в Україні?",
  "data": {
    "url": "https://gist.githubusercontent.com/olehomelchenko/fab1d4aa75529cff74ef264946216b08/raw/gapminder.csv"
  },
  "transform": [
    {
      "filter": "indexof(['Ukraine', 'Poland', 'Romania', 'Hungary', 'Slovak Republic', 'Belarus', 'Moldova', 'Lithuania', 'Spain', 'Norway', 'Brazil', 'Chile'], datum.country) >= 0 && datum.year >= 1950"
    },
    {
      "calculate": "datum.country === 'Ukraine' ? 'Україна' : (indexof(['Poland', 'Romania', 'Hungary', 'Slovak Republic', 'Belarus', 'Moldova'], datum.country) >= 0 ? 'Сусідні країни' : (indexof(['Lithuania', 'Spain', 'Norway'], datum.country) >= 0 ? 'Інші європейські' : 'Неєвропейські'))",
      "as": "group"
    }
  ],
  "layer": [
    {
      "transform": [{"filter": "datum.country !== 'Ukraine'"}],
      "mark": {"type": "line", "tooltip": true, "strokeWidth": 1.2, "opacity": 0.75},
      "encoding": {
        "x": {
          "field": "year",
          "type": "quantitative",
          "axis": {"format": "d"},
          "title": null
        },
        "y": {
          "field": "life_expectancy",
          "type": "quantitative",
          "scale": {"zero": false},
          "title": "тривалість життя, років"
        },
        "detail": {"field": "country", "type": "nominal"},
        "color": {
          "field": "group",
          "type": "nominal",
          "title": "група країн",
          "scale": {
            "domain": [
              "Україна",
              "Сусідні країни",
              "Інші європейські",
              "Неєвропейські"
            ],
            "range": ["#17325E", "#C2703D", "#3E8E7E", "#8E7CB0"]
          },
          "legend": {"symbolStrokeWidth": 2.5}
        },
        "strokeDash": {
          "field": "group",
          "type": "nominal",
          "title": "група країн",
          "scale": {
            "domain": [
              "Україна",
              "Сусідні країни",
              "Інші європейські",
              "Неєвропейські"
            ],
            "range": [[1, 0], [1, 0], [6, 3], [2, 3]]
          },
          "legend": {"symbolStrokeWidth": 2.5}
        }
      }
    },
    {
      "transform": [{"filter": "datum.country === 'Ukraine'"}],
      "mark": {"type": "line", "strokeWidth": 3.5, "opacity": 1},
      "encoding": {
        "x": {
          "field": "year",
          "type": "quantitative",
          "axis": {"format": "d"},
          "title": null
        },
        "y": {
          "field": "life_expectancy",
          "type": "quantitative",
          "scale": {"zero": false},
          "title": "тривалість життя, років"
        },
        "detail": {"field": "country", "type": "nominal"},
        "color": {
          "field": "group",
          "type": "nominal",
          "title": "група країн",
          "scale": {
            "domain": [
              "Україна",
              "Сусідні країни",
              "Інші європейські",
              "Неєвропейські"
            ],
            "range": ["#17325E", "#C2703D", "#3E8E7E", "#8E7CB0"]
          },
          "legend": {"symbolStrokeWidth": 2.5}
        },
        "strokeDash": {
          "field": "group",
          "type": "nominal",
          "title": "група країн",
          "scale": {
            "domain": [
              "Україна",
              "Сусідні країни",
              "Інші європейські",
              "Неєвропейські"
            ],
            "range": [[1, 0], [1, 0], [6, 3], [2, 3]]
          },
          "legend": {"symbolStrokeWidth": 2.5}
        }
      }
    }
  ]
}
```