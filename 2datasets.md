---
layout: page
title: Datasets
subtitle: Don't add too many datasets, they said...
---

<h1 style="text-align: center;">Why was one dataset (CMU) not sufficient for the investigation? </h1>

<img style="float: left;padding-right: 20px;;padding-bottom: 20px;" class="gators" src="../assets/img/Professore_Ada_Reptking.png" alt="again a crocodile"/>

<p>
Clearly, much of the relevant information concerning films (box office, summaries, release date, etc.) is already present in the CMU dataset. So what is the rationale behind Professeur Ada Reptking's (and our 5 students') idea of adding 3 additional datasets? The answers are manifold. <br/>
In order to understand their thinking, it is worth looking at the investigation that started it all: is it possible to observe a trend of correlation between violence in the real and fictional world? 
To do this, it is clearly necessary to define trends in violence on both sides: in the real world and in cinematic representations. This is where the NIBRS dataset comes in: it was used to define violence in the real world. On the films' side, the Kaggle Movie Dataset was used to fill in the missing data from CMU.

</p><p>
One of the questions that could legitimately arise is: why NIBRS? Indeed, this dataset only contains data related to the United States, whilst the world of violence is sadly extended to all countries. The answer is twofold and comes from two directionally distinct considerations: on the one hand, for the final model, it was necessary to find a dataset providing data on crimes committed on a weekly basis. FBI provides such information, with the necessary detail. On the other hand, we quickly concluded that American films represented the majority of the films produced. They therefore keep a sufficiently large sample that would also allow us to determine whether real-world violence influences film production. 
</p>
<p>
Let's now have a sneak peak into how all these datasets were handled and made ready to use. 
</p>
<h1 style="text-align: center;">CMU dataset & Kaggle Movie Dataset</h1>

<p>
We take into account the following considerations for our project: 
<ol>
<li>We need movies' data and corresponding plots. </li> 
<li>We restrict the analysis to the USA (American movies). </li> 
<li>The release date is crucial for temporal analysis. </li> 
<li>The box office revenue is crucial for the violence metric. </li> 
</ol>

To be coherent with each point, we applied the following preprocessing pipeline :
<ul>
<li>Step 1 :
    <ul>
    <li>Load CMU movie data, plots and Kaggle datasets</li>
    <li>From CMU: remove unnecessary columns, standardize the format of each column </li>
    <li>Plot : check for NaN and lowercase</li>
    <li>Merge CMU movie data and plots</li>
    </ul>
</li>
<li>Step 2 :
    <ul>
    <li>Remove movies if the genre is not defined</li>
    <li>Filter to keep only American movies</li>
    </ul>
</li>
<li>Step 3 :
    <ul>
    <li>Preprocess Kaggle data: filter on USA produced movies, drop NaN and duplicates</li>
    <li>Complete CMU with Kaggle for missing dates, check for outliers</li>
    </ul>
</li>
<li>Step 4 :
    <ul>
    <li>Replace missing box office data by the median</li>
    <li>Normalize the box office using a rolling window</li>
    </ul>
</li>
</ul>
</p>

<p>
In the analysis we carried out to establish the presence, or absence, of violence in movies, the columns Languages and Countries were not used (the latter was used only previously to filter and keep only the movies from the US). They have thus been discarded to create a dataset containing only the relevant columns for the wanted visualisations. Further, the release date was simplified and split into two columns: year and week, to be fit the format required in the distributed autoregressive lag model (see Models & Methods section). Additionally, this has been useful to observe several trends such as the distribution of violent movies across years, etc.
</p>

<div class="flourish-embed flourish-chart" data-src="visualisation/20859618"><script src="https://public.flourish.studio/resources/embed.js"></script><noscript><img src="https://public.flourish.studio/visualisation/20859618/thumbnail" width="100%" alt="chart visualization" /></noscript></div>

<p>
Here we visualize the ratio of movies we keep after each step of the pipeline above:</p>
<div class="flourish-embed flourish-chart" data-src="visualisation/20857333"><script src="https://public.flourish.studio/resources/embed.js"></script><noscript><img src="https://public.flourish.studio/visualisation/20857333/thumbnail" width="100%" alt="chart visualization" /></noscript></div>

<h1 style="text-align: center;">NIBRS (FBI) dataset</h1>

<p>
The National Incident-Based Reporting System (<a target = "_blanck" href="https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/downloads"> NIBRS </a>) is a U.S. system for collecting and analyzing crime data. The data found on the Crime Data Explorer (CDE) is sourced from the FBI’s Uniform Crime Reporting (UCR) Program, which collects information from over 18,000 federal, state, local, tribal and territorial law enforcement agencies across the U.S. (Source: <a target = "_blanck" href="https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/explorer/crime/crime-trend"> CDE</a>).
</p>

<p>
Key points about this data:
<ul>
    <li>The report is voluntary for non-federal agencies and depends on state participation or direct submissions to the FBI.</li>
    <li>It reflects reported crimes and may not include all crime occurrences.</li>
    <li>Various confounders factors (socio-economic and legal factors such as population size, economic conditions, etc.) influence crime reporting and activity.</li>
</ul>
</p>

<p>
Why NIBRS Data is useful for our analysis:
<ul>
    <li><b>Insights:</b> It provides specific details about incidents (including their exact dates, types, victim injuries and locations).</li>
    <li><b>Types of offenses:</b> Knowing the nature of offenses helps us classify crimes by their violent range.
Definition: of violent crime The FBI categorizes violent crimes into four offenses: homicide, rape, robbery, and aggravated assault, all involving force or threats (Source: <a target = "_blanck" href="https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/explorer/crime/crime-trend"> CDE</a>).</li>
</ul>
For our analysis, we adjusted these categories to include offenses that are clearly violent but were not classified as such by the FBI (e.g., Animal Cruelty)
</p>

