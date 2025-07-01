


document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_ENDPOINT = 'http://localhost:3000/api/generate-meal-plan';
    const MAX_DAYS = 14;

    // DOM Elements
    const generatePlanBtn = document.getElementById('generate-plan-btn');
    const dietaryRestrictionsInput = document.getElementById('dietary-restrictions');
    const allergiesInput = document.getElementById('allergies');
    const cuisinePreferencesInput = document.getElementById('cuisine-preferences');
    const mealDurationInput = document.getElementById('meal-duration');
    const mealPlanOutput = document.getElementById('meal-plan-output');
    
    // Initialize error display
    const errorDisplay = document.getElementById('error-display') || createErrorDisplay();

    function createErrorDisplay() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-display';
        errorDiv.className = 'error-message';
        errorDiv.style.display = 'none';
        document.querySelector('.meal-planner-container').prepend(errorDiv);
        return errorDiv;
    }

    function createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner"></div>
            <p>Generating your personalized meal plan...</p>
        `;
        return spinner;
    }

    async function handleGeneratePlan() {
        const dietaryRestrictions = dietaryRestrictionsInput.value.trim();
        const allergies = allergiesInput.value.trim();
        const cuisinePreferences = cuisinePreferencesInput.value.trim();
        const mealDuration = parseInt(mealDurationInput.value);

        // Validation
        if (isNaN(mealDuration) || mealDuration < 1 || mealDuration > MAX_DAYS) {
            showError(`Please enter a valid number of days (1-${MAX_DAYS})`);
            return;
        }

        // Reset UI
        resetUI();
        const loadingSpinner = createLoadingSpinner();
        mealPlanOutput.appendChild(loadingSpinner);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dietaryRestrictions,
                    allergies,
                    cuisinePreferences,
                    mealDuration
                })
            });

            const data = await parseResponse(response);
            
            if (!data.mealPlan) {
                throw new Error('Received empty meal plan from server');
            }

            displayMealPlan(data.mealPlan);
            addPrintButton(); // Add print button after meal plan is displayed

        } catch (error) {
            console.error("Error:", error);
            showError(error.message || 'An unexpected error occurred. Please try again.');
        } finally {
            loadingSpinner.remove();
        }
    }

    function resetUI() {
        mealPlanOutput.innerHTML = '';
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';
    }

    async function parseResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Handle potential string response
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch {
                throw new Error('Failed to parse server response');
            }
        }
        
        return data;
    }

    function displayMealPlan(mealPlan) {
        if (typeof mealPlan !== 'object' || mealPlan === null) {
            showError('Invalid meal plan format received');
            return;
        }

        let html = `
            <div class="meal-plan-header">
                <h2>Your ${Object.keys(mealPlan).length}-Day Meal Plan</h2>
            </div>
            <div class="meals-container">
        `;

        for (const [day, meals] of Object.entries(mealPlan)) {
            if (typeof meals !== 'object' || meals === null) continue;
            
            html += `<div class="day-plan"><h3>${day}</h3><div class="meals-grid">`;

            for (const [mealType, description] of Object.entries(meals)) {
                html += `
                    <div class="meal-card">
                        <div class="meal-header">${mealType}</div>
                        <div class="meal-content">${formatMealDescription(description)}</div>
                    </div>
                `;
            }

            html += `</div></div>`;
        }

        mealPlanOutput.innerHTML = html + '</div>';
    }

    function addPrintButton() {
        const printButton = `
            <div class="print-actions">
                <button id="print-meal-plan-btn" class="print-btn">
                    <i class="fas fa-print"></i> Print Meal Plan
                </button>
            </div>
        `;
        mealPlanOutput.insertAdjacentHTML('beforeend', printButton);
        document.getElementById('print-meal-plan-btn').addEventListener('click', printMealPlan);
    }

    function formatMealDescription(desc) {
        if (!desc) return "Not available";
        
        if (typeof desc === 'object') {
            desc = JSON.stringify(desc, null, 2);
        }
        
        return desc.split('\n').map(line => {
            if (line.match(/^[A-Z][a-z]+:/)) return `<strong>${line}</strong>`;
            if (line.trim().startsWith('-')) return `• ${line.substring(1).trim()}`;
            return line;
        }).join('<br>');
    }

    function printMealPlan() {
        const printWindow = window.open('', '_blank');
        const mealPlanContent = document.querySelector('.meals-container').cloneNode(true);
        
        // Remove any buttons from the printed version
        mealPlanContent.querySelectorAll('button').forEach(btn => btn.remove());
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Meal Plan</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px;
                        line-height: 1.5;
                    }
                    .day-plan { 
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                    }
                    .meal-card { 
                        border: 1px solid #ddd; 
                        padding: 15px; 
                        margin: 10px 0;
                        border-radius: 5px;
                        page-break-inside: avoid;
                    }
                    .meal-header {
                        font-weight: bold;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    @media print {
                        body { margin: 0.5in; }
                    }
                </style>
            </head>
            <body>
                <h1>My Meal Plan</h1>
                ${mealPlanContent.innerHTML}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        }, 200);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
    }

    // Event listener
    generatePlanBtn.addEventListener('click', handleGeneratePlan);
});