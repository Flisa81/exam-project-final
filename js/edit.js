// Load existing post
async function loadPostToEdit() {
  try {
    const res = await fetch(`${API_BASE}/social/posts/${postId}`);
    const { data: post } = await res.json();

    if (!res.ok || !post) throw new Error("Post not found.");

    console.log("Post Author:", post.author.name);
    console.log("Logged-in User:", user.name);

    if (post.author.name !== user.name) {
      alert("You are not the owner of this post.");
      window.location.href = "../index.html";
      return;
    }

    form.title.value = post.title || "";
    form.body.value = post.body || "";
    mediaInput.value = post.media?.url || "";

    if (post.media?.url) {
      preview.src = post.media.url;
      preview.alt = post.media.alt || "Post image";
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
  } catch (err) {
    console.error("Error loading post:", err);
    form.innerHTML = "<p>Could not load the post.</p>";
  }
}

// ... Keep rest of the code same ...

document.addEventListener("DOMContentLoaded", loadPostToEdit);
