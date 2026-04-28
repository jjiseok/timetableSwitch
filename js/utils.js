window.App = window.App || {};

App.utils = {
    extractClassNum(text) {
        const safeText = String(text || '');
        let match = safeText.match(/\d{1,2}-\d{1,2}/);
        if (match) return match[0];

        match = safeText.match(/\d{3}/);
        if (match) return match[0];

        return safeText.split('\n')[0].trim();
    },

    isCellEmpty(val) {
        const v = String(val || '').trim();
        return v === '' || v === 'XX';
    },

    getCell(row, col) {
        return document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
    },

    getTeacherShortName(row) {
        return String(App.state.teachers[row] || '').split('\n')[0];
    }
};
