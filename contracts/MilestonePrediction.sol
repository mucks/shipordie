// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MilestonePrediction
 * @notice Binary prediction market for startup milestones
 * @dev Users bet YES or NO on whether a milestone will be achieved by deadline
 */
contract MilestonePrediction {
    
    enum Side { None, Yes, No }
    enum MarketState { Open, Locked, Resolved }
    
    struct Startup {
        address creator;
        string name;
        string description;
        string category;
        string stage;
        string website;
        uint256 createdAt;
    }
    
    struct Market {
        address creator;
        uint256 deadline;
        uint256 creatorStake;
        uint256 yesPool;
        uint256 noPool;
        MarketState state;
        Side winningSide;
        string metadataURI; // IPFS or data URI with title, description
        uint256 startupId; // 0 means no startup
    }
    
    struct Bet {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }
    
    // State
    uint256 public marketCount;
    uint256 public startupCount;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Startup) public startups;
    mapping(uint256 => mapping(address => Bet)) public bets;
    
    address public oracle;
    
    // Events
    event StartupCreated(
        uint256 indexed startupId,
        address indexed creator,
        string name,
        string category
    );
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        uint256 deadline,
        uint256 creatorStake,
        string metadataURI,
        uint256 startupId
    );
    
    event BetPlaced(
        uint256 indexed marketId,
        address indexed bettor,
        Side side,
        uint256 amount
    );
    
    event MarketLocked(uint256 indexed marketId);
    
    event MarketResolved(
        uint256 indexed marketId,
        Side winningSide
    );
    
    event RewardClaimed(
        uint256 indexed marketId,
        address indexed claimer,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }
    
    modifier marketExists(uint256 marketId) {
        require(marketId < marketCount, "Market does not exist");
        _;
    }
    
    constructor() {
        oracle = msg.sender;
    }
    
    /**
     * @notice Create a new startup
     * @param name Startup name
     * @param description Startup description
     * @param category Startup category
     * @param stage Startup stage
     * @param website Startup website (optional)
     */
    function createStartup(
        string calldata name,
        string calldata description,
        string calldata category,
        string calldata stage,
        string calldata website
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(description).length > 0, "Description required");
        require(bytes(category).length > 0, "Category required");
        
        uint256 startupId = startupCount++;
        
        startups[startupId] = Startup({
            creator: msg.sender,
            name: name,
            description: description,
            category: category,
            stage: stage,
            website: website,
            createdAt: block.timestamp
        });
        
        emit StartupCreated(startupId, msg.sender, name, category);
        
        return startupId;
    }
    
    /**
     * @notice Create a new milestone prediction market
     * @param deadline Unix timestamp when market locks
     * @param metadataURI IPFS or data URI containing market details
     * @param startupId Startup ID (0 means no startup)
     */
    function createMarket(
        uint256 deadline,
        string calldata metadataURI,
        uint256 startupId
    ) external payable returns (uint256) {
        require(deadline > block.timestamp, "Deadline must be future");
        require(msg.value > 0, "Must stake BNB");
        if (startupId > 0) {
            require(startupId < startupCount, "Startup does not exist");
        }
        
        uint256 marketId = marketCount++;
        
        markets[marketId] = Market({
            creator: msg.sender,
            deadline: deadline,
            creatorStake: msg.value,
            yesPool: 0,
            noPool: 0,
            state: MarketState.Open,
            winningSide: Side.None,
            metadataURI: metadataURI,
            startupId: startupId
        });
        
        emit MarketCreated(marketId, msg.sender, deadline, msg.value, metadataURI, startupId);
        
        return marketId;
    }
    
    /**
     * @notice Bet YES on a market
     */
    function betYes(uint256 marketId) 
        external 
        payable 
        marketExists(marketId) 
    {
        Market storage market = markets[marketId];
        require(market.state == MarketState.Open, "Market not open");
        require(block.timestamp < market.deadline, "Past deadline");
        require(msg.value > 0, "Must send BNB");
        
        market.yesPool += msg.value;
        bets[marketId][msg.sender].yesAmount += msg.value;
        
        emit BetPlaced(marketId, msg.sender, Side.Yes, msg.value);
    }
    
    /**
     * @notice Bet NO on a market
     */
    function betNo(uint256 marketId) 
        external 
        payable 
        marketExists(marketId) 
    {
        Market storage market = markets[marketId];
        require(market.state == MarketState.Open, "Market not open");
        require(block.timestamp < market.deadline, "Past deadline");
        require(msg.value > 0, "Must send BNB");
        
        market.noPool += msg.value;
        bets[marketId][msg.sender].noAmount += msg.value;
        
        emit BetPlaced(marketId, msg.sender, Side.No, msg.value);
    }
    
    /**
     * @notice Lock market after deadline (anyone can call)
     */
    function lockMarket(uint256 marketId) 
        external 
        marketExists(marketId) 
    {
        Market storage market = markets[marketId];
        require(market.state == MarketState.Open, "Not open");
        require(block.timestamp >= market.deadline, "Before deadline");
        
        market.state = MarketState.Locked;
        emit MarketLocked(marketId);
    }
    
    /**
     * @notice Resolve market (oracle only)
     * @param winningSide Side.Yes or Side.No
     */
    function resolveMarket(uint256 marketId, Side winningSide) 
        external 
        onlyOracle 
        marketExists(marketId) 
    {
        Market storage market = markets[marketId];
        require(market.state == MarketState.Locked, "Not locked");
        require(winningSide == Side.Yes || winningSide == Side.No, "Invalid side");
        
        market.state = MarketState.Resolved;
        market.winningSide = winningSide;
        
        emit MarketResolved(marketId, winningSide);
    }
    
    /**
     * @notice Claim payout if on winning side
     */
    function claimReward(uint256 marketId) 
        external 
        marketExists(marketId) 
    {
        Market storage market = markets[marketId];
        require(market.state == MarketState.Resolved, "Not resolved");
        
        Bet storage userBet = bets[marketId][msg.sender];
        require(!userBet.claimed, "Already claimed");
        
        uint256 payout = 0;
        
        if (market.winningSide == Side.Yes && userBet.yesAmount > 0) {
            // Winner gets: (total pool + creator stake) * (their bet / winning pool)
            uint256 totalPrize = market.yesPool + market.noPool + market.creatorStake;
            payout = (totalPrize * userBet.yesAmount) / market.yesPool;
        } else if (market.winningSide == Side.No && userBet.noAmount > 0) {
            uint256 totalPrize = market.yesPool + market.noPool + market.creatorStake;
            payout = (totalPrize * userBet.noAmount) / market.noPool;
        }
        
        require(payout > 0, "No reward to claim");
        
        userBet.claimed = true;
        
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(marketId, msg.sender, payout);
    }
    
    /**
     * @notice Get market details
     */
    function getMarket(uint256 marketId) 
        external 
        view 
        marketExists(marketId) 
        returns (Market memory) 
    {
        return markets[marketId];
    }
    
    /**
     * @notice Get user's bet on a market
     */
    function getUserBet(uint256 marketId, address user) 
        external 
        view 
        marketExists(marketId) 
        returns (Bet memory) 
    {
        return bets[marketId][user];
    }
    
    /**
     * @notice Calculate potential payout for a user
     */
    function calculatePotentialPayout(uint256 marketId, address user) 
        external 
        view 
        marketExists(marketId) 
        returns (uint256 yesPayout, uint256 noPayout) 
    {
        Market memory market = markets[marketId];
        Bet memory userBet = bets[marketId][user];
        
        if (market.yesPool > 0 && userBet.yesAmount > 0) {
            uint256 totalPrize = market.yesPool + market.noPool + market.creatorStake;
            yesPayout = (totalPrize * userBet.yesAmount) / market.yesPool;
        }
        
        if (market.noPool > 0 && userBet.noAmount > 0) {
            uint256 totalPrize = market.yesPool + market.noPool + market.creatorStake;
            noPayout = (totalPrize * userBet.noAmount) / market.noPool;
        }
    }
    
    /**
     * @notice Get startup details
     */
    function getStartup(uint256 startupId) 
        external 
        view 
        returns (Startup memory) 
    {
        require(startupId < startupCount, "Startup does not exist");
        return startups[startupId];
    }
    
    /**
     * @notice Update oracle address
     */
    function updateOracle(address newOracle) external onlyOracle {
        require(newOracle != address(0), "Invalid address");
        oracle = newOracle;
    }
}




