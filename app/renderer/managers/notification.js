class Notification {
	// Callback will be the function responsible for adding the notification to the GUI.
	callback = null;

	constructor() {
		this.setStatus();
		window.notificationAPI.onGetNotification(this.onGetNotification)
	}	

	/**
	 * Asynchronously sets the status by getting it from the notification API.
	 */
	async setStatus() {
		this.STATUS = await window.notificationAPI.getStatus();
	}

	/**
	 * Handles incoming notifications. If a callback is defined, it will be called with the notification.
	 * @param {Object} notification - The incoming notification.
	 */
	onGetNotification(notification) {
		if (!this.callback) {
    		console.error("Does not have a callback, please define it.");
    		return;
    	}

    	this.callback(notification);
	}

	/**
	 * Adds a message with a given status and triggers the onGetNotification handler.
	 * @param {string} message - The message to add.
	 * @param {STATUS} status - The status of the message.
	 */
	addMessage(message, status) {
		const notification = {
			'message': message,
      		'status': status
    	};
		this.onGetNotification(notification);
	}

	/**
	 * Sets the callback function.
	 * @param {Function} value - The callback function.
	 * @throws {Error} If the provided value is not a function.
	 */
  	set callback(value) {
  		if (typeof value !== 'function') {
  			throw new Error('Callback must be a function');
  		}
  		
  		this.callback = value;
  	}
}

window.notification = new Notification();
