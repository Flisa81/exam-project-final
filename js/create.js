const API_BASE = "https://v2.api.noroff.dev";
const form = document.getElementById("create-post-form");
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const mediaInput = document.getElementById("media");
const mediaSelect = document.getElementById("media-select");
const mediaPreview = document.getElementById("media-preview");
const messageBox = document.getElementById("form-message");

// Redirect if not logged in
if (!token || !user) {
  alert("You must be logged in to create a post.");
  window.location.href = "../account/login.html";
}

// Show image preview from typed URL
mediaInput.addEventListener("input", () => {
  const url = mediaInput.value.trim();
  if (url) {
    mediaPreview.src = url;
    mediaPreview.alt = "Preview image";
    mediaPreview.style.display = "block";
    mediaSelect.value = "";
  } else {
    mediaPreview.style.display = "none";
  }
});

// Show preview and update input from dropdown
mediaSelect.addEventListener("change", () => {
  const selected = mediaSelect.options[mediaSelect.selectedIndex];
  const url = selected.value;
  const alt = selected.dataset.alt || "Post image";

  mediaInput.value = url;

  if (url) {
    mediaPreview.src = url;
    mediaPreview.alt = alt;
    mediaPreview.style.display = "block";
  } else {
    mediaPreview.style.display = "none";
  }
});

// Submit post
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageBox.textContent = "";
  messageBox.classList.remove("success");

  const title = form.title.value.trim();
  const body = form.body.value.trim();
  const mediaUrl = mediaInput.value.trim();
  const alt = mediaPreview.alt || title;

  if (!title || !body) {
    messageBox.textContent = "Title and body are required.";
    return;
  }

  const postData = { title, body };

  if (mediaUrl) {
    postData.media = {
      url: mediaUrl,
      alt: alt
    };
  }

  try {
    const res = await fetch(`${API_BASE}/social/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    const data = await res.json();

    if (res.ok) {
      messageBox.textContent = "✅ Post created successfully!";
      messageBox.classList.add("success");

      // Clear form and image preview
      form.reset();
      mediaPreview.style.display = "none";
      mediaPreview.alt = "";
    } else {
      messageBox.textContent = data.errors?.[0]?.message || "Something went wrong.";
    }
  } catch (err) {
    console.error("Create post error:", err);
    messageBox.textContent = "Failed to create post. Please try again.";
  }
});
