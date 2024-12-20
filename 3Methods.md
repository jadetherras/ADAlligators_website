---
layout: page
title: Models & methods 
subtitle: What we used, how and why
---

<h1 id="Sentiment">Sentiment analysis</h1>
<h2>A first naive method for classification</h2>

<p>In a naive trial for classification, we used a pretrained <a href="https://huggingface.co/bhadresh-savani/distilbert-base-uncased-emotion"> DistilBert sentiment analysis model</a> to extract sentiments from the movies' plots and trained a logistic regression on the result. As logistic regression is a supervised machine learning method, we trained it only on a subset of the human labelled data and tested the model on a validation set. The method performed poorly (30% accuracy).</p>

<p>However, we reused the model after the LLM classification, to analyze disparities in the result depending on the classification.</p>

<p>The model returns a probability distribution across 6 sentiments :
<ul>
<li>Sadness</li>
<li>Joy</li>
<li>Love</li>
<li>Anger</li>
<li>Fear</li>
<li>Surprise</li>
</ul></p>


<p>The graph below shows the distribution of each sentiment per category (violent vs non-violent). Each point is a movie, red if violent and blue if peaceful. Due to the very high density of points, the boxplot was added for each pair (sentiment-classification). <br/> 

<img style="margin: auto;padding-bottom: 10px;padding-top: 10px;"  src="../assets/img/sentimentANALYSIS.png" alt="histograme"/>

<p>No surprise the model performed poorly ! First, the model tends to give high scores for anger in general, for both violent and non-violent movies. Using all the classified data, we can see that violent movies tend to have higher anger and fear scores, where peaceful movies tend to have a slightly higher joy score, and interestingly a higher sadness score. The latter can be explained by the shared percentage, whcih is close for both movies. <br/>
However, the most important conclusion we can draw from this plot is that boxplots largely overlap. We threfore can't classify the data only with this metric. The concept of violence is too complex and isn't captured by this model!</p>

<h1 id="LLM">LLM for violence classification</h1>

<p>
The model described previously was not working so well... hence we upgraded! <br/>
We used a custom prompt and function for the model <a target="_blank" href="https://platform.openai.com/docs/models#gpt-4o-mini">GPT-4o mini</a> from OpenIA. Movies are classified between different violence levels (binary or ternary model).
</p>

<p>
For the data, we create batches by concatenating multiple plots and adding a separator with the plot number between each plot. Testing reveals that the model tends to forget some plots if too many are given at the time. We stated on batches of 10 movies, taking care of the maximum tokens' number of the model. 
</p>

For the model, we processed as follows :
<ul>
    <li>Created a custom violence scale, a set and instructions and provided examples to the LLM</li>
    <li>Created a custom function to specify the return format of the model </li>
    <li>Create a request for the model</li>
</ul>

We followed the <a target="_blank" href="https://platform.openai.com/docs/guides/prompt-engineering">prompt engineering guide</a> of OpenIA to design the scale and examples:

<details><summary>Prompt (click to know more) </summary>
<code style="color: red">
  ### Violence scale : ### <br/><br/>

  - **Peaceful**: The text describes no physical or psychological violence. There are no aggression, conflict, or harm to people or animals. Suitable for all audiences.<br/>
  - **Mild**: The level of violence is medium or uncertain. There might be moments of tension or mild conflict, such as arguments. Mild action or suspense is allowed.<br/>
  - **Violent**: The text describes extreme physical or psychological violence, such as physical aggression, conflict, or harm. Scenes may include fighting, injury, rape. It is a prominent feature of the film.<br/><br/>

### Instructions ### <br/><br/>
Assign a level of violence to each movie plot below. Respond with a dictionary where the keys are the plot numbers (e.g., 'plot1', 'plot2') and the values are the levels of violence ('Peaceful', 'Mild', 'Violent')</code></details>
<details><summary>Example (click to know more)</summary>
 <code style="color: red">
    Here are some examples for each label : <br/>
        - **Peaceful**: plot1 :'norma and malcolm miochaels are a middle-aged married couple who are in the midst of a midlife crisis. both decide to separate and begin their lives anew away from each other. however, problems ensue once they discover that they are no longer as young as they used to be.'
        plot2:'in the 1840s, two sisters fall in love with the same man. while drunk, the man writes a letter proposing marriage to the wrong one.'<br/>
        - **Mild**: plot1:'set in the 19th century, the plot centered around a man  who is falsely accused murder. the other side of the door was shot in monterrey, mexico.{{cite web}}'
        plot2:'in a desperate, but not-too-courageous, attempt to end his life, a man hires a murderer to do the job for him. soon, though, things are looking better and the he must now avoid the hit.'<br/>
        - **Violent**: plot1:'Richard Beck  is a police detective who believed that rape victims are to blame for the crime. He is later raped by two of the suspects he had been chasing. Ultimately, he changes his beliefs about rape victims. This made for TV movie was groundbreaking in that it portrayed the rape of a man by two other men, and because of this it has become a cult classic.'
        plot2:'newlywed carl  goes to war where he endures major suffering. back home, wife pauli  starves, becomes a prostitute to survive, and their baby dies.'
  </code></details>

We want the model to return an array of predictions, one prediction per plot. We specified a task and a return type using a function.

<h4>Custom function for classification</h4>

```ruby
self.function = {
"name": "Assign_violence_level",
"description": "Predict the level of violence of a list of movie plots",
"parameters": {
    "type": "object",
    "properties": {
        "prediction": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "Peaceful",
                    "Mild",
                    "Violent"
                ]
            },
            "description": "The list of violence levels for each movie plot, in the same order as the plots were provided."
        }
    },
    "required": [
        "prediction"
    ]
}
}
```

Finally, we create the request by combining all elements. 

<h4>Create a request</h4>

```ruby
completion = self.client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": self.Content},
        {"role": "user","content": Text},
        {"role": "assistant", "content": self.Example}
    ],
    functions=[self.function],
    function_call={"name": "Assign_violence_level"},
)
```

<h1 id="Empath">Empath model</h1>

<p>
In the first iterations, we used lists of manually selected words to analyse our plots. The level of violence in the movies would depend on how many times the words in the lists were counted in the summary. <br/>
Two problems arise from this method: 
<ul>
    <li>Subjectivity of the list: the definition depends on one's knowledge of the english language, of one's perception of violence, etc. </li>
    <li>Non-treatment of lemmas: word variations such as "being" --> "be", etc. are not always treated. Their treatment depends on the specification (or not) in the list itself. Homogeneity is therefore lacking.</li>
</ul>
To solve these problems, we decided to use the Empath model in combination with a pre-treatment of the summaries. <br/>
We lemmatize, remove the stop-words and then look at the categories most present in each summary. This allows us also to evaluate the correctness of the LLM: we make sure that the categories most represented in violent movies are indeed violent ones and vice-versa. 
</p>

<h1 id="ARDL">Auto-regressive distributed lag model</h1>

<p>With the data on violence in movies and real-life violence cleaned and matched, we can start the correlation analysis.</p>

<p>First, we need to set up the linear regression model. Since we want to analyze if there is a correlation between violent movies and real-world violence, we naturally have to include an independent variable that captures the violence in movies as good as possible. Simply counting the number of violent movies released in a certain time span does not seem to capture it sufficiently: if there are a lot of violent movies released but nobody watches them, we cannot assume that it has a significant impact on society. Thus, we take the box office revenue of violent movies as the main independent variable for movie violence in our model. A low box office revenue of a violent movie captures the fact that only a small part of the society could have been influenced by this movie, inversely for a high box office revenue. For reasons of exhaustiveness, however, we also include the simple count of violent movie releases, although we do not expect this variable to have a significant coefficient.</p>

<p>Of course, the box office revenue of violent movies and the count of violent movie releases cannot be the only independent variables in the model since there might be innumerable other confounding factors that have an influence on real-world violence. A “standard” linear regression model thus does not seem to satisfy our needs.</p>

<p>A very important aspect of our model is the time step: due to the high number of possible confounding factors, it naturally is very difficult to trace peaks in violence back to specific violent movies. Moreover, the violence level averaged over an entire year might not provide interesting details as it is comparably stable from one year to another. Thus, we need to aim for a very short timestep: Our answer to this is a timestep of one week. This means that we analyze our available data based on the week it was generated, i.e. how the violent movies of this week influenced the real-world violence of this week. The specific date of each datapoint in the datasets allows us to use such a fine time resolution.</p>

<p>Yet, this model still does not seem to capture the “nature” of real-world violence sufficiently. The assumption that the violent movies of this week have an instantaneous effect on the real-world violence of the same week seems rather unconvincing. The solution to this problem is called the auto-regressive distributed lag model. These models consist of two parts:</p>

<ul>
    <li><b>The auto-regressive part:</b> Taking into account that the dependent variable (real-world violence) of past time steps is included in the model.</li>
    <li><b>The distributed lag part:</b> Taking into account that also past time steps of the independent variable (box office revenues of violent movies) are included in the model.</li>
</ul>

<p>The optimal lag for both parts, i.e., how many previous time steps are included in the model, is found using the <code>ardl_select_order</code> function from the Statsmodels module. This function needs a value for the maximum lag allowed as input. For this, we set a maximum lag of 6 timesteps for both lags. This ensures a good balance between exhaustiveness and statistical robustness and moreover reflects the fact that in general movies make most of their profit during the “opening window” of the first 4-6 weeks after release (source: <a target="_blank" href="https://www.boxofficemojo.com/chart/top_opening_weekend/">Box Office Mojo</a>).</p>

<p>Lastly, we account for time-specific real-world violence levels with time-fixed effects. Due to the limited data available after filtering and cleaning, we chose biweekly time-fixed effects, i.e., additional constant factors that capture time-specific real-world violence levels that are not explained by the violent movie effects.</p>

<h3>Final Model Formula</h3>

<p>The final model is thus an auto-regressive distributed lag model with time fixed effects, described by the following formula:</p>

<p class="formula">V<sub>t</sub> = α + ∑<sub>i=t-1</sub><sup>t-〖lag〗<sub>ar</sub></sup> β<sub>i</sub> ∙ V<sub>i</sub> + ∑<sub>j=t</sub><sup>t-〖lag〗<sub>d</sub></sup> γ<sub>j</sub> ∙ X<sub>j</sub> + ∑<sub>k=t</sub><sup>t-〖lag〗<sub>d</sub></sup> δ<sub>k</sub> ∙ W<sub>k</sub> + ∑<sub>l=1</sub><sup>N/2</sup> ε<sub>l</sub> ∙ T<sub>l</sub></p>

<h4>Where:</h4>
<ul>
    <li><b>V<sub>t</sub>:</b> Endogenous variable: real-world violence value in week t.</li>
    <li><b>α:</b> Constant term.</li>
    <li><b>β<sub>i</sub>:</b> Coefficients for the lagged real-world violence values.</li>
    <li><b>V<sub>i</sub>:</b> Endogenous variable: real-world violence value in week i.</li>
    <li><b>〖lag〗<sub>ar</sub>:</b> Optimal lag for auto-regressive part.</li>
    <li><b>γ<sub>j</sub>:</b> Coefficients for the lagged movie violence values.</li>
    <li><b>X<sub>j</sub>:</b> Exogenous variable: box office revenue of violent movies in week j.</li>
    <li><b>〖lag〗<sub>d</sub>:</b> Optimal lag for distributed lag part.</li>
    <li><b>δ<sub>k</sub>:</b> Coefficient for the lagged count of violent movies.</li>
    <li><b>W<sub>k</sub>:</b> Exogenous variable: count of violent movie releases in week k.</li>
    <li><b>ε<sub>l</sub>:</b> Coefficients for the biweekly time-fixed effects.</li>
    <li><b>T<sub>l</sub>:</b> Time-fixed effect of biweek l.</li>
    <li><b>N:</b> Total number of weeks in the data.</li>
</ul>

<h3>Model Implementation</h3>

<p>The model is built in the code using the ARDL class of the Statsmodels module in the following way:</p>

<p><i>We rerun the select_order function each time we apply the ARDL model to new data. Thus, we ensure to always use the optimal lag values for each dataset provided to the function.</i></p>

<h3>Intermediate ARDL Models</h3>

<p>We tried different ways of standardizing/normalizing the exogenous and endogenous variables before applying the model on them. We describe all approaches below and present the corresponding results for the coefficients. Since the purpose of the time-fixed effects in our model is purely to purge the exogenous variable from time-fixed confounding factors, we do not include their coefficients in the results here. Due to the high number of time-fixed effect factors (one for every two weeks in the data), this would also not be an efficient use of space on this page. If interested, you can analyze them using the code provided in the <i>results.ipynb</i>.</p>

<h3>Approaches:</h3>

<ul>
    <li><b>Naïve approach:</b> In the first approach, we do not normalize and use the following values:</li>
    <ul>
        <li>X<sub>j</sub>: Sum of box office revenues of violent movies in week j</li>
        <li>W<sub>k</sub>: Count of violent movie releases in week k</li>
        <li>V<sub>i</sub>: Number of all criminal offenses registered in week i</li>
    </ul>

    <li><b>Violence offense ratios:</b> In this approach, we normalize the real-world violence but keep the box office revenues as they are.</li>
    <ul>
        <li>X<sub>j</sub>: Sum of box office revenues of violent movies in week j</li>
        <li>W<sub>k</sub>: Count of violent movie releases in week k</li>
        <li>V<sub>i</sub>: Number of all criminal offenses registered in week i divided by the number of all criminal offenses registered in that year</li>
    </ul>

    <li><b>Normalized box office revenues:</b> In this approach, we normalize the box office revenues for violent films but keep the violence offense counts as they are.</li>
    <ul>
        <li>X<sub>j</sub>: Fill NaN values of box office revenues with median, divide all values by the median, then sum up these values for the violent movies in week j</li>
        <li>W<sub>k</sub>: Count of violent movie releases in week k</li>
        <li>V<sub>i</sub>: Number of all criminal offenses registered in week i</li>
    </ul>

    <li><b>Z-score for violence offenses:</b> In this approach, we compute the z-score for the violence offenses but keep the box office revenues as they are.</li>
    <ul>
        <li>X<sub>j</sub>: Sum of box office revenues of violent movies in week j</li>
        <li>W<sub>k</sub>: Count of violent movie releases in week k</li>
        <li>V<sub>i</sub>: Z-score of the offense counts for each category of offense (e.g., Assault Offenses, Robbery, etc.) using a rolling window of the same size as the maximum auto-regressive lag of the ARDL model.</li>
    </ul>
</ul>
 