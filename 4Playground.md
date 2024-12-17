---
layout: page
title: Let's play with our data !
subtitle: Classified movies - would you say the same ? 
---

<h1 style="text-align:center">To LLM or not to LLM ? <br/> That is the question ! </h1>

<p>
<img style="float: left;padding-right: 20px;;padding-bottom: 20px;" class="gators" src="../assets/img/caimaizie.png" alt="again a crocodile"/> Hi, i'm Caizieman the gamer crocodile ! <br/>
I don't trust this LLM, (even if Ada told me I can't label everything myself) should we try to see if we agree with him ?
</p>

<h3>Time for the battle !</h3>

You will do as the LLM ! read the summary and classify between violent and non-violent.
<br/><br/>
<div id="prediction-container">
  <div style="text-align: center;">
  <button class="butorange" id="replay-button" onclick="window.location.reload();">'I don't want to read this' button (reload)</button>'
  </div>
  <p><strong>Content:</strong> <span id="content"><span class="loader"></span></span></p>

  <p><strong>Your Prediction:</strong></p>
  <div style="text-align: center;" id = "predict">
  </div>

  <div id="name"></div>
  <div style="text-align: center;" id = "replay" ><div>
</div>

<script>
  let agreeCount = localStorage.getItem("agreeCount");
  let totalCount = localStorage.getItem("totalCount");
  console.log(agreeCount)
  if (isNaN(agreeCount)) {
    agreeCount = 0;
    totalCount = 0;
    localStorage.setItem("agreeCount", agreeCount.toString());
    localStorage.setItem("totalCount", totalCount.toString());
    document.getElementById("replay").innerHTML = `<p>You did not play yet !</p>`;
  } else {
    agreeCount = parseInt(agreeCount);
    document.getElementById("replay").innerHTML = `You agreed <span>${agreeCount}</span> times over <span>${totalCount}</span>`;
  }


  // take the dataset
  const data = {{ site.data.playground | jsonify }};
  // Select a random line from the data
  function getRandomPrediction() {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex]; 
  }
  
  // Display the plot
  function displayPrediction() {
    document.getElementById("content").textContent = randomPrediction.Plot;
    document.getElementById("predict").innerHTML = '<button class="butgreen" onclick="makePrediction(-1)">Non-Violent</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button class="butred" onclick="makePrediction(1)">Violent</button>';
  }

  // When a user makes a prediction, check if it matches the actual prediction.
  function makePrediction(userPrediction) {
    document.getElementById("name").innerHTML = `<p style="text-align:center" ><strong>Name:</strong> <span>${randomPrediction.Movie_name}</span></p>`;
    const result = document.getElementById("predict");

    if (userPrediction === parseInt(randomPrediction.Prediction)) {
      result.textContent = 'The LLM agree';
      agreeCount = agreeCount +1;
    } else {
      result.textContent = "Nah the LLM is wrong.. or you ?";
    }
    totalCount = totalCount +1;

    document.getElementById("replay").innerHTML = `You agreed <span>${agreeCount}</span> times over <span>${totalCount}</span> <div><button class="butorange" id="replay-button" onclick="window.location.reload();">Replay</button> </div>`;
    localStorage.setItem("agreeCount",agreeCount.toString());
    localStorage.setItem("totalCount",totalCount.toString());

  }

  const randomPrediction = getRandomPrediction();
  displayPrediction();

</script>
