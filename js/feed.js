const API_BASE = "https://v2.api.noroff.dev";
const postsContainer = document.getElementById("posts");
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// Fetch and render posts
async function loadPosts() {
  try {
    const res = await fetch(`${API_BASE}/social/posts?_author=true&_sort=created&sortOrder=desc`);
    const result = await res.json();

    if (!res.ok) throw new Error(result.errors?.[0]?.message || "Failed to fetch posts");

    const posts = result.data;
    postsContainer.innerHTML = "";

    posts.forEach(post => {
      const isOwner = user && user.name === post.author.name;

      const postEl = document.createElement("article");
      postEl.classList.add("post");

      postEl.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        ${post.media?.url ? `<img src="${post.media.url}" alt="${post.media.alt || "Post image"}" style="max-width:100%; margin: 1rem 0;" />` : ""}
        <p><strong>Author:</strong> ${post.author.name}</p>
        <p><small>Created: ${new Date(post.created).toLocaleString()}</small></p>
        <p><small>Updated: ${new Date(post.updated).toLocaleString()}</small></p>
        <a href="./post/index.html?id=${post.id}" class="view-link">View Post</a>
        ${isOwner ? `<a href="./post/edit.html?id=${post.id}" class="edit-link">Edit Post</a>` : ""}
      `;

      postsContainer.appendChild(postEl);
    });

  } catch (err) {
    console.error("Error loading posts:", err);
    postsContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadPosts);
