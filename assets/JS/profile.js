let url = "https://tarmeezacademy.com/api/v1/";
let user;
if (localStorage.getItem("user")) {
  user = JSON.parse(localStorage.getItem("user"));
}
console.log(user);
changeUI();
getPosts();
// help functions
function profileDetails() {
  document.getElementById("imageProfile").src = user.profile_image;
  document.getElementById("name").innerHTML = user.name;
  document.getElementById("username").innerHTML = user.username;
  document.getElementById("email").innerHTML = user.email;
  // document.getElementById("postsNumber").innerHTML = `${user.posts_count} post`;
}
// hideModal
function hideModal(ele) {
  let myModalEl = document.getElementById(ele);
  let modal = bootstrap.Modal.getInstance(myModalEl);
  modal.hide();
}
// changeUI
function changeUI() {
  if (localStorage.getItem("token")) {
    document.getElementById("toLogout").style.display = "inline";
    document.getElementById("imageProfile-nav").style.display = "inline";
    document.getElementById("imageProfile-nav").src = user.profile_image;
    document.getElementById("containerProfile").style.display = "block";
    document.getElementById("noUser").style.display = "none";
    profileDetails();
  } else {
    document.getElementById("toLogout").style.display = "none";
    document.getElementById("imageProfile-nav").style.display = "none";
    document.getElementById("containerProfile").style.display = "none";
    document.getElementById("home").style.display = "none";
    document.getElementById("noUser").style.display = "block";
  }
}
// alert
function alert(msg, type) {
  let alertEle = document.createElement("div");
  alertEle.setAttribute("role", "alert");
  alertEle.className = `alert alert-${type}`;
  alertEle.innerHTML = msg;
  document.body.prepend(alertEle);
  setTimeout(function () {
    alertEle.style.display = "none";
  }, 2000);
}
// --------------------------------------------------

// logout
function logout() {
  localStorage.clear();
  changeUI();
  alert("logged out successfully", "success");
}
// Update Profile
async function updateProfile() {}


// get posts
async function getPosts() {
  let response = await axios.get(`${url}users/${user.id}/posts`);
  let posts = response.data.data;

  document.getElementById("posts").innerHTML = "";

  for (const post of posts) {
    let card = document.createElement("div");
    card.className = "card text-white mb-3";
    card.id = `p${post.id}`;
    let postTitle = "";
    if (post.title != null) {
      postTitle = post.title;
    }

    let imageUser = "assets/Images/person.png";
    if (typeof post.author.profile_image == "string") {
      imageUser = post.author.profile_image;
    }
    let imagePost = "";
    if (typeof post.image == "string") {
      imagePost = `<img src='${post.image}' class="w-100 mb-1">`;
    }
    card.innerHTML = `
        <div class="card-header mb-2 clearfix">
          <div class="float-start">
            <img src='${imageUser}' >
            <b id="user" class="fs-5">${post.author.name}</b>
          </div>
          <div class="btns float-end">
            <button class="btn btn-secondary btn-sm" onclick="updateBtn('${encodeURIComponent(
              JSON.stringify(post)
            )}')">Update</button>
            <button class="btn btn-danger btn-sm" onclick="deleteBtn(${
              post.id
            })">Delete</button>
          </div>
        </div>
        <div class="card-body">
          ${imagePost}
          <h6 class="time text-info">${post.created_at}</h6>
          <h4 class="card-title">${postTitle}</h4>
          <p class="card-text">${post.body}</p>
          <hr>
         <div class="bg-warning d-inline rounded-pill p-1" id="comments${
           post.id
         }"><b>${post.comments_count} Comments</b></div>
        </div>
    `;

    card.setAttribute(
      "onclick",
      `showPost("${encodeURIComponent(JSON.stringify(card.outerHTML))}", ${
        post.id
      })`
    );
    document.getElementById("posts").append(card);
  }
}
// show post
async function showPost(cardObj, postId) {
  let card = JSON.parse(decodeURIComponent(cardObj));
  document.getElementById("posts").innerHTML = card;

  let response = await axios.get(`${url}posts/${postId}`);
  let post = response.data.data;

  let comments = document.getElementById(`comments${post.id}`);
  comments.className = "";
  comments.innerHTML = "";
  for (let com of post.comments) {
    let comment = document.createElement("div");
    comment.style.cssText = `
      background-color: #a1a1ffee;
      color: #002;
      padding: 5px 20px;
      margin: 10px;
      border-radius:20px;
    `;
    comment.innerHTML = `
      <img src='${com.author.profile_image}' class='imageProfile'>
      <b id="user" class="fs-5">${com.author.name}</b>
      <p class="ps-5">${com.body}</p>
    `;
    comments.append(comment);
  }

  let addComment = document.createElement("div");
  addComment.style.position = "relative";
  let addCommentBtn = document.createElement("button");
  addCommentBtn.innerHTML = "Send";
  addCommentBtn.className = "btn btn-primary position-absolute end-0 bottom-0";
  addCommentBtn.setAttribute(
    "onclick",
    `addComment("${encodeURIComponent(JSON.stringify(card))}", ${post.id})`
  );
  addComment.innerHTML = `
    <textarea class="form-control" name="comment" id="bodyComment" rows="3"></textarea>
  `;
  addComment.append(addCommentBtn);
  comments.append(addComment);
}
// add comment
async function addComment(cardObj, postId) {
  const comment = document.getElementById("bodyComment").value;
  const token = localStorage.getItem("token");
  try {
    let data = {
      body: comment,
    };
    let config = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
    let response = await axios.post(
      `${url}posts/${postId}/comments`,
      data,
      config
    );
    alert("Added comment successfully", "success");
    showPost(cardObj, postId);
  } catch (error) {
    alert("There is not a comment", "danger");
  }
}

// Updat post
function updateBtn(postObj) {
  let post = JSON.parse(decodeURIComponent(postObj));
  document.getElementById("titlePost").value = post.title;
  document.getElementById("contentPost").value = post.body;
  document.getElementById("idPost-input").value = post.id;
  let modal = new bootstrap.Modal(
    document.getElementById("editPost-modal"),
    {}
  );
  modal.toggle();
}
async function editPost() {
  let idPost = document.getElementById("idPost-input").value;
  console.log(idPost);
  let titlePost = document.getElementById("titlePost").value;
  let contentPost = document.getElementById("contentPost").value;
  let image = document.getElementById("imagePost").files[0];
  const token = localStorage.getItem("token");
  try {
    let formData = new FormData();
    formData.append("body", contentPost);
    formData.append("title", titlePost);
    formData.append("image", image);
    formData.append("_method", "put");

    let config = {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    let response = await axios.post(`${url}posts/${idPost}`, formData, config);
    hideModal("editPost-modal");
    alert("Done Succussfully", "success");
    getPosts();
  } catch (error) {
    console.log(error.response.data.message);
    
    document.getElementById("warning").innerHTML = error.response.data.message;
  }
}
// Delete post
function deleteBtn(postId) {
  document.getElementById("idPost-input").value = postId;
  let modal = new bootstrap.Modal(document.getElementById("deletePost-modal"),{});
  modal.toggle();
}
async function deletePost() {
  let idPost = document.getElementById("idPost-input").value;
  try {
    const token = localStorage.getItem("token");
    let config = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    let response = await axios.delete(`${url}posts/${idPost}`, config);
    hideModal("deletePost-modal");
    alert("Done Succussfully", "success");
    getPosts();
  } catch (error) {
    console.log(error);
  }
}
