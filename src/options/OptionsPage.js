import React, { useEffect, useState } from "react";
import repoScreenshot from "./repo-screenshot.png";
import { getToken, setToken as storeToken } from "../storage";
import fetchQuery from "../fetch-query";

async function validateToken(token) {
  try {
    const query = `{
        viewer {
          repositories {
            totalCount
          }
        }
      }`;
    const result = await fetchQuery({ token, query });
    return Boolean(result.data) && !Boolean(result.errors);
  } catch (e) {
    return false;
  }
}

export default function Options() {
  const [token, setToken] = useState("");

  useEffect(() => {
    async function fetchToken() {
      const token = await getToken();
      setToken(token || "");
    }
    fetchToken();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const isValidToken = await validateToken(token);
    if (!isValidToken) {
      alert("Token seems to be invalid or not enough permissions granted");
    } else {
      await storeToken(token);
      alert("Token sucessfully saved!");
    }
  }
  return (
    <div className="content">
      <h1>Options</h1>
      <p>
        <a
          href="https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line"
          target="_new"
        >
          Please create a personal Github access token
        </a>{" "}
        to allow Status Update Notifier for Github to access your PR status.
      </p>
      <p>
        You only need to grant <strong>repo</strong> access.<br></br>
        Your token will only be sent to the Github API.<br></br>
        <br></br>
        <img src={repoScreenshot}></img>
      </p>
      <form onSubmit={handleSubmit} method="POST">
        <div>
          <label htmlFor="token">Token:</label>
          <input
            id="token"
            value={token}
            onChange={event => {
              setToken(event.target.value);
            }}
          ></input>
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
