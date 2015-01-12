define(['image'], function(image) {

    requirejs(['image!img/bower2requirejs.png'], function(requirejs2bower) {

        var wrapper = document.getElementById('wrapper');

        if (requirejs2bower) {
            wrapper.innerHTML = '<h2>Success</h2><a href="bower.json">Read bower.json</a><br><br>';
            wrapper.appendChild(requirejs2bower);
        }

    });

});

