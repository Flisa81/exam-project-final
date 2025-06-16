const API_BASE = "https://v2.api.noroff.dev";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const postTitle = document.getElementById("post-title");
const postAuthor = document.getElementById("post-author");
const postDate = document.getElementById("post-date");
const postImage = document.getElementById("post-image");
const postBody = document.getElementById("post-body");
const shareUrl = document.getElementById("share-url");
const commentForm = document.getElementById("comment-form");
const commentInput = document.getElementById("comment-input");
const commentsList = document.getElementById("comments-list");

if (!postId) {
  postTitle.textContent = "Error: Missing Post ID";
  postBody.innerHTML = "<p>No post ID found in the URL.</p>";
  shareUrl.value = window.location.href;
  postImage.style.display = "none";
} else {
  document.addEventListener("DOMContentLoaded", loadPost);
}

async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/social/posts/${postId}?_comments=true`);
    const { data: post } = await res.json();

    if (!res.ok || !post) throw new Error("Post not found.");

    postTitle.textContent = post.title || "Untitled";
    postAuthor.textContent = post.author?.name || "Unknown";
    postDate.textContent = new Date(post.created).toLocaleString();
    postBody.innerHTML = `<p>${post.body || "No content"}</p>`;

    if (post.media && post.media.url) {
      let imgUrl = post.media.url;

      if (imgUrl.includes("imgur.com") && !imgUrl.includes("i.imgur.com")) {
        const id = imgUrl.split("/").pop().split(".")[0];
        imgUrl = `https://i.imgur.com/${id}.jpeg`;
      }

      postImage.src = imgUrl;
      postImage.alt = post.media.alt || post.title || "Post image";
      postImage.style.display = "block";
    } else {
      postImage.style.display = "none";
    }

    shareUrl.value = window.location.href;

    // Edit button for owner
    if (post.author.name === user?.name) {
      const editButton = document.createElement("a");
      editButton.href = `edit.html?id=${postId}`;
      editButton.textContent = "Edit This Post";
      editButton.classList.add("edit-button");
      editButton.style.marginTop = "1rem";
      document.getElementById("post-container").appendChild(editButton);
    }

    // Comments
    commentsList.innerHTML = "";
    if (post.comments.length > 0) {
      post.comments.forEach(comment => {
        const div = document.createElement("div");
        div.classList.add("comment");
        div.innerHTML = `
          <p><strong>${comment.owner}</strong>: ${comment.body}</p>
          <p class="comment-date">${new Date(comment.created).toLocaleString()}</p>
        `;
        commentsList.appendChild(div);
      });
    } else {
      commentsList.innerHTML = "<p>No comments yet.</p>";
    }

  } catch (err) {
    postTitle.textContent = "Post Load Error";
    postBody.innerHTML = `<p>Could not load post. <br>${err.message}</p>`;
    postImage.style.display = "none";
  }
}

if (commentForm) {
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const commentText = commentInput.value.trim();
    if (!commentText) return;

    try {
      const res = await fetch(`${API_BASE}/social/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: commentText }),
      });

      if (res.ok) {
        commentInput.value = "";
        loadPost();
      } else {
        const error = await res.json();
        alert(error.errors?.[0]?.message || "Failed to post comment.");
      }
    } catch (err) {
      alert("Something went wrong while posting comment.");
    }
  });
}
