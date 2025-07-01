document.addEventListener('DOMContentLoaded', () => {
    const ingredientsInput = document.getElementById('ingredients');
    const preferenceSelect = document.getElementById('preference');
    const getSuggestionsBtn = document.getElementById('getSuggestionsBtn');
    const resultsDiv = document.getElementById('results');

    getSuggestionsBtn.addEventListener('click', async () => {
        const ingredients = ingredientsInput.value.split(/\r?\n|,\s*/).filter(item => item.trim() !== '');
        const preference = preferenceSelect.value;

        if (ingredients.length === 0) {
            resultsDiv.innerHTML = '<p style="color: red;">Please enter some ingredients.</p>';
            return;
        }

        resultsDiv.innerHTML = '<p>Loading suggestions...</p>';

        try {
            const response = await fetch('http://localhost:3000/api/substitute-ingredients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients, preference }),
            });

            const data = await response.json();

            if (!response.ok) {
                resultsDiv.innerHTML = `<p style="color: red;">Error: ${data.error || 'Unknown error'}</p>`;
                console.error('API Error:', data);
                return;
            }

            if (data.substitutions && data.substitutions.length > 0) {
                resultsDiv.innerHTML = ''; // Clear previous results
                data.substitutions.forEach(sub => {
                    const subItem = document.createElement('div');
                    subItem.className = 'substitution-item';
                    subItem.innerHTML = `<h3>Original: ${sub.original}</h3>
                        <ul>
                            ${sub.suggestions.map(s => `<li><strong>${s.item}</strong>: ${s.reason}</li>`).join('')}
                        </ul>`;
                    resultsDiv.appendChild(subItem);
                });
            } else {
                resultsDiv.innerHTML = '<p>No substitutions found for the given ingredients and preference.</p>';
            }

        } catch (error) {
            resultsDiv.innerHTML = '<p style="color: red;">Failed to connect to the server.</p>';
            console.error('Fetch error:', error);
        }
    });
}); 