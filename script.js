document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const menuItems = document.querySelectorAll('.menu li');
    let currentIndex = 0;
    let lastUpdate = 0;
    
    // Optimized send function
    function sendToGame(action, data) {
        try {
            if (window.invokeNative) {
                fetch(`https://${GetParentResourceName()}/${action}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }).catch(() => {});
            }
        } catch (err) {}
    }

    // Optimized scrollbar
    function updateScrollbar() {
        const now = Date.now();
        if (now - lastUpdate < 50) return; // Limit updates
        lastUpdate = now;
        
        const scrollPercent = menu.scrollTop / (menu.scrollHeight - menu.clientHeight);
        const thumbHeight = Math.max(40, (menu.clientHeight / menu.scrollHeight) * scrollbarThumb.parentElement.clientHeight);
        const maxPos = scrollbarThumb.parentElement.clientHeight - thumbHeight;
        
        scrollbarThumb.style.height = `${thumbHeight}px`;
        scrollbarThumb.style.top = `${maxPos * scrollPercent}px`;
    }

    // Optimized message handler
    window.addEventListener('message', function(event) {
        const data = event.data;
        if (!data || !data.type) return;
        
        if (data.type === 'setVisible') {
            document.body.style.display = data.visible ? 'flex' : 'none';
            return;
        }
        
        if ((data.type === 'forceUpdate' || data.type === 'setActive') && typeof data.index === 'number') {
            currentIndex = data.index;
            menuItems.forEach(item => item.classList.remove('active'));
            menuItems[currentIndex]?.classList.add('active');
            menuItems[currentIndex]?.scrollIntoView({
                behavior: 'auto',
                block: 'nearest'
            });
            updateScrollbar();
        }
    });

    // Attach scroll listener with throttling
    let scrollTimeout;
    menu.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                updateScrollbar();
                scrollTimeout = null;
            }, 50);
        }
    });
}); 