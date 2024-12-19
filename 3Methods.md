---
layout: page
title: Models & methods 
subtitle: What we used, how and why
---

<h1>Sentiment analysis</h1>
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
Note: this graph is huge, it can crash. Dont hesitate to refresh the page if needed. </p>
<div class="flourish-embed flourish-scatter" data-src="visualisation/20864115"><script src="https://public.flourish.studio/resources/embed.js"></script><noscript><img src="https://public.flourish.studio/visualisation/20864115/thumbnail" width="100%" alt="scatter visualization" /></noscript></div>

<p>No surprise the model performed poorly ! First, the model tends to give high scores for anger in general, for both violent and non-violent movies. Using all the classified data, we can see that violent movies tend to have higher anger and fear scores, where peaceful movies tend to have a slightly higher joy score, and interestingly a higher sadness score. The latter can be explained by the shared percentage, whcih is close for both movies. <br/>
However, the most important conclusion we can draw from this plot is that boxplots largely overlap. We threfore can't classify the data only with this metric. The concept of violence is too complex and isn't captured by this model!</p>

<h1 id="#LLM">LLM for violence classification</h1>

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

<h1>Empath model</h1>

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

<h1>Auto-regressive distributed lack model</h1>
 