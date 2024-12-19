---
layout: page
title: Let's play with our data !
subtitle: Classified movies - would you say the same ? 
---

<h1 style="text-align:center">To LLM or not to LLM ? <br/> That is the question ! </h1>

<span id="loader" class="loader"></span>
<canvas id="pieChart" width="150" height="150"></canvas>
<p>
<img style="float: left;padding-right: 20px;;padding-bottom: 20px;" class="gators" src="../assets/img/caimaizie.png" alt="again a crocodile"/> Hi, I'm Caizieman the gamer crocodile ! <br/>
I don't trust this LLM, (even if Ada Reptking told me I can't label everything myself). <br/>
Should we try to see if we agree with him ?
</p>

<h3>Time for the battle !</h3>

You will do as the LLM ! read the summary and classify between violent and non-violent.
<br/><br/>
<div id="prediction-container">
  <div style="text-align: center;">
  <button class="butorange" id="replay-button" onclick="window.location.reload();">"I don't want to read this" button (reload)</button>
  </div>
  <p><strong>Content:</strong> <span id="content"><span class="loader"></span></span></p>

  <p><strong>Your Prediction:</strong></p>
  <div style="text-align: center;" id = "predict">
  </div>

  <div id="name"></div>
  <div style="text-align: center;" id = "replay" ><div>
</div>

<script>
  //first, the code to create the global variable ! We will use JSONBin to store the data (small, good for small project)

  //we will call JSONBin for the data about games
  const BIN_URL = "https://api.jsonbin.io/v3/b/676204c2acd3cb34a8bb6482";
  const API_KEY = "$2a$10$sOmrituc.lw1NLnRMGejOelnaPGd0EJKBP5FR8uZ47D26jTPdzL9q";
  
  //fetch
  const HEADERS = {
    "X-Master-Key": API_KEY,
    "Content-Type": "application/json"
  };

  let pieChart;

  // function to find and display the data
  async function fetchStats() {
    try {
      const response = await fetch(BIN_URL, { headers: HEADERS });
      const data = await response.json();
      const stats = data.record;
      // Display stats on the page
      console.log("fetch", stats.nbPlay,stats.nbAgree);
      return stats;
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  //we gonna test, we gonna do nimp, we need to be able to reset 
  async function resetStats() {
    try {
      // Fetch the current data
      let stats = await fetchStats();
      if (!stats) return;

      // Update 
      stats.nbPlay = 0;
      stats.nbAgree = 0;

      console.log("reset", stats.nbPlay,stats.nbAgree)

      // Save the updated data 
      await fetch(BIN_URL, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(stats)
      });

    } catch (error) {
      console.error("Error resetting stats:", error);
    }
  }

  // function to update the data
  async function updateStats(doAgree) {
    try {
      // Fetch the current data
      let stats = await fetchStats();
      if (!stats) return;

      // Update 
      stats.nbPlay += 1;
      if (doAgree) stats.nbAgree += 1;
      
      console.log("update", stats.nbPlay,stats.nbAgree)

      // Save the updated data 
      await fetch(BIN_URL, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(stats)
      });

    } catch (error) {
      console.error("Error updating stats:", error);
    }
  }

  async function updateChart() {
  // Fetch the current data
    let stats = await fetchStats();
    if (!stats) return;

    const data = {
      labels: ['Disagree', 'Agree'],
      datasets: [{
        label: 'Game Stats',
        data: [stats.nbPlay - stats.nbAgree, stats.nbAgree],
        backgroundColor: ['#FF6384', '#36A2EB']
      }]
    };

    const config = {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'The LLM battle so far : Do people agree ?',
            font: {
              size: 30    
            }
          },
          subtitle: { // Custom subtitle plugin
            display: true,
            text: 'People Played ' + stats.nbPlay + ' times !',
            font: {
              weight: 'bold', 
              size: 20,      
            }
        }
        }
      }
    };

    // Create the chart or update it
    if (pieChart) {
      pieChart.data = data;
      pieChart.update();
    } else {
      const ctx = document.getElementById('pieChart').getContext('2d');
      pieChart = new Chart(ctx, config);
    }

    document.getElementById("loader").style.display = 'none';
    document.getElementById("pieChart").style.display = 'block';
    
  }

  // here the html game part 

  // take the dataset
  const data = {{ site.data.playground | jsonify }};
  // Select a random line from the data
  function getRandomPrediction() {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex]; 
  }

  function displayPrediction() {
    document.getElementById("content").textContent = randomPrediction.Plot;
    document.getElementById("predict").innerHTML = '<button class="butgreen" onclick="makePrediction(-1)">Non-Violent</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class="butred" onclick="makePrediction(1)">Violent</button>';
  }

  async function makePrediction(userPrediction) {
    try {
      let stats = await fetchStats();
      if (!stats) return;

      document.getElementById("name").innerHTML = `<p style="text-align:center" ><strong>Movie Name:</strong> <span>${randomPrediction.Movie_name}</span></p>`;
      const result = document.getElementById("predict");

      if (userPrediction === parseInt(randomPrediction.Prediction)) {
        result.textContent = 'The LLM agrees';
        document.getElementById("replay").innerHTML = `People agreed <span>${stats.nbAgree + 1}</span> times over <span>${stats.nbPlay + 1} games !</span> <div><button class="butorange" id="replay-button" onclick="window.location.reload();">Replay</button> </div>`;
        updateStats(true);
      } else {
        result.textContent = "Nah the LLM is wrong... or you are?";
        document.getElementById("replay").innerHTML = `People agreed <span>${stats.nbAgree}</span> times over <span>${stats.nbPlay + 1} games !</span> <div><button class="butorange" id="replay-button" onclick="window.location.reload();">Replay</button> </div>`;
        updateStats(false);
      }
      updateChart(stats);
      
    } catch {
      console.error("Error adding new stats:", error);
    }

  }

  updateChart();
  const randomPrediction = getRandomPrediction();
  displayPrediction();

  

</script>


<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>