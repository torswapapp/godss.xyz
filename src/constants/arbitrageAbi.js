const ARBITRAGE_ABI = [
  "function checkArbitrageOpportunity(address tokenA, address tokenB, uint256 amount) external view returns (bool profitable, uint256 profit)",
  "function executeArbitrage(address[] calldata path, bytes[] calldata data) external returns (bool success)",
  "function estimateGasCost(address[] calldata path, bytes[] calldata data) external view returns (uint256)",
  "function owner() external view returns (address)",
  "function withdrawETH() external",
  "function withdrawToken(address token) external"
];

export default ARBITRAGE_ABI; 