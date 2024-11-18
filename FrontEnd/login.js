document.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    fetch("http://localhost:5678/api/users/login", {

      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })

    .then((response) => {
      if (!response.ok) {
        openErrorModal(); 
      } else {
        response.json()
        .then((data) => {
          sessionStorage.setItem("token", data.token); 
          window.location.replace("index.html"); 
          console.log(data)
        });
      }
    })
    
    .catch((error) => {
      console.error("Erreur lors de la connexion :", error);
    });
  });
  

  document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.querySelector("#login-logout");
    const token = sessionStorage.getItem("token");


    if (token) {
        loginLink.textContent = "logout";
        loginLink.href = "index.html";

        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            sessionStorage.removeItem("token");
            window.location.replace("login.html");
        });
    } else {
        loginLink.textContent = "login";
    }

    const errorModal = document.getElementById("errorModal");
    const closeButton = errorModal.querySelector(".close-button");
    const okButtonclose = errorModal.querySelector(".close-button-ok"); 


    okButtonclose.addEventListener("click", closeErrorModal);
    closeButton.addEventListener("click", closeErrorModal);

    errorModal.addEventListener("click", (event) => {
        if (event.target === errorModal) {
            closeErrorModal();
        }
    });
});

function openErrorModal() {
    const errorModal = document.getElementById("errorModal");
    errorModal.style.display = "flex";
}
function closeErrorModal() {
    const errorModal = document.getElementById("errorModal");
    errorModal.style.display = "none";
}
