document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu li');
    let currentIndex = Array.from(menuItems).findIndex(item => item.classList.contains('active'));
    
    const mainMenu = document.querySelector('.menu-main');
    const selfMenu = document.querySelector('.self-menu');
    let currentMenu = 'main';

    // Add message handler for Lua communication
    window.addEventListener('message', function(event) {
        const data = event.data;
        console.log('Received message:', data);

        if (data.type === 'updateIndex') {
            currentIndex = data.index;
            updateUI(currentMenu, currentIndex);
        } else if (data.type === 'switchMenu') {
            showMenu(data.menu);
        }
    });

    // Modified sendToGame to ensure UI sync
    function sendToGame(action, data) {
        try {
            if (window.invokeNative) {
                window.invokeNative('sendMessage', JSON.stringify({
                    action: action,
                    data: {
                        ...data,
                        currentMenu: currentMenu,
                        currentIndex: currentIndex
                    }
                }));
            } else {
                console.log('Web action:', action, data);
                handleWebAction(action, data);
            }
        } catch (e) {
            console.log('SendToGame error:', e);
        }
    }

    // Update UI function
    function updateUI(menuType, index) {
        // Remove active class from all items
        document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
        
        const currentItems = menuType === 'main' ? mainMenu.querySelectorAll('li') : selfMenu.querySelectorAll('li');
        
        if (currentItems[index]) {
            currentItems[index].classList.add('active');
            currentItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Show menu function
    function showMenu(menuType) {
        mainMenu.style.display = menuType === 'main' ? 'block' : 'none';
        selfMenu.style.display = menuType === 'self' ? 'block' : 'none';
        currentMenu = menuType;
        currentIndex = 0;
        updateUI(menuType, currentIndex);
    }

    // Modified key handler to send updates to Lua
    document.addEventListener('keydown', function(e) {
        const currentItems = currentMenu === 'main' ? 
            mainMenu.querySelectorAll('li') : 
            selfMenu.querySelectorAll('li');

        switch(e.keyCode) {
            case 38: // Up arrow
                e.preventDefault();
                if (currentIndex > 0) {
                    currentIndex--;
                    updateUI(currentMenu, currentIndex);
                    sendToGame('updateIndex', { index: currentIndex });
                }
                break;

            case 40: // Down arrow
                e.preventDefault();
                if (currentIndex < currentItems.length - 1) {
                    currentIndex++;
                    updateUI(currentMenu, currentIndex);
                    sendToGame('updateIndex', { index: currentIndex });
                }
                break;

            case 13: // Enter
                e.preventDefault();
                const activeItem = currentItems[currentIndex];
                if (activeItem) {
                    const itemText = activeItem.querySelector('a').textContent.trim();
                    if (currentMenu === 'main' && itemText === 'Self') {
                        showMenu('self');
                    } else if (currentMenu === 'self' && itemText === 'Back') {
                        showMenu('main');
                    } else if (currentMenu === 'self') {
                        sendToGame('selfAction', {
                            action: itemText,
                            value: itemText.includes('Health') || itemText.includes('Armor') ? 100 : null
                        });
                    }
                }
                break;

            case 8: // Backspace
                if (currentMenu === 'self') {
                    e.preventDefault();
                    showMenu('main');
                }
                break;
        }
    });

    // Handle scrollbar
    function updateScrollbar() {
        if (!menu || !scrollbarThumb) return;
        
        const scrollPercentage = menu.scrollTop / (menu.scrollHeight - menu.clientHeight);
        const thumbHeight = Math.max(40, (menu.clientHeight / menu.scrollHeight) * scrollbarTrack.clientHeight);
        const maxPosition = scrollbarTrack.clientHeight - thumbHeight;
        const thumbPosition = maxPosition * scrollPercentage;
        
        scrollbarThumb.style.height = `${thumbHeight}px`;
        scrollbarThumb.style.top = `${thumbPosition}px`;
    }

    // Initialize
    updateScrollbar();
    menu.addEventListener('scroll', updateScrollbar);

    // Global error handler
    window.onerror = function(msg, url, line) {
        console.log(`Error: ${msg} at ${url}:${line}`);
        return false;
    };
}); 