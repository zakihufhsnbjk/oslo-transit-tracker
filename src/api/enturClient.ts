const ENDPOINT = "https://api.entur.io/journey-planner/v3/graphql";

export async function fetchGraphQL(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ET-Client-Name": "oslo-transit-tracker",
    },
    body: JSON.stringify({ query, variables }),
  });

  return res.json();
}
