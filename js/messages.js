window.App = window.App || {};

App.messages = {
    show(text, type) {
        const DOM = App.DOM;
        const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
        const colorClass = type === 'success' ? 'text-google-green' : type === 'error' ? 'text-google-red' : 'text-google-blue';
        const content = `<span class="flex items-center gap-1 justify-center md:justify-start ${colorClass}"><span class="material-symbols-outlined text-[16px]">${icon}</span> ${text}</span>`;

        DOM.msgDiv.innerHTML = content;
        if (DOM.mobileMsgDiv) DOM.mobileMsgDiv.innerHTML = content;
    },

    setPanel(html, color) {
        const DOM = App.DOM;
        const styleMap = {
            success: 'display: flex; background-color: #e6f4ea; border-color: #ceead6; border-left-color: #1e8e3e;',
            error: 'display: flex; background-color: #fce8e6; border-color: #fad2cf; border-left-color: #d93025;',
            info: 'display: flex; background-color: #e8f0fe; border-color: #d2e3fc; border-left-color: #1a73e8;'
        };

        DOM.msg2way.innerHTML = html;
        DOM.panel2way.style.cssText = styleMap[color] || styleMap.info;
        DOM.panel2way.classList.remove('hidden-panel');
    },

    hidePanel() {
        App.DOM.panel2way.classList.add('hidden-panel');
    }
};
