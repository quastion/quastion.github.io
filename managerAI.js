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
        this._net = new Net(9);
        this._net2 = new Net(9);
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
                self.makeStep(self._net, mark.enemy);
            }
        });
        endOfGame = false;
        this.init();
        //this.evolution(10);
    }

    evolution(count)
    {
        let i = 0;
        while(i++ < count)
        {
            let isEnd = 0;
            while(true)
            {
                if(this.makeStep(this._net, mark.player) == 1) break;
                if(this.makeStep(this._net2, mark.enemy) == 1) break;
            }
        }

    }

    makeStep(net, markType) {

        let vectorsStep;
        let matrixStep;
        while(true)
        {
            let isWin = this._checkToWin();
            switch (isWin) {
                case -1:
                    net.correctWeights(false);
                    this._win('Player');
                    return 1;
                case 1:
                    net.correctWeights(true);
                    this._win('Computer');
                    return 1;
                case -2:
                    net.correctWeights(true);
                    this._win('Standoff');
                    return 1;
                default:
                    break;
            }
            vectorsStep = net.move();
            if(vectorsStep === undefined)
            {
                net.correctWeights(true);
                this._win('Standoff');
                return 1;
            }
            matrixStep = this._transformVectorMoveToMatrixMove(vectorsStep, this.columnsCount);
            if(cells[matrixStep[0]][matrixStep[1]].mark === mark.void)
                break;
        }

        this.renderer.mark(cells[matrixStep[0]][matrixStep[1]], markType);
        net.nextState();

        let isWin = this._checkToWin();
        switch (isWin) {
            case -1:
                net.correctWeights(false);
                this._win('Player');
                return 1;
            case 1:
                net.correctWeights(true);
                this._win('Computer');
                return 1;
            case -2:
                net.correctWeights(true);
                this._win('Standoff');
                return 1;
            default:
                break;
        }
        return 0;
    }

    _transformVectorMoveToMatrixMove(move, cellsCountOnLine){
        return [Math.floor(move/cellsCountOnLine), move%cellsCountOnLine];
    }

    _win(winner)
    {
        endOfGame = true;
        this.renderer.showWinDialog(winner);
        this.generateMap(3,3);
    }

    _checkToWin()
    {
        let lines = this._getLines();
        let assessment = 0, i = 0;
        //Проверка на ничью

        while(i < lines.length)
        {
            assessment = this._getLineAssessment(lines[i++]);
            if(assessment==-3)
                return -1;
            else
            if(assessment==6)
                return 1;
        }
        let isStandoff = true;
        cells.forEach((elem) =>
        {
            elem.forEach((cell) =>
            {
                if(cell.mark === mark.void)
                    isStandoff = false;
            });
        });
        if(isStandoff === true)
            return -2;
        return 0;
    }

    //Сформировать линии из клеток для дальнейшей их оценки на перспективу победы
    _getLines(){
        let lines = [];
        let lineIndex = 0;
        //Получить вертикальные и горизонтальные линии
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
        //Перемешаем в случайном порядке
        lines.sort(function (a,b) {
            return Math.random() - 0.5;
        })
        //Получить вертикальные и горизонтальные линии
        //горизонтальные
        for(let i = Math.floor((this.rowsCount-1)/2); i < this.rowsCount; i++)
        {
            lines[lineIndex] = [];
            for (let j = 0; j < this.columnsCount; j++)
                lines[lineIndex][j] = cells[i][j];
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

    init(){
        cells.forEach(function (cells) {
            cells.forEach(function (cell) {
                cell.mark = mark.void;
                cell.textContent = mark.void;
            })
        })
    }
}

// =====================================================================================
// ======================================= Отрисовщик ==================================
// =====================================================================================

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
        //this.container.classList.add('hide-transition');
        setTimeout(()=>
        {
            document.getElementById('win-dialog').textContent = "Winner: " + winner;
            document.getElementById('win-dialog').classList.add('show-transition');
        }, 1500);
    }
}

// =====================================================================================
// ======================================= AI ==========================================
// =====================================================================================
class Net {
    constructor(mapStatesCount)
    {
        this.mapStatesCount = mapStatesCount;
        this._nodes = [];
        this._historyOfMoves = [];
        this._newLearnIteration = true;

        for(let i = 0; i < mapStatesCount; i++) {
            let node = this._buildNode(null, this.mapStatesCount-1, i);
            this._nodes[i] = node;
        }
    }

    _buildNode(parentNode, childNodesCount, neuronIndex) {
        let mapState = [];
        if(parentNode === null){
            for(let i = 0; i < childNodesCount+1; i++)
                mapState[i] = mark.void;
        }
        else
            mapState = parentNode.mapState.slice(0);
        let childNodes = [];
        let weight = 0;
        let node = new Neuron(mapState, weight, parentNode, childNodes, neuronIndex);
        mapState[neuronIndex] = mark.enemy;
        let mapStateFreeIndexes = [];
        mapState.forEach((elem, i)=>{
            if(elem === mark.void) mapStateFreeIndexes.push(i);
        });

        if(childNodesCount != 0)
        for (let i = 0; i < childNodesCount; i++){
            let childNeuronIndex = mapStateFreeIndexes[i];
            childNodes[i] = this._buildNode(node, childNodesCount-1, childNeuronIndex);
        }
        return node;
    }

    move(){
        let nodes = [];
        let maxWeight = -Infinity;
        if(this._newLearnIteration === true)
        {
            this._newLearnIteration = false;
            this._currentMoves = this._nodes;
        }

        this._currentMoves.forEach((value)=>{
            if(value!== undefined && maxWeight<value.weight)
                maxWeight = value.weight;
        });
        this._currentMoves.forEach((value)=>{
            if(value!== undefined && maxWeight==value.weight)
                nodes.push(value);
        });
        this._node = nodes[Math.floor(nodes.length*Math.random())];
        if(nodes.length == 0)
        {

            let o = 0;
        }
        if(this._node!==undefined)
        {
            // this._currentMoves.splice(this._currentMoves.indexOf(this._node),1);
            this._currentMoves = this._currentMoves.filter((elem) => elem.currentStep!=this._node.currentStep);
            //this._currentMoves[this._currentMoves.indexOf(this._node)] = undefined;
        }

        return this._node !== undefined ? this._node.currentStep : undefined;
    }

    nextState(){
        this._currentMoves = this._node.childNodes;
        this._historyOfMoves.push(this._node);
    }

    correctWeights(isWin){
        //if(isWin === true)
        {
            let node = this._nodes[this._historyOfMoves[0].currentStep];
            node.weight+= isWin===true?1:-1;
            for(let i = 1; i < this._historyOfMoves.length; i++){
                node = node.childNodes.filter((elem) => elem.currentStep == this._historyOfMoves[i].currentStep)[0];

                try{

                    node.weight+= isWin===true?1:-1;
                }
                catch (e) {
                    let f = 4;
                }
                // if(i>0)
                //     this._historyOfMoves[i-1].childNodes.push(this._historyOfMoves[i]);
            }
        }

        //this._nodes.push(this._historyOfMoves[0]);
        this._historyOfMoves = [];
        this._newLearnIteration = true;
    }
}

class Neuron {
    constructor(mapState, weight, parentNode, childNodes, currentStep)
    {
        this.mapState = mapState;
        this.weight = weight;
        this.parentNode = parentNode;
        this.childNodes = childNodes;
        this.currentStep = currentStep;
    }

    clone()
    {
        return new Neuron(
            this.mapState,
            this.weight,
            this.parentNode,
            this.childNodes,
            this.currentStep,
        );

    }
}

