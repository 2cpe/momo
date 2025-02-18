document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu li');
    let currentIndex = 0;
    
    const mainMenu = document.querySelector('.menu-main');
    const selfMenu = document.querySelector('.self-menu');
    let currentMenu = 'main';

    // Game message handler
    window.addEventListener('message', function(event) {
        const data = event.data;
        console.log('Received message:', data); // Debug log
        
        if (data.type === 'updateIndex') {
            // Force update UI from game
            const items = currentMenu === 'main' ? 
                mainMenu.querySelectorAll('li') : 
                selfMenu.querySelectorAll('li');
            
            // Remove active class from all items
            document.querySelectorAll('.menu li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to current item
            if (items[data.index]) {
                items[data.index].classList.add('active');
                items[data.index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                currentIndex = data.index;
                console.log('Updated index to:', currentIndex); // Debug log
            }
        } else if (data.type === 'menuActivate') {
            const items = currentMenu === 'main' ? 
                mainMenu.querySelectorAll('li') : 
                selfMenu.querySelectorAll('li');
            
            if (items[currentIndex]) {
                const itemText = items[currentIndex].querySelector('a').textContent.trim();
                if (itemText === 'Self') {
                    currentMenu = 'self';
                    mainMenu.style.display = 'none';
                    selfMenu.style.display = 'block';
                    currentIndex = 0;
                } else if (itemText === 'Back') {
                    currentMenu = 'main';
                    selfMenu.style.display = 'none';
                    mainMenu.style.display = 'block';
                    currentIndex = 0;
                }
            }
        }
    });

    // Game communication
    function postMessage(action, data) {
        if (window.invokeNative) {
            fetch(`https://${GetParentResourceName()}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).catch(err => console.log('Error:', err));
        }
    }

    // Update UI function
    function updateUI(index) {
        document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
        const items = currentMenu === 'main' ? mainMenu.querySelectorAll('li') : selfMenu.querySelectorAll('li');
        if (items[index]) {
            items[index].classList.add('active');
            items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Only handle keyboard events if they come from game
    window.addEventListener('keydown', function(e) {
        e.preventDefault(); // Prevent default keyboard handling
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