const bs721 = artifacts.require("bs721");
module.exports = function(deployer) {
  // bs721 is the contract,DEMARCHI the contract's name,NFT-MGLT the contract's symbol
  deployer.deploy(bs721, "NFT", "RANALDI");
};

