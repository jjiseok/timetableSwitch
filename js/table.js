window.App = window.App || {};

App.table = {
    render() {
        const state = App.state;
        const DOM = App.DOM;

        DOM.thead.innerHTML = '';
        DOM.tbody.innerHTML = '';

        const h0 = state.headers[0];
        const h1 = state.headers[1];

        const tr1 = document.createElement('tr');
        const th0 = document.createElement('th');
        th0.rowSpan = 2;
        th0.innerText = '교사명';
        th0.className = 'border-thick-r border-thick-b';
        tr1.appendChild(th0);

        let cSpan = 0;
        const dayEndIdx = new Set();
        for (let i = 1; i < h0.length; i++) {
            if (h0[i] !== '') {
                if (cSpan > 0) dayEndIdx.add(i - 1);
                cSpan = 1;
                const th = document.createElement('th');
                th.innerText = h0[i];
                th.className = 'border-thick-r';
                tr1.appendChild(th);
            } else {
                tr1.lastChild.colSpan = ++cSpan;
            }
        }
        dayEndIdx.add(h0.length - 1);
        DOM.thead.appendChild(tr1);

        const tr2 = document.createElement('tr');
        for (let i = 1; i < h1.length; i++) {
            const th = document.createElement('th');
            th.innerText = h1[i];
            th.className = 'border-thick-b';
            if (dayEndIdx.has(i)) th.classList.add('border-thick-r');
            tr2.appendChild(th);
        }
        DOM.thead.appendChild(tr2);

        state.timetableData.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            tr.dataset.originalIndex = rowIndex;

            row.forEach((cell, colIndex) => {
                const td = document.createElement('td');
                td.innerText = cell;
                td.dataset.row = rowIndex;
                td.dataset.col = colIndex;

                if (colIndex === 0) {
                    td.classList.add('border-thick-r');
                } else {
                    if (dayEndIdx.has(colIndex)) td.classList.add('border-thick-r');
                    td.onclick = () => App.swap.handleCellClick(rowIndex, colIndex, cell);
                }

                tr.appendChild(td);
            });

            DOM.tbody.appendChild(tr);
        });

        DOM.tableWrapper.classList.remove('hidden');
        DOM.btnReset.classList.remove('hidden');
        DOM.btnExport.classList.remove('hidden');
    },

    restoreRowOrder() {
        const DOM = App.DOM;
        const rows = Array.from(DOM.tbody.querySelectorAll('tr[data-original-index]'));
        rows.sort((a, b) => parseInt(a.dataset.originalIndex, 10) - parseInt(b.dataset.originalIndex, 10));

        rows.forEach(tr => {
            tr.classList.remove('pulled-row');
            DOM.tbody.appendChild(tr);
        });

        const resultRow = document.getElementById('swap-result-row');
        if (resultRow && App.state.currentSelection.row !== -1) {
            const selTr = document.querySelector(`tr[data-original-index="${App.state.currentSelection.row}"]`);
            if (selTr) DOM.tbody.insertBefore(resultRow, selTr.nextSibling);
        }
    },

    groupSwappableRows(selRowIndex, rowIndicesArray) {
        const DOM = App.DOM;
        this.restoreRowOrder();

        const selTr = document.querySelector(`tr[data-original-index="${selRowIndex}"]`);
        if (!selTr) return;

        const resultRow = document.getElementById('swap-result-row');
        const insertReference = resultRow ? resultRow.nextSibling : selTr.nextSibling;
        const uniqueIndices = [...new Set(rowIndicesArray)].filter(rowIndex => rowIndex !== selRowIndex);

        uniqueIndices.forEach(rowIndex => {
            const tr = document.querySelector(`tr[data-original-index="${rowIndex}"]`);
            if (tr) {
                tr.classList.add('pulled-row');
                DOM.tbody.insertBefore(tr, insertReference);
            }
        });

        DOM.tableWrapper.scroll({ top: selTr.offsetTop - 50, behavior: 'smooth' });
    },

    insertSwapResultRow(selectedRowIndex) {
        const state = App.state;
        const selTr = document.querySelector(`tr[data-original-index="${selectedRowIndex}"]`);
        if (!selTr) return;

        const newTr = document.createElement('tr');
        newTr.id = 'swap-result-row';

        const newTd = document.createElement('td');
        newTd.colSpan = state.headers[1].length;
        newTd.style.backgroundColor = '#f1f8f3';
        newTd.style.borderBottom = '2px solid #1e8e3e';
        newTd.style.textAlign = 'left';
        newTd.style.padding = '8px 10px';
        newTd.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center gap-3">
                <span class="font-bold text-google-green text-xs shrink-0 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">info</span>
                    아래 당겨진 줄에서 <b>녹색 시간표</b>를 클릭하세요:
                </span>
            </div>
        `;

        newTr.appendChild(newTd);
        selTr.parentNode.insertBefore(newTr, selTr.nextSibling);
    },

    clearSelectionClasses() {
        document.querySelectorAll('#table-body td').forEach(td => {
            td.classList.remove(
                'cell-selected',
                'cell-swappable',
                'cell-target',
                'cell-helper',
                'cell-helper-2',
                'cell-helper-3',
                'cell-helper-4',
                'cell-empty-target'
            );
        });
    },

    removeResultRow() {
        const existingRow = document.getElementById('swap-result-row');
        if (existingRow) existingRow.remove();
    }
};
