var constructSeries = function(name, timestamps, values){
	var points = [];
	for(var i = 0; i<timestamps.length; i++){
		var timestamp = timestamps[i];
		var value = values[i];

		points.push({
			x: timestamp,
			y: value
		});
	}
	return {
		name: name,
		points: points
	};
};

var extractSeries = function(metrics, baseMetric){
	var timestamps = metrics.timestamps;
	var subMetricNames = Object.keys(metrics.metrics).filter(function(metricName){
		return metricName.indexOf(baseMetric) !== -1 && metricName !== baseMetric;
	});

	var series = [];
	for(var i = 0; i<subMetricNames.length; i++){
		var name = subMetricNames[i];
		var s = constructSeries(name, timestamps, metrics.metrics[name]); 
		s.color = "hsl(210,97%," + (95 -(i+1)*30) + "%)";
		series.push( s );
	}

	return series;
};

module.exports = extractSeries;
module.exports.constructSeries = constructSeries;
