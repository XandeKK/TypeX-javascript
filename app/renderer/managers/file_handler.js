class FileHandler {
	current_page = 0;
	current_style = '';
	cleaned_images_path = [];
	default_path = '';
	cleaned_path = '';
	raw_path = '';
	text_path = '';
	app_files_path = '';

	/**
     * Checks if the specified directory contains the cleaned images directory.
     * @param {string} path - The directory path to check.
     * @returns {boolean} - True if the directory contains the cleaned images directory, false otherwise.
     */
	async HasDirCleaned(path) {
		const cleaned_path = await window.FileSystemAPI.join(path, window.preference.general.cleaned_path);
		return await window.FileSystemAPI.existsSync(cleaned_path);
	}

	/**
     * Retrieves information about the current image, including paths for cleaned and raw images, and additional data from a JSON file.
     * @returns {Object} - Information about the current image.
     */
	async getImage() {
		const info = {}

		const filename = this.cleaned_images_path[this.current_page];
		info.cleaned = await window.FileSystemAPI.join(this.cleaned_path, filename);
		info.raw = await window.FileSystemAPI.join(this.raw_path, filename);

		const filename_app = await window.FileSystemAPI.join(this.app_files_path, filename.replace(/\..+$/, '.json'));
		
		if (await window.FileSystemAPI.existsSync(filename_app)) {
			try {
				const response = await fetch('file://' + filename_app);
				const data = await response.json();
				
				info.data = data;
			} catch {}
		}

		return info;
	}

	/**
     * Opens the specified path, sets the current style, and initializes paths for cleaned, raw, app files, and text files.
     * @param {string} path - The path to open.
     * @param {string} style - The style to set.
     * @returns {boolean} - True if successful, false otherwise.
     */
	async open(path, style) {
		if (!await this.HasDirCleaned(path)) {
			window.notification.addMessage(`Does not have the ${window.preference.general.cleaned_path} directory in ${path}` , window.notification.STATUS.DANGER);
			return false;
		}

		this.current_style = style;
		this.current_page = 0;
		this.default_path = path;

		await this.set_paths()

		this.cleaned_images_path = await this.process_images(this.cleaned_path);

		window.text_list.readFile(this.text_path);

		return true;
	}

	/**
     * Sets paths for cleaned, raw, app files, and text files based on the default path.
     */
	async set_paths() {
		this.cleaned_path = await window.FileSystemAPI.join(this.default_path, window.preference.general.cleaned_path);
		this.raw_path = await window.FileSystemAPI.join(this.default_path, window.preference.general.raw_path);
		this.app_files_path = await window.FileSystemAPI.join(this.default_path, window.preference.general.app_files_path);
		this.text_path = await window.FileSystemAPI.join(this.default_path, window.preference.general.text_path);
	}

	/**
     * Processes images in the specified path, filters based on image file extensions, and sorts them.
     * @param {string} path - The path to process.
     * @returns {Array} - Array of processed image files.
     */
	async process_images(path) {
		let files = await window.FileSystemAPI.readdir(path);
		files = files.filter((file) =>  /\.(png|jpg|jpeg|webp)$/i.test(file));
		files.sort(this.compareFiles);

		return files;
	}

	/**
     * Comparison function for sorting files numerically.
     * @param {string} a - The first file.
     * @param {string} b - The second file.
     * @returns {boolean} - True if the first file is numerically less than the second file, false otherwise.
     */
	compareFiles(a, b) {
	    let aNumber = parseInt(a);
	    let bNumber = parseInt(b);
	    return aNumber < bNumber;
	}

	/**
     * Moves to the next page if possible.
     */
	next() {
		if (this.current_page == this.cleaned_images_path.length - 1 || this.cleaned_images_path.length == 0) return;
		
		this.current_page += 1;
	}

	/**
     * Moves to the previous page if possible.
     */
	back() {
		if (this.current_page == 0) return;
		
		this.current_page -= 1;
	}

	/**
     * Moves to the specified page index if valid.
     * @param {number} index - The index to move to.
     */
	toGo(index) {
		if (index < 0 || index > this.cleaned_images_path.length - 1) return;
		
		this.current_page = index
	}
}

window.file_handler = new FileHandler();