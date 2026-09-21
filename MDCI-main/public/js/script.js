console.log('script.js is loaded');


function previewImage(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  input.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });
}

previewImage("headerInput", "headerPreview");
previewImage("footerInput", "footerPreview");
previewImage("bannerInput", "bannerPreview");

function toggleEdit(id) {
  const form = document.getElementById("edit-form-" + id);
  if (form.style.display === "none" || form.style.display === "") {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}

$(document).ready(function () {
  // Initialize editors
  $("#editor-homepage").summernote({ height: 50 });
  $("#editor-aboveform").summernote({ height: 50 });
  $("#placementPartnerContent").summernote({ height: 100 });
  $("#editor-whyChooseUs").summernote({ height: 100 });
  $("#editor-contentBesideYoutube").summernote({ height: 100 });
  $("#editor-ourCoursesContent").summernote({ height: 200 });
  $("#editor-ourEventsContent").summernote({ height: 200 });
  $("#editor-contentBelowGallery").summernote({ height: 50 });
  $("#editor-ourCollegesContent").summernote({ height: 200 });
  $("#editor-studentReviewContent").summernote({ height: 200 });
  $("#editor-contentStarStudent").summernote({ height: 200 });
  $("#editor-homeLoctionContent").summernote({ height: 200 });
  $("#editor-faqHeading").summernote({ height: 100 });
  $("#editor-homeBlogSection").summernote({ height: 200 });
  $("#editor-ourEducationContent").summernote({ height: 200 });
  $("#editor-ourEducationContent").summernote({ height: 200 });
  $("#editor-topAboutSection").summernote({
    height: 400,
  });
});

function addPlacementImageInput() {
  const container = document.getElementById("imageInputsContainer");

  const newBlock = document.createElement("div");
  newBlock.classList.add("image-upload-block", "mb-3");

  newBlock.innerHTML = `
      <div class="form-group">
        <label>Select image to upload:</label>
        <input type="file" name="image" class="form-control imageInput" accept="image/*" required />
      </div>
      <div class="form-group">
        <label>Preview:</label><br />
        <img src="#" alt="Image Preview" class="img-fluid mb-2 imagePreview" style="max-height: 200px; display: none; object-fit: cover; border-radius: 5px;" />
      </div>
    `;

  container.appendChild(newBlock);
}

// Show preview for each selected image
document.addEventListener("change", function (e) {
  if (e.target && e.target.classList.contains("imageInput")) {
    const input = e.target;
    const preview = input
      .closest(".image-upload-block")
      .querySelector(".imagePreview");
    const file = input.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  }
});

function toggleUploadedPlacementImages() {
  const section = document.getElementById("uploadedPlacementImages");
  section.style.display = section.style.display === "none" ? "block" : "none";
}
function toggleUploadedGalleryImages() {
  const section = document.getElementById("uploadedGalleryImages");
  section.style.display = section.style.display === "none" ? "block" : "none";
}

function addMoreGalleryImageInput() {
  const container = document.getElementById("galleryImageInputsContainer");

  const newInputBlock = document.createElement("div");
  newInputBlock.classList.add("image-upload-block", "mb-3");

  newInputBlock.innerHTML = `
      <div class="form-group">
        <label>Select image(s) to upload:</label>
        <input
          type="file"
          name="image"
          class="form-control galleryImageInput"
          accept="image/*"
          multiple
          required
        />
      </div>
    `;

  container.appendChild(newInputBlock);
}
// Handle gallery image preview
document.addEventListener("change", function (e) {
  if (e.target && e.target.classList.contains("galleryImageInput")) {
    const previewContainer = e.target
      .closest(".image-upload-block")
      .querySelector(".galleryPreviewContainer");
    previewContainer.innerHTML = ""; // Clear previous previews

    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = document.createElement("img");
        img.src = event.target.result;
        img.style.maxHeight = "150px";
        img.style.marginRight = "10px";
        img.style.borderRadius = "5px";
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
});

// SweetAlert2 Delete Confirmation
document.addEventListener("DOMContentLoaded", () => {
  const deleteForms = document.querySelectorAll(".deleteForm");
  deleteForms.forEach((form) => {
    const button = form.querySelector(".deleteBtn");
    button.addEventListener("click", function (e) {
      e.preventDefault();
      Swal.fire({
        title: "Are you sure?",
        text: "This image will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      });
    });
  });
});

function toggleEdit(id) {
  const el = document.getElementById("edit-form-" + id);
  if (el.style.display === "none") {
    el.style.display = "block";
  } else {
    el.style.display = "none";
  }
}

// Toggle visibility of uploaded education images
function toggleUploadedEducationImages() {
  const section = document.getElementById("uploadedEducationImages");
  section.style.display = section.style.display === "none" ? "block" : "none";
}

// Show image previews
function previewEducationImages(input, container) {
  container.innerHTML = ""; // Clear existing previews
  if (input.files) {
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";
        img.classList.add("mr-2", "mb-2");
        container.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
}

// Add more image input fields
function addMoreEducationImageInput() {
  const container = document.getElementById("educationImageInputsContainer");

  const newBlock = document.createElement("div");
  newBlock.classList.add("image-upload-block", "mb-3");

  newBlock.innerHTML = `
      <div class="form-group">
        <label>Select image(s) to upload:</label>
        <input
          type="file"
          name="images"
          class="form-control educationImageInput"
          accept="image/*"
          multiple
          required
        />
      </div>
      <div class="form-group">
        <label>Preview:</label><br />
        <div class="educationPreviewContainer d-flex flex-wrap"></div>
      </div>
    `;

  container.appendChild(newBlock);

  // Add event listener to new input for preview
  const fileInput = newBlock.querySelector(".educationImageInput");
  const previewContainer = newBlock.querySelector(".educationPreviewContainer");

  fileInput.addEventListener("change", function () {
    previewEducationImages(this, previewContainer);
  });
}

// On page load, bind preview to initial input
document.addEventListener("DOMContentLoaded", function () {
  const initialInput = document.querySelector(".educationImageInput");
  const initialPreview = document.querySelector(".educationPreviewContainer");

  if (initialInput && initialPreview) {
    initialInput.addEventListener("change", function () {
      previewEducationImages(this, initialPreview);
    });
  }
});

// Toggle visibility of uploaded placement student images
function toggleUploadedPlacementStudentImages() {
  const section = document.getElementById("uploadedPlacementStudentImages");
  section.style.display = section.style.display === "none" ? "block" : "none";
}

// Show image previews
function previewPlacementStudentImages(input, container) {
  container.innerHTML = ""; // Clear existing previews
  if (input.files) {
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";
        img.classList.add("mr-2", "mb-2");
        container.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
}

// Add more image input fields
function addMorePlacementStudentImageInput() {
  const container = document.getElementById(
    "placementStudentImageInputsContainer"
  );

  const newBlock = document.createElement("div");
  newBlock.classList.add("image-upload-block", "mb-3");

  newBlock.innerHTML = `
      <div class="form-group">
        <label>Select image(s) to upload:</label>
        <input
          type="file"
          name="images"
          class="form-control placementStudentImageInput"
          accept="image/*"
          multiple
          required
        />
      </div>
      <div class="form-group">
        <label>Preview:</label><br />
        <div class="placementStudentPreviewContainer d-flex flex-wrap"></div>
      </div>
    `;

  container.appendChild(newBlock);

  // Attach preview event to the new input
  const fileInput = newBlock.querySelector(".placementStudentImageInput");
  const previewContainer = newBlock.querySelector(
    ".placementStudentPreviewContainer"
  );

  fileInput.addEventListener("change", function () {
    previewPlacementStudentImages(this, previewContainer);
  });
}

// Initial preview binding
document.addEventListener("DOMContentLoaded", function () {
  const initialInput = document.querySelector(".placementStudentImageInput");
  const initialPreview = document.querySelector(
    ".placementStudentPreviewContainer"
  );

  if (initialInput && initialPreview) {
    initialInput.addEventListener("change", function () {
      previewPlacementStudentImages(this, initialPreview);
    });
  }
});

// toggle review button section
function toggleReviewSection() {
  const section = document.getElementById("reviewSection");
  section.style.display = section.style.display === "none" ? "block" : "none";
}

// delete popup button section
document.querySelectorAll(".delete-review-form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // prevent default form submission

    Swal.fire({
      title: "Are you sure?",
      text: "This review will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        form.submit(); // submit form if confirmed
      }
    });
  });
});

// delete button popup
// Wait until DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select all delete forms
  const deleteForms = document.querySelectorAll(".delete-faq-form");

  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // stop default submit

      Swal.fire({
        title: "Are you sure?",
        text: "This FAQ will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit(); // proceed with form submission if confirmed
        }
      });
    });
  });
});



