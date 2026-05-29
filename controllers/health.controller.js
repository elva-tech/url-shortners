const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    service: 'ELVA Links Service',
    status: 'Running',
  });
};

module.exports = {
  getHealth,
};
