export const GET_DEPARTURES = `
query ($id: String!, $n: Int!) {
  stopPlace(id: $id) {
    name
    estimatedCalls(numberOfDepartures: $n) {
      realtime
      aimedDepartureTime
      expectedDepartureTime
      destinationDisplay {
        frontText
      }
      serviceJourney {
        line {
          publicCode
          transportMode
        }
      }
    }
  }
}
`;

export const SEARCH_STOPS = `
query ($text: String!) {
  multiModalHubs(name: $text) {
    id
    name
  }
}
`;