class PatternManager {
	directories = [];
	images_path = [];
	
	constructor() {
		this.loadConfiguration();
	}

	/**
	 * Save the current configuration to a file
	 */
	saveConfiguration() {
		const settings = {
			'directories': this.directories
		};

		window.electronStoreAPI.set('patterns_configuration', settings);
	}

	/**
	 * Load configuration from a file
	 */
	async loadConfiguration() {
		const data = await window.electronStoreAPI.get('fonts_configuration');

		if (data === undefined) return;

	    this.directories = data.directories;
	}

	/**
	 * Add a directory to the list
	 * @param {string} dir - Directory path to be added
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
     * Remove a directory from the list
     * @param {number} index - Index of the directory to be removed
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
	 * Asynchronously scan all directories for patterns
	 */
	async scanDirectories() {
		this.images_path = [];

	    const dirs_length = this.directories.length;

	    await Promise.all(this.directories.map(async (dir) => {
	        await this.scanPatterns(dir);
	    }));

	    this.saveConfiguration();
	}

	/**
	 * Asynchronously scan a directory for image patterns
	 * @param {string} dir_path - Path of the directory to scan
	 */
	async scanPatterns(dir_path) {
        try {
            const files = await window.FileSystemAPI.readdir(dir_path);

            await Promise.all(files.map(async (file) => {
            	const full_path = await window.FileSystemAPI.join(dir_path, file);

                if (await window.FileSystemAPI.isDirectory(full_path)) {
                    await this.scanPatterns(full_path);
                } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file)) {
                	this.images_path.push(full_path);
                }
            }));
        } catch (error) {
            console.error('Font Manager: An error occurred during scanning:', error);
        }
    }
}

window.pattern_manager = new PatternManager()