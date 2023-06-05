import { updateComments, addComment, showRegistrationDialog, showLogInDialog } from "./api.js";


export const body = document.querySelector("body");
export const commentSection = document.querySelector(".comments");
export const notificationSection = document.querySelector(".notification-section");

export let comments = [];


window.addEventListener("load", () => {
	const registerButton = document.querySelector(".register-button");
	registerButton.addEventListener("click", () => {
		showRegistrationDialog();
	});

	const loginButton = document.querySelector(".login-button");
	loginButton.addEventListener("click", () => {
		showLogInDialog();
	});

	updateComments();
});
