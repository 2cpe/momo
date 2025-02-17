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
        menuItems.forEach(item => item.classList.remove('active'));
        menuItems[index].classList.add('active');
        menuItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Send selected menu item to game
        sendToGame('menuSelect', {
            item: menuItems[index].querySelector('a').textContent.trim(),
            index: index
        });
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
        if (event.data.type === 'setActive') {
            currentIndex = event.data.index;
            setActiveItem(currentIndex);
        } else if (event.data.type === 'keypress') {
            // Simulate keyboard event
            const keyEvent = new KeyboardEvent('keydown', {
                key: event.data.key,
                bubbles: true
            });
            document.dispatchEvent(keyEvent);
        }
    });

    // Initial setup
    updateScrollbar();
    menu.addEventListener('scroll', updateScrollbar);
}); 