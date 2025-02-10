export const AAVE_POOL_ABI = [
  "function getReserveData(address asset) external view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
  "function getConfiguration(address asset) external view returns (tuple(uint256 data))",
  "function getUserConfiguration(address user) external view returns (tuple(uint256 data))",
  "function getReserveNormalizedIncome(address asset) external view returns (uint256)",
  "function getReserveNormalizedVariableDebt(address asset) external view returns (uint256)",
  "function getReservesList() external view returns (address[])"
];

export default AAVE_POOL_ABI; 