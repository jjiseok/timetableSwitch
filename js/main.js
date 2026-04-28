window.App = window.App || {};

App.main = {
    init() {
        App.initDOM();

        App.DOM.fileInput.addEventListener('change', App.excel.handleFileUpload);
        App.DOM.btnDownload.addEventListener('click', App.excel.downloadTemplate);
        App.DOM.btnReset.addEventListener('click', App.swap.resetSelection);
        App.DOM.btn2way.addEventListener('click', App.swap.executeMultiWaySwap);
        App.DOM.btnExport.addEventListener('click', App.excel.exportTimetable);

        window.addEventListener('resize', () => {
            if (App.state.currentArrowMoves) App.arrows.draw(App.state.currentArrowMoves);
        });
    }
};

document.addEventListener('DOMContentLoaded', App.main.init);
