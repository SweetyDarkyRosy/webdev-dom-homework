const addFormButton = document.querySelector(".add-form-button");
const commentSection = document.querySelector(".comments");

let gComments = [];			// Array of comments


// Comment class
class CComment {
	constructor(headerText, commentText) {
		this.headerText = headerText;
		this.commentText = commentText;
		this.likeCount = 0;
		this.isLikedByUser = false;

		{
			let currTime = new Date();

			this.addTime = currTime.getDate() + '.' + (currTime.getMonth() + 1) + '.' + currTime.getFullYear() +
				' ' + currTime.getHours() + ':' + currTime.getMinutes();
		}
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
			newCommentHeaderTime.innerHTML = this.addTime;
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

				renderComments();
			});
		}

		return commentItem;
	}
}

// Comment template for HTML code
const commentTemplate = '<div class="comment-header"></div><div class="comment-body">\
	<div class="comment-text"></div></div><div class="comment-footer"><div class="likes">\
	<span class="likes-counter"></span><button class="like-button"></button></div></div>';


/*
function addComment(name, commentText) {
	const newComment = document.createElement("li");
	newComment.classList.add("comment");
	newComment.innerHTML = commentTemplate;

	{
		const newCommentHeader = newComment.querySelector(".comment-header");

		const newCommentHeaderName = document.createElement("div");
		newCommentHeaderName.innerHTML = name;
		newCommentHeader.appendChild(newCommentHeaderName);

		let currTime = new Date();
		console.log(currTime.getDate());

		const newCommentHeaderTime = document.createElement("div");
		newCommentHeaderTime.innerHTML = currTime.getDate() + '.' + (currTime.getMonth() + 1) + '.' + currTime.getFullYear() +
			' ' + currTime.getHours() + ':' + currTime.getMinutes();
		newCommentHeader.appendChild(newCommentHeaderTime);
	}

	{
		const newCommentText = newComment.querySelector(".comment-text");
		newCommentText.innerHTML = commentText;
	}

	commentSection.appendChild(newComment);
}
*/

function renderComments() {
	// Cleaning up
	commentSection.innerHTML = "";

	// Filling the comment section
	for (let i = 0; i < gComments.length; i++)
	{
		const comment = gComments[i];
		const newComment = comment.getCommentCode();
	
		commentSection.appendChild(newComment);
	}
}

function addComment(headerText, commentText) {
	const newComment = new CComment(headerText, commentText);
	gComments.push(newComment);

	renderComments();
}

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

		nameInput.value = '';
		commentText.value = '';
	});

	nameInput.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});

	commentText.addEventListener("click", (event) => {
		event.target.classList.remove("invalid-el");
	});
});
