---
layout: page
title: Datasets
subtitle: Don't add to many datasets, they said...
---

<h1 style="text-align: center;">Why was one dataset (CMU) not sufficient for the investigation? </h1>

<img style="float: left;padding-right: 20px;;padding-bottom: 20px;" class="gators" src="../assets/img/Professore_Ada_Reptking.png" alt="again a crocodile"/>

<p>
Clearly, much of the relevant information concerning films (box office, summaries, release date, etc.) is already present in the CMU dataset. So what is the rationale behind Professeur Ada Reptking's (and our 5 students') idea of adding Z additional datasets? The answers are manifold. 
In order to understand their thinking, it is worth looking at the investigation that started it all: is it possible to observe a trend of correlation between violence in the real and fictional world? 
To do this, it is clearly necessary to define trends in violence on both sides: in the real world and in cinematic representations. This is where the NIBRS dataset comes in: it was used to define violence in the real world. On the film side, the Kaggle Movie Dataset was used to fill in the missing data from CMU.

</p><p>
One of the questions that could legitimately arise is: why NIBRS? Indeed this dataset only contains data related to the United States, whilst the world of violence is sadly extended to all countries. The answer is twofold and comes from two directionally distinct considerations: on the one hand, for the final model, it was necessary to find a dataset providing data on crimes committed on a weekly basis. FBI provides such information, with the necessary detail. On the other hand, we quickly concluded that American films represented the majority of the films produced. They therefore represent a sufficiently large sample that would also allow us to determine whether real-world violence influences film production. 
</p>
<p>
Let's now have a sneak peak into how all these datasets were handled and made ready to use. 
</p>
<h1 style="text-align: center;">CMU dataset & Kaggle Movie Dataset</h1>

<p>
Take in account the following consideration, for our project : 
<ol>
<li>We need movies data and corresponding movies's plots. </li> 
<li>We restrict the analysis to USA (american movies). </li> 
<li>The release date is crucial for temporal analysis. </li> 
<li>The box office is crucial for the violence metric. </li> 
</ol>

To be coherent with each point, we applied the following preprocessing pipeline :
<ul>
<li>Step 1 :
    <ul>
    <li>load CMU, plots and Kaggle datasets</li>
    <li>CMU : remove unnecessary columns, standardize the format of each column </li>
    <li>Plot : check for NaN and lowercase</li>
    <li>Merge CMU and plots</li>
    </ul>
</li>
<li>Step 2 :
    <ul>
    <li>Remove if no genres</li>
    <li>Take only american movies</li>
    </ul>
</li>
<li>Step 3 :
    <ul>
    <li>Preprocess Kaggle : USA, drop NaN, drop duplicate</li>
    <li>Complete with Kaggle for missing date, check for outliers</li>
    </ul>
</li>
<li>Step 4 :
    <ul>
    <li>Replace missing box office by the median</li>
    <li>Normalize the box office using a rolling window</li>
    </ul>
</li>
</ul>
</p>

<p>
In the analysis we carried out to establish violence in movies, the columns Languages and Countries were not used (the latter was used only previously to filter and keep only the movies from the US). They have thus been discarded to create a dataset containing only the relevant columns for the wanted visualisations. Further, the release date was simplified int two columns: year and week, to be usable in the distributed autoregressive lag model. Additionally, this has been useful to observe several trends such as the distribution of violent movies across years, etc.
</p>

<div class="flourish-embed flourish-chart" data-src="visualisation/20859618"><script src="https://public.flourish.studio/resources/embed.js"></script><noscript><img src="https://public.flourish.studio/visualisation/20859618/thumbnail" width="100%" alt="chart visualization" /></noscript></div>

<p>
Here we visualize the ratio of movies we keep at each steps</p>
<div class="flourish-embed flourish-chart" data-src="visualisation/20857333"><script src="https://public.flourish.studio/resources/embed.js"></script><noscript><img src="https://public.flourish.studio/visualisation/20857333/thumbnail" width="100%" alt="chart visualization" /></noscript></div>

<h1 style="text-align: center;">NIBRS (FBI)dataset</h1>
(https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/downloads)
The dataset: all crimes reported to the FBI per state and per year, with detailed information such as the exact date of the incident. 
???


