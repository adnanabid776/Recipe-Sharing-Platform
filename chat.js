let currentRecipe = null; // Track last displayed recipe
// AI Recipe Search Functionality
const aiMessages = document.getElementById('ai-messages');
const aiQuery = document.getElementById('ai-query');
const aiSubmit = document.getElementById('ai-submit');

// Recipe Adjustment Functions
function detectAdjustmentCommand(query) {
    const commands = {
        'vegetarian': { type: 'dietary', action: 'remove-meat' },
        'vegan': { type: 'dietary', action: 'remove-animal-products' },
        'halve': { type: 'servings', action: 0.5 },
        'double': { type: 'servings', action: 2 }
    };

    query = query.toLowerCase();
    for (const [keyword, command] of Object.entries(commands)) {
        if (query.includes(keyword)) return command;
    }
    return null;
}

function adjustServings(recipe, factor) {
    const modified = JSON.parse(JSON.stringify(recipe));
    for (let i = 1; i <= 20; i++) {
        if (modified[`strMeasure${i}`]) {
            modified[`strMeasure${i}`] = multiplyMeasurement(modified[`strMeasure${i}`], factor);
        }
    }
    return modified;
}

function multiplyMeasurement(measurement, factor) {
    const numericMatch = measurement.match(/(\d+\/\d+|\d+\.\d+|\d+)/);
    if (numericMatch) {
        const value = eval(numericMatch[0]);
        const newValue = value * factor;
        return measurement.replace(numericMatch[0], newValue.toFixed(1));
    }
    return measurement;
}

// Simple mock AI function (in a real app, connect to an AI API)
async function fetchAIResponse(query) {
    // Show typing indicator
    showTypingIndicator();

    // In a real implementation, you would call an AI API here
    // This is a mock implementation that uses TheMealDB's search
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Extract keywords from query
        const keywords = extractKeywords(query);

        // Search TheMealDB based on keywords
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${keywords}`);
        const data = await response.json();

        // Hide typing indicator
        hideTypingIndicator();

        if (data.meals) {
            return {
                text: `Here are some recipes related to "${keywords}":`,
                meals: data.meals.slice(0, 3) // Show top 3 results
            };
        } else {
            return {
                text: `I couldn't find any recipes for "${keywords}". Try different keywords.`,
                meals: null
            };
        }
    } catch (error) {
        hideTypingIndicator();
        return {
            text: "Sorry, I encountered an error. Please try again later.",
            meals: null
        };
    }
}

// Helper function to extract keywords
function extractKeywords(query) {
    // Remove common question words
    const questionWords = ['show', 'me', 'find', 'recipes', 'for', 'give', 'suggest', 'what', 'are', 'some'];
    return query.toLowerCase()
        .split(' ')
        .filter(word => !questionWords.includes(word))
        .join(' ');
}

// Display messages in chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('ai-message', sender);
    messageDiv.textContent = text;
    aiMessages.appendChild(messageDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('ai-message', 'bot');
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
    aiMessages.appendChild(typingDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Enhanced displayRecipes function with proper error handling
// function displayRecipes(meals) {
//     currentRecipe = meals ? meals[0] : null;
//     if (!meals || meals.length === 0) return;

//     const recipesDiv = document.createElement('div');
//     recipesDiv.classList.add('ai-recipes-grid');

//     meals.forEach(meal => {
//         const recipeCard = document.createElement('div');
//         recipeCard.classList.add('recipe-card');
//         recipeCard.dataset.mealId = meal.idMeal;

//         recipeCard.innerHTML = `
//             <div class="card-image-wrapper">
//                 <img src="${meal.strMealThumb || 'img/recipe-placeholder.jpg'}"
//                      alt="${meal.strMeal}"
//                      class="card-image">
//                 <div class="card-badge-container">
//                     <span class="badge badge-area">${meal.strArea || 'Intl'}</span>
//                     <span class="badge badge-category">${meal.strCategory || 'Dessert'}</span>
//                 </div>
//             </div>
//             <div class="card-content">
//                 <h3 class="card-title">${meal.strMeal}</h3>
//                 <button class="card-action-btn" data-meal-id="${meal.idMeal || ''}">
//                     <i class="fas fa-utensils"></i> View Details
//                 </button>
//             </div>
//         `;

//         recipesDiv.appendChild(recipeCard);
//     });

//     aiMessages.appendChild(recipesDiv);
//     aiMessages.scrollTop = aiMessages.scrollHeight;

//     // Add click handlers to View Details buttons
//     document.querySelectorAll('.card-action-btn').forEach(button => {
//         button.addEventListener('click', async (e) => {
//             e.preventDefault();
//             e.stopPropagation();

//             const mealId = button.dataset.mealId;

//             // Show loading state
//             const originalHTML = button.innerHTML;
//             button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
//             button.disabled = true;

//             try {
//                 if (mealId) {
//                     // Add timeout to prevent hanging
//                     const controller = new AbortController();
//                     const timeoutId = setTimeout(() => controller.abort(), 5000);

//                     const response = await fetch(
//                         `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
//                         { signal: controller.signal }
//                     );

//                     clearTimeout(timeoutId);

//                     if (!response.ok) {
//                         throw new Error(`HTTP error! status: ${response.status}`);
//                     }

//                     const data = await response.json();

//                     if (!data.meals || data.meals.length === 0) {
//                         throw new Error('Recipe data not found in response');
//                     }

//                     // Assuming openRecipePopup is defined elsewhere in your code
//                     if (typeof openRecipePopup === 'function') {
//                         openRecipePopup(data.meals[0]);
//                     } else {
//                         console.error("Error: openRecipePopup function is not defined.");
//                         addMessage("Error: Could not display recipe details.", 'bot');
//                     }
//                 } else {
//                     // Handle imported/parsed recipes
//                     const card = button.closest('.recipe-card');
//                     if (!card) throw new Error('Could not find recipe card');

//                     const meal = {
//                         strMeal: card.querySelector('.card-title')?.textContent || 'Unknown Recipe',
//                         strMealThumb: card.querySelector('.card-image')?.src || 'img/recipe-placeholder.jpg',
//                         strInstructions: "Full instructions available after import",
//                         strArea: card.querySelector('.badge-area')?.textContent || 'International',
//                         strCategory: card.querySelector('.badge-category')?.textContent || 'Dessert'
//                     };
//                     // Assuming openRecipePopup is defined elsewhere in your code
//                     if (typeof openRecipePopup === 'function') {
//                         openRecipePopup(meal);
//                     } else {
//                         console.error("Error: openRecipePopup function is not defined.");
//                         addMessage("Error: Could not display recipe details.", 'bot');
//                     }
//                 }
//             } catch (error) {
//                 console.error("Recipe load error:", error);

//                 // Show error message near the button instead of in chat
//                 const errorElement = document.createElement('div');
//                 errorElement.className = 'recipe-error-message';
//                 errorElement.textContent = 'Failed to load recipe. Please try again.';

//                 button.insertAdjacentElement('afterend', errorElement);
//                 setTimeout(() => errorElement.remove(), 3000);
//             } finally {
//                 // Restore button state
//                 button.innerHTML = originalHTML;
//                 button.disabled = false;
//             }
//         });
//     });
// }

function displayRecipes(meals) {
  currentRecipe = meals[0];
  if (!meals || meals.length === 0) return;
  
  const recipesDiv = document.createElement('div');
  recipesDiv.classList.add('ai-recipes-grid');
  
  meals.forEach(meal => {
    const recipeCard = document.createElement('div');
    recipeCard.classList.add('recipe-card');
    recipeCard.dataset.mealId = meal.idMeal;
    
    recipeCard.innerHTML = `
      <div class="card-image-wrapper">
        <img src="${meal.strMealThumb || 'img/recipe-placeholder.jpg'}" 
             alt="${meal.strMeal}" 
             class="card-image">
        <div class="card-badge-container">
          <span class="badge badge-area">${meal.strArea || 'Intl'}</span>
          <span class="badge badge-category">${meal.strCategory || 'Dessert'}</span>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${meal.strMeal}</h3>
        <button class="card-action-btn" data-meal-id="${meal.idMeal || ''}">
          <i class="fas fa-utensils"></i> View Details
        </button>
      </div>
    `;
    
    recipesDiv.appendChild(recipeCard);
  });

  aiMessages.appendChild(recipesDiv);
  aiMessages.scrollTop = aiMessages.scrollHeight;

  // Add click handlers to View Details buttons
  document.querySelectorAll('.card-action-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const mealId = button.dataset.mealId;
      
      // Show loading state
      const originalHTML = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      button.disabled = true;
      
      try {
        if (mealId) {
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
          const data = await response.json();
          
          if (data.meals && data.meals[0]) {
            openRecipePopup(data.meals[0]);
          } else {
            throw new Error('Recipe not found');
          }
        } else {
          // Handle imported/parsed recipes
          const card = button.closest('.recipe-card');
          const meal = {
            strMeal: card.querySelector('.card-title').textContent,
            strMealThumb: card.querySelector('.card-image').src,
            strInstructions: "Full instructions available after import",
            strArea: card.querySelector('.badge-area').textContent,
            strCategory: card.querySelector('.badge-category').textContent
          };
          openRecipePopup(meal);
        }
      } catch (error) {
        console.error("Recipe load error:", error);
        const errorElement = document.createElement('div');
        errorElement.className = 'recipe-error-message';
        errorElement.textContent = 'Failed to load recipe. Please try again.';
        button.insertAdjacentElement('afterend', errorElement);
        setTimeout(() => errorElement.remove(), 3000);
      } finally {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }
    });
  });
}
function openRecipePopup(meal) {
  // Create popup container if it doesn't exist
  let popup = document.querySelector('.recipe-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.className = 'recipe-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-actions">
          <button class="popup-close">&times;</button>
          <button class="popup-print">
            <i class="fas fa-print"></i> Print Recipe
          </button>
        </div>
        <div class="popup-body"></div>
      </div>
    `;
    document.body.appendChild(popup);
    
    // Add close handler
    popup.querySelector('.popup-close').addEventListener('click', () => {
      popup.style.display = 'none';
    });

    // Add print handler
    popup.querySelector('.popup-print').addEventListener('click', () => {
      printRecipe(meal);
    });
  }

  // Populate popup content
  const popupBody = popup.querySelector('.popup-body');
  let ingredients = '';
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
      ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`] || ''}</li>`;
    }
  }

  popupBody.innerHTML = `
    <div class="recipe-header">
      <img src="${meal.strMealThumb || 'img/recipe-placeholder.jpg'}" alt="${meal.strMeal}">
      <h2>${meal.strMeal}</h2>
      <div class="recipe-meta">
        <span class="badge">${meal.strArea || 'International'}</span>
        <span class="badge">${meal.strCategory || 'Dessert'}</span>
      </div>
    </div>
    <div class="recipe-section">
      <h3>Ingredients</h3>
      <ul class="ingredients-list">${ingredients}</ul>
    </div>
    <div class="recipe-section">
      <h3>Instructions</h3>
      <div class="instructions">${meal.strInstructions || 'No instructions available.'}</div>
    </div>
  `;

  // Show popup
  popup.style.display = 'block';
}

// Add the printRecipe function
function printRecipe(meal) {
  // Create a printable version
  const printWindow = window.open('', '_blank');
  
  // Format ingredients
  let ingredients = '';
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
      ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`] || ''}</li>`;
    }
  }

  // Create printable HTML
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${meal.strMeal} Recipe</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          color: #333;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .print-title {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .print-image {
          max-width: 100%;
          height: auto;
          margin: 0 auto 20px;
          display: block;
          border-radius: 8px;
        }
        .print-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
          font-style: italic;
          color: #666;
        }
        .print-section {
          margin-bottom: 20px;
        }
        .print-section-title {
          font-size: 20px;
          border-bottom: 2px solid #eee;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .print-ingredients {
          columns: 2;
          column-gap: 30px;
          margin: 0;
          padding: 0 0 0 20px;
        }
        .print-instructions {
          white-space: pre-line;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1 class="print-title">${meal.strMeal}</h1>
        <div class="print-meta">
          <span>${meal.strCategory || 'Dessert'}</span>
          <span>${meal.strArea || 'International'} Cuisine</span>
        </div>
        <img src="${meal.strMealThumb || 'img/recipe-placeholder.jpg'}" alt="${meal.strMeal}" class="print-image">
      </div>
      
      <div class="print-section">
        <h2 class="print-section-title">Ingredients</h2>
        <ul class="print-ingredients">${ingredients}</ul>
      </div>
      
      <div class="print-section">
        <h2 class="print-section-title">Instructions</h2>
        <p class="print-instructions">${meal.strInstructions || 'No instructions available.'}</p>
      </div>
      
      <script>
        setTimeout(() => {
          window.print();
          window.close();
        }, 300);
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// Update the CSS to include print button styles
const popupStyles = `
.recipe-popup {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
  overflow-y: auto;
}

.popup-content {
  background: var(--card-bg);
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  position: relative;
}

.popup-actions {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 10px;
}

.popup-close, .popup-print {
  font-size: 1rem;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.popup-close {
  background: #e74c3c;
  color: white;
}

.popup-print {
  background: var(--primary-color);
  color: white;
}

.popup-close:hover {
  background: #c0392b;
}

.popup-print:hover {
  background: #5a52d6;
}

.recipe-header {
  text-align: center;
  margin-bottom: 2rem;
}

.recipe-header img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.recipe-meta {
  margin: 1rem 0;
}

.recipe-section {
  margin-bottom: 1.5rem;
}

.ingredients-list {
  columns: 2;
  column-gap: 2rem;
}

@media (max-width: 768px) {
  .popup-content {
    margin: 1rem;
    padding: 1rem;
  }
  
  .ingredients-list {
    columns: 1;
  }
  
  .popup-actions {
    flex-direction: column;
    align-items: flex-end;
  }
}
`;

// Update the style element
const styleElement = document.createElement('style');
styleElement.innerHTML = popupStyles;
document.head.appendChild(styleElement);

// Add this CSS for the popup




// Handle AI search
aiSubmit.addEventListener('click', async () => {
    const query = aiQuery.value.trim();
    if (!query) return;

    // Add user message
    addMessage(query, 'user');
    aiQuery.value = '';

    // Get AI response
    const response = await fetchAIResponse(query);

    // Add bot response
    addMessage(response.text, 'bot');

    // Display recipes if available
    if (response.meals) {
        displayRecipes(response.meals);
    }
});

// Allow pressing Enter to submit
aiQuery.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        aiSubmit.click();
    }
});