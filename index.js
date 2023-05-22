import { updateComments, addComment } from "./api.js";


export const body = document.querySelector("body");
export const addFormButton = document.querySelector(".add-form-button");
export const commentSection = document.querySelector(".comments");
export const notificationSection = document.querySelector(".notification-section");

export let comments = [];


window.addEventListener("load", () => {
	const nameInput = document.querySelector(".add-form-name");
	const commentText = document.querySelector(".add-form-text");

	addFormButton.addEventListener("click", () => {
		if (nameInput.value.length === 0)
		{
			nameInput.classList.add("invalid-el");
			return;
		}

		if (commentText.value.length === 0)
		{
			commentText.classList.add("invalid-el");
			return;
		}

		addComment(nameInput.value, commentText.value);
	});

	nameInput.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	commentText.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	updateComments();
});
