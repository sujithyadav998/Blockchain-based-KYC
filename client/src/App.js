import React, { Component } from "react";
import KycBlockChain from "./contracts/KycBlockChain.json";
import getWeb3 from "./getWeb3";
import "./App.css";
const crypto = require("crypto");

const GetAllBankAccounts = (props) => {
  if (parseInt(props.bankcount) > 0) {
    return (
      <div className="bank-accounts-list">
        {props.banks.map((bank) => (
          <div key={bank.key} className="bank-account-item blockchain-animation">
            {bank.address}
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="text-center">
        <p>There are no verified Bank Accounts in this network!</p>
      </div>
    );
  }
};

const GetAllBankRequests = (props) => {
  return (
    <div className="bank-accounts-list">
      {props.bankrequests.map((request) => (
        <div key={request.key} className="bank-account-item">
          <strong>{request.name}</strong>
          <div>{request.address}</div>
        </div>
      ))}
    </div>
  );
};
//------tab navigation starts here--------
const hideAll = () => {
  document.getElementsByClassName("new-customer")[0].style.display = "none";
  document.getElementsByClassName("existing-customer")[0].style.display =
    "none";
  document.getElementsByClassName("existing-customer")[1].style.display =
    "none";
  document.getElementsByClassName("new-bank")[0].style.display = "none";
  document.getElementsByClassName("existing-bank")[0].style.display = "none";
  document.getElementsByClassName("existing-bank")[1].style.display = "none";
  let elements = document.querySelectorAll(".active-button");
  for (var i = 0; i < elements.length; i++) {
    elements[i].classList.remove("active-button");
  }
};
const show = (target) => {
  hideAll();
  document.getElementById(`${target}-button`).classList.add("active-button");
  if (target === "new-customer") {
    document.getElementsByClassName("new-customer")[0].style.display = "block";
  }
  if (target === "existing-customer") {
    document.getElementsByClassName("existing-customer")[0].style.display =
      "block";
    document.getElementsByClassName("existing-customer")[1].style.display =
      "block";
  }
  if (target === "existing-bank") {
    document.getElementsByClassName("existing-bank")[0].style.display = "block";
    document.getElementsByClassName("existing-bank")[1].style.display = "block";
  }
  if (target === "new-bank") {
    document.getElementsByClassName("new-bank")[0].style.display = "block";
  }
};
//------tab navigation ends here--------

//setting state values
class App extends Component {
  state = {
    web3: null,
    account: null,
    contract: null,
    name: null,
    aadhar: null,
    pan: null,
    getdata: null,
    data_hash: null,
    b_name: null,
    bank_verify: null,
    entity: null,
    allaccounts: null,
    allbanks: [],
    bank_count: 0,
    status: null,
    requestAddress: null,
    bankrequests: [],
    aadharVerify: null,
    panVerify: null,
    verified: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = KycBlockChain.networks[networkId];
      const instance = new web3.eth.Contract(
        KycBlockChain.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        account: accounts[0],
        contract: instance,
        allaccounts: accounts,
      });
      this.whoami();
      this.numbanks();
      this.onAccountChanged();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    show("new-customer");
  };

  myNameChangeHandler = (event) => {
    this.setState({ name: event.target.value });
  };
  myAadharChangeHandler = (event) => {
    this.setState({ aadhar: event.target.value });
  };
  myPanChangeHandler = (event) => {
    this.setState({ pan: event.target.value });
  };

  myBankNameChangeHandler = (event) => {
    this.setState({ bname: event.target.value });
  };

  myDataChangeHandler = (event) => {
    this.setState({ getdata: event.target.value });
  };

  myData1ChangeHandler = (event) => {
    this.setState({ aadharVerify: event.target.value });
  };

  myData2ChangeHandler = (event) => {
    this.setState({ panVerify: event.target.value });
  };

  myVBankChangeHandler = (event) => {
    this.setState({ bank_verify: event.target.value });
  };

  requestAddressChange = (event) => {
    this.setState({ requestAddress: event.target.value });
  };

  onAccountChanged = () => {
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });
  };

  whoami = async () => {
    var { contract } = this.state;
    const cus = await contract.methods
      .isCus()
      .call({ from: this.state.account });
    const org = await contract.methods
      .isOrg()
      .call({ from: this.state.account });

    var who = cus ? "Customer" : org ? "Bank" : "None";
    this.setState({ entity: who });
  };

  createmycustomer = async () => {
    var { contract } = this.state;
    await contract.methods
      .newCustomer(
        this.state.name,
        crypto
          .createHash("sha1")
          .update(this.state.aadhar + this.state.pan)
          .digest("hex"),
        this.state.bank_verify
      )
      .send({ from: this.state.account })
      .then(() => {
        window.alert("You successfully made an account!");
        window.location.reload();
      });
  };

  createmybank = async () => {
    var { contract } = this.state;

    await contract.methods
      .newOrganisation(this.state.bname)
      .send({ from: this.state.account })
      .then(() => {
        window.alert("You are now a verified Bank Entity!");
        window.location.reload();
      });
  };

  verifykycfromcustomer = async () => {
    var { contract } = this.state;
    const response = await contract.methods
      .viewCustomerData(this.state.getdata)
      .call({ from: this.state.account });

    this.setState({ data_hash: response });

    const dhash = crypto
      .createHash("sha1")
      .update(this.state.aadharVerify + this.state.panVerify)
      .digest("hex");

    if (dhash === this.state.data_hash) {
      this.setState({ verified: "Success" });
    } else {
      this.setState({ verified: "Fail" });
    }
  };

  get = async () => {
    var { contract } = this.state;
    var access = await contract.methods
      .isOrg()
      .call({ from: this.state.account });
    if (access) {
      this.verifykycfromcustomer();
    } else {
      window.alert("You are not a verified Bank!");
    }
  };

  create_customer = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var access = await contract.methods
      .isCus()
      .call({ from: this.state.account });

    if (!access) {
      this.createmycustomer();
      this.whoami();
    } else {
      window.alert("You already have an account!");
    }
  };

  create_bank = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var access = await contract.methods
      .isOrg()
      .call({ from: this.state.account });

    var ifcustomer = await contract.methods
      .isCus()
      .call({ from: this.state.account });

    if (!access && !ifcustomer) {
      this.createmybank();
      this.whoami();
    } else if (ifcustomer) {
      window.alert("Customer entities cannot be a bank!");
    } else {
      window.alert("You are already a bank!");
    }
  };

  modify_data = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var confirm = await contract.methods
      .isCus()
      .call({ from: this.state.account });
    if (confirm) {
      await contract.methods
        .modifyCustomerData(
          this.state.name,
          crypto
            .createHash("sha1")
            .update(this.state.name + this.state.aadhar + this.state.pan)
            .digest("hex"),
          this.state.bank_verify
        )
        .send({ from: this.state.account })
        .then(() => {
          window.alert("Data Changed!");
          window.location.reload();
        });
    } else {
      window.alert("You are not permitted to use this function!");
    }
  };

  numbanks = async () => {
    var { contract } = this.state;
    var len = await contract.methods.bankslength().call();
    this.setState({ bank_count: len });
    var banks = [];
    if (parseInt(this.state.bank_count) > 0) {
      for (var i = 0; i < len; i++) {
        banks.push({
          key: i,
          address: await contract.methods.Banks(i).call(),
        });
      }
    }

    this.setState({ allbanks: banks });
  };

  getmystatus = async () => {
    var { contract } = this.state;
    var status = await contract.methods
      .checkStatus()
      .call({ from: this.state.account });

    if (status === "0") {
      this.setState({ status: "Accepted" });
    } else if (status === "1") {
      this.setState({ status: "Rejected" });
    } else if (status === "2") {
      this.setState({ status: "Pending" });
    } else {
      this.setState({ status: "Undefined" });
    }
  };

  viewRequests = async () => {
    var { contract } = this.state;
    var reqs = await contract.methods.viewRequests().call({
      from: this.state.account,
    });
    var all_reqs = [];
    var i = 0;
    for (const req in reqs) {
      all_reqs.push({
        key: i,
        address: reqs[req],
        name: await contract.methods.viewName(reqs[req]).call(),
      });
      i++;
    }
    this.setState({ bankrequests: all_reqs });
  };

  accept = async () => {
    var { contract } = this.state;
    await contract.methods
      .changeStatusToAccepted(this.state.requestAddress)
      .send({ from: this.state.account })
      .then(
        () => {
          window.alert("Status Changed!");
          window.location.reload();
        },
        () => {
          window.alert("You are not authorized!");
        }
      );
  };

  reject = async () => {
    var { contract } = this.state;
    await contract.methods
      .changeStatusToRejected(this.state.requestAddress)
      .send({ from: this.state.account })
      .then(
        () => {
          window.alert("Status Changed!");
          window.location.reload();
        },
        () => {
          window.alert("You are not authorized!");
        }
      );
  };

  render() {
    if (!this.state.web3) {
      return <div className="loading-state">Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <div className="blockchain-animation">
          <h2>KYC Blockchain Platform</h2>
          <h3>{this.state.account}</h3>
          <div className="text-center mb-2">
            <span className="verification-status">
              Current Account is a {this.state.entity} entity
            </span>
          </div>
        </div>

        <div className="form-top-padding">
          <fieldset>
            <div className="form-title">
              <strong>Verified Organisation Addresses</strong>
            </div>
            <GetAllBankAccounts
              bankcount={this.state.bank_count}
              banks={this.state.allbanks}
            />
          </fieldset>
        </div>

        <div className="main-buttons-container">
          <button
            onClick={() => show("new-customer")}
            id="new-customer-button"
            title="Register as a new customer"
          >
            <span>New Customer</span>
            <span className="button-description">Register new account</span>
          </button>
          <button
            onClick={() => show("existing-customer")}
            id="existing-customer-button"
            title="Access existing customer features"
          >
            <span>Existing Customer</span>
            <span className="button-description">Manage your account</span>
          </button>
          <button
            onClick={() => show("new-bank")}
            id="new-bank-button"
            title="Register as a new organisation"
          >
            <span>New Organisation</span>
            <span className="button-description">Register organisation</span>
          </button>
          <button
            onClick={() => show("existing-bank")}
            id="existing-bank-button"
            title="Access organisation features"
          >
            <span>Organisation Access</span>
            <span className="button-description">Manage verifications</span>
          </button>
        </div>

            <div className="new-customer">
          <fieldset>
            <div className="form-title">
              <strong>Customer Registration Form</strong>
              <div className="text-center">(New customers only)</div>
            </div>
              <form onSubmit={this.create_customer}>
                <div className="form-group">
                <label>Your Name</label>
                <input type="text" onChange={this.myNameChangeHandler} placeholder="Enter your full name" />
                </div>

                <div className="form-group">
                <label>Your Aadhar</label>
                <input type="text" onChange={this.myAadharChangeHandler} placeholder="Enter your Aadhar number" />
                </div>

                <div className="form-group">
                <label>Your Pan</label>
                <input type="text" onChange={this.myPanChangeHandler} placeholder="Enter your PAN number" />
                </div>

                <div className="form-group">
                <label>Organisation Address for Verification</label>
                <input type="text" onChange={this.myVBankChangeHandler} placeholder="Enter organisation address" />
                </div>

              <input type="submit" value="Create Customer Account" />
              </form>
          </fieldset>
        </div>

        <div className="new-bank">
          <fieldset>
            <div className="form-title">
              <strong>Organisation Registration</strong>
              <div className="text-center">(New organisations only)</div>
            </div>
            <form onSubmit={this.create_bank}>
              <div className="form-group">
                <label>Organisation Name</label>
                <input type="text" onChange={this.myBankNameChangeHandler} placeholder="Enter organisation name" />
              </div>
              <input type="submit" value="Register Organisation" />
            </form>
          </fieldset>
        </div>

            <div className="existing-customer">
          <fieldset>
            <div className="form-title">
              <strong>Update Customer Data</strong>
              <div className="text-center">(Existing customers only)</div>
            </div>
              <form onSubmit={this.modify_data}>
                <div className="form-group">
                <label>New Name</label>
                <input type="text" onChange={this.myNameChangeHandler} placeholder="Enter new name" />
              </div>

              <div className="form-group">
                <label>New Aadhar</label>
                <input type="text" onChange={this.myAadharChangeHandler} placeholder="Enter new Aadhar number" />
                </div>

                <div className="form-group">
                <label>New Pan</label>
                <input type="text" onChange={this.myPanChangeHandler} placeholder="Enter new PAN number" />
                </div>

                <div className="form-group">
                <label>New Organisation Verify</label>
                <input type="text" onChange={this.myVBankChangeHandler} placeholder="Enter new organisation address" />
                </div>

              <input type="submit" value="Update Customer Data" />
              </form>
          </fieldset>
                </div>

        <div className="existing-bank">
          <fieldset>
            <div className="form-title">
              <strong>Customer Requests Management</strong>
            </div>
            <div className="text-center mb-2">
              <button onClick={this.viewRequests} className="blockchain-animation">
                View Customer Requests
              </button>
            </div>
            
            <GetAllBankRequests bankrequests={this.state.bankrequests} />
            
            <div className="form-top-padding">
              <div className="form-group">
                <label>Request Address</label>
                <input type="text" onChange={this.requestAddressChange} placeholder="Enter request address" />
              </div>

              <div className="text-center mt-2">
                <button onClick={this.accept} className="accept-button">
                  Accept Request
                </button>
                <button onClick={this.reject} className="reject-button">
                  Reject Request
                </button>
              </div>
            </div>
          </fieldset>
              </div>

        <div className="existing-bank mt-2">
          <fieldset>
            <div className="form-title">
              <strong>Customer Data Verification</strong>
            </div>
            <div className="form-group">
              <label>Customer Address</label>
              <input type="text" onChange={this.myDataChangeHandler} placeholder="Enter customer address" />
            </div>
            <div className="form-group">
              <label>Aadhar Number</label>
              <input type="text" onChange={this.myData1ChangeHandler} placeholder="Enter Aadhar number" />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input type="text" onChange={this.myData2ChangeHandler} placeholder="Enter PAN number" />
            </div>
            <div className="text-center mt-2">
              <button onClick={this.get} className="blockchain-animation">
                Verify Customer Data
              </button>
            </div>
            {this.state.verified && (
              <div className={`verification-status ${this.state.verified === "Success" ? "verification-success" : "verification-fail"}`}>
                Verification Status: {this.state.verified}
              </div>
            )}
          </fieldset>
        </div>

        <div className="existing-customer mt-2">
          <fieldset>
            <div className="form-title">
              <strong>Customer Status Check</strong>
            </div>
            <div className="text-center">
              <button onClick={this.getmystatus} className="blockchain-animation">
                Check Customer Status
              </button>
            </div>
            {this.state.status && (
              <div className="verification-status">
                Current Status: {this.state.status}
            </div>
          )}
          </fieldset>
        </div>
      </div>
    );
  }
}

export default App;
