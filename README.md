# Ownership DApp Demo

Blockmason is excited to launch our second blockchain product called [Link](https://mason.link). Link allows developers to use smart contracts and the power of blockchain in their web or mobile applications with very little to no prior blockchain experience. Link creates classic, conventional, web-based APIs for any smart contract written on a programmable blockchain (e.g. Ethereum). 

In this activity, we will use Link to record ownership of assets (in this example, collectible digital stamps) on the blockchain. 

With Link and its built-in private blockchain, there is no need to use common blockchain development tools such as Infura or acquire an underlying token such as ETH to pay for gas fees - it just works!

A simple front-end template is provided and [Parcel](https://parceljs.org/) will be used as the web application bundler and server.

The key steps of this activity are:
1. Setup project and install dependencies
2. Deploy a basic Ownership smart contract to the blockchain using Link
3. Configure a front-end JavaScript file
4. Run our decentralized application

### Setup

You will need to setup the following for this activity:

> Install `Node` and `npm`: https://nodejs.org/en/download/ (note - you can also use `yarn`)

> Clone the Github repo: https://github.com/blockmason/simple-ownership-contract-demo into a new folder.

>  In the new folder, run `npm install` to install the following dependencies:

* `@blockmason/link-sdk` - https://www.npmjs.com/package/@blockmason/link-sdk - a simple SDK for interacting with the Link project.

* `parcel-bundler` - https://parceljs.org/getting_started.html - for bundling and running the web application

> Create a Blockmason Link account - register at https://mason.link/sign-up and then setup your demo organization.

### Deploy the Ownership Smart Contract
The `Ownership.sol` file contains a very simple Ownership Smart Contract:
```
pragma solidity ^0.5.8;

contract Ownership {
    mapping(string => address) public ownerOf;
    address public authority;
    
    constructor() public {
        authority = msg.sender;
    }
    
    function setOwner(string memory asset, address owner) public {
        ownerOf[asset] = owner;
    }
}
```
* Ownership is recorded in a mapping called `ownerOf` between an asset name (some string) and an Ethereum address (a 20 byte value). 
  
* Using the keyword `public` for the `ownerOf` mapping object automatically provides us with a getter. 

* The `authority` in this case will be a Link managed Ethereum account.

> Sign into your Link account and copy and paste the `Ownership.sol` contract code into the Link IDE. We'll call this project `Ownership`. 

![Ownership Link IDE](images/ownership_link_ide.png)

> Now click on the `API` button on the `Code/API` toggle and you will see API endpoints for all the Ownership smart contract functions and attributes!

![Ownership Link API](images/ownership_link_api.png)

**That's it!** Our Ownership smart contract is automatically deployed to the Link private network/blockchain and we are ready to use our web API endpoints in our front-end DApp. 

### Configure DApp Front-End

Taking a look inside the `src/` folder, we see that it is a very basic JavaScript app with data pulled in from `stamps.json`. We also make use of jQuery and Bootstrap in our code.

> Take a look at `index.html` and `js/app.js` code templates, which is where we will focus our efforts.

#### index.html
We see that the html template loads each of the stamps with data from `stamps.json` including an image, and an input field for setting an owners address. When a user presses the `Own` button, the intent is for the specified address to be recorded as the stamp's owner.

#### app.js
The template code has been provided and we just need to fill in the details.
```
const stampData = require('../stamps.json');
const { link } = require('@blockmason/link-sdk');

const ownershipProject = link({
    clientId: '',
    clientSecret: ''
});
```
We import the stamp data and the `@blockmason/link-sdk` package. We then need to provide the `clientId` and `clientSecret` from Link in order to use the `.get` and `.post` commands provided by the `link` object. 

> Copy and paste your specific `clientId` and `clientSecret` from the bottom of the Link IDE screen:
![Link creds](images/link_creds.png)

```
App = {
    init: function() {
        // Load stamps.
        const stampsRow = $('#stampsRow');
        const stampTemplate = $('#stampTemplate');
    
        for (i = 0; i < stampData.length; i ++) {
            stampTemplate.find('.panel-title').text(stampData[i].name);
            stampTemplate.find('img').attr('src', stampData[i].picture);
            stampTemplate.find('.stamp-location').text(stampData[i].location);
            stampTemplate.find('.btn-own').attr('data-id', stampData[i].id);
    
            stampsRow.append(stampTemplate.html());
            App.markOwned(i, stampData[i].id);
        }
        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-own', App.setOwnership);
    },

```
The above code:
* Loads all the stamp data as part of our `stampTemplate` into our `stampRow` element.

* Calls `App.markOwned(..)` which will check the blockchain and mark an asset with its corresponding owner.

* Returns a button click event listener

```
markOwned: async function(index, name) {
    // Mark stamp ownership
},
```
Here, we will call the `GET /ownerOf` API endpoint to retrive the owner of an asset value we pass. 

![Get ownerOf](images/get_ownerof.png)
Note the following:
* We pass an attribute called `value` which is a string
* We get a response object called `result` which is an address

The `index` function argument is used to identify which `.panel-stamp` element is being referenced during the for loop in `App.init()`. Our completed code looks like the following:
```
markOwned: async function(index, name) {
    const asset = {
        "value": name
    };  

    const { result } = await ownershipProject.get('/ownerOf', asset);
    
    if (result !== '0x0000000000000000000000000000000000000000') {
        $('.panel-stamp').eq(index).find('#ownerAddress').empty();
        $('.panel-stamp').eq(index).find('#ownerAddress').append('Owner: ' + result).css({ wordWrap: "break-word" });
    }
},
```
Lastly, we need to complete the `setOwnership` function:
```
setOwnership: async function(event) {
    event.preventDefault();
    if (confirm("Confirm ownership of this stamp, which can take a few seconds to record on the blockchain")) {
        const stampId = $(event.target).data('id');
        const owner = $(event.target).closest("div.owner-address").find("input[name='owner']").val();
        $(event.target).text("Processing").attr('disabled', true);

    // Set Ownership code
    }
}
```
Here, we will call the `POST /setOwner` API endpoint to set the owner of an asset with an address.

![Set Ownership](images/post_setowner.png)
Note the following:
* We pass an attribute called `asset` which is a string, and `owner` which is an address.
* We don't get a response object

That last point is true if the POST request is successful. Otherwise, an `error` object is returned containing the error details. Our completed code looks like the following:
```
setOwnership: async function(event) {
    event.preventDefault();
    if (confirm("Confirm ownership of this stamp, which can take a few seconds to record on the blockchain")) {
        const stampId = $(event.target).data('id');
        const owner = $(event.target).closest("div.owner-address").find("input[name='owner']").val();
        $(event.target).text("Processing").attr('disabled', true);

        const reqBody = {
            "asset": stampId,
            "owner": owner
        };

        const response = await ownershipProject.post('/setOwner', reqBody);
        
        if(response.errors) {
            alert(response.errors[0].detail);
            $(event.target).text("Own").attr('disabled', false);
        } 
        else {
            console.log('Post request successful');
            $(event.target).text("Own").attr('disabled', false);
            $(event.target).closest("div.owner-address").find("input[name='owner']").val('');  
            $(event.target).parents(".panel-stamp").find("#ownerAddress").text('Owner: ' + owner);
        }
    }
}
```
Find the complete code in `app-complete.js`. 

### Run your DApp

> Run the application from the project root folder with:
```
npm start
```

See the full command this executes under `scripts` in `package.json`. 

Note the following:
* By default, the DApp will run at https://localhost:1234 . You can specify the `-p` flag in the scripts command in `package.json` if you want to use a specific port.

* `Parcel` will create the following folders in your project folder: `.cache/` and `dist/`. If you run into any errors while running your DApp, delete these folders and try to run `npm start` again.

Copy and paste in an Ethereum wallet address (you can use a MetaMask browser wallet for example) and try to own one of the Collectible Stamps. *Note:* if you do not enter in a valid address, you will see the following error alert pop up:

![Address Error Alert](images/address_error_alert.png)


When running, your DApp should look similar to the following:

![App Running](images/app_running.png)

**Congrats** on getting your first DApp running from scratch using Link!

