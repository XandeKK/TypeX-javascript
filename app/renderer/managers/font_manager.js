class FontManager {
	directories = [];
	fonts = {};
	fonts_path = {};

	constructor() {
		this.loadConfiguration();
	}

	saveConfiguration() {
		const settings = {
			'directories': this.directories,
			'fonts': this.serialize_fonts(this.fonts)
		};

		window.electronStoreAPI.set('fonts_configuration', settings);
	}

	async loadConfiguration() {
		const data = await window.electronStoreAPI.get('fonts_configuration');

		if (data === undefined) return;

		this.directories = data.directories;

		await this.scanDirectories();

		this.deserialize_fonts(data.fonts);
	}

	/**
	 * Serializes font data for saving configuration.
	 * @param {object} _fonts - The font data to be serialized.
	 * @returns {object} - Serialized font data.
	 */
	serialize_fonts(_fonts) {
		const serialized_fonts = {};
		for (const font_name in _fonts){
			serialized_fonts[font_name] = {
				'font': _fonts[font_name]['font'],
				'nickname': _fonts[font_name]['nickname']
			};
		}
		return serialized_fonts;
	}

	/**
	 * Deserializes font data from loaded configuration.
	 * @param {object} _fonts - Serialized font data to be deserialized.
	 */
	deserialize_fonts(_fonts) {
		for (const font_name in _fonts) {
			this.addFont(font_name);
			if (this.fonts.hasOwnProperty(font_name)) {
				this.fonts[font_name]['nickname'] = _fonts[font_name]['nickname'];
			}
		}
	}

	/**
	 * Adds a directory to the list of directories to be scanned for fonts.
	 * @param {string} dir - The directory to be added.
	 */
	async addDir(dir) {
		if (this.directories.indexOf(dir) != -1) {
			window.notification.addMessage('Already have this directory.', window.notification.STATUS.DANGER);
			return;
		}

		if (!await window.FileSystemAPI.existsSync(dir)) {
		    window.notification.addMessage('Directory does not exist.', window.notification.STATUS.ERROR);
			return;
		}

		this.directories.push(dir);
		this.scanDirectories();
	}

	/**
	 * Removes a directory from the list of directories to be scanned for fonts.
	 * @param {number} index - The index of the directory to be removed.
	 */
	removeDir(index) {
		if (index < 0 || index >= this.directories.length) {
			window.notification.addMessage('Index out of range.', window.notification.STATUS.ERROR);
			return;
		}

		this.directories.splice(index, 1);
		this.scanDirectories();
	}

	/**
	 * Scans all directories for fonts.
	 */
	async scanDirectories() {
	    const old_fonts = Object.assign({}, this.fonts);

	    document.fonts.clear();
	    this.fonts = {};
	    this.fonts_path = {};
	    
	    const dirs_length = this.directories.length;

	    await Promise.all(this.directories.map(async (dir) => {
	        await this.scanFonts(dir);
	    }));

	    this.restoreFonts(old_fonts);
	    this.saveConfiguration();
	}

	/**
	 * Scans a specific path for fonts.
	 * @param {string} dir_path - The path to be scanned for fonts.
	 */
	async scanFonts(dir_path) {
        try {
            const files = await window.FileSystemAPI.readdir(dir_path);

            await Promise.all(files.map(async (file) => {
                const full_path = await window.FileSystemAPI.join(dir_path, file);

                if (await window.FileSystemAPI.isDirectory(full_path)) {
                    await this.scanFonts(full_path);
                } else if (/\.(otf|ttf)$/i.test(file)) {
                    this.processFontFile(full_path);
                }
            }));
        } catch (error) {
            console.error('Font Manager: An error occurred during scanning:', error);
        }
    }

	/**
	 * Processes a font file.
	 * @param {string} font_file_path - The path of the font file to be processed.
	 */
	async processFontFile(font_file_path) {
		let font_name = await window.FileSystemAPI.basename(font_file_path);

	    let font_style = this.parseFontStyle(font_name);

	    if (!this.fonts_path.hasOwnProperty(font_style['font'])) {
	        this.fonts_path[font_style['font']] = {};
	    }

	    this.fonts_path[font_style['font']][font_style['style']] = font_file_path;
	}

	/**
	 * Parses the style of a font.
	 * @param {string} font_name - The name of the font to be parsed.
	 */
	parseFontStyle(font_name) {
		let font_lower = font_name.toLowerCase();
	    let regex = /[-_ ]?(reg(ular)?|bold[-_ ]?ital(ic)?|bold|ital(ic)?)$/i;
	    let result = font_lower.match(regex);

	    if (result) {
	        let style = result[0];
	        let _font_name = font_name.slice(0, result.index);

	        return { 'font': _font_name, 'style': this.sanitizeFontStyle(style) };
	    }

	    return { 'font': font_name, 'style': 'regular' };
	}

	/**
	 * Sanitizes the style of a font.
	 * @param {string} style - The style of the font to be parsed.
	 */
	sanitizeFontStyle(style) {
		if (style.includes('bold') && style.includes('ital')) {
			return 'bold-italic';
		} else if (style.includes('bold')) {
			return 'bold';
		} else if (style.includes('ital')) {
			return 'italic';
		}

		return 'regular';
	}

	/**
	 * Restores fonts.
	 * @param {Object} old_fonts - The old fonts to be restored.
	 */
	restoreFonts(old_fonts) {
		for (font_name in old_fonts) {
			if (this.fonts_path.hasOwnProperty(font_name)) {
				this.addFont(font_name);
				this.fonts[font_name]['nickname'] = old_fonts[font_name]['nickname'];
			}
		}
	}

	/**
	 * Adds a font.
	 * @param {string} font_name - The name of the font to be added.
	 */
	addFont(font_name) {
		if (this.fonts_path.hasOwnProperty(font_name)) {
			const font_object = this.fonts_path[font_name];
			this.fonts[font_name] = {
			    'font': font_name,
			    'nickname': null
			};

			this.loadRegularFont(font_name, (err, font) => {
			    if (err) {
			        console.error(err);
			    } else {
			        this.fonts[font_name]['regular'] = font;
			    }
			});

			this.loadFont(font_object['bold'], font_name, 'bold', (err, font) => {
			    if (err) {
			        console.error(err);
			    } else {
			        this.fonts[font_name]['bold'] = font;
			    }
			});

			this.loadFont(font_object['italic'], font_name, 'italic', (err, font) => {
			    if (err) {
			        console.error(err);
			    } else {
			        this.fonts[font_name]['italic'] = font;
			    }
			});

			this.loadFont(font_object['bold-italic'], font_name, 'bold-italic', (err, font) => {
			    if (err) {
			        console.error(err);
			    } else {
			        this.fonts[font_name]['bold-italic'] = font;
			    }
			});
			this.saveConfiguration();
			return true;
		}
		
		// Notification.message(tr('KEY_FONT_NOT_FOUND') + font);
		return false;
	}

	/**
	 * Removes a font.
	 * @param {string} font_name - The name of the font to be removed.
	 */
	removeFont(font_name) {
		if (this.fonts.hasOwnProperty(font_name)) {
			document.fonts.delete(this.fonts[font_name]['regular']);
			document.fonts.delete(this.fonts[font_name]['bold']);
			document.fonts.delete(this.fonts[font_name]['italic']);
			document.fonts.delete(this.fonts[font_name]['bold-italic']);

			delete this.fonts[font_name];
			this.saveConfiguration();
			return true;
		}
		// Notification.message(tr('KEY_FONT_NOT_FOUND') + font);
		return false;
	}

	/**
	 * Edits the nickname of a font.
	 * @param {string} font_name - The name of the font.
	 * @param {string} nickname - The new nickname for the font.
	 */
	editNickname(font_name, nickname) {
		if (!this.fonts.hasOwnProperty(font_name)) {
			window.notification.addMessage(`Font not found: ${font_name}`, window.notification.STATUS.ERROR);
			return;
		}
		this.fonts[font_name]['nickname'] = nickname.length == 0 ? '' : nickname;
		this.saveConfiguration();
	}

	/**
	 * Loads a regular font or another style if there is no regular font.
	 * @param {string} font_name - The name of the font to be loaded.
	 */
	loadRegularFont(font_name, callback) {
		if (!this.fonts_path.hasOwnProperty(font_name)){
			window.notification.addMessage(`Font not found: ${font_name}`, window.notification.STATUS.ERROR);
			this.loadFont('', font_name, 'regular', callback);
			return;
		}

		var font_object = this.fonts_path[font_name];
		
		if (font_object.hasOwnProperty('regular')){
			this.loadFont(font_object['regular'], font_name, 'regular', callback);
			return;
		}

		var style = Object.keys(font_object)[0];
		this.loadFont(font_object[style], font_name, style, callback);
	}

	/**
	 * Loads a font from a file path.
	 * @param {string} font_file_path - The path of the font file to be loaded.
	 * @param {string} font_name - The name of the font to be loaded.
	 * @param {string} style - The style of the font to be loaded.
	 * @param {function} callback - Callback function to handle the loaded font.
	 */
	loadFont(font_file_path, font_name, style, callback) {
	    if (font_file_path == undefined || font_file_path.length == 0) {
	        callback(null, new FontFace('invalid', ''));
	        return;
	    }

	    let font = new FontFace(font_name + '-' + style, 'url(file://' + font_file_path + ')');
		font.load().then(function(loaded_font) {
		    document.fonts.add(loaded_font);
		    callback(null, loaded_font);
		}).catch(function(error) {
		    console.error(`Error loading font from 'file://${font_file_path}': ${error}`);
		    callback(error);
		});
	}
}

window.font_manager = new FontManager();