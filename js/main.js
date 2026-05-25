window.App = window.App || {};

App.main = {
    init() {
        App.initDOM();

        App.DOM.fileInput.addEventListener('change', App.excel.handleFileUpload);

        if (App.DOM.dropZone) {
            App.DOM.dropZone.addEventListener('click', () => App.DOM.fileInput.click());
            App.DOM.dropZone.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    App.DOM.fileInput.click();
                }
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                App.DOM.dropZone.addEventListener(eventName, event => {
                    event.preventDefault();
                    event.stopPropagation();
                    App.DOM.dropZone.classList.add('drag-over');
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                App.DOM.dropZone.addEventListener(eventName, event => {
                    event.preventDefault();
                    event.stopPropagation();
                    App.DOM.dropZone.classList.remove('drag-over');
                });
            });

            App.DOM.dropZone.addEventListener('drop', event => {
                const file = event.dataTransfer.files && event.dataTransfer.files[0];
                App.excel.openFile(file);
            });
        }

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
