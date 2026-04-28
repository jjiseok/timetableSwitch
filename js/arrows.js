window.App = window.App || {};

App.arrows = {
    draw(moves) {
        const state = App.state;
        const DOM = App.DOM;
        state.currentArrowMoves = moves;

        const wrapper = document.getElementById('table-inner-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        let html = '';

        moves.forEach(move => {
            const startCell = App.utils.getCell(move.sR, move.sC);
            const destCell = App.utils.getCell(move.dR, move.dC);
            if (!startCell || !destCell) return;

            const s = startCell.getBoundingClientRect();
            const d = destCell.getBoundingClientRect();
            const x1 = s.left - wrapperRect.left + s.width / 2;
            const y1 = s.top - wrapperRect.top + s.height / 2;
            const x2 = d.left - wrapperRect.left + d.width / 2;
            const y2 = d.top - wrapperRect.top + d.height / 2;
            const cx = (x1 + x2) / 2;
            const arch = Math.min(Math.abs(x2 - x1) / 3, 50);
            const cy = y1 - arch - 10;

            html += `<path d="M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" fill="none" stroke="#1e8e3e" stroke-width="3" stroke-dasharray="6,4" class="marching-ants" marker-end="url(#arrowhead-green)" />`;
            html += `<circle cx="${x1}" cy="${y1}" r="4" fill="#1e8e3e" />`;
        });

        DOM.arrowLayer.innerHTML = html;
    },

    clear() {
        App.state.currentArrowMoves = null;
        App.DOM.arrowLayer.innerHTML = '';
    }
};
