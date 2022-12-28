# Obsidian Vega

Create data visualizations using Vega or Vega-Lite specifications written in JSON format. Additional documentation can be found at the Vega website for formatting [Vega specifications](https://vega.github.io/vega/docs/) and [Vega-Lite spefications](https://vega.github.io/vega-lite/docs/). 

To add a chart or plot, create a code block with `vega` or `vega-lite` as the language and add the JSON specification.

~~~markdown
```vega-lite
{
  "width": 300,
  "data": {
    "values": [
      {"a": "A", "b": 39}, {"a": "B", "b": 98},
      {"a": "C", "b": 76}, {"a": "D", "b": 23}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": { "field": "a", "type": "nominal", "axis": { "labelAngle": 0 } },
    "y": { "field": "b", "type": "quantitative" }
  }
}
```
~~~
