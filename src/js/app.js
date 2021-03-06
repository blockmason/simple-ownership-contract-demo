const stampData = require('../stamps.json');
const { link } = require('@blockmason/link-sdk');

const ownershipProject = link({
    clientId: '',
    clientSecret: ''
});

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

    markOwned: async function(index, name) {
        // Mark stamp ownership
    },

    fetchAuthority: async function() {
        const { result } = await ownershipProject.get('/authority');
        console.log('authority is', result);
    },

    setOwnership: async function(event) {
        event.preventDefault();
        if (confirm("Confirm ownership of this stamp, which can take a few seconds to record on the blockchain")) {
          const stampId = $(event.target).data('id');
          const owner = $(event.target).closest("div.owner-address").find("input[name='owner']").val();
          $(event.target).text("Processing").attr('disabled', true);
    
        // Set Ownership code
        }
    }
};
  
$(function() {
    $(window).load(function() {
        App.init();
    });
});
  