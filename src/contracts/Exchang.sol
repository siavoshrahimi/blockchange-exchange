pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";


import './Token.sol';
contract Exchange{
    using SafeMath for uint;


    //Varialbles
    address public feeAccount; // the address that receives exchange's fee
    uint256 public feePercent;
    address constant ETHER = address(0); // store Ether in token mapping with blank address
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public cancelledOrders;
    mapping(uint256 => bool) public orderFilled;
    uint256 public orderCount;

    //Events
    event Deposit (address indexed token, address indexed user, uint256 amount, uint balance);
    event Withdraw (address indexed token, address indexed user, uint256 amount, uint balance);
    event Order(
        uint256 id,
        address indexed user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address indexed user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address indexed user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );

    //Orders
    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //Fallback :reverts if Ether is sent to this smart contract by mistake
   /* fallback() external payable {
        revert();
    }*/

    function depositEther() public payable{
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        payable(msg.sender).transfer(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);

    }

    function withdrawEther() public payable {
        require(tokens[ETHER][msg.sender] >= msg.value);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(msg.value);
        payable(msg.sender).transfer(msg.value);
        emit Withdraw(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);

    }

    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        require(Token(_token).transfer(msg.sender, _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns(uint256){
        return tokens[_token][_user];
    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender); //same user can cancel order
        require(_order.id == _id); //the order must exist
        cancelledOrders[_id] = true;
        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);
    }

    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount);
        require(!cancelledOrders[_id]);
        require(!orderFilled[_id]);
        _Order storage _order = orders[_id];
        _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
        orderFilled[_order.id] = true;

    }

    function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
        //fee is paid by person how fill the orders
        //fee deducted from tokenGet
        uint256 _feeAmount = _amountGet.mul(feePercent).div(100);

        //add to feeAccount
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);

        //execute trade & charge fee
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount)); //charge fee from _amountGet
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);

        //trade event
        emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, block.timestamp);
    }
}