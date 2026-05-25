window.App = window.App || {};

App.initDOM = function initDOM() {
    App.DOM = {
        fileInput: document.getElementById('excel-file'),
        dropZone: document.getElementById('drop-zone'),
        msgDiv: document.getElementById('result-msg'),
        mobileMsgDiv: document.getElementById('mobile-result-msg'),
        tableWrapper: document.getElementById('table-wrapper'),
        thead: document.getElementById('table-head'),
        tbody: document.getElementById('table-body'),
        panel2way: document.getElementById('panel-2way'),
        msg2way: document.getElementById('msg-2way'),
        btn2way: document.getElementById('btn-2way'),
        btnReset: document.getElementById('btn-reset'),
        btnExport: document.getElementById('btn-export'),
        btnDownload: document.getElementById('btn-download-template'),
        arrowLayer: document.getElementById('arrow-layer')
    };
};
