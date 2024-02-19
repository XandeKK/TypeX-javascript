class Preference {
	HQ_STYLES = {
		'MANGA': 0,
		'MANHWA': 1,
		'MANHUA': 2,
		'COMIC': 3
	}

	HQ_STYLES_STRING = {
		0: 'Manga',
		1: 'Manhwa',
		2: 'Manhua',
		3: 'Comic'
	}

	canvas = {
		'styles': {
			0: {
				'default_font': null,
				'font_size': 20,
				'color': '#000000'
			},
			1: {
				'default_font': null,
				'font_size': 20,
				'color': '#000000'
			},
			2: {
				'default_font': null,
				'font_size': 20,
				'color': '#000000'
			},
			3: {
				'default_font': null,
				'font_size': 20,
				'color': '#000000'
			}
		},
		'text_edge': {
			'color_active': '#ff000077',
			'color_deactive': '#00000033'
		},
		'padding': {
			'color_active': '#0000ff77',
		}
	}

	general = {
		'is_dark_mode': window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
		'cleaned_path': 'cleaned',
		'raw_path': 'raw',
		'text_path': 'text.txt',
		'app_files_path': 'app_files',
		'language': navigator.language
	}

	constructor() {
		this.loadConfiguration();
	}

	saveConfiguration() {
		const settings = {
			'canvas': this.canvas,
			'general': this.general
		};

		window.electronStoreAPI.set('preference_configuration', settings);
	}

	async loadConfiguration() {
		const data = await window.electronStoreAPI.get('preference_configuration');

		if (data === undefined) return;

      	this.canvas = data.canvas;
      	this.general = data.general;

      	this.load_general();
	}

	load_general() {
		// to do
	}
}
window.preference = new Preference();