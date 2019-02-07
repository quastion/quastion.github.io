'use strict'


let mark = {
    void: '',
    player: 'x',
    enemy: 'o'
}
let cells;
let endOfGame = false;

// =====================================================================================
// ======================================= Логика ======================================
// =====================================================================================

class Manager {
    container;
    renderer;

    constructor(container)
    {
        this.container = container;
        this.renderer = new Renderer(container);
    }

    generateMap(rowsCount, columnsCount) {
        let self = this;
        this.container.innerHTML = '';
        this.rowsCount = rowsCount;
        this.columnsCount = columnsCount;
        this.renderer.init(rowsCount, columnsCount);
        this.renderer.addCellsClickListeners(function () {
            if(!endOfGame && this.textContent === mark.void)
            {
                self.renderer.mark(this, mark.player);
                self.makeStep();
            }
        });
        endOfGame = false;
        this.init();
    }

    makeStep() {
        let self = this;

        let lines = this._getLines();
        let linesAssessment = lines.map(line => {
                return {
                    assessment: self._getLineAssessment(line),
                    line: line
                };
            }
        );
        let maxAssessment = linesAssessment[0];
        linesAssessment.forEach(function (value) {
            if(maxAssessment.assessment < value.assessment)
                maxAssessment = value;
        });

        let cell;
        while(true)
        {
            if((cell = this._getCellOnLine(maxAssessment)) === undefined)
            {
                let isWin = this._checkToWin();
                switch (isWin) {
                    case -1:
                        this._win('Player');
                        break;
                    case 1:
                        this._win('Computer');
                        break;
                    default:
                        this.generateMap(this.rowsCount, this.columnsCount);
                        break;
                }

                linesAssessment.splice(linesAssessment.indexOf(maxAssessment),1);
                maxAssessment.assessment = -3;
                if(linesAssessment.length == 0)
                    break;
                linesAssessment.forEach(function (value) {
                    if(maxAssessment.assessment < value.assessment)
                        maxAssessment = value;
                });
            }
            else
            {
                this.renderer.mark(cell, mark.enemy);
                let isWin = this._checkToWin();
                switch (isWin) {
                    case -1:
                        this._win('Player');
                        break;
                    case 1:
                        this._win('Computer');
                        break;
                    default:
                        break;
                }
                break;
            }
        }


    }

    _win(winner)
    {
        endOfGame = true;
        this.renderer.showWinDialog(winner);
    }

    _checkToWin()
    {
        let lines = this._getLines();
        let assessment = 0, i = 0;
        while(i < lines.length)
        {
            assessment = this._getLineAssessment(lines[i++]);
            if(assessment==-3)
                return -1;
            else
            if(assessment==6)
                return 1;
        }
        return 0;
    }

    //Сформировать линии из клеток для дальнейшей их оценки на перспективу победы
    _getLines(){
        let lines = [];
        let lineIndex = 0;
        //Получить вертикальные и горизонтальные линии
        //горизонтальные
        for(let i = Math.floor((this.rowsCount-1)/2); i < this.rowsCount; i++)
        {
            lines[lineIndex] = [];
            for (let j = 0; j < this.columnsCount; j++)
                lines[lineIndex][j] = cells[i][j];
            lineIndex++;
        }
        for(let i = 0; i < Math.floor((this.rowsCount-1)/2); i++)
        {
            lines[lineIndex] = [];
            for (let j = 0; j < this.columnsCount; j++)
                lines[lineIndex][j] = cells[i][j];
            lineIndex++;
        }
        //вертикальные
        for(let i = 0; i < this.columnsCount; i++)
        {
            lines[lineIndex] = [];
            for (let j = 0; j < this.rowsCount; j++)
                lines[lineIndex][j] = cells[j][i];
            lineIndex++;
        }
        //Получить диагональные линии с наклоном по часовой стрелке и против часовой стрелки
        //по часовой стрелке
        for(let k = 2; k < this.columnsCount; k++)
        {
            lines[lineIndex] = [];
            for(let i = k, j = 0; i > 0, j < this.rowsCount; i--, j++) //по столбцам
                lines[lineIndex][j] = cells[j][i];
            lineIndex++;
        }
        //против часовой стрелке
        for(let k = 0; k < this.columnsCount-2; k++)
        {
            lines[lineIndex] = [];
            for(let i = k, j = 0; i < this.columnsCount, j < this.rowsCount; i++, j++) //по столбцам
                lines[lineIndex][j] = cells[j][i];
            lineIndex++;
        }
        return lines;
    }

    //Получить оценку перспективности линии
    //Чем выше результат, тем выше приоритет у линии для совершения хода
    _getLineAssessment(line)
    {
        let assessment = 0;
        line.forEach(function (cell) {
            if(cell.mark === mark.enemy)
               assessment+=2;
            else
            if(cell.mark === mark.void)
                assessment++;
            else
            if(cell.mark === mark.player)
                assessment-=1;
        });
        //Если на линии 2 клетки отмечены игроком - надо ему помешать, ставим макс. приоритет
        if(assessment == 5)
            assessment = 99999;
        else
        if(assessment == -1)
            assessment = 66666;
        return assessment;
    }

    //Получить ячейку в линии (возможно следуя определенному алгоритму, тактике)
    _getCellOnLine(line)
    {
        let cell;
        let cellsOnLine = [], indexCellOnLine = 0;
        //Вносим приоритет на то, чтобы поставить 0 в середину поля
        if(line.line[(line.line.length-1)/2].mark === mark.void)
        {
            cell = line.line[(line.line.length-1)/2];
        }
        else
        {
            for(let i = 0; i < line.line.length; i++)
                if(line.line[i].mark === mark.void)
                    cellsOnLine[indexCellOnLine++] = line.line[i];
            cell = cellsOnLine[Math.floor(Math.random()*cellsOnLine.length)];
        }

        return cell;
    }

    init(){
        cells.forEach(function (cells) {
            cells.forEach(function (cell) {
                cell.mark = mark.void;
                cell.textContent = mark.void;
            })
        })
    }
}

class Renderer {
    container;
    table;

    constructor(container){
        this.container = container;
    }

    init(rowsCount, columnsCount){
        this.table = document.createElement('table');
        cells = [];

        for(let i = 0; i < rowsCount; i++)
        {
            let row = this.table.insertRow();
            cells[i] = [];
            for (let j = 0; j < columnsCount; j++)
            {
                let cell = row.insertCell(j);
                cells[i][j] = cell;
            }
        }
        this.container.appendChild(this.table);
    }

    addCellsClickListeners(listener){
        cells.forEach(function (cells) {
            cells.forEach(function (cell) {
                cell.addEventListener('click', listener);
            });
        });
    }

    // mark(rowIndex, columnIndex, markType)
    // {
    //     cells[rowIndex][columnIndex].mark = markType;
    //     cells[rowIndex][columnIndex].textContent = markType;
    // }

    mark(cell, markType)
    {
        cell.mark = markType;
        cell.textContent = markType;
    }

    showWinDialog(winner)
    {
        this.container.classList.add('hide-transition');
        setTimeout(()=>
            {
                document.getElementById('win-dialog').textContent = "Winner: " + winner;
                document.getElementById('win-dialog').classList.add('show-transition');
            }, 1500);
    }
}
