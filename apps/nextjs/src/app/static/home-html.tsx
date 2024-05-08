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
    <h2>crafting complex URL structures</h2>
    <p>
      thoughtfully constructed URLs allow you to generate highly specific 
      and immersive pages.
    </p>
    <ul>
      <li>using nested paths to create intricate worlds
        <pre>https://realm-of-aragon.forest/elven-forest/hidden-glade/ancient-ruins</pre>
      </li>
      <li>combining multiple parameters to specify details
        <pre>https://art-studio.ai?subject=cyberpunk-cityscape&colors=neon-blue,magenta&style=digital-painting&detail=ultra-high</pre>
      </li>
      <li>encoding complex instructions directly into the URL path or parameters
        <pre>https://guided-meditation.calm/script=Imagine a peaceful beach at sunset...</pre>
      </li>
    </ul>

    <h2>alternative protocols</h2>
    <p>
      invent your own unique protocols to customize and contextualize your pages in alternet.
    </p>
    <ul>
    <li>simulating other environments
    <pre>simulator://windows95.exe/</pre>
  </li>
  <li>immersive 3D graphics and virtual reality experiences
    <pre>xr://immersive-scene.js?skybox=space&objects=planets,asteroids&interactions=orbit,zoom</pre>
  </li>
  <li>emulating command line interfaces and running scripts
    <pre>cmd://dos.exe/?script=echo hello world&style=.dos .login,.dos .sidebar {display:none}</pre>
  </li>
  <li>running standalone web applications with custom UIs
    <pre>app://codemirror.exe?fullscreen&style=.CodeMirror{height:100%}&persistence=local</pre>
  </li>
    </ul>

    <h2>regular and iterative prompting</h2>
    <p>
      you can also interact with alternet using normal prompts 
      and iterative prompting techniques.
    </p>
    <ul>
      <li>provide a detailed description of the desired page or experience 
        directly in the prompt, without using a URL structure.
        <pre>
Generate a website for a futuristic space travel agency. Include sections on destinations, spacecraft, pricing, and a booking form. Use a sleek, modern design with a dark color scheme and neon accents.</pre>
      </li>
      <li>start with an initial prompt and then refine the generated page
        through a series of follow-up prompts. provide feedback, additional details, or specific
        changes you'd like to see in each iteration.
        <pre>
Initial prompt: Create a website for a fantasy-themed tavern.

Iteration 1: The tavern looks great! Can you add a menu of food and drink items?

Iteration 2: Perfect. Now let's add some background music and sound effects to enhance the atmosphere.

Iteration 3: Awesome. As a final touch, can you add a guestbook where visitors can leave comments in-character as fantasy patrons?</pre>
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
