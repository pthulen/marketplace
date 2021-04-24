pragma solidity ^0.5.0;

contract Marketplace {
    string public name;

    //increment whenever products are added to contract
    uint public productCount = 0;

    mapping(uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );



    constructor() public {
        name = "Marketplace";
    }

    function createProduct(string memory _name, uint _price) public {
        //validate params
        //require a name
        require(bytes(_name).length > 0);
        //require valid price
        require(_price > 0);
        productCount ++;
        //create product
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        //trigger event
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable{
        //fetch product
        Product memory _product = products[_id];
        //fetch owner
        address payable _seller = _product.owner;
        //validate product
        require(_product.id > 0 && _product.id <= productCount);
        //Require needed ether for transaction
        require(msg.value >= _product.price);
        //require product isn't purchased
        require(!_product.purchased);
        //require buyer not seller
        require(_seller != msg.sender);

        //mark as purchased/transfer ownership
        _product.owner = msg.sender;
        _product.purchased = true;

        //update product in mapping
        products[_id] = _product;
        //pay seller
        address(_seller).transfer(msg.value);
        //trigger event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);

    } 
}
