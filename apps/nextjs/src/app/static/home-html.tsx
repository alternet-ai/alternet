export const HOME_HTML = `
<html>

<head>
  <link rel="canonical" href="https://alternet.ai/home">
  <meta charset="UTF-8">
  <title>home</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;500&display=swap');

    body {
      font-family: 'Fira Sans', sans-serif;
      background-color: #f5f5f5;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 40px;
    }

    h1 {
      font-size: 48px;
      font-weight: 500;
      margin-bottom: 20px;
      color: #222;
    }

    h2 {
      font-size: 28px;
      font-weight: 500;
      margin-top: 40px;
      margin-bottom: 15px;
      color: #444;
    }

    p {
      font-size: 18px;
      margin-bottom: 20px;
    }

    ul {
      margin-bottom: 20px;
      padding-left: 20px;
    }

    li {
      font-size: 16px;
      margin-bottom: 10px;
    }

    pre {
      background-color: #eee;
      padding: 10px;
      font-size: 14px;
      border-radius: 4px;
      white-space: pre-wrap;
    }

    .intro {
      font-size: 24px;
      font-weight: 300;
      margin-bottom: 30px;
    }

    .outro {
      font-size: 20px;
      font-weight: 300;
      margin-top: 40px;
    }

    .logo {
      font-weight: 500;
      color: #1a73e8;
    }
    @keyframes wavy {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
      100% {
        transform: translateY(0);
      }
    }
    
  </style>
</head>

<body>
  <div class="container">
    <h1>welcome to <span class="logo">alternet</span></h1>
    <p class="intro">
      alternet makes pages.
      <br>alternet is the subconscious of the internet.
      <br>alternet is something new.
      <br><span class="logo">dream play create</span></h1>
    </p>
    <h2>get creative</h2>
    <p>
      thoughtfully constructed prompts allow you to generate intriguing
      and immersive pages:
    </p>
    <ul>
    <li>shift to an alternate reality
      <pre><a href="https://wikipedia.org?world-ruler=pizza-rat">https://wikipedia.org?world-ruler=pizza-rat</a></pre>
    </li>
    <li>engage with fictional entities
      <pre><a href="https://career-advice.org?personality=slavoj-zizek&intoxicant=mushrooms&interactive=true">https://career-advice.org?personality=slavoj-zizek&intoxicant=mushrooms&interactive=true</a></pre>
    </li>
    <li>make custom tools & apps
      <pre><a href="live weather status for sf.
        the api is https://api.open-meteo.com/v1/forecast?latitude=37.79&longitude=-122.40&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m
        and the format is {
        "current": {
          "time": "2022-01-01T15:00"
          "temperature_2m": 2.4,
          "wind_speed_10m": 11.9,
        },
        "hourly": {
          "time": ["2022-07-01T00:00","2022-07-01T01:00", ...]
          "wind_speed_10m": [3.16,3.02,3.3,3.14,3.2,2.95, ...],
          "temperature_2m": [13.7,13.3,12.8,12.3,11.8, ...],
          "relative_humidity_2m": [82,83,86,85,88,88,84,76, ...],
        }
      }">live weather status for sf.
the api is https://api.open-meteo.com/v1/forecast?latitude=37.79&longitude=-122.40&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m
and the format is
{
  "current": {
    "time": "2022-01-01T15:00"
    "temperature_2m": 2.4,
    "wind_speed_10m": 11.9,
  },
  "hourly": {
    "time": ["2022-07-01T00:00","2022-07-01T01:00", ...]
    "wind_speed_10m": [3.16,3.02,3.3,3.14,3.2,2.95, ...],
    "temperature_2m": [13.7,13.3,12.8,12.3,11.8, ...],
    "relative_humidity_2m": [82,83,86,85,88,88,84,76, ...],
  }
}</a></pre>
    </li>
    <li>explore infinite versions of real websites
      <pre><a href="https://scp-wiki.wikidot.com/">https://scp-wiki.wikidot.com/</a></pre>
    </li>
      <li>play text adventures in imagined worlds
        <pre><a href="https://itch.io/lord-of-the-rings/the-shire/frodo?choices=4&free-input=">https://itch.io/lord-of-the-rings/the-shire/frodo?choices=4&free-input=</a></pre>
      </li>
      <li>create vividly drawn scenes
        <pre><a href="https://art-studio.ai?subject=cyberpunk-cityscape&colors=neon-blue,magenta&style=digital-painting&detail=ultra-high">https://art-studio.ai?subject=cyberpunk-cityscape&colors=neon-blue,magenta&style=digital-painting&detail=ultra-high</a></pre>
      </li>
    
      <li>start with an initial prompt and then refine the generated page
        through a series of follow-up prompts. provide feedback, additional details, or specific
        changes you'd like to see in each iteration.
        <pre>
Initial prompt: <a href="Homepage for a My Little Pony themed anarchist collective.">Homepage for a My Little Pony themed anarchist collective.</a>

Iteration 1: The collective looks great! Can you add a manifesto outlining the group's core principles and goals?

Iteration 2: Perfect. Now let's add some colorful banners and graphics featuring the ponies promoting mutual aid and direct action.

Iteration 3: Awesome. As a final touch, can you add a link to a forum where members can discuss organizing efforts and share resources in-character as the ponies?</pre>
      </li>
    </ul>

    <p class="outro">
      the possibilities in
      alternet are boundless - experiment, push boundaries, and let your imagination guide you.
      thanks for reading and happy hallucinating <3
      <br> - max & claude
    </p>
  </div>
</body>

</html>
`;
