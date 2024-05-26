import React from 'react';
import Head from 'next/head';

const NoEmailPage = () => {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://alternet.ai/home" />
        <meta charSet="UTF-8" />
        <title>No Email</title>
        <style>{`
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

          p {
            font-size: 18px;
            margin-bottom: 20px;
          }

          .intro {
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 30px;
          }

          .logo {
            font-weight: 500;
            color: #1a73e8;
          }

          a {
            color: #1a73e8;
            text-decoration: underline;
          }
        `}</style>
      </Head>
      <div className="container">
        <h1>Sign In Error</h1>
        <p className="intro">
          You must have an email attached to your Discord account in order to sign in.
        </p>
        <p>
          Please <a href="/home" style={{ color: '#1a73e8', textDecoration: 'underline' }}>go back to the homepage</a> and try again.
        </p>
      </div>
    </>
  );
};

export default NoEmailPage;

