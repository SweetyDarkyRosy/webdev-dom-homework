export function renderComments(commentSection, comments) {
	// ----- Cleaning up -----

	commentSection.innerHTML = "";

	
	// ----- Filling the comment section -----

	for (let i = 0; i < comments.length; i++)
	{
		const comment = comments[i];
		commentSection.appendChild(comment.getCommentCode());
	}
}
