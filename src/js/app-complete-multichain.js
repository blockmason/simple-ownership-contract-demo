//Link user: harish+ownership@blockmason.io
//Org: ownership-example

const stampData = require('../stamps.json');
const { link } = require('@blockmason/link-sdk');

const ownershipProject = link({
    clientId: '2MvXH9cApIXZysbfT1HprtFI83VZ5lj-NKJ2UmETkGw',
    clientSecret: 'fu53saVtXIA6xrj5DR/hv1y5gIo3e5Yp5UsFdE7eqxu9nkxoKUJWfDWrOovuzft'
});

const paymentProject = link({
    clientId: 'h-K5LiZTO658OZ8oA_YhpCSV99K1oGw0mV7ENhBy7Ts',
    clientSecret: 'H+JpRbTyYCZPrsp1iL9NyBJLIZCIBm9InGy3cEQC3QqzfD3/B2ryZp47qP+PG7I'
});

App = {
    tokenConversionRate: 5,
    
    init: function() {
        // Load stamps.
        // console.log(stampData);
        const stampsRow = $('#stampsRow');
        const stampTemplate = $('#stampTemplate');
    
        for (i = 0; i < stampData.length; i ++) {
            stampTemplate.find('.panel-title').text(stampData[i].name);
            stampTemplate.find('img').attr('src', stampData[i].picture);
            stampTemplate.find('.stamp-location').text(stampData[i].location);
            stampTemplate.find('.btn-own').attr('data-id', stampData[i].id);
            stampTemplate.find('.btn-value').text(stampData[i].price * App.tokenConversionRate);
    
            stampsRow.append(stampTemplate.html());
            App.markOwned(i, stampData[i].id);
        }
        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-own', App.handleOwnership);
    },

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

    fetchAuthority: async function() {
        const { result } = await ownershipProject.get('/authority');
        console.log('authority is', result);
    },

    setOwnership: async function(event, stampId, owner) {
        event.preventDefault();
        const reqBody = {
            "asset": stampId,
            "owner": owner
        };

        try {
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
        } catch(err) {
            console.log(err);
            alert("Blockchain network request timed out. Please try again");
        }
    },

    transferPayment: async function(receiver, amount) {
        const reqBody = {
            "_to": receiver,
            "_value": web3.toHex(amount*Math.pow(10, 18))
        };

        try {
            const result = await paymentProject.post('/transfer', reqBody);
            console.log('transfer result is', result);
            if (result.success) {
                return true
            } else {
                const message = result.errors[0]['detail'];
                alert(message);
                return false
            }
        } catch(err) {
            console.log(err);
            alert("Blockchain network request timed out. Please try again");
        }
    },
    
    handleOwnership: async function(event) {
        event.preventDefault();
        if (confirm("Confirm ownership of this stamp, which can take a few seconds to record on the blockchain")) {
            $(event.target).text("Processing").attr('disabled', true);
            const stampId = $(event.target).data('id');
            const newOwner = $(event.target).closest("div.owner-address").find("input[name='owner']").val();
            const price = parseInt($(event.target).next().html());
            let existingOwner = $(event.target).parents(".panel-stamp").find("#ownerAddress").text();
            
            if (existingOwner !== '') {
                existingOwner = existingOwner.split(" ")[1]
                if (existingOwner !== newOwner) {
                    const transferSuccess = await App.transferPayment(existingOwner, price/App.tokenConversionRate);
                    if (transferSuccess) {
                        App.setOwnership(event, stampId, newOwner);
                    } else {
                        alert("Error in transferring funds");
                        $(event.target).text("Own").attr('disabled', false);
                    }
                } else {
                    alert("The provided address is already the owner");
                    $(event.target).closest("div.owner-address").find("input[name='owner']").val('');
                }
            } else {
                App.setOwnership(event, stampId, newOwner);
            }
        }
    }
};
  
$(function() {
    $(window).load(function() {
        App.init();
    });
});
  