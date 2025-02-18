document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu li');
    let currentIndex = Array.from(menuItems).findIndex(item => item.classList.contains('active'));
    
    const mainMenu = document.querySelector('.menu-main');
    const selfMenu = document.querySelector('.self-menu');
    let currentMenu = 'main';
    
    // Check if we're in FiveM
    const isFiveM = window.invokeNative !== undefined;

    // Function to send messages to Lua or handle web actions
    function sendToGame(action, data) {
        if (isFiveM) {
            fetch(`https://${GetParentResourceName()}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            // Web handling
            console.log('Web action:', action, data);
            handleWebAction(action, data);
        }
    }

    // Handle actions for web testing
    function handleWebAction(action, data) {
        switch(action) {
            case 'menuSelect':
                if (data.menu === 'self') {
                    showMenu('self');
                } else if (data.menu === 'main') {
                    showMenu('main');
                }
                break;
            case 'selfAction':
                // Simulate self actions for web testing
                const item = data.action;
                if (item.includes('God Mode') || item.includes('Semi God Mode') || item.includes('No Ragdoll')) {
                    const toggle = document.querySelector(`.self-menu li a:contains('${item}') .toggle-switch`);
                    if (toggle) toggle.classList.toggle('active');
                } else if (item.includes('Health') || item.includes('Armor')) {
                    // Update value display for testing
                    const display = document.querySelector(`.self-menu li a:contains('${item}') .value-display`);
                    if (display) display.textContent = data.value;
                }
                break;
        }
    }

    // Scrollbar update function
    function updateScrollbar() {
        const scrollPercentage = menu.scrollTop / (menu.scrollHeight - menu.clientHeight);
        const maxThumbHeight = scrollbarTrack.clientHeight - 20;
        const thumbHeight = Math.min(
            maxThumbHeight,
            Math.max(40, (menu.clientHeight / menu.scrollHeight) * scrollbarTrack.clientHeight)
        );
        const maxPosition = scrollbarTrack.clientHeight - thumbHeight;
        const thumbPosition = Math.min(maxPosition, (maxPosition) * scrollPercentage);
        
        scrollbarThumb.style.height = `${thumbHeight}px`;
        scrollbarThumb.style.top = `${thumbPosition}px`;
    }

    // Function to update active menu item
    function setActiveItem(index, items = menuItems) {
        console.log('Setting active item:', index);
        
        // Remove active class from all items in both menus
        document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
        
        if (items[index]) {
            requestAnimationFrame(() => {
                items[index].classList.add('active');
            });
            
            items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            if (isFiveM) {
                sendToGame('menuSelect', {
                    item: items[index].querySelector('a').textContent.trim(),
                    index: index
                });
            }
        }
    }

    function showMenu(menuType) {
        mainMenu.style.display = menuType === 'main' ? 'block' : 'none';
        selfMenu.style.display = menuType === 'self' ? 'block' : 'none';
        currentMenu = menuType;
        
        // Get the items of the current menu
        const currentItems = menuType === 'main' ? 
            mainMenu.querySelectorAll('li') : 
            selfMenu.querySelectorAll('li');
        
        // Reset index when switching menus
        currentIndex = 0;
        setActiveItem(currentIndex, Array.from(currentItems));
    }

    // Modify menuActivate handler
    function handleMenuActivate(item) {
        if (currentMenu === 'main') {
            if (item === 'Self') {
                showMenu('self');
                sendToGame('menuSelect', { menu: 'self' });
            }
        } else if (currentMenu === 'self') {
            if (item === 'Back') {
                showMenu('main');
                sendToGame('menuSelect', { menu: 'main' });
            } else {
                // Handle self menu items
                sendToGame('selfAction', {
                    action: item,
                    value: item.includes('Health') || item.includes('Armor') ? 100 : null
                });
            }
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const currentItems = currentMenu === 'main' ? 
            mainMenu.querySelectorAll('li') : 
            selfMenu.querySelectorAll('li');
        
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                setActiveItem(currentIndex, Array.from(currentItems));
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < currentItems.length - 1) {
                currentIndex++;
                setActiveItem(currentIndex, Array.from(currentItems));
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const activeItem = currentItems[currentIndex];
            if (activeItem) {
                const itemText = activeItem.querySelector('a').textContent.trim();
                handleMenuActivate(itemText);
            }
        } else if (e.key === 'Backspace' && currentMenu === 'self') {
            e.preventDefault();
            showMenu('main');
        }
    });

    // Handle messages from game
    window.addEventListener('message', function(event) {
        console.log('Received message:', event.data); // Debug log
        
        if (event.data.type === 'setActive') {
            // Force remove active class from all items first
            menuItems.forEach(item => item.classList.remove('active'));
            
            // Ensure index is within bounds
            const newIndex = Math.min(Math.max(0, event.data.index), menuItems.length - 1);
            currentIndex = newIndex;
            
            // Force add active class to new item
            if (menuItems[currentIndex]) {
                menuItems[currentIndex].classList.add('active');
                menuItems[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                // Update styles immediately
                requestAnimationFrame(() => {
                    menuItems[currentIndex].classList.add('active');
                });
                
                console.log('Updated menu index to:', currentIndex);
            }
        } else if (event.data.type === 'menuActivate') {
            const activeItem = menuItems[currentIndex];
            if (activeItem) {
                const itemText = activeItem.querySelector('a').textContent.trim();
                handleMenuActivate(itemText);
            }
        }
    });

    // Initial setup
    updateScrollbar();
    menu.addEventListener('scroll', updateScrollbar);
}); 