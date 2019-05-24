const stampData = require('../stamps.json');
const { link } = require('@blockmason/link-sdk');

const ownershipProject = link({
    clientId: 'd5KsamAN13js-IzOmQAhseNhLL9Mleo8458uyI13I_A',
    clientSecret: 'O6FHzB1XKsRf/nHk12XaDQQ7DBowBlFcCsKX2RbPhCVcKs6F8BGBPKhAYkx2FVJ'
});

App = {
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

    handleOwnership: async function(event) {
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
            $('.btn-own').attr('data-id', stampId).text("Own").attr('disabled', false);
          } 
          else {
            console.log('post successful');
            $(event.target).text("Own").attr('disabled', false);
            $(event.target).closest("div.owner-address").find("input[name='owner']").val('');  
            App.init();
          }
        }
    }
};
  
$(function() {
    $(window).load(function() {
        App.init();
    });
});
  