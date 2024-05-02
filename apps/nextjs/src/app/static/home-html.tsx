export const HOME_HTML = `<html>
<head>
  <link rel="canonical" href="https://alternet.ai/home">
  <meta charset="UTF-8">
  <title>home</title>
  <style>
    @font-face {
      font-family: 'PressStart2P';
      src: url('https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2') format('woff2');
    }

    body {
      background-color: #000;
      font-family: 'PressStart2P', monospace;
      text-align: center;
      margin: 0;
      padding: 50px;
      color: #0f0;
      background-image: radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px);
      background-position: 0 0, 25px 25px;
      background-size: 50px 50px;
      animation: animatedBackground 5s linear infinite;
    }

    @keyframes animatedBackground {
      0% {
        background-position: 0 0, 25px 25px;
      }

      100% {
        background-position: -50px -50px, -25px -25px;
      }
    }

    h1 {
      font-size: 32px;
      color: #f0f;
      text-shadow: 2px 2px 0 #ff0;
      margin: 0;
      padding: 20px;
      animation: textShadow 1.6s infinite;
    }

    @keyframes textShadow {
      0% {
        text-shadow: 2px 2px 0 #ff0;
      }

      25% {
        text-shadow: -2px 2px 0 #ff0;
      }

      50% {
        text-shadow: -2px -2px 0 #ff0;
      }

      75% {
        text-shadow: 2px -2px 0 #ff0;
      }

      100% {
        text-shadow: 2px 2px 0 #ff0;
      }
    }

    p {
      font-size: 18px;
      color: #ff0;
      margin: 20px 0;
    }

    .ascii-art {
      font-family: monospace;
      white-space: pre;
      color: #0ff;
    }

    footer {
      margin-top: 300px;
      margin-bottom: 50px;
      color: #f0f;
      font-size: 14px;
    }

    .contact-link {
      display: inline-block;
      padding: 10px 20px;
      color: #000;
      background-color: #0ff;
      text-decoration: none;
      margin-top: 20px;
      font-size: 14px;
      border: 2px dotted #f0f;
      box-shadow: 0 0 10px #fff;
    }

    .visitor-counter {
      margin-top: 20px;
      font-size: 24px;
      color: #ff0;
      text-shadow: 0 0 5px #f0f;
    }
  </style>
</head>

<body>
  <pre class="ascii-art">

          _____                    _____        _____                    _____                    _____                    _____                    _____                _____          
         /\\    \\                  /\\    \\      /\\    \\                  /\\    \\                  /\\    \\                  /\\    \\                  /\\    \\              /\\    \\         
        /::\\    \\                /::\\____\\    /::\\    \\                /::\\    \\                /::\\    \\                /::\\____\\                /::\\    \\            /::\\    \\        
       /::::\\    \\              /:::/    /    \\:::\\    \\              /::::\\    \\              /::::\\    \\              /::::|   |               /::::\\    \\           \\:::\\    \\       
      /::::::\\    \\            /:::/    /      \\:::\\    \\            /::::::\\    \\            /::::::\\    \\            /:::::|   |              /::::::\\    \\           \\:::\\    \\      
     /:::/\\:::\\    \\          /:::/    /        \\:::\\    \\          /:::/\\:::\\    \\          /:::/\\:::\\    \\          /::::::|   |             /:::/\\:::\\    \\           \\:::\\    \\     
    /:::/__\\:::\\    \\        /:::/    /          \\:::\\    \\        /:::/__\\:::\\    \\        /:::/__\\:::\\    \\        /:::/|::|   |            /:::/__\\:::\\    \\           \\:::\\    \\    
   /::::\\   \\:::\\    \\      /:::/    /           /::::\\    \\      /::::\\   \\:::\\    \\      /::::\\   \\:::\\    \\      /:::/ |::|   |           /::::\\   \\:::\\    \\          /::::\\    \\   
  /::::::\\   \\:::\\    \\    /:::/    /           /::::::\\    \\    /::::::\\   \\:::\\    \\    /::::::\\   \\:::\\    \\    /:::/  |::|   | _____    /::::::\\   \\:::\\    \\        /::::::\\    \\  
 /:::/\\:::\\   \\:::\\    \\  /:::/    /           /:::/\\:::\\    \\  /:::/\\:::\\   \\:::\\    \\  /:::/\\:::\\   \\:::\\____\\  /:::/   |::|   |/\\    \\  /:::/\\:::\\   \\:::\\    \\      /:::/\\:::\\    \\ 
/:::/  \\:::\\   \\:::\\____\\/:::/____/           /:::/  \\:::\\____\\/:::/__\\:::\\   \\:::\\____\\/:::/  \\:::\\   \\:::|    |/:: /    |::|   /::\\____\\/:::/__\\:::\\   \\:::\\____\\    /:::/  \\:::\\____\\
\\::/    \\:::\\  /:::/    /\\:::\\    \\          /:::/    \\::/    /\\:::\\   \\:::\\   \\::/    /\\::/   |::::\\  /:::|____|\\::/    /|::|  /:::/    /\\:::\\   \\:::\\   \\::/    /   /:::/    \\::/    /
 \\/____/ \\:::\\/:::/    /  \\:::\\    \\        /:::/    / \\/____/  \\:::\\   \\:::\\   \\/____/  \\/____|:::::\\/:::/    /  \\/____/ |::| /:::/    /  \\:::\\   \\:::\\   \\/____/   /:::/    / \\/____/ 
          \\::::::/    /    \\:::\\    \\      /:::/    /            \\:::\\   \\:::\\    \\            |:::::::::/    /           |::|/:::/    /    \\:::\\   \\:::\\    \\      /:::/    /          
           \\::::/    /      \\:::\\    \\    /:::/    /              \\:::\\   \\:::\\____\\           |::|\\::::/    /            |::::::/    /      \\:::\\   \\:::\\____\\    /:::/    /           
           /:::/    /        \\:::\\    \\   \\::/    /                \\:::\\   \\::/    /           |::| \\::/____/             |:::::/    /        \\:::\\   \\::/    /    \\::/    /            
          /:::/    /          \\:::\\    \\   \\/____/                  \\:::\\   \\/____/            |::|  ~|                   |::::/    /          \\:::\\   \\/____/      \\/____/             
         /:::/    /            \\:::\\    \\                            \\:::\\    \\                |::|   |                   /:::/    /            \\:::\\    \\                              
        /:::/    /              \\:::\\____\\                            \\:::\\____\\               \\::|   |                  /:::/    /              \\:::\\____\\                             
        \\::/    /                \\::/    /                             \\::/    /                \\:|   |                  \\::/    /                \\::/    /                             
         \\/____/                  \\/____/                               \\/____/                  \\|___|                   \\/____/                  \\/____/                              
                                                                                                                                                                                        

</pre>

  <h1>AlterNet - Prepare for Launch!</h1>
  <p>Thanks for being a part of our beginning :)</p>

  <footer>Copyright &copy; 2024 Alternet AI, Inc</footer>

  <marquee scrollamount="20" behavior="alternate">
    ~ ~ ~ ~ <=>
      <=>
        <=> ~ ~ ~ ~
  </marquee>
</body>

</html>`