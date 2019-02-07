'use strict'


let mark = {
    void: '',
    player: 'x',
    enemy: 'o'
}
let cells;

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
        this.rowsCount = rowsCount;
        this.columnsCount = columnsCount;
        this.renderer.init(rowsCount, columnsCount);
        this.renderer.addCellsClickListeners(function () {
            if(this.textContent === mark.void)
            {
                self.renderer.mark(this, mark.player);
                self.makeStep();
            }
        });
        this.init();
    }

    makeStep() {
        let self = this;
        //self.renderer.mark(0,1,mark.enemy);
        // for(let i = 0; i < cells.length; i++)
        // {
        //     for (let j = 0; j < cells[i].length; j++)
        //     {
        //         if(cells[i][j].mark == mark.void)
        //         {
        //             self.renderer.mark(i, j, mark.enemy);
        //             return;
        //         }
        //     }
        // }
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
                        this._win('Computer');
                        break;
                    case 1:
                        this._win('Player');
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
        //вертикальные
        for(let i = 0; i < this.rowsCount; i++)
        {
            lines[lineIndex] = [];
            for (let j = 0; j < this.columnsCount; j++)
                lines[lineIndex][j] = cells[i][j];
            lineIndex++;
        }
        //горизонтальные
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
        return assessment;
    }

    //Получить ячейку в линии (возможно следуя определенному алгоритму, тактике)
    _getCellOnLine(line)
    {
        let cell;
        for(let i = 0; i < line.line.length; i++)
            if(line.line[i].mark === mark.void)
            {
                cell = line.line[i];
                break;
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