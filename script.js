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
        // Send update to Lua first
        sendToGame('menuSelect', {
            item: menuItems[index].querySelector('a').textContent.trim(),
            index: index
        });

        // Then force UI update through the same path
        const event = {
            data: {
                type: 'forceUpdate',
                index: index
            }
        };
        window.dispatchEvent(new MessageEvent('message', event));
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

    // Handle messages from game with improved reliability
    window.addEventListener('message', function(event) {
        console.log('Received message:', event.data);
        
        if (event.data.type === 'forceUpdate') {
            // Force immediate UI update
            currentIndex = event.data.index;
            
            // Clear all active states first
            menuItems.forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = '';
                item.style.boxShadow = '';
            });

            // Set new active state
            const activeItem = menuItems[currentIndex];
            if (activeItem) {
                activeItem.classList.add('active');
                activeItem.style.backgroundColor = 'rgba(0, 102, 255, 0.2)';
                activeItem.style.boxShadow = '0 0 15px rgba(0, 102, 255, 0.3)';
                
                // Ensure item is visible
                activeItem.scrollIntoView({
                    behavior: event.data.direction ? 'smooth' : 'auto',
                    block: 'nearest'
                });
            }
            
            // Update scrollbar position
            updateScrollbar();
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