// pragma solidity >=0.5.2 <0.6.0;
pragma solidity >= 0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";


contract Migrations {
  address public owner;
  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
