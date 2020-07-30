const auto = (token, code) => {
  const option = {
    header: {
      Authorization: token,
    },
  };
  fetch(`https://discordapp.com/api/v6/invites/${code}`, option);
};

export default auto;
