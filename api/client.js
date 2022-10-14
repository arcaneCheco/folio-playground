const prismic = require("@prismicio/client");

module.exports = ({ endpoint, fetch, accessToken }) => {
  return prismic.createClient(endpoint, {
    fetch,
    accessToken,
  });
};
