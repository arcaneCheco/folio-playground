import * as prismic from "@prismicio/client";

export const getClient = ({ endpoint, fetch, accessToken }) => {
  return prismic.createClient(endpoint, {
    fetch,
    accessToken,
  });
};
