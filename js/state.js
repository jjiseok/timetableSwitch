window.App = window.App || {};

App.state = {
    timetableData: [],
    headers: [],
    teachers: [],
    timeNames: [],
    currentSelection: { row: -1, col: -1, baseClass: '', rawClass: '' },
    targetSelection: { row: -1, col: -1 },
    currentArrowMoves: null
};
