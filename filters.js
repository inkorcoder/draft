window.createFilter = function (frequency) {
	var filter = context.createBiquadFilter();
	filter.type = "allpass";

	filter.type = 'peaking'; // тип фильтра
	filter.frequency.value = frequency.freq; // частота
	filter.Q.value = 1; // Q-factor
	filter.gain.value = frequency.gain;

	return filter;
};

window.createFilters = function () {
	filters = frequencies.map(createFilter);

	filters.reduce(function (prev, curr) {
		prev.connect(curr);
		return curr;
	});

	return filters;
};

window.equalize = function (audio) {
	var filters = createFilters();

	// источник цепляем к первому фильтру 
	source.connect(filters[0]);
	// а последний фильтр - к выходу
	filters[filters.length - 1].connect(context.destination);
};

