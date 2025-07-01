const API_BASE_URL = "http://localhost:5000";

function validateFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload an image file (JPEG, PNG, or GIF)');
    return false;
  }
  
  if (file.size > maxSize) {
    alert('File size must be less than 5MB');
    return false;
  }
  
  return true;
}

function addIngredient() {
  const list = document.getElementById("ingredients-list");
  const container = document.createElement("div");
  container.className = "ingredient-container";
  
  const input = document.createElement("input");
  input.type = "text";
  input.name = "ingredients[]";
  input.placeholder = "Ingredient";
  input.required = true;
  input.className = "ingredient-input";
  
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "✕";
  removeBtn.className = "remove-ingredient";
  removeBtn.onclick = () => {
    container.remove();
    // Ensure at least one ingredient field remains
    if (list.children.length === 0) {
      addIngredient();
    }
  };
  
  container.appendChild(input);
  container.appendChild(removeBtn);
  list.appendChild(container);
}

function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!validateFile(file)) {
    event.target.value = '';
    document.getElementById("preview").style.display = 'none';
    return;
  }
  
  const output = document.getElementById("preview");
  output.src = URL.createObjectURL(file);
  output.style.display = 'block';
}

document.getElementById("recipe-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  
  const submitButton = this.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Saving...';
  
  try {
    // Validate required fields
    const title = this.querySelector('input[name="title"]').value.trim();
    const steps = this.querySelector('textarea[name="steps"]').value.trim();
    const ingredients = Array.from(this.querySelectorAll('input[name="ingredients[]"]'))
      .map(input => input.value.trim())
      .filter(value => value);
    
    if (!title) throw new Error('Recipe title is required');
    if (!steps) throw new Error('Recipe steps are required');
    if (ingredients.length === 0) throw new Error('At least one ingredient is required');
    
    const formData = new FormData(this);
    
    const res = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Recipe saved successfully!");
      this.reset();
      document.getElementById("preview").style.display = "none";
      // Clear dynamic ingredient inputs except one
      const list = document.getElementById("ingredients-list");
      list.innerHTML = "";
      addIngredient(); // Add one input back
    } else {
      throw new Error(data.message || 'Failed to save recipe');
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

// Add initial ingredient field if none exists
document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById("ingredients-list");
  if (list.children.length === 0) {
    addIngredient();
  }
});
