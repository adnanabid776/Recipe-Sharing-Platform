const searchRecipes = document.querySelector(".search-recipes");
const searchButtonRecipes = document.querySelector(".search-button-recipes");
const recipeContainer = document.querySelector(".recipe-container");
const letterSearchContainer = document.createElement('div');
const recipeDetailsContent = document.querySelector(".recipe-details-content");
const closeButton = document.querySelector(".recipe-close-button");
const recipeDetails = document.querySelector(".recipe-details");


// Create loading bar element
let loadingBar = document.querySelector('.loading-bar');
if (!loadingBar) {
    loadingBar = document.createElement('div');
    loadingBar.className = 'loading-bar';
    document.body.insertBefore(loadingBar, document.body.firstChild);
}

// Enhanced Recipe Popup Function
const openRecipePopup = (meal) => {
    const recipeDetails = document.querySelector(".recipe-details");
    const recipeDetailsContent = document.querySelector(".recipe-details-content");

    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
        }
    }

    recipeDetailsContent.innerHTML = `
        <div class="recipe-popup-buttons">
            <button class="recipe-close-button">
                <i class="fas fa-times"></i>
            </button>
            <button class="recipe-print-button">
                <i class="fas fa-print"></i> Print Recipe
            </button>
        </div>
        <div class="recipe-popup-content">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-popup-image">
            <h2 class="recipe-popup-title">${meal.strMeal}</h2>
            <div class="recipe-popup-meta">
                <div class="recipe-popup-meta-item">
                    <i class="fas fa-utensils"></i>
                    <span>${meal.strCategory}</span>
                </div>
                <div class="recipe-popup-meta-item">
                    <i class="fas fa-globe"></i>
                    <span>${meal.strArea}</span>
                </div>
                ${meal.strYoutube ? `
                <div class="recipe-popup-meta-item">
                    <i class="fab fa-youtube"></i>
                    <a href="${meal.strYoutube}" target="_blank">Video Tutorial</a>
                </div>` : ''}
            </div>
            <div class="recipe-popup-section">
                <h3 class="recipe-popup-section-title">Ingredients</h3>
                <ul class="recipe-popup-ingredients">${ingredients}</ul>
            </div>
            <div class="recipe-popup-section">
                <h3 class="recipe-popup-section-title">Instructions</h3>
                <p class="recipe-popup-instructions">${meal.strInstructions}</p>
            </div>
        </div>
    `;

    recipeDetails.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Close button event
    document.querySelector(".recipe-close-button").addEventListener('click', (e) => {
        e.stopPropagation();
        recipeDetails.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Print button event
    document.querySelector(".recipe-print-button").addEventListener('click', () => {
        printRecipe(meal);
    });
};

const printRecipe = (meal) => {
    // Create a printable version of the recipe
    const printWindow = window.open('', '_blank');
    
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
        }
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${meal.strMeal} Recipe</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
                .print-header { text-align: center; margin-bottom: 30px; }
                .print-title { font-size: 28px; margin-bottom: 10px; color: #333; }
                .print-meta { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; }
                .print-image { max-width: 100%; height: auto; margin: 0 auto 20px; display: block; border-radius: 8px; }
                .print-section { margin-bottom: 20px; }
                .print-section-title { font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
                .print-ingredients { columns: 2; column-gap: 30px; }
                .print-instructions { white-space: pre-line; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1 class="print-title">${meal.strMeal}</h1>
                <div class="print-meta">
                    <span>${meal.strCategory}</span>
                    <span>${meal.strArea} Cuisine</span>
                </div>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="print-image">
            </div>
            
            <div class="print-section">
                <h2 class="print-section-title">Ingredients</h2>
                <ul class="print-ingredients">${ingredients}</ul>
            </div>
            
            <div class="print-section">
                <h2 class="print-section-title">Instructions</h2>
                <p class="print-instructions">${meal.strInstructions}</p>
            </div>
            
            ${meal.strYoutube ? `
            <div class="print-section no-print">
                <h2 class="print-section-title">Video Tutorial</h2>
                <p>Watch the video tutorial: ${meal.strYoutube}</p>
            </div>` : ''}
            
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
};
function createLetterSearch() {
    letterSearchContainer.className = 'letter-search';
    letterSearchContainer.innerHTML = '<p>Search by letter:</p>';
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement('button');
        button.className = 'letter-btn';
        button.textContent = letter;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            fetchrecipesByLetter(letter.toLowerCase());
        });
        letterSearchContainer.appendChild(button);
    }
    const searchForm = document.querySelector('form');
    if (searchForm) {
        searchForm.insertAdjacentElement('afterend', letterSearchContainer);
    }
}

const fetchrecipesByLetter = async (letter) => {
    try {
        loadingBar.style.width = '0';
        loadingBar.style.opacity = '1';
        loadingBar.style.display = 'block';
        recipeContainer.innerHTML = "<h3>Fetching recipes starting with " + letter.toUpperCase() + "...</h3>";

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            loadingBar.style.width = `${progress}%`;
            if (progress >= 90) clearInterval(progressInterval);
        }, 100);

        const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
        const response = await data.json();

        loadingBar.style.width = '100%';
        await new Promise(resolve => setTimeout(resolve, 300));
        loadingBar.style.opacity = '0';
        loadingBar.style.display = 'none';

        recipeContainer.innerHTML = "";

        if (response.meals) {
            response.meals.forEach((meal) => {
                const recipeDiv = document.createElement('div');
                recipeDiv.classList.add('recipe');
                recipeDiv.innerHTML = `
                    <img src="${meal.strMealThumb}">
                    <h2>${meal.strMeal}</h2>
                    <p>This is <span>${meal.strArea}</span> dish.</p>
                    <p>It belongs to <span>${meal.strCategory}</span> category.</p>
                `;
                const button = document.createElement('button');
                button.textContent = "View Recipe";
                button.className = "view-recipe-btn";
                button.addEventListener('click', () => openRecipePopup(meal));
                recipeDiv.appendChild(button);
                recipeContainer.appendChild(recipeDiv);
            });
        } else {
            recipeContainer.innerHTML = "<h3>No recipes found starting with " + letter.toUpperCase() + "</h3>";
        }

    } catch (error) {
        console.error("Error fetching recipes by letter:", error);
        loadingBar.style.opacity = '0';
        loadingBar.style.display = 'none';
        recipeContainer.innerHTML = "<h3>Error loading recipes. Please try again.</h3>";
    }
};

const fetchrecipes = async (query) => {
    try {
        loadingBar.style.transition = 'width 0.4s ease';
        loadingBar.style.width = '0';
        loadingBar.style.opacity = '1';
        loadingBar.style.display = 'block';
        recipeContainer.innerHTML = "<h3>Fetching recipes...</h3>";
        void loadingBar.offsetWidth;
        loadingBar.style.width = '30%';
        const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        loadingBar.style.width = '70%';
        const response = await data.json();
        loadingBar.style.width = '100%';
        await new Promise(resolve => setTimeout(resolve, 300));
        loadingBar.style.opacity = '0';
        loadingBar.addEventListener('transitionend', () => {
            loadingBar.style.display = 'none';
        }, { once: true });

        recipeContainer.innerHTML = "";

        if (response.meals) {
            response.meals.forEach((meal) => {
                const recipeDiv = document.createElement('div');
                recipeDiv.classList.add('recipe');
                recipeDiv.innerHTML = `
                    <img src="${meal.strMealThumb}">
                    <h2>${meal.strMeal}</h2>
                    <p>This is <span>${meal.strArea}</span> dish.</p>
                    <p>It belongs to <span>${meal.strCategory}</span> category.</p>
                `;
                const button = document.createElement('button');
                button.textContent = "View Recipe";
                button.className = "view-recipe-btn";
                button.addEventListener('click', () => openRecipePopup(meal));
                recipeDiv.appendChild(button);
                recipeContainer.appendChild(recipeDiv);
            });
        } else {
            recipeContainer.innerHTML = "<h3>No recipes found. Try different ingredients!</h3>";
        }

    } catch (error) {
        console.error("Error fetching recipes:", error);
        loadingBar.style.opacity = '0';
        loadingBar.style.display = 'none';
        recipeContainer.innerHTML = "<h3>Error loading recipes. Please try again.</h3>";
    }
};

createLetterSearch();

searchButtonRecipes.addEventListener('click', (e) => {
    e.preventDefault();
    const searchInput = searchRecipes.value.trim();
    if (searchInput) {
        fetchrecipes(searchInput);
        searchRecipes.value = ''; // Clear input after search
    } else {
        recipeContainer.innerHTML = "<h3>Please enter some ingredients to search</h3>";
    }
});