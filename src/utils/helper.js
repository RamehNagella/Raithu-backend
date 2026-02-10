const mapUserLocation = (address = {}) => {
  const allowed = [
    "houseNumber",
    "village",
    "mandal",
    "district",
    "state",
    "pincode",
  ];
  // req.body.location = {};
  // if (allowed.includes(req.user.address)) {
  //   Object.keys(req.user.address).forEach((key) => {
  //     req.body.location[key] = req.user.address[key];
  //   });
  // }
  return allowed.reduce((acc, key) => {
    if (address[key]) acc[key] = address[key];
    return acc;
  }, {});
};

const mapGrainToPublicResponse = (grain) => ({
  id: grain._id,
  name: grain.name,
  grainType: grain.grainType,
  variety: grain.variety,
  description: grain.description,
  photos: grain.photo?.map((p) => p.url) || [],
  price: Number(grain.price.toString()),
  unit: grain.unit,
  availableQuantity: grain.availableQuantity,
  qualityGrade: grain.qualityGrade,
  harvestDate: grain.harvestDate,
  isOrganic: grain.isOrganic,
  qualityGrade: grain.qualityGrade,
  seller: {
    name: grain.sellerName,
    district: grain.location?.district,
  },
});

module.exports = {
  mapUserLocation,
  mapGrainToPublicResponse,
};
