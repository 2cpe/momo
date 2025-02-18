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
        
        // Remove active class from all items
        menuItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
                // Force style update
                item.style.backgroundColor = 'rgba(0, 102, 255, 0.2)';
                item.style.boxShadow = '0 0 15px rgba(0, 102, 255, 0.3)';
            } else {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.boxShadow = 'none';
            }
        });

        // Ensure scrolling into view
        if (menuItems[index]) {
            menuItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    // Handle messages from game
    window.addEventListener('message', function(event) {
        console.log('Received message:', event.data);
        
        if (event.data.type === 'setActive') {
            // Ensure index is within bounds
            const newIndex = Math.min(Math.max(0, event.data.index), menuItems.length - 1);
            if (currentIndex !== newIndex) {
                currentIndex = newIndex;
                // Force immediate UI update
                requestAnimationFrame(() => {
                    setActiveItem(currentIndex);
                    console.log('Updated menu index to:', currentIndex);
                });
            }
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