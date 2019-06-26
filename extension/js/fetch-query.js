export default async function fetchQuery({ token, query }) {
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}` },
    body: JSON.stringify({ query })
  });

  return r.json();
}
