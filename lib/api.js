import axios from "axios";
import axiosRetry from "axios-retry";

// const express = require('express');

// var cors = require('cors');
// express.use(cors());

// Fault-tolerance,
axiosRetry(axios, {
	retries: 3,
	retryDelay: 5000,
});

export const sendContactForm = async data => {
	// console.log("Data being sent from the client:", data);
	try {
		const response = await axios.post("/api/email", data, {
			headers: {
				"Content-Type": "application/json",
				"Accept": "Token",
				// Accept: 'application/json',
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "*",
			},
		});

		// const axios_response = await response.data;

		if (response.status !== 200) {
			console.error("Error:", response.data);
			throw new Error("Failed to send the contact form data");
		}

		return response.data;
	} catch (error) {
		console.error("Network error:", error.message);
		return Promise.reject(error.message);
	}
};

export const sendReminderEmail = async data => {
	// console.log("Data being sent from the client:", data);
	try {
		const response = await axios.post("/api/send_reminder", data, {
			headers: {
				"Content-Type": "application/json",
				// "Accept": "Token",
				// Accept: 'application/json',
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "*",
			},
		});

		// const axios_response = await response.data;

		if (response.status !== 200) {
			console.error("Error:", response.data);
			throw new Error("Failed to send the contact form data");
		}

		return response.data;
	} catch (error) {
		console.error("Network error:", error.message);
		return Promise.reject(error.message);
	}
};

export const sendNTFAccess = async data => {
	// console.log('Data being sent from the client:', data);
	try {
		const response = await axios.post("/api/ntfview", data, {
			headers: {
				"Content-Type": "application/json",
				// 'Accept': 'Token',
				// Accept: 'application/json',
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "*",
			},
		});

		if (response.status !== 200) {
			console.error("Error:", response.data);
			throw new Error("Failed to send the contact form data");
		}

		return response.data;
	} catch (error) {
		console.error("Network error:", error.message);
		return Promise.reject(error.message);
	}
};

export const sendParticipationCert = async data => {
	// console.log('Data received from lib:', data);
	try {
		const response = await axios.post("https://emat.systems/generate-pdf", data, {
			headers: {
				"Content-Type": "application/json",
				// 'Accept': 'Token',
				// Accept: 'application/json',
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "*",
			},
		});

		if (response.status !== 200) {
			console.error("Error:", response.data);
			throw new Error("Failed to send the contact form data");
		}

		return response.data;
	} catch (error) {
		console.error("Network error:", error.message);
		return Promise.reject(error.message);
	}
};
