/// <reference path="./global.d.ts" />
"use strict";

const fastifyOauth2 = require("@fastify/oauth2");
const { request } = require("undici");

const providers = {
  github: {
    config: fastifyOauth2.GITHUB_CONFIGURATION,
    getUserDetails: getGitHubUserDetails,
    scope: ["user:email", "read:user"],
  },
};

async function getGitHubUserDetails(token) {
  const res = await request("https://api.github.com/user", {
    headers: {
      "User-Agent": "platformatic-authentication-server",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.access_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const user = await res.body.json();

  return {
    fullName: user.name,
    email: user.email,
    provider: "github",
    providerId: user.id,
  };
}

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function (app, options) {
  const { provider } = options;

  if (!providers[provider]) {
    throw new Error(`Unknown provider option ${provider}`);
  }

  const startRedirectPath = `/login/${provider}`;
  // TODO understand why it is using a full URL
  const callbackUri = `http://127.0.0.1:3042/login/${provider}/callback`;

  await app.register(fastifyOauth2, {
    name: provider,
    credentials: {
      client: {
        id: "5e3a9f0f81b8bc10b766",
        secret: "23c7032a35a4bdc6ff94a51aa9c8fe8bca25de5d",
      },
      auth: providers[provider].config,
    },
    scope: providers[provider].scope,
    startRedirectPath,
    callbackUri,
  });

  app.get(`/login/${provider}/callback`, async function (request, reply) {
    const { token } = await this[
      provider
    ].getAccessTokenFromAuthorizationCodeFlow(request);

    const user = await providers[provider].getUserDetails(token);

    // const dbUsers = await app.platformatic.entities.user.find({
    //   where: {
    //     provider: { eq: provider },
    //     providerId: { eq: user.providerId },
    //   },
    // });

    // if (dbUsers.length === 0) {
    //   await app.platformatic.entities.user.save({ input: user });
    // }

    return { user };
  });
};

// module.exports = async function (app, options) {
//   const fastify = require("fastify")({ logger: { level: "trace" } });
//   const oauthPlugin = require("@fastify/oauth2");

//   app.register(oauthPlugin, {
//     name: "github",
//     credentials: {
//       client: {
//         id: "5e3a9f0f81b8bc10b766",
//         secret: "23c7032a35a4bdc6ff94a51aa9c8fe8bca25de5d",
//       },
//       auth: oauthPlugin.GITHUB_CONFIGURATION,
//     },
//     // register a fastify url to start the redirect flow
//     startRedirectPath: "/login/github",
//     // facebook redirect here after the user login
//     callbackUri: "http://localhost:3042/login/github/callback",
//   });

//   app.get("/login/github/callback", async function (request, reply) {
//     const { token } = await this.github.getAccessTokenFromAuthorizationCodeFlow(
//       request
//     );

//     console.log(token.access_token);

//     // if later you need to refresh the token you can use
//     // const { token: newToken } = await this.getNewAccessTokenUsingRefreshToken(token)

//     reply.send({ access_token: token.access_token });
//   });
// };
