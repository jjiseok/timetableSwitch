window.App = window.App || {};

App.swap = {
    resetSelection() {
        const state = App.state;
        state.currentSelection = { row: -1, col: -1, baseClass: '', rawClass: '' };
        state.targetSelection = { row: -1, col: -1 };

        App.table.clearSelectionClasses();
        App.table.removeResultRow();
        App.table.restoreRowOrder();
        App.arrows.clear();
        App.messages.hidePanel();

        if (state.teachers.length > 0) {
            App.messages.show('초기화되었습니다. 내 수업을 다시 클릭하세요.', 'info');
        }
    },

    handleCellClick(row, col, cellValue) {
        const state = App.state;
        const { isCellEmpty, extractClassNum } = App.utils;

        if (isCellEmpty(cellValue)) return;

        const baseClass = extractClassNum(cellValue);
        const isNewSelection = state.currentSelection.row === -1 || baseClass !== state.currentSelection.baseClass;

        if (isNewSelection) {
            state.currentSelection = { row, col, baseClass, rawClass: cellValue };
            App.arrows.clear();
            App.messages.hidePanel();
            App.table.restoreRowOrder();
            this.findDirectSwappable();
            return;
        }

        if (row === state.currentSelection.row && col === state.currentSelection.col) return;

        const clickedCell = App.utils.getCell(row, col);
        if (!clickedCell) return;

        if (clickedCell.classList.contains('cell-swappable')) {
            this.focusSwappable(row, col);
            return;
        }

        state.targetSelection = { row, col };
        document.querySelectorAll('.cell-target').forEach(element => element.classList.remove('cell-target'));
        clickedCell.classList.add('cell-target');

        const myStatus = String(state.timetableData[state.currentSelection.row][col]).trim();

        if (!isCellEmpty(myStatus)) {
            App.messages.setPanel(
                `<span class="flex items-start gap-1.5"><span class="material-symbols-outlined text-google-red text-[18px]">error</span> <span><b>내 시간표 충돌:</b> 목표 시간 <b>[${state.timeNames[col]}]</b>에 이미 수업이 있습니다.</span></span>`,
                'error'
            );
            App.DOM.btn2way.classList.add('hidden');
        } else {
            App.messages.setPanel(
                '<span class="flex items-start gap-1.5"><span class="material-symbols-outlined text-google-blue text-[18px]">info</span> <span><b>상대방 시간표 충돌:</b> 직접 교환이 안 되어 다중 경로를 탐색합니다.</span></span>',
                'info'
            );
            App.DOM.btn2way.classList.remove('hidden');
        }
    },

    findDirectSwappable() {
        const state = App.state;
        const { extractClassNum, isCellEmpty } = App.utils;

        App.table.clearSelectionClasses();
        App.table.removeResultRow();

        const { row, col, baseClass } = state.currentSelection;
        const selectedTd = App.utils.getCell(row, col);
        if (selectedTd) selectedTd.classList.add('cell-selected');

        const list = [];
        const swappableRowIndices = [];

        for (let r = 0; r < state.timetableData.length; r++) {
            for (let c = 1; c < state.timeNames.length; c++) {
                if (r === row || c === col) continue;

                if (extractClassNum(state.timetableData[r][c]) === baseClass) {
                    const myTargetIsEmpty = isCellEmpty(state.timetableData[row][c]);
                    const theirTargetIsEmpty = isCellEmpty(state.timetableData[r][col]);

                    if (myTargetIsEmpty && theirTargetIsEmpty) {
                        const td = App.utils.getCell(r, c);
                        if (td) td.classList.add('cell-swappable');

                        list.push({ r, c, teacher: App.utils.getTeacherShortName(r), time: state.timeNames[c] });
                        swappableRowIndices.push(r);
                    }
                }
            }
        }

        if (list.length > 0) {
            App.messages.show(`[${state.timeNames[col]}] ${baseClass} 직접 교체 가능: ${list.length}건`, 'success');
            App.table.insertSwapResultRow(row);
            App.table.groupSwappableRows(row, swappableRowIndices);
        } else {
            App.messages.show('직접 교체 가능한 시간이 없습니다. 다른 수업을 눌러보세요.', 'error');
        }
    },

    focusSwappable(row, col) {
        const state = App.state;
        const td = App.utils.getCell(row, col);
        if (!td) return;

        td.classList.add('cell-highlight-blink');
        setTimeout(() => td.classList.remove('cell-highlight-blink'), 1500);

        const myRow = state.currentSelection.row;
        const myCol = state.currentSelection.col;

        document.querySelectorAll('.cell-empty-target').forEach(element => element.classList.remove('cell-empty-target'));

        const targetName = state.teachers[row];
        const myName = state.teachers[myRow];
        const myTime = state.timeNames[myCol];
        const targetTime = state.timeNames[col];

        App.messages.setPanel(
            `
            <span class="flex items-start gap-1.5">
                <span class="material-symbols-outlined text-google-green text-[18px]">check_circle</span>
                <span>
                    <b class="text-google-green">직접 교체 성공!</b> <b>[${myName}]</b> 선생님과 <b>[${targetName}]</b> 선생님이 서로 수업을 맞교환합니다.<br>
                    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 6px; color: #3c4043;">
                        <li><b>${myName}</b>(나): [${myTime}] ➔ <b>[${targetTime}]</b> (이동)</li>
                        <li><b>${targetName}</b>(상대): [${targetTime}] ➔ <b>[${myTime}]</b> (이동)</li>
                    </ul>
                </span>
            </span>`,
            'success'
        );
        App.DOM.btn2way.classList.add('hidden');

        const moves = [
            { sR: myRow, sC: myCol, dR: myRow, dC: col },
            { sR: row, sC: col, dR: row, dC: myCol }
        ];

        const myTarget = App.utils.getCell(myRow, col);
        const theirTarget = App.utils.getCell(row, myCol);
        if (myTarget) myTarget.classList.add('cell-empty-target');
        if (theirTarget) theirTarget.classList.add('cell-empty-target');

        setTimeout(() => App.arrows.draw(moves), 50);
    },

    executeMultiWaySwap() {
        const state = App.state;
        const { extractClassNum, isCellEmpty } = App.utils;

        const { row: tA, col: timeA, baseClass: targetBaseClass } = state.currentSelection;
        const { row: tB, col: timeB } = state.targetSelection;
        const candidates = [];

        for (let r = 0; r < state.timetableData.length; r++) {
            if (r === tA || r === tB) continue;

            for (let c = 1; c < state.timeNames.length; c++) {
                if (c === timeA || c === timeB) continue;
                if (extractClassNum(String(state.timetableData[r][c])) === targetBaseClass) {
                    candidates.push({ r, c });
                }
            }
        }

        let foundPath = null;
        const dfs = (currentRow, depth, maxDepth, path) => {
            if (depth === maxDepth) {
                return isCellEmpty(state.timetableData[currentRow][timeA]) ? [...path] : null;
            }

            for (const candidate of candidates) {
                const alreadyUsed = path.some(pathNode => pathNode.r === candidate.r || pathNode.c === candidate.c);
                if (alreadyUsed) continue;
                if (!isCellEmpty(state.timetableData[currentRow][candidate.c])) continue;

                path.push(candidate);
                const result = dfs(candidate.r, depth + 1, maxDepth, path);
                if (result) return result;
                path.pop();
            }

            return null;
        };

        for (let depth = 1; depth <= 4; depth++) {
            foundPath = dfs(tB, 0, depth, []);
            if (foundPath) break;
        }

        if (!foundPath) {
            App.messages.setPanel(
                '<span class="flex items-start gap-1.5"><span class="material-symbols-outlined text-google-red text-[18px]">search_off</span> <span><b>탐색 완료:</b> 빈 시간이 완벽히 맞물리는 <b>다중 교체 경로</b>가 없습니다.</span></span>',
                'error'
            );
            App.DOM.btn2way.classList.add('hidden');
            App.arrows.clear();
            return;
        }

        const helperClasses = ['cell-helper', 'cell-helper-2', 'cell-helper-3', 'cell-helper-4'];
        foundPath.forEach((node, index) => {
            const td = App.utils.getCell(node.r, node.c);
            if (td) td.classList.add(helperClasses[index]);
        });

        const helperRowIndices = foundPath.map(node => node.r);
        App.table.groupSwappableRows(tA, [tB, ...helperRowIndices]);

        const moves = [
            { sR: tA, sC: timeA, dR: tA, dC: timeB },
            { sR: tB, sC: timeB, dR: tB, dC: foundPath[0].c }
        ];
        const targetPositions = [
            { r: tA, c: timeB },
            { r: tB, c: foundPath[0].c }
        ];

        for (let i = 0; i < foundPath.length - 1; i++) {
            moves.push({ sR: foundPath[i].r, sC: foundPath[i].c, dR: foundPath[i].r, dC: foundPath[i + 1].c });
            targetPositions.push({ r: foundPath[i].r, c: foundPath[i + 1].c });
        }

        const lastNode = foundPath[foundPath.length - 1];
        moves.push({ sR: lastNode.r, sC: lastNode.c, dR: lastNode.r, dC: timeA });
        targetPositions.push({ r: lastNode.r, c: timeA });

        targetPositions.forEach(position => {
            const td = App.utils.getCell(position.r, position.c);
            if (td) td.classList.add('cell-empty-target');
        });

        setTimeout(() => App.arrows.draw(moves), 50);

        const names = foundPath.map(node => App.utils.getTeacherShortName(node.r));
        let li = `<li><b>${App.utils.getTeacherShortName(tA)}</b>(나): [${state.timeNames[timeA]}] ➔ <b>[${state.timeNames[timeB]}]</b></li>`;
        li += `<li><b>${App.utils.getTeacherShortName(tB)}</b>(목표): [${state.timeNames[timeB]}] ➔ <b>[${state.timeNames[foundPath[0].c]}]</b></li>`;

        for (let i = 0; i < names.length - 1; i++) {
            li += `<li><b>${names[i]}</b>(경유${i + 1}): [${state.timeNames[foundPath[i].c]}] ➔ <b>[${state.timeNames[foundPath[i + 1].c]}]</b></li>`;
        }
        li += `<li><b>${names[names.length - 1]}</b>(경유${names.length}): [${state.timeNames[lastNode.c]}] ➔ <b>[${state.timeNames[timeA]}]</b></li>`;

        App.messages.setPanel(
            `<span class="flex items-start gap-1.5"><span class="material-symbols-outlined text-google-green text-[18px]">check_circle</span><span><b class="text-google-green">${foundPath.length + 1}중 교체 성공!</b><ul>${li}</ul></span></span>`,
            'success'
        );
        App.DOM.btn2way.classList.add('hidden');
    }
};
