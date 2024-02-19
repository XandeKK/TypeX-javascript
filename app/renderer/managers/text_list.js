class TextList {
	current_line = 0;
	list = [];

	/**
	 * Sets the list of texts from a string, splitting by newlines and filtering out empty lines.
	 * @param {string} text - The text to set.
	 */
	setList(text) {
		if (typeof text !== 'string') {
			window.notification.addMessage('Text must be a string.', window.notification.STATUS.ERROR);
	    }

		this.list = text.split("\n").filter(line => line.trim() !== '');
		this.current_line = 0;
	}

	/**
	 * Reads a file from a given path and sets the list of texts from its content.
	 * @param {string} path - The path to the file.
	 */
	async readFile(path) {
		const response = await fetch('file://' + path);
		const text = await response.text();
		this.setList(text);
	}


	/**
	 * Returns the current text from the list.
	 * @returns {string} The current text.
	 */
	getCurrentText() {
		return this.list[this.current_line];
	}


	/**
	 * Moves to the next text in the list, if not already at the end.
	 */
	next() {
		if (this.current_line >= this.list.length - 1) {
			window.notification.addMessage('Cannot go forward; already at the end of the list.', window.notification.STATUS.ERROR);
			return;
		}

		this.current_line++;
	}

	/**
	 * Moves to the previous text in the list, if not already at the beginning.
	 */
	back() {
		if (this.current_line <= 0) {
			window.notification.addMessage('Cannot go back further; already at the beginning of the list.', window.notification.STATUS.ERROR);
			return;
		}

		this.current_line--;
	}

	/**
	 * Moves to a specific index in the list.
	 * @param {number} index - The index to move to.
	 */
	toGo(index) {
		if (index < 0 || index >= this.list.length) {
			window.notification.addMessage(`Index should be between 0 and ${this.list.length - 1} inclusive.`, window.notification.STATUS.ERROR);
			return;
		}

		this.current_line = index;
	}
}

window.text_list = new TextList();