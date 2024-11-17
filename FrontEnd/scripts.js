
function genererateGallery(works) {
  const sectionPortfolio = document.querySelector(".gallery");
  sectionPortfolio.innerHTML = "";
  works.forEach((projet) => {
    const projetElement = document.createElement("figure");
    projetElement.dataset.id = projet.id; 

    const imageProjet = document.createElement("img");
    imageProjet.src = projet.imageUrl;
    imageProjet.alt = projet.title;
	
    const nomProjet = document.createElement("figcaption");
    nomProjet.innerText = projet.title;

    projetElement.appendChild(imageProjet);
    projetElement.appendChild(nomProjet);
    
    sectionPortfolio.appendChild(projetElement);
  });
}


function createButton(category) {
  const sectionGallery = document.querySelector(".filtres");
  const button = document.createElement("button");
  button.textContent = category.name;
  button.classList.add("btn-filtre");

  category.id === 0 ? button.classList.add("active") : null;
  button.addEventListener("click", (event) => {
    let filtered = category.id === 0 ? myworks : myworks.filter(work => work.categoryId === category.id);

    genererateGallery(filtered);

    document.querySelector(".btn-filtre.active").classList.remove("active");

    event.target.classList.add("active");
  });

  return button;
}

function RenderButtonBox(categories) {
  let buttonBox = document.createElement("div");
  buttonBox.classList.add("filtres");

  categories.unshift({ id: 0, name: "Tous" });
  for (const category of categories) {
    const button = createButton(category);
    buttonBox.appendChild(button);
  }
  document.querySelector(".gallery").insertAdjacentElement("beforebegin", buttonBox);

  const token = sessionStorage.getItem("token");
  if (token) {
    buttonBox.style.display = "none";
  }
}

let myworks;

try {
  const res = await fetch("http://localhost:5678/api/works");
  myworks = await res.json();
  genererateGallery(myworks);
} catch (error) {
  console.log(error);
}

let categories;

try {
  const res = await fetch("http://localhost:5678/api/categories");
  categories = await res.json();
  RenderButtonBox(categories);
} catch (error) {
  console.log(error);
}

function toggleAdminElements() {
  const token = sessionStorage.getItem("token");
  const adminElements = document.querySelectorAll("#portfolio .hidden");

  if (token) {
    adminElements.forEach(element => {
      element.classList.remove("hidden");
    });
  } else {
    adminElements.forEach(element => {
      element.style.display = "none";
    });
  }
}

toggleAdminElements();

// MODAL //

function genererateGalleryModal(works) {
  const modalGallery = document.querySelector(".gallery-modal");
  modalGallery.innerHTML = ""; 

  works.forEach((projet) => {
    const projetElement = document.createElement("figure");
    projetElement.dataset.id = projet.id; 

    const imageProjet = document.createElement("img");
    imageProjet.src = projet.imageUrl;
    imageProjet.alt = projet.title;

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa-regular", "fa-trash-can", "trash-icon");

    trashIcon.addEventListener("click", (event) => {
      const figure = event.target.closest("figure");
      deleteWork(figure);
    });

    projetElement.appendChild(imageProjet);
    projetElement.appendChild(trashIcon); 

    modalGallery.appendChild(projetElement); 
  });
}


function afficherPopup() {
  let popupBackground = document.querySelector(".modalBackground");
  popupBackground.classList.add("active");
  
  genererateGalleryModal(myworks); 
}

function cacherPopup() {
  let popupBackground = document.querySelector(".modalBackground");
  popupBackground.classList.remove("active");
}

let closeButton = document.querySelector(".modalBackground .close-button");
closeButton.addEventListener("click", cacherPopup);

document.getElementById("ajouter-photo").addEventListener("click", afficherPopupUpload);

function initAddEventListenerPopup() {
  let btnModifier = document.querySelector("#btn-edit");
  btnModifier.addEventListener("click", afficherPopup);

  let popupBackground = document.querySelector(".modalBackground");
  popupBackground.addEventListener("click", (event) => {
    if (event.target === popupBackground) {
      cacherPopup();
    }
  });
}

initAddEventListenerPopup();

async function deleteWork(figure) {
  const workId = figure.dataset.id;
  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });
    if (response.ok) {

      console.log(`Le work avec l'id : ${workId} a été supprimé`);

      myworks = myworks.filter(work => work.id !== parseInt(workId));

      genererateGallery(myworks);      
      genererateGalleryModal(myworks);  
    } 
  } catch (error) {
    console.error(error);
  }
}

function addCategories(categories) { 
  const selectElement = document.getElementById("categorySelect");
  selectElement.innerHTML = '<option value="">Choisir une catégorie</option>';
  categories.forEach(category => {
    if (category.id !== 0) { 
      let option = document.createElement("option");
      option.value = category.id;
      option.label = category.name;
      selectElement.appendChild(option); 
    }
  });
}
function afficherPopupUpload() {
  cacherPopup(); 
  let uploadModal = document.querySelector(".modalBackground-upload");
  uploadModal.classList.add("active");
  addCategories(categories);
}

function cacherPopupUpload() {
  let uploadModal = document.querySelector(".modalBackground-upload");
  uploadModal.classList.remove("active");
  resetUploadForm();
}

let popupBackgroundUpload = document.querySelector(".modalBackground-upload");
popupBackgroundUpload.addEventListener("click", (event) => {
  if (event.target === popupBackgroundUpload) {
    cacherPopupUpload();
  }
});

function resetUploadForm() {
  const preview = document.getElementById('preview');
  const imageInput = document.getElementById('image');
  const uploadButton = document.getElementById('uploadButton');
  const title = document.getElementById("title");
  const categorySelect = document.getElementById("categorySelect");
  const uploadInstructions = document.getElementById("uploadInstructions");

  preview.src = "";
  preview.style.display = 'none'; 
  uploadInstructions.style.display = 'block'; 
  imageInput.value = "";
  title.value = "";
  categorySelect.value = "";

 
  imageOk = false; 
  titleOk = false;
  categoryOk = false;

  uploadButton.setAttribute('disabled', ''); 
  uploadButton.classList.remove("active"); 
}


let imageOk = false;
let titleOk = false;
let categoryOk = false;

function addListeners() {
  const image = document.getElementById('image');
  const preview = document.getElementById('preview');
  const maxSize = 4 * 1024 * 1024;
  const categorySelect = document.getElementById("categorySelect");
  const title = document.getElementById("title");

  const uploadForm = document.getElementById('uploadForm');
  uploadForm.addEventListener('submit', function(event) {
    event.preventDefault();
    submitForm();
  });

  image.addEventListener("change", function() {
    const uploadInstructions = document.getElementById("uploadInstructions");
    if (this.files && this.files[0]) {
        if (this.files[0].size > maxSize) {
            alert("Le fichier est trop volumineux. La taille maximale autorisée est de 4 Mo.");
            resetUploadForm();
            imageOk = false;
            return;
        }
        preview.src = URL.createObjectURL(this.files[0]);
        preview.onload = () => {
            preview.style.display = 'block';
            uploadInstructions.style.display = 'none'; 
            URL.revokeObjectURL(preview.src);
        };
        imageOk = true; 
    } else {
        imageOk = false; 
        preview.style.display = 'none';
        uploadInstructions.style.display = 'flex';
    }
    CheckEntries();
});


  title.addEventListener("input", function(){
    if(this.value.length > 50 ){
      titleOk = false;
      CheckEntries();
      return;
    }
    if(this.value.length < 3){
      titleOk = false;
      CheckEntries();
      return;
    }
    titleOk = true;
    CheckEntries();
  });
  
  categorySelect.addEventListener("change", function(e) {
    if (e.target.value === "" ) {
      categoryOk = false;
    } else {
      categoryOk = true;
    }
    CheckEntries();
  });
}

async function submitForm() {
  const title = document.getElementById('title').value;
  const imageInput = document.getElementById('image');
  const categoryId = document.getElementById('categorySelect').value;

  const imageFile = imageInput.files[0];
  const formData = new FormData();

  formData.append('image', imageFile);
  formData.append('title', title);
  formData.append('category', categoryId);

  try {
    const response = await fetch('http://localhost:5678/api/works', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (response.ok) {
      const newWork = await response.json();
      myworks.push(newWork);
      genererateGallery(myworks);
      genererateGalleryModal(myworks);
      cacherPopupUpload();
      afficherPopup();

      const notification = document.querySelector(".notification");
      notification.textContent = 'Le projet a été ajouté avec succès.';
      notification.classList.remove("hidden");

      setTimeout(() => {
        notification.classList.add("hidden");
      }, 1500);
  
    } else {
      console.error('Erreur lors de l\'ajout du projet:', response.statusText);
      alert('Une erreur est survenue lors de l\'ajout du projet.');
    }
  } 
  catch (error) {
    console.error('Erreur lors de l\'ajout du projet:', error);
    alert('Une erreur est survenue lors de l\'ajout du projet.');
  }
}

function CheckEntries() {
  const uploadButton = document.getElementById("uploadButton");

  if (imageOk && titleOk && categoryOk) {
    uploadButton.removeAttribute('disabled'); 
    uploadButton.classList.add("active"); 
  } else {
    uploadButton.setAttribute('disabled', ''); 
    uploadButton.classList.remove("active"); 
  }
}

addListeners();

document.querySelector(".modalBackground-upload .close-button").addEventListener("click", cacherPopupUpload);

document.querySelector(".back-button").addEventListener("click", () => {
  cacherPopupUpload(); 
  afficherPopup(); 
});
