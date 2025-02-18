document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const menuItems = document.querySelectorAll('.menu li');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    let currentIndex = 0;

    // Simple function to update active item
    function setActive(index) {
        // Remove active class from all items
        menuItems.forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected item
        if (menuItems[index]) {
            menuItems[index].classList.add('active');
            menuItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Update scrollbar
        const scrollPercent = menu.scrollTop / (menu.scrollHeight - menu.clientHeight);
        const thumbHeight = Math.max(40, (menu.clientHeight / menu.scrollHeight) * menu.clientHeight);
        const maxScroll = menu.clientHeight - thumbHeight;
        const thumbPosition = maxScroll * scrollPercent;
        
        if (scrollbarThumb) {
            scrollbarThumb.style.height = thumbHeight + 'px';
            scrollbarThumb.style.top = thumbPosition + 'px';
        }
    }

    // Listen for messages from Lua
    window.addEventListener('message', function(event) {
        if (event.data.type === 'updateMenu') {
            currentIndex = event.data.index;
            setActive(currentIndex);
        }
    });

    // Update scrollbar on scroll
    menu.addEventListener('scroll', function() {
        const scrollPercent = menu.scrollTop / (menu.scrollHeight - menu.clientHeight);
        const thumbHeight = Math.max(40, (menu.clientHeight / menu.scrollHeight) * menu.clientHeight);
        const maxScroll = menu.clientHeight - thumbHeight;
        const thumbPosition = maxScroll * scrollPercent;
        
        if (scrollbarThumb) {
            scrollbarThumb.style.height = thumbHeight + 'px';
            scrollbarThumb.style.top = thumbPosition + 'px';
        }
    });
}); 