import { renderComments } from "./render.js";
import { body, addFormButton, commentSection, notificationSection, comments } from "./index.js";


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

// Comment template for HTML code
const commentTemplate = '<div class="comment-header"></div><div class="comment-body">\
	<div class="comment-text"></div></div><div class="comment-footer"><div class="likes">\
	<span class="likes-counter"></span><button class="like-button"></button></div></div>';


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

					addFormButton.classList.remove("hidden");

					const successNotification = addDefaultNotification("Комментарии были успешно загружены");
					removeNotification(successNotification, 3000);

					renderComments(commentSection, comments);
				}).catch((error) => {
						const commonErrorNotification = addErrorNotification("Произошла ошибка загрузки данных");
						removeNotification(commonErrorNotification, 2000);

						addFormButton.classList.remove("hidden");

						console.error(error);
					});
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
