var zipPoints = function(seqX, seqY) {
		var points = [];
		for (var i = 0; i < seqX.length; i++) {
			var x = seqX[i];
			var y = seqY[i];

			points.push({
				x: x,
				y: y
			});
		}
		return points;
	};

var extractSeries = function(metrics, baseMetric) {
		var timestamps = metrics.timestamps;
		var subMetricNames = Object.keys(metrics.metrics).filter(function(metricName) {
			return metricName.indexOf(baseMetric) !== -1 && metricName !== baseMetric;
		});
		if (subMetricNames.length === 0) {
			subMetricNames.push(baseMetric);
		}

		var series = [];
		for (var i = 0; i < subMetricNames.length; i++) {
			var name = subMetricNames[i];
			series.push({
				name: name,
				color: "hsl(210,97%," + (95 - (i + 1) * 30) + "%)",
				highlightColor: 'red',
				points: zipPoints(timestamps, metrics.metrics[name])
			});
		}

		return series;
	};

module.exports = extractSeries;
module.exports.zipPoints = zipPoints;