document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu li');
    let currentIndex = Array.from(menuItems).findIndex(item => item.classList.contains('active'));
    
    // Function to send messages to Lua
    function sendToGame(action, data) {
        if (window.invokeNative) {
            fetch(`https://${GetParentResourceName()}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
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
    function setActiveItem(index) {
        console.log('Setting active item:', index);
        
        // Force DOM update
        menuItems.forEach((item, i) => {
            // Remove all active classes first
            item.classList.remove('active');
            // Clear any inline styles
            item.style.removeProperty('background-color');
            item.style.removeProperty('box-shadow');
        });

        // Set new active item
        if (menuItems[index]) {
            const activeItem = menuItems[index];
            activeItem.classList.add('active');
            
            // Force visual update with inline styles
            activeItem.style.cssText = `
                background-color: rgba(0, 102, 255, 0.2) !important;
                box-shadow: 0 0 15px rgba(0, 102, 255, 0.3) !important;
            `;

            // Scroll into view
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Send update to game
            sendToGame('menuSelect', {
                item: activeItem.querySelector('a').textContent.trim(),
                index: index
            });
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                setActiveItem(currentIndex);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < menuItems.length - 1) {
                currentIndex++;
                setActiveItem(currentIndex);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // Send selection confirmation to game
            sendToGame('menuActivate', {
                item: menuItems[currentIndex].querySelector('a').textContent.trim(),
                index: currentIndex
            });
        }
    });

    // Handle messages from game with forced update
    window.addEventListener('message', function(event) {
        console.log('Received message:', event.data);
        
        if (event.data.type === 'setActive') {
            const newIndex = Math.min(Math.max(0, event.data.index), menuItems.length - 1);
            
            // Force update even if index hasn't changed
            currentIndex = newIndex;
            
            // Use RAF for smooth animation
            window.requestAnimationFrame(() => {
                setActiveItem(currentIndex);
                // Double RAF to ensure render
                window.requestAnimationFrame(() => {
                    // Force repaint
                    menu.style.transform = 'translateZ(0)';
                });
            });
        } else if (event.data.type === 'menuActivate') {
            // Handle menu activation
            sendToGame('menuActivate', {
                item: menuItems[currentIndex].querySelector('a').textContent.trim(),
                index: currentIndex
            });
        }
    });

    // Initial setup
    updateScrollbar();
    menu.addEventListener('scroll', updateScrollbar);
}); 