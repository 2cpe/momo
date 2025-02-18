document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu li');
    let currentIndex = Array.from(menuItems).findIndex(item => item.classList.contains('active'));
    
    // Function to send messages to Lua
    function sendToGame(action, data) {
        try {
            if (window.invokeNative) {
                fetch(`https://${GetParentResourceName()}/${action}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).catch(err => console.error('Failed to send to game:', err));
            } else {
                // Fallback for injected scenario
                console.log('Sending to game:', action, data);
                window.postMessage({ type: action, ...data }, '*');
            }
        } catch (err) {
            console.error('Error sending to game:', err);
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
        const data = event.data;
        
        // Add more robust checking
        if (!data || typeof data !== 'object') return;
        
        console.log('Received message:', data);
        
        if (data.type === 'forceUpdate' || data.type === 'setActive') {
            // Ensure index is a number and valid
            const newIndex = parseInt(data.index);
            if (isNaN(newIndex) || newIndex < 0 || newIndex >= menuItems.length) return;
            
            currentIndex = newIndex;
            
            // Clear all active states
            menuItems.forEach(item => {
                item.classList.remove('active');
            });

            // Set new active state
            const activeItem = menuItems[currentIndex];
            if (activeItem) {
                activeItem.classList.add('active');
                
                // Smooth scroll only if direction is specified
                activeItem.scrollIntoView({
                    behavior: data.direction ? 'smooth' : 'auto',
                    block: 'nearest'
                });
            }
            
            updateScrollbar();
        } else if (data.type === 'menuActivate') {
            // Handle menu activation
            sendToGame('menuActivate', {
                item: menuItems[currentIndex].querySelector('a').textContent.trim(),
                index: currentIndex
            });
        }
    });

    // Add visibility handler
    window.addEventListener('message', function(event) {
        if (event.data.type === 'setVisible') {
            document.body.style.display = event.data.visible ? 'flex' : 'none';
        }
    });

    // Initial setup
    updateScrollbar();
    menu.addEventListener('scroll', updateScrollbar);
}); 