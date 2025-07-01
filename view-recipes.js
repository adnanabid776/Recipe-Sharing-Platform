const API_BASE_URL = "http://localhost:5000";
let allRecipes = [];

// Fetch all recipes
async function fetchRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/recipes`);
        const recipes = await response.json();
        allRecipes = recipes;
        updateCategoryFilter(recipes);
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        document.getElementById('recipes-grid').innerHTML = `
            <div class="no-recipes">
                Error loading recipes. Please try again later.
            </div>
        `;
    }
}

// Update category filter options
function updateCategoryFilter(recipes) {
    const categories = new Set(recipes.map(recipe => recipe.category).filter(Boolean));
    const select = document.getElementById('category-filter');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Display recipes in grid
function displayRecipes(recipes) {
    const grid = document.getElementById('recipes-grid');
    
    if (recipes.length === 0) {
        grid.innerHTML = `
            <div class="no-recipes">
                No recipes found. Try a different search or filter.
            </div>
        `;
        return;
    }
    
    grid.innerHTML = recipes.map((recipe, idx) => `
        <div class="recipe-card" data-idx="${idx}">
            <div class="recipe-summary">
                <div style="flex:1;">
                    ${recipe.image 
                        ? `<img src="${recipe.image.startsWith('http') ? '' : API_BASE_URL}${recipe.image}" alt="${recipe.title}" class="recipe-image">` 
                        : `<div class="recipe-image" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center; height: 180px;">
                            <i class=\"fas fa-utensils\" style=\"font-size: 3rem; color: #ddd;\"></i>
                        </div>`
                    }
                    <h2 class="recipe-title">${recipe.title}</h2>
                    ${recipe.category ? `<div class="recipe-category">${recipe.category}</div>` : ''}
                </div>
                <button class="expand-arrow" aria-label="Expand/collapse recipe">
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L10 12L14 8" stroke="#4a4a7d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
            </div>
            <div class="recipe-details-collapsible" style="display: none;">
                <div class="recipe-info">
                    <span><i class="far fa-clock"></i> Prep: ${recipe.prepTime || 'N/A'}</span>
                    <span><i class="fas fa-fire"></i> Cook: ${recipe.cookTime || 'N/A'}</span>
                </div>
                <div class="recipe-ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                <div class="recipe-steps">
                    <h3>Instructions</h3>
                    ${(recipe.steps || '').split(/\r?\n/).filter(Boolean).map(step => `<p>${step}</p>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Add expand/collapse event listeners
    document.querySelectorAll('.expand-arrow').forEach((arrowBtn) => {
        arrowBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = arrowBtn.closest('.recipe-card');
            const details = card.querySelector('.recipe-details-collapsible');
            const isOpen = details.style.display === 'block';
            if (isOpen) {
                details.style.display = 'none';
                arrowBtn.style.transform = 'rotate(0deg)';
            } else {
                details.style.display = 'block';
                arrowBtn.style.transform = 'rotate(90deg)';
            }
        });
    });
    // Also allow clicking the summary area (except the arrow button) to expand/collapse
    document.querySelectorAll('.recipe-summary').forEach((summary) => {
        summary.addEventListener('click', function(e) {
            if (e.target.closest('.expand-arrow')) return;
            const card = summary.closest('.recipe-card');
            const details = card.querySelector('.recipe-details-collapsible');
            const arrowBtn = card.querySelector('.expand-arrow');
            const isOpen = details.style.display === 'block';
            if (isOpen) {
                details.style.display = 'none';
                arrowBtn.style.transform = 'rotate(0deg)';
            } else {
                details.style.display = 'block';
                arrowBtn.style.transform = 'rotate(90deg)';
            }
        });
    });
}

// Filter recipes based on search and category
function filterRecipes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    const filtered = allRecipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm) ||
                            recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm));
        const matchesCategory = !category || recipe.category === category;
        return matchesSearch && matchesCategory;
    });
    
    displayRecipes(filtered);
}

// View individual recipe
function viewRecipe(id) {
    const recipe = allRecipes.find(r => r.id === id);
    if (!recipe) return;
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'recipe-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>${recipe.title}</h2>
            ${recipe.image ? `<img src="${recipe.image.startsWith('http') ? '' : API_BASE_URL}${recipe.image}" alt="${recipe.title}" class="recipe-image" style="max-width: 100%; border-radius: 8px; margin: 1rem 0;">` : ''}
            <div class="recipe-details">
                <p><strong>Preparation Time:</strong> ${recipe.prepTime || 'N/A'}</p>
                <p><strong>Cooking Time:</strong> ${recipe.cookTime || 'N/A'}</p>
                <p><strong>Category:</strong> ${recipe.category || 'N/A'}</p>
                <h3>Ingredients:</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
                <h3>Instructions:</h3>
                <div class="recipe-steps">
                    ${(recipe.steps || '').split(/\r?\n/).filter(Boolean).map(step => `<p>${step}</p>`).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.remove();
    };
    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Add event listeners
document.getElementById('search-input').addEventListener('input', filterRecipes);
document.getElementById('category-filter').addEventListener('change', filterRecipes);

// Add modal styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .recipe-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }
    
    .close-modal {
        position: absolute;
        right: 1rem;
        top: 1rem;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
    }
    
    .close-modal:hover {
        color: #333;
    }
    
    .modal-content img {
        max-width: 100%;
        height: auto;
        border-radius: 5px;
        margin: 1rem 0;
    }
    
    .recipe-details {
        margin-top: 1rem;
    }
    
    .recipe-steps p {
        margin-bottom: 0.5rem;
    }
`;
document.head.appendChild(modalStyles);

// Load recipes when page loads
fetchRecipes(); 