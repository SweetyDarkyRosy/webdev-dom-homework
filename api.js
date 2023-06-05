import { renderComments } from "./render.js";
import { body, commentSection, notificationSection, comments } from "./index.js";


// Comment template for HTML code
const commentTemplate = '<div class="comment-header"></div><div class="comment-body">\
	<div class="comment-text"></div></div><div class="comment-footer"><div class="likes">\
	<span class="likes-counter"></span><button class="like-button"></button></div></div>';

// Registration dialog HTML code
const registrationDialogCode = '<div class="authorization-dialog"><h1>Регистрация</h1><input type="text" class="authorization-dialog-input user-login-input" placeholder="Логин"/>\
	<input type="text" class="authorization-dialog-input user-password-input" placeholder="Пароль"/><input type="text" class="authorization-dialog-input user-name-input" placeholder="Имя пользователя"/>\
	<button class="simple-button">Зарегистрироваться</button></div>'

// Login dialog HTML code
const logInDialogCode = '<div class="authorization-dialog"><h1>Авторизация</h1><input type="text" class="authorization-dialog-input user-login-input" placeholder="Логин"/>\
	<input type="text" class="authorization-dialog-input user-password-input" placeholder="Пароль"/><button class="simple-button">Войти</button></div>'

	// Comment add form HTML code
const addFormCode = '<input type="text" class="add-form-name" placeholder="Введите ваше имя"/>\
	<textarea type="textarea" class="add-form-text" placeholder="Введите ваш коментарий" rows="4"></textarea>\
	<div class="add-form-row"><button class="add-form-button">Написать</button></div>'


// Comment class
class CComment {
	constructor(headerText, commentText, addDate) {
		this.headerText = headerText;
		this.commentText = commentText;
		this.likeCount = 0;
		this.isLikedByUser = false;
		this.addDate = addDate;
	}

	getCommentCode() {
		const commentItem = document.createElement("li");
		commentItem.classList.add("comment");
		commentItem.innerHTML = commentTemplate;

		{
			const newCommentHeader = commentItem.querySelector(".comment-header");
	
			const newCommentHeaderName = document.createElement("div");

			let formatedCommentHeaderNameStr = this.headerText;
			formatedCommentHeaderNameStr = formatedCommentHeaderNameStr.replaceAll('<', "&lt;");
			formatedCommentHeaderNameStr = formatedCommentHeaderNameStr.replaceAll('>', "&gt;");
			newCommentHeaderName.innerHTML = formatedCommentHeaderNameStr;

			newCommentHeader.appendChild(newCommentHeaderName);
	
			let currTime = new Date();
	
			const newCommentHeaderTime = document.createElement("div");
			newCommentHeaderTime.innerHTML = this.addDate;
			newCommentHeader.appendChild(newCommentHeaderTime);
		}
	
		{
			const newCommentText = commentItem.querySelector(".comment-text");

			let formatedCommentTextStr = this.commentText;
			formatedCommentTextStr = formatedCommentTextStr.replaceAll('<', "&lt;");
			formatedCommentTextStr = formatedCommentTextStr.replaceAll('>', "&gt;");
			newCommentText.innerHTML = formatedCommentTextStr.replaceAll(/(?:\r\n|\r|\n)/g, "<br>");

			newCommentText.addEventListener("click", (event) => {
				event.stopPropagation();

				const addFormComment = document.querySelector(".add-form-text");

				if (addFormComment.value.length != 0)
				{
					addFormComment.value += '\n';
				}

				addFormComment.value = addFormComment.value + '> ' + this.commentText + '\n\n' + this.headerText + ',';
			});
		}

		{
			const likeCount = commentItem.querySelector(".likes-counter");
			likeCount.innerHTML = String(this.likeCount);
		}

		{
			const likeButton = commentItem.querySelector(".like-button");
			if (this.isLikedByUser === true)
			{
				likeButton.classList.add("-active-like");
			}

			likeButton.addEventListener("click", (event) => {
				event.stopPropagation();

				if (this.isLikedByUser === true)
				{
					this.isLikedByUser = false;
					this.likeCount--;
				}
				else
				{
					this.isLikedByUser = true;
					this.likeCount++;
				}

				renderComments(commentSection, comments);
			});
		}

		return commentItem;
	}
}


function addDefaultNotification(notificationText) {
	const notificationDiv = document.createElement('DIV');
	notificationDiv.classList.add('notification');
	notificationDiv.classList.add('default-notification-style');
	notificationDiv.innerHTML = "<h1>" + notificationText + "</h1>";

	notificationSection.appendChild(notificationDiv);

	return notificationDiv;
}

function addErrorNotification(notificationText) {
	const notificationDiv = document.createElement('DIV');
	notificationDiv.classList.add('notification');
	notificationDiv.classList.add('error-notification-style');
	notificationDiv.innerHTML = "<h1>" + notificationText + "</h1>";

	notificationSection.appendChild(notificationDiv);

	return notificationDiv;
}

function removeNotification(notification, delay) {
	setTimeout(() => {
			notificationSection.removeChild(notification)
		}, delay);
}

export function updateComments() {
	const updateNotification = addDefaultNotification("Обновление списка комментариев");
	removeNotification(updateNotification, 2000);

	fetch("https://webdev-hw-api.vercel.app/api/v1/viktoriia-pashchenko/comments",
		{
			method: "GET"
		}).then((response) => {
				if (response.status == 404)
				{
					const internetErrorNotification = addErrorNotification("Ошибка подключения");
					removeNotification(internetErrorNotification, 2000);

					alert("Кажется, у вас сломался интернет, попробуйте позже");
					Promise.reject("Ошибка соединения");
				}
				else if (response.status == 500)
				{
					const serverErrorNotification = addErrorNotification("Неисправность на сервере");
					removeNotification(serverErrorNotification, 2000);

					alert("Сервер сломался, попробуй позже");
					Promise.reject("Неисправность на сервере");
				}
				else
				{
					return response.json();
				}
			}).then((responseData) => {
					for (let i = comments.length; i < responseData.comments.length; i++)
					{
						let addDate = String(responseData.comments[i].date);
						addDate = addDate.replace(/([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+:[0-9]+:[0-9]+).[0-9]+Z/, "$3.$2.$1 $4");
			
						const newComment = new CComment(responseData.comments[i].author.name, responseData.comments[i].text,
							addDate);
						comments.push(newComment);
					}

					const addFormButton = document.querySelector(".add-form-button");
					if (addFormButton != null)
					{
						addFormButton.classList.remove("hidden");
					}
					

					const successNotification = addDefaultNotification("Комментарии были успешно загружены");
					removeNotification(successNotification, 3000);

					renderComments(commentSection, comments);
				}).catch((error) => {
						const commonErrorNotification = addErrorNotification("Произошла ошибка загрузки данных");
						removeNotification(commonErrorNotification, 2000);

						const addFormButton = document.querySelector(".add-form-button");
						if (addFormButton != null)
						{
							addFormButton.classList.remove("hidden");
						}

						console.error(error);
					});
}

export function showRegistrationDialog() {
	const registrationDiv = document.createElement('DIV');
	registrationDiv.classList.add('authorization-modal');
	registrationDiv.innerHTML = registrationDialogCode;

	const newUserLoginInput = registrationDiv.querySelector(".user-login-input");
	newUserLoginInput.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	const newUserPasswordInput = registrationDiv.querySelector(".user-password-input");
	newUserPasswordInput.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	const newUserNameInput = registrationDiv.querySelector(".user-name-input");
	newUserNameInput.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	const registerButton = registrationDiv.querySelector(".simple-button");
	registerButton.addEventListener("click", () => {
		if (newUserLoginInput.value.length === 0)
		{
			newUserLoginInput.classList.add("invalid-el");
			return;
		}

		if (newUserPasswordInput.value.length === 0)
		{
			newUserPasswordInput.classList.add("invalid-el");
			return;
		}

		if (newUserNameInput.value.length === 0)
		{
			newUserNameInput.classList.add("invalid-el");
			return;
		}

		let newUserData = {
			"login": newUserLoginInput.value,
			"name": newUserNameInput.value,
			"password": newUserPasswordInput.value
		};

		fetch("https://wedev-api.sky.pro/api/user",
		{
			method: "POST",
			body: JSON.stringify(newUserData)
		}).then((response) => {
				if (response.status == 404)
				{
					const internetErrorNotification = addErrorNotification("Ошибка подключения");
					removeNotification(internetErrorNotification, 2000);

					alert("Кажется, у вас сломался интернет, попробуйте позже");
					Promise.reject("Ошибка соединения");
				}
				else if (response.status == 400)
				{
					const serverErrorNotification = addErrorNotification("Не удалось зарегистрироваться. Пользователь с таким логином уже существует");
					removeNotification(serverErrorNotification, 2000);

					alert("Пользователь с таким логином уже существует");
					Promise.reject("Пользователь уже существует");
				}
				else if (response.status == 500)
				{
					const serverErrorNotification = addErrorNotification("Неисправность на сервере");
					removeNotification(serverErrorNotification, 2000);

					alert("Сервер сломался, попробуй позже");
					Promise.reject("Неисправность на сервере");
				}
				else
				{
					const successNotification = addDefaultNotification("Регистрация прошла успешно");
					removeNotification(successNotification, 3000);

					body.removeChild(registrationDiv);
				}
			}).catch((error) => {
					const commonErrorNotification = addErrorNotification("Произошла ошибка. Регистрация не была проведена успешно");
					removeNotification(commonErrorNotification, 2000);

					body.removeChild(registrationDiv);

					console.error(error);
				});
	});

	const containerSection = document.querySelector(".authorization-header");
	body.insertBefore(registrationDiv, containerSection);
}

function postLogIn() {
	const authorizationHeader = document.querySelector(".authorization-header");
	body.removeChild(authorizationHeader);

	const addFormDiv = document.createElement('DIV');
	addFormDiv.classList.add('add-form');
	addFormDiv.innerHTML = addFormCode;

	const nameInput = addFormDiv.querySelector(".add-form-name");
	nameInput.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	const commentText = addFormDiv.querySelector(".add-form-text");
	commentText.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	const addFormButton = addFormDiv.querySelector(".add-form-button");
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

	const container = document.querySelector(".container");
	container.appendChild(addFormDiv);
}

export function showLogInDialog() {
	const logInDiv = document.createElement('DIV');
	logInDiv.classList.add('authorization-modal');
	logInDiv.innerHTML = logInDialogCode;

	const newUserLoginInput = logInDiv.querySelector(".user-login-input");
	newUserLoginInput.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	const newUserPasswordInput = logInDiv.querySelector(".user-password-input");
	newUserPasswordInput.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	const registerButton = logInDiv.querySelector(".simple-button");
	registerButton.addEventListener("click", () => {
		if (newUserLoginInput.value.length === 0)
		{
			newUserLoginInput.classList.add("invalid-el");
			return;
		}

		if (newUserPasswordInput.value.length === 0)
		{
			newUserPasswordInput.classList.add("invalid-el");
			return;
		}

		let userData = {
			"login": newUserLoginInput.value,
			"password": newUserPasswordInput.value
		};

		fetch("https://wedev-api.sky.pro/api/user/login",
		{
			method: "POST",
			body: JSON.stringify(userData)
		}).then((response) => {
			if (response.status == 404)
			{
				const internetErrorNotification = addErrorNotification("Ошибка подключения");
				removeNotification(internetErrorNotification, 2000);

				alert("Кажется, у вас сломался интернет, попробуйте позже");
				Promise.reject("Ошибка соединения");
			}
			else if (response.status == 400)
			{
				const serverErrorNotification = addErrorNotification("Не удалось авторизоваться. Неверный логин или пароль");
				removeNotification(serverErrorNotification, 2000);

				alert("Не удалось авторизоваться. Неверный логин или пароль");
				Promise.reject("Неверный логин или пароль");
			}
			else if (response.status == 500)
			{
				const serverErrorNotification = addErrorNotification("Неисправность на сервере");
				removeNotification(serverErrorNotification, 2000);

				alert("Сервер сломался, попробуй позже");
				Promise.reject("Неисправность на сервере");
			}
			else
			{
				const successNotification = addDefaultNotification("Авторизация прошла успешно");
				removeNotification(successNotification, 3000);

				body.removeChild(logInDiv);

				postLogIn();
			}
		}).catch((error) => {
				const commonErrorNotification = addErrorNotification("Произошла ошибка. Не удалось авторизоваться");
				removeNotification(commonErrorNotification, 2000);

				body.removeChild(logInDiv);

				console.error(error);
			});
	});

	const containerSection = document.querySelector(".authorization-header");
	body.insertBefore(logInDiv, containerSection);
}

export function addComment(headerText, commentText) {
	let rawCommentData = {
		"name": headerText,
		"text": commentText
	};

	const addCommentNotification = addDefaultNotification("Добавление комментария");
	removeNotification(addCommentNotification, 2000);
	
	fetch("https://webdev-hw-api.vercel.app/api/v1/viktoriia-pashchenko/comments",
		{
			method: "POST",
			body: JSON.stringify(rawCommentData)
		}).then((response) => {
				if (response.status == 404)
				{
					const internetErrorNotification = addErrorNotification("Ошибка подключения");
					removeNotification(internetErrorNotification, 2000);

					alert("Кажется, у вас сломался интернет, попробуйте позже");
					Promise.reject("Ошибка соединения");
				}
				else if (response.status == 400)
				{
					const serverErrorNotification = addErrorNotification("Условия не были выполнены");
					removeNotification(serverErrorNotification, 2000);

					alert("Имя и комментарий должны быть не короче 3 символов");

					const nameInput = document.querySelector(".add-form-name");
					nameInput.value = '';

					const commentText = document.querySelector(".add-form-text");
					commentText.value = '';

					Promise.reject("Неверный запрос");
				}
				else if (response.status == 500)
				{
					const serverErrorNotification = addErrorNotification("Неисправность на сервере");
					removeNotification(serverErrorNotification, 2000);

					alert("Сервер сломался, попробуй позже");
					Promise.reject("Неисправность на сервере");
				}
				else
				{
					const successNotification = addDefaultNotification("Комментарий был загружен");
					removeNotification(successNotification, 3000);

					const addFormButton = document.querySelector(".add-form-button");
					addFormButton.classList.add("hidden");

					const nameInput = document.querySelector(".add-form-name");
					nameInput.value = '';

					const commentText = document.querySelector(".add-form-text");
					commentText.value = '';

					setTimeout(() => {
							updateComments();
						}, 1500);
				}
			}).catch((error) => {
					const commonErrorNotification = addErrorNotification("Произошла ошибка. Комментарий не был отправлен");
					removeNotification(commonErrorNotification, 2000);

					console.error(error);
				});
}
