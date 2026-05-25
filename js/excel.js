window.App = window.App || {};

App.excel = {
    handleFileUpload(event) {
        const file = event.target.files[0];
        App.excel.openFile(file);
        event.target.value = '';
    },

    openFile(file) {
        if (!file) return;

        const fileName = String(file.name || '').toLowerCase();
        const isExcelFile = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

        if (!isExcelFile) {
            App.messages.show('엑셀 파일(.xlsx, .xls)만 열 수 있습니다.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function onLoad(loadEvent) {
            try {
                const data = new Uint8Array(loadEvent.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    blankrows: true
                });

                App.excel.processData(json);
            } catch (error) {
                console.error(error);
                App.messages.show('엑셀 읽기 실패', 'error');
            }
        };

        App.messages.show(`파일을 불러오는 중입니다: ${file.name}`, 'info');
        reader.readAsArrayBuffer(file);
    },

    processData(jsonArray) {
        const state = App.state;
        let dayHeaderIndex = -1;

        for (let i = 0; i < Math.min(30, jsonArray.length); i++) {
            const rowStr = jsonArray[i].join('').replace(/\s/g, '');
            const hasDays = rowStr.includes('월') && rowStr.includes('화') && rowStr.includes('수');
            const hasPeriods = rowStr.includes('12345') || rowStr.includes('1234');

            if (hasDays || hasPeriods) {
                dayHeaderIndex = i;
                if (!rowStr.includes('월') && i > 0 && jsonArray[i - 1].join('').includes('월')) {
                    dayHeaderIndex = i - 1;
                }
                break;
            }
        }

        if (dayHeaderIndex === -1) {
            App.messages.show('양식 인식 불가', 'error');
            return;
        }

        const rawH0 = jsonArray[dayHeaderIndex];
        const rawH1 = jsonArray[dayHeaderIndex + 1];
        let tCol = rawH0.findIndex(value => {
            const text = String(value);
            return text.includes('교사') || text.includes('성명') || text.includes('이름');
        });

        if (tCol === -1) {
            tCol = Math.max(0, rawH0.findIndex(value => String(value).replace(/\s/g, '').includes('월')) - 1);
        }

        const validCols = [tCol];
        let started = false;
        let periodCount = 0;

        for (let col = 0; col < Math.max(rawH0.length, rawH1.length); col++) {
            if (col === tCol) continue;

            const dayValue = String(rawH0[col] || '').trim();
            if (dayValue !== '' && ['월', '화', '수', '목', '금'].some(day => dayValue.includes(day))) {
                started = true;
                periodCount = 0;
            }

            if (!started || periodCount >= 7) continue;

            periodCount++;
            validCols.push(col);
        }

        state.headers = [
            validCols.map(index => index === tCol ? '교사명' : (rawH0[index] || '')),
            validCols.map(index => index === tCol ? '' : (rawH1[index] || ''))
        ];

        state.timetableData = [];
        let currentRow = null;

        for (let i = dayHeaderIndex + 2; i < jsonArray.length; i++) {
            const row = jsonArray[i];
            const teacherName = String(row[tCol] || '')
                .trim()
                .replace(/^[\d\.\(\)]+\s*/, '')
                .replace(/[\d\(\)]/g, '')
                .trim();

            const filteredRow = validCols.map(index => String(row[index] || '').trim());
            if (teacherName === '' && !filteredRow.slice(1).some(cell => cell !== '')) continue;

            if (teacherName !== '' && !teacherName.includes('비고')) {
                if (currentRow) state.timetableData.push(currentRow);
                filteredRow[0] = teacherName;
                currentRow = filteredRow;
            } else if (currentRow) {
                for (let col = 1; col < filteredRow.length; col++) {
                    if (filteredRow[col]) currentRow[col] += '\n' + filteredRow[col];
                }
            }
        }

        if (currentRow) state.timetableData.push(currentRow);

        state.teachers = state.timetableData.map(row => row[0]);
        state.timeNames = [''];

        let currentDayName = '';
        for (let i = 1; i < state.headers[1].length; i++) {
            if (state.headers[0][i] !== '') currentDayName = state.headers[0][i];
            state.timeNames.push(`${currentDayName} ${state.headers[1][i]}교시`);
        }

        App.table.render();
        App.messages.show(`총 ${state.teachers.length}명의 교사 데이터를 불러왔습니다.`, 'success');
    },

    exportTimetable() {
        const state = App.state;
        if (state.timetableData.length === 0) return;

        try {
            const aoa = [
                state.headers[0].map(header => String(header || '')),
                state.headers[1].map(header => String(header || '')),
                ...state.timetableData.map(row => row.map(cell => String(cell || '')))
            ];

            const ws = XLSX.utils.aoa_to_sheet(aoa);
            const merges = [];
            let startCol = 1;
            const row0 = state.headers[0];

            for (let col = 2; col < row0.length; col++) {
                if (row0[col] !== '' && row0[col] !== row0[startCol]) {
                    if (col - startCol > 1) merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: col - 1 } });
                    startCol = col;
                }
            }
            if (row0.length - startCol > 1) {
                merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: row0.length - 1 } });
            }

            ws['!merges'] = merges;
            ws['!cols'] = [{ wch: 15 }, ...Array(row0.length).fill({ wch: 8 })];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '시간표');
            XLSX.writeFile(wb, `시간표_${new Date().toLocaleDateString().replace(/\./g, '').replace(/\s/g, '_')}.xlsx`);
            App.messages.show('엑셀 파일(.xlsx)로 내보내기 하였습니다.', 'success');
        } catch (error) {
            console.error(error);
            App.messages.show('내보내기 오류', 'error');
        }
    },

    downloadTemplate() {
        const wsData = [
            ['교사명', '월', '월', '월', '월', '월', '월', '월', '화', '화', '화', '화', '화', '화', '화', '수', '수', '수', '수', '수', '수', '수', '목', '목', '목', '목', '목', '목', '목', '금', '금', '금', '금', '금', '금', '금'],
            ['', '1', '2', '3', '4', '5', '6', '7', '1', '2', '3', '4', '5', '6', '7', '1', '2', '3', '4', '5', '6', '7', '1', '2', '3', '4', '5', '6', '7', '1', '2', '3', '4', '5', '6', '7'],
            ['샘플교사', '1-1', '', '1-2', '', '1-3', '', '', '', '1-1', '1-4', '', '', '', '', '1-2', '', '1-3', '', '', '', '', '', '', '1-4', '', '1-1', '', '', '1-3', '', '', '1-2', '', '', '']
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '양식');
        XLSX.writeFile(wb, '시간표_양식.xlsx');
    }
};
