document.getElementById('smoothieForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const APP_ID = 'bd594922'; 
  const APP_KEY = 'a3d3d42482e2ce2d78fa654b20116f74';

  const selectedFlavors = Array.from(document.querySelectorAll('input[name="flavor"]:checked')).map(el => el.value);
  const selectedDiet = Array.from(document.querySelectorAll('input[name="diet"]:checked')).map(el => el.value);
  const selectedGoals = Array.from(document.querySelectorAll('input[name="goal"]:checked')).map(el => el.value);

  let query = 'smoothie';
  if (selectedFlavors.length > 0) {
      query += ' ' + selectedFlavors.join(' ');
  }

  let dietLabels = selectedDiet.map(diet => {
      switch(diet) {
          case 'vegan': return 'vegan';
          case 'gluten-free': return 'gluten-free';
          case 'dairy-free': return 'dairy-free';
          case 'nut-free': return 'peanut-free';
          default: return '';
      }
  });

  const apiUrl = `https://api.edamam.com/search?q=${query}&app_id=${APP_ID}&app_key=${APP_KEY}&health=${dietLabels.join('&health=')}`;

  fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
          if (data.hits.length > 0) {
              const smoothie = data.hits[0].recipe;

              const smoothieName = generateSmoothieName(selectedFlavors, selectedGoals);

              document.getElementById('smoothieName').textContent = smoothieName;
              document.getElementById('smoothieImage').src = smoothie.image;
              document.getElementById('smoothieImage').alt = smoothie.label;

              const recipeDetails = `
                  <p><strong>Name:</strong> ${smoothie.label}</p>
                  <p><strong>Ingredients:</strong> ${smoothie.ingredientLines.join(', ')}</p>
                  <p><strong>Calories:</strong> ${Math.round(smoothie.calories)}</p>
                  <a href="${smoothie.url}" target="_blank">Full Recipe</a>
              `;
              document.getElementById('recipeDetails').innerHTML = recipeDetails;

              const nutritionData = [
                  {label: 'Calories', value: Math.round(smoothie.calories)},
                  {label: 'Protein', value: Math.round(smoothie.totalNutrients.PROCNT.quantity)},
                  {label: 'Fat', value: Math.round(smoothie.totalNutrients.FAT.quantity)},
                  {label: 'Carbohydrates', value: Math.round(smoothie.totalNutrients.CHOCDF.quantity)}
              ];

              renderNutritionChart(nutritionData);

              document.getElementById('smoothieResult').classList.remove('hidden');
          } else {
              alert('No smoothie recipes found. Please adjust your preferences and try again.');
          }
      })
      .catch(error => {
          console.error('Error fetching smoothie recipe:', error);
          alert('There was an error fetching the smoothie recipe. Please try again later.');
      });
});

function generateSmoothieName(flavors, goals) {
  const flavorPart = flavors.length > 0 ? flavors.join(' & ') : 'Mystery';
  const goalPart = goals.length > 0 ? goals.join(' ') : 'Smoothie';
  return `${flavorPart} ${goalPart}`;
}

function renderNutritionChart(data) {
  const width = 400;
  const height = 300;
  const margin = {top: 20, right: 20, bottom: 30, left: 40};

  d3.select("#nutritionChart").selectAll("*").remove();

  const svg = d3.select("#nutritionChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
      .range([0, width - margin.left - margin.right])
      .padding(0.1)
      .domain(data.map(d => d.label));

  const y = d3.scaleLinear()
      .range([height - margin.top - margin.bottom, 0])
      .domain([0, d3.max(data, d => d.value)]);

  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));

  svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

  svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - margin.top - margin.bottom - y(d.value))
      .attr("fill", "#ff7f50");
}
your-app-key
