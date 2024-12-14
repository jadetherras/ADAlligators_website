---
layout: page
title: Datasets
subtitle: Don't add to many datasets, they said...
---

<h1 style="text-align: center;">Why was one dataset (CMU) not sufficient for the investigation? </h1>

<img style="float: left;padding-right: 20px;;padding-bottom: 20px;" class="gators" src="../../assets/img/Professore_Ada_Reptking.png" alt="again a crocodile"/>

<p>
Clearly, much of the relevant information concerning films (box office, summaries, release date, etc.) is already present in the CMU dataset. So what is the rationale behind Professeur Ada Reptking's (and our 5 students') idea of adding 3 additional datasets? The answers are manifold. 
In order to understand their thinking, it is worth looking at the investigation that started it all: is it possible to observe a trend of correlation between violence in the real and fictional world? 
To do this, it is clearly necessary to define trends in violence on both sides: in the real world and in cinematic representations. This is where the NIBRS dataset comes in: it was used to define violence in the real world. On the film side, the Kaggle Movie Dataset was used to fill in the missing data from CMU.
One of the questions that could legitimately arise is: why NIBRS? Indeed this dataset only contains data related to the United States, whilst the world of violence is sadly extended to all countries. The answer is twofold and comes from two directionally distinct considerations: on the one hand, for the final model, it was necessary to find a dataset providing data on crimes committed on a weekly basis. FBI provides such information, with the necessary detail. On the other hand, we quickly concluded that American films represented the majority of the films produced. They therefore represent a sufficiently large sample that would also allow us to determine whether real-world violence influences film production. 

Let's now have a sneak peak into how all these datasets were handled and made ready to use. 

<h1 style="text-align: center;">NIBRS dataset</h1>
(https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/downloads)
The dataset: all crimes reported to the FBI per state and per year, with detailed information such as the exact date of the incident. 
???

<h1 style="text-align: center;">CMU dataset & Kaggle Movie Dataset</h1>
Regarding the CMU dataset, different manipulations were done. Notably, the missing release dates in CMU were partially recovered with the help of the Kaggle Movie Dataset. 
?? Ici il nous faut tout le reste qu'on a fait avant mais que j'ai oublié ??

Once the cleaning process was complete, what was left was a dataframe with the following columns:
- Wikipedia movie ID
- Movie name
- Release date
- Box office revenue
- Languages
- Countries
- Genres
- Plot

In the analysis we carried out to establish violence in movies, the columns Languages and Countries were not used (the latter was used only previously to filter and keep only the movies from the US). They have thus been discarded to create a dataset containing only the relevant columns for the wanted visualisations. Further, the release date was simplified int two columns: year and week, to be usable in the distributed autoregressive lag model. Additionally, this has been useful to observe several trends such as the distribution of violent movies across years, etc.

<h1 id="#CMU" style="text-align: center;">CMU movie dataset</h1>
<h1 style="text-align: center;">Kaggle dataset</h1>
<h1 style="text-align: center;">FBI dataset</h1>


