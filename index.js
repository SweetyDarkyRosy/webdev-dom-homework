const addFormButton = document.querySelector(".add-form-button");
const commentSection = document.querySelector(".comments");

let comments = [];


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


function updateComments() {
	const fetchPromise = fetch("https://webdev-hw-api.vercel.app/api/v1/viktoriia-pashchenko/comments",
		{
			method: "GET"
		});
	
	fetchPromise.then((response) => {
		const jsonPromise = response.json();

		jsonPromise.then((responseData) => {
			for (let i = comments.length; i < responseData.comments.length; i++)
			{
				let addDate = String(responseData.comments[i].date);
				addDate = addDate.replace(/([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+:[0-9]+:[0-9]+).[0-9]+Z/, "$3.$2.$1 $4");

				const newComment = new CComment(responseData.comments[i].author.name, responseData.comments[i].text,
					addDate);
				comments.push(newComment);
			}

			renderComments();
		});
	});
}

function renderComments() {
	// ----- Cleaning up -----

	commentSection.innerHTML = "";

	
	// ----- Filling the comment section -----

	for (let i = 0; i < comments.length; i++)
	{
		const comment = comments[i];
		commentSection.appendChild(comment.getCommentCode());
	}
}

function addComment(headerText, commentText) {
	let rawCommentData = {
		"name": headerText,
		"text": commentText
	};

	const fetchPromise = fetch("https://webdev-hw-api.vercel.app/api/v1/viktoriia-pashchenko/comments",
		{
			method: "POST",
			body: JSON.stringify(rawCommentData)
		});
	
	fetchPromise.then(() => {
		updateComments();
	});
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

	updateComments();
});
