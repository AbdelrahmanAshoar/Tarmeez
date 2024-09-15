let url = "https://tarmeezacademy.com/api/v1/";
let finalPage = 1;
let page = 1;

changeUI();
getPosts(1);
showPost();

window.addEventListener("scroll", function () {
  let endOfPage =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
  if (page >= finalPage) {
    return;
  }
  if (endOfPage) {
    page = page + 1;
    getPosts(page);
  }
});



// help method
function hideModal(ele) {
  let myModalEl = document.getElementById(ele);
  let modal = bootstrap.Modal.getInstance(myModalEl);
  modal.hide();
}

function getImageProfile() {
  if (localStorage.getItem("user")) {
    let user = JSON.parse(localStorage.getItem("user"));
    document.getElementById("imageProfile-nav").src = user.profile_image;
  }
}

function changeUI() {
  if (localStorage.getItem("token")) {
    document.getElementById("toLogin").style.display = "none";
    document.getElementById("toRegister").style.display = "none";
    document.getElementById("postBtn").style.display = "flex";
    document.getElementById("toLogout").style.display = "inline";
    document.getElementById("imageProfile-nav").style.display = "inline";
    getImageProfile();
  } else {
    document.getElementById("toLogin").style.display = "inline";
    document.getElementById("toRegister").style.display = "inline";
    document.getElementById("postBtn").style.display = "none";
    document.getElementById("toLogout").style.display = "none";
    document.getElementById("imageProfile-nav").style.display = "none";
  }
}

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
// ---------------------------------------------------------------------------

// get posts
async function getPosts(page) {
  let response = await axios.get(
    `https://tarmeezacademy.com/api/v1/posts?limit=5&page=${page}`
  );
  finalPage = response.data.meta.last_page;
  let posts = response.data.data;
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
        <div class="card-header mb-2">
          <img src='${imageUser}' alt=''>
          <b id="user" class="fs-5">${post.author.name}</b>
        </div>
        <div class="card-body">
          ${imagePost}
          <h6 class="time text-info">${post.created_at}</h6>
          <h4 class="card-title">${postTitle}</h4>
          <p class="card-text">${post.body}</p>
          <hr>
         <div class="bg-warning d-inline rounded-pill p-1" id="comments${post.id}"><b>${post.comments_count} Comments</b></div>
        </div>
    `;
    document.getElementById("posts").append(card);
  }
}

// login
async function login() {
  let username = document.getElementById("usernameLogin").value;
  let password = document.getElementById("passwordLogin").value;

  try {
    let data = {
      username: username,
      password: password,
    };
    let config = {
      headers: {
        Accept: "application/json",
      },
    };
    let response = await axios.post(`${url}login`, data, config);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    hideModal("login-modal");
    changeUI();
    alert("logged in successfully", "success");
  } catch (error) {
    document.getElementById("warningLogin").innerHTML =
      error.response.data.message;
  }
}

// register
async function register() {
  let name = document.getElementById("nameReg").value;
  let username = document.getElementById("usernameReg").value;
  let email = document.getElementById("emailReg").value;
  let password = document.getElementById("passwordReg").value;
  let image = document.getElementById("imageReg").files[0];

  try {
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("image", image);
    formData.append("name", name);
    formData.append("email", email);
    let config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let response = await axios.post(`${url}register`, formData, config);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    hideModal("register-modal");
    changeUI();
    alert(`Welcome ${name}`, "success");
  } catch (error) {
    document.getElementById("warningRegister").textContent =
      error.response.data.message;
  }
}

// logout
function logout() {
  localStorage.clear();
  changeUI();
  alert("logged out successfully", "success");
}

// create post
async function createPost() {
  let titlePost = document.getElementById("titlePost").value;
  let contentPost = document.getElementById("contentPost").value;
  let image = document.getElementById("imagePost").files[0];
  const token = localStorage.getItem("token");
  try {
    let formData = new FormData();
    formData.append("body", contentPost);
    formData.append("title", titlePost);
    formData.append("image", image);

    let config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    let response = await axios.post(`${url}posts`, formData, config);
    hideModal("addPost-modal");
    changeUI();
    alert("Done Succussfully", "success");
    getPosts();
  } catch (error) {
    document.getElementById("warning").innerHTML = error.response;
  }
}

// get post
function getPost() {
  return new Promise((resolve) => {
    document.querySelector("#home").addEventListener("click", function (ele) {
      window.addEventListener("scroll", function () {
        event.preventDefault(); // يمنع التصرف الافتراضي
        event.stopPropagation(); // يمنع انتشار الحدث
      });
      let specificParent = ele.target.closest(".card");
      resolve(specificParent);
      this.style.display = "none";
    });
  });
}
// show post
async function showPost() {
  let card = await getPost();
  let urlPost = `${url}posts/${card.id.slice(1)}`;
  let response = await axios.get(urlPost);
  let post = response.data.data;
  
  let comments = document.getElementById(`comments${card.id.slice(1)}`);
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

  if (localStorage.getItem('token')) {
    let addComment = document.createElement("div");
    addComment.style.position = "relative";
    addComment.innerHTML = `
      <textarea class="form-control" name="comment" id="bodyComment" rows="3"></textarea>
      <button class="btn btn-primary position-absolute end-0 bottom-0" onclick="addComment('${encodeURIComponent(JSON.stringify(post))}')">Send</button>
    `;
    comments.append(addComment);
  }  
  document.getElementById("post").innerHTML = "";
  document.getElementById("post").append(card);
}



async function addComment(postObj) {
  const comment = document.getElementById("bodyComment").value;
  let post = JSON.parse(decodeURIComponent(postObj));
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
      `${url}posts/${post.id}/comments`,
      data,
      config
    );
    alert("Added comment successfully", "success");
    showPostAfterAddComment(post);
  } catch (error) {   
    alert("There is not a comment", "danger");
  }
}

async function showPostAfterAddComment(postGiven){
  let card = document.createElement("div");
  card.className = "card text-white mb-3";
  console.log(postGiven);
  
  card.id = `p${postGiven.id}`;
  let urlPost = `${url}posts/${postGiven.id}`;
  let response = await axios.get(urlPost);
  let post = response.data.data;
  
  

  let content = "";

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
    content += comment.outerHTML;
  }

  card.innerHTML = `
    <div class="card-header mb-2">
      <img src="${postGiven.author.profile_image}" alt="">
      <b id="user" class="fs-5">${postGiven.author.name}</b>
    </div>
    <div class="card-body">
      <img src="${postGiven.image}" class="w-100 mb-1">
      <h6 class="time text-info">${postGiven.created_at}</h6>
      <h4 class="card-title">${postGiven.title}</h4>
      <p class="card-text">${postGiven.body}</p>
      <hr>
      <div id="comments${postGiven.id}">${content}</div>
      <div style="position: relative;">
        <textarea class="form-control" name="comment" id="bodyComment" rows="3"></textarea>
        <button class="btn btn-primary position-absolute end-0 bottom-0" onclick="addComment('${encodeURIComponent(JSON.stringify(post))}')">Send</button>
      </div>
    </div>
  `;
  
  document.getElementById("post").innerHTML = "";
  document.getElementById("post").append(card);
}

