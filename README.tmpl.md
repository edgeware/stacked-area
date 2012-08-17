# Stacked-area
Stacked-area is a graphing component for creating stacked area visualizations of data.

## Getting started

To instantiate a graph, you need to provide
* A target dom element
* A list of data series
* An options object (optional)

		var graph = new StackedGraph(elem, series, { /*options*/ } );

The series data should be and array of series objects each having the following attributes
* name {String, optional}
* color {String, optional}
* highlightColor {String, optional}
* points {Array}

The points array contains the actual data for the series. Each point should have the attributes
* x {Number}
* y {Number}

### Methods

Once you have instantiated a graph, there is a set of methods available for zooming, getting values etc.

--- api documentation ---