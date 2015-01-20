define(['image'], function(image) {

    requirejs(['image!img/bower2requirejs.png'], function(requirejs2bower) {

        var wrapper = document.getElementById('wrapper');

        if (requirejs2bower) {
            wrapper.innerHTML = '<h2>Success</h2><a href="bower.json">Bower.json available in src, deleted in dist after build</a><br><br>';
            wrapper.appendChild(requirejs2bower);
        }

    });

});

