import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Marketplace from '../abis/Marketplace.json';
import NavBar from './NavBar';
import Main from './Main';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();

  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData () {
    const web3 = window.web3;
    //load accounts
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]});
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if(networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address);
      this.setState({ marketplace });
      const productCount = await marketplace.methods.productCount().call();
      console.log(productCount.toString());
      this.setState({ loading: false })
    } else {
      window.alert('Marketplace contract not deployed to detect network.')
    }
    
  }

  constructor(props) {
    super(props)
    this.state = {
      account: 'Loading',
      productCount: 0,
      products: [],
      loading: true
    }
    this.createProduct = this.createProduct.bind(this);
  }

  createProduct(name, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
    .once('receipt', (receipt) =>{
      this.setState({ loading: false })
    });
  }
  render() {
    return (
      <div>
        <NavBar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
                {this.state.loading 
                  ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div> 
                  : <Main createProduct={this.createProduct} />}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
