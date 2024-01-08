// query selector 이용해서 첫번째를 가져옴
const spreadSheetContainer = document.querySelector("#spreadsheet-container");
// 엑셀 export 기능 버튼 연결
const exportBtn = document.querySelector("#export-btn");
const ROWS = 10;
const COLS = 10;
const spreadsheet = [];
const alphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

// 각 셀이 `데이터`를 가져야 함 => 문자열이 아닌 객체 데이터 생성
// 클래스를 만들고 인스턴스 객체로 만들기
// [this 개념 잡기]
class Cell {
    constructor(isHeader, disabled, data, row, column, rowName, columnName, active = false) {
        this.isHeader = isHeader;
        this.disabled = disabled;
        this.data = data;
        this.row = row;
        this.column = column;
        this.rowName = rowName;
        this.columnName = columnName;
        this.active = active;
    }
}

// exportBtn 클릭한 경우 함수
exportBtn.onclick = function (e) {
    // 엑셀 형식으로 데이터 내보내는 방식
    let csv = "";
    for (let i = 0; i < spreadsheet.length; i++) {
        // 헤더 부분은 통과해야 하므로 코드 작성
        if (i === 0) continue;
        // 셀 부분들만 데이터로 넘김
        csv +=
            spreadsheet[i]
                // 헤더는 들어가면 안됨 => 헤더 없는 새 배열 생성
                .filter(item => !item.isHeader)
                // 필요한 속성인 데이터만 가져옴
                .map(item => item.data)
                // 각 아이템들을 ,로 조인
                .join(',') + "\r\n";
    }

    // 엑셀 파일 다운로드
    const csvObj = new Blob([csv]);
    console.log('csvObj', csvObj);
    // 내보내는 URL 생성
    const csvUrl = URL.createObjectURL(csvObj);
    console.log('csvUrl', csvUrl);

    const a = document.createElement("a");
    a.href = csvUrl;
    // 엑셀 파일의 이름 설정
    a.download = 'spreadsheet name.csv';
    // 실제 버튼이 클릭하는 것처럼 요소 클릭
    a.click();
}

// 함수 호출
initSpreadsheet();

function initSpreadsheet() {
    // 이중 for문으로 10*10의 표 생성
    for (let i = 0; i < ROWS; i++) {
        let spreadsheetRow = [];
        for (let j = 0; j < COLS; j++) {
            let cellData = '';
            let isHeader = false;
            let disabled = false;

            // 모든 row 첫 번째 컬럼에 숫자 넣기
            if (j === 0) {
                cellData = i;
                // 모든 row 첫 번째 컬럼에 true == isHader로 따로 스타일링 가능
                isHeader = true;
                // 헤더는 입력 불가능하도록
                disabled = true;
            }
            // 모든 col 첫 번째 컬럼에 숫자 넣기
            if (i === 0) {
                // alphabets 배열의 값 가져옴
                // col의 index에서 한 칸 띄고 시작하므로 -1
                cellData = alphabets[j - 1];
                // 모든 col 첫 번째 컬럼에 true == isHader로 따로 스타일링 가능
                isHeader = true;
                // 헤더는 입력 불가능하도록
                disabled = true;
            }

            // 첫 번째 row의 컬럼은 "";
            // cell이 undefined이면 공란으로 둠
            if (!cellData) {
                cellData = "";
            }

            const rowName = i;
            const columnName = alphabets[j - 1];

            // 새로운 Cell 객체 생성
            // isHeader, disabled, data, row, column, rowName, columnName, active
            const cell = new Cell(isHeader, disabled, cellData, i, j, rowName, columnName, false);
            // 배열 spreadsheetRow에 문자열 i-j 삽입
            // spreadsheetRow.push(i + "-" + j);
            // spreadsheetRow에 cell 삽입
            spreadsheetRow.push(cell);
        }
        // 배열 spreadsheet에 spreadsheetRow의 값 추가
        spreadsheet.push(spreadsheetRow);
    }
    // 함수 호출
    drawSheet();
    console.log(spreadsheet);
}

// cell 객체 생성 함수
function createCellEl(cell) {
    const cellEl = document.createElement('input');
    cellEl.className = 'cell';
    cellEl.id = 'cell_' + cell.row + cell.column;
    cellEl.value = cell.data;
    cellEl.disabled = cell.disabled;
    // 셀을 클릭한 경우 값을 가져오기
    if (cell.isHeader) {
        cellEl.classList.add("header");
    }
    // 선택한 셀의 값(데이터) 가져옴
    cellEl.onclick = () => handleCellClick(cell);
    cellEl.onchange = (e) => handleOnChange(e.target.value, cell);

    return cellEl;
}

// Header부분 class 따로 만들어 스타일링할 수 있도록 하는 함수
function createCellEl(cell) {
    const cellEl = document.createElement('input');
    cellEl.className = 'cell';
    cellEl.id = 'cell_' + cell.row + cell.column;
    cellEl.value = cell.data;
    cellEl.disabled = cell.disabled;

    if (cell.isHeader) {
        cellEl.classList.add("header");
    }

    // 클릭 이벤트 발생 시 해당 함수 호출
    cellEl.onclick = () => handleCellClick(cell);
    // 체인지 이벤트 발생 시 해당 함수 호출
    // e.target.value 선택한 타겟 셀 값(데이터)
    cellEl.onchange = (e) => handleOnChange(e.target.value, cell);

    return cellEl;
}

// 셀을 내보낼 때 현재 셀 값(데이터)을 가져옴
function handleOnChange(data, cell) {
    cell.data = data;
}

// 셀을 클릭했을 때 발생하는 함수
function handleCellClick(cell) {
    // 이전 하이라이트를 취소하기 위한 함수 호출
    clearHeaderActiveStates();
    // 셀을 선택했을 때, 해당 셀의 row, col의 값 가져오기
    const columnHeader = spreadsheet[0][cell.column];
    const rowHeader = spreadsheet[cell.row][0];
    // row, col의 header 요소 가져오기
    const columnHeaderEl = getElFromRowCol(columnHeader.row, columnHeader.column);
    const rowHeaderEl = getElFromRowCol(rowHeader.row, rowHeader.column);
    // 활성화 시 버튼 색 변화하는 부분 구현을 위한 class
    columnHeaderEl.classList.add('active');
    rowHeaderEl.classList.add('active');
    // console.log('clicked cell', columnHeaderEl, rowHeaderEl);

    // 몇 번째 셀을 선택했는지 확인할 수 있는 코드
    document.querySelector("#cell-status").innerHTML = cell.columnName + cell.rowName;
}

// row, col의 요소를 가져오는 함수
function getElFromRowCol(row, col) {
    return document.querySelector("#cell_" + row + col);
}

// 이전에 하이라이트 되었던 부분 하이라이트 해제하는 함수
function clearHeaderActiveStates() {
    const headers = document.querySelectorAll('.header');

    headers.forEach((header) => {
        header.classList.remove('active');
    })
}

// sheet 그리는 함수
function drawSheet() {
    for (let i = 0; i < spreadsheet.length; i++) {
        // 10개의 셀을 하나의 div로 감싸는 작업
        const rowContainerEl = document.createElement("div");
        rowContainerEl.className = "cell-row";

        for (let j = 0; j < spreadsheet[i].length; j++) {
            // (0,0), (0,1) 처럼 하나씩 할당
            const cell = spreadsheet[i][j];
            // 생성한 하나의 input 요소를 셀을 생성해서 넣어줌
            rowContainerEl.append(createCellEl(cell));
        }            
        // 10개씩 묶인 rowContainerEl를 spreadSheetContainer에 넣어준다.
        spreadSheetContainer.append(rowContainerEl);
    }
}