const { ipcMain } = require('electron');

class Notification {
	STATUS = {
	    INFO: 0,
	    WARNING: 1,
	    ERROR: 2,
	    SUCCESS: 3
	};
	// sendNotificationToRenderer is mainWindow.webContents.send
	_sendNotificationToRenderer = null;

	constructor() {
		ipcMain.handle('getStatus', this.status.bind(this));
	}

	/**
     * Sends a message to the renderer.
     * @param {string} message - The notification message.
     * @param {STATUS} status - The status of the notification (info, warning, error, success).
     */
	sendMessage(message, status) {
    	if (!this._sendNotificationToRenderer) {
    		console.error("Does not have a sendNotificationToRenderer, please define it.");
    		return;
    	}

  		const notification = {
			'message': message,
      		'status': status
    	};

    	this._sendNotificationToRenderer('notification', notification);
  	}

  	/**
  	 * Returns the possible statuses for notifications.
  	 * @returns {Object} The possible statuses.
  	 */
  	status() {
  		return this.STATUS;
  	}

  	/**
  	 * Sets the function to send notifications to the renderer.
  	 * @param {Function} value - The function to send notifications.
  	 * @throws {Error} If the provided value is not a function.
  	 */
  	set sendNotificationToRenderer(value) {
  		if (typeof value !== 'function') {
  			throw new Error('sendNotificationToRenderer must be a function');
  		}
  		this._sendNotificationToRenderer = value;
  	}
}

module.exports = new Notification();