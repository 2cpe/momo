window.addEventListener('message', function(event) {
    if (event.data.type === 'showMenu') {
        document.getElementById('menu').style.display = event.data.display ? 'block' : 'none';
    }
});

// Vehicle spawn buttons
document.querySelectorAll('[data-vehicle]').forEach(button => {
    button.addEventListener('click', function() {
        fetch('http://menu/spawnVehicle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.dataset.vehicle
            })
        });
    });
});

// Revive button
document.getElementById('reviveButton').addEventListener('click', function() {
    fetch('http://menu/revive', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
});

// Close button
document.getElementById('closeMenu').addEventListener('click', function() {
    fetch('http://menu/closeMenu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
}); 