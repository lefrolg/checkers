'use strict';

class Checkers {
    board;
    tds;
    root;
    gamer = {
        1: {name: 'black', img: './img/bss.png', imgD: './img/bd.png'},
        [-1]: {name: 'white', img: './img/wss.png', imgD: './img/wd.png'}
    }
    move;
    gamerMoveDiv;
    focusingChecker;
    stateFixedFocusingChecker;
    stateMustFight;

    init(id){
        this.root = document.getElementById(id);
        let mainObj = this;

        this.tds = this.root.querySelectorAll('td');
        for(let td of this.tds){
            td.addEventListener('click', function(event){
                mainObj.processing(event.target)
            })
        }
        this.gamerMoveDiv =  this.root.querySelector('div.move');

        this.newGame();
        for(let btn of this.root.querySelectorAll('.newGame')){
            btn.addEventListener('click', ()=> this.newGame())
        }

    }

    newGame(){

        this.board = [
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [-1, 0, -1, 0, -1, 0, -1, 0],
            [0, -1, 0, -1, 0, -1, 0, -1],
            [-1, 0, -1, 0, -1, 0, -1, 0],
        ]

        this.move = -1;
        this.focusingChecker = '';
        this.stateFixedFocusingChecker = 0;
        this.stateMustFight = {
            1: 0,
            [-1]: 0
        }

        this.showBoard();
    }

    processing(td){
        if (td.tagName == "IMG")
            td = td.parentElement;

        if (this.board[td.dataset.x][td.dataset.y] && this.board[td.dataset.x][td.dataset.y]%2 == this.move){
            if (!this.stateFixedFocusingChecker){
                this.focusedChecker(td.dataset.x, td.dataset.y);
                this.showFocusedChecker(td.dataset.x, td.dataset.y);
            } else{
                this.showErrorMove(td);
            }
        } else if (!this.board[td.dataset.x][td.dataset.y] && this.focusingChecker){
            let state = this.moving(td.dataset.x, td.dataset.y);

            if (!state){
                this.showErrorMove(td);
                return;
            } else if (state == 2){
                this.showBoard();
                this.showFocusedChecker(this.focusingChecker[0], this.focusingChecker[1]);
            } else if (Array.isArray(state)){
                let stateFightAgain = this.fightLong(state, td.dataset.x, td.dataset.y);
                if (!stateFightAgain || (Array.isArray(stateFightAgain) && !stateFightAgain.length)){
                    this.showErrorMove(td);
                    return;
                }
                this.showBoard();
                if (stateFightAgain == 2)
                    this.showFocusedChecker(this.focusingChecker[0], this.focusingChecker[1]);

                this.checkFightGamer();
                let winner = this.checkWinner();
                if (!winner)
                    return;
                else
                    this.showWinner(winner);
            } else {
                this.checkFightGamer();
                this.showBoard();
                let winner = this.checkWinner();
                if (!winner)
                    return;
                else
                    this.showWinner(winner);
            }
        }
    }

    moving(xM, yM){
        xM = +xM;
        yM = +yM;
        let xF = +this.focusingChecker[0];
        let yF = +this.focusingChecker[1];
        let sumFocus = +xF + +yF;
        let sumMove = +xM + +yM;
        let xStep = xM - xF;
        let yStep = yM - yF;
        let way;

        if(xStep != xStep || yStep != yStep)
            return 0;

        if (this.board[xM][yM])
            return 0;

        if (!this.stateMustFight[this.move]){
            if (
            ( xF + this.move == xM && (sumMove == sumFocus || sumMove - 2 * this.move == sumFocus) ) ||
            (this.board[xF][yF]/this.move == 3 && Math.abs(xStep) == Math.abs(yStep) )
            ){
                if ((this.move == 1 && xM == 7) ||
                (this.move == -1 && xM == 0) )
                    this.board[xM][yM] = 3*this.move;
                else
                    this.board[xM][yM] = this.board[xF][yF];
                this.board[xF][yF] = 0;
                this.move = -this.move;
                return 1;
            } else
                return 0;
        } else if (this.stateMustFight[this.move]){
            if (
            this.board[xF][yF] == this.move &&
            Math.abs(xStep) == 2 && Math.abs(yStep) == 2  &&
            this.board[xF + xStep/2][yF + yStep/2]%2 == -this.move
            ){
                return this.fight(xM, yM, xF, yF, xF + xStep/2, yF + yStep/2);
            } else if (this.board[xF][yF] == 3*this.move){
                let xWay = xStep/ Math.abs(xStep);
                let yWay = yStep/ Math.abs(yStep);
                let xDefeated;
                let yDefeated;
                let sum = 0;

                if (Math.abs(xStep) == Math.abs(yStep)){
                    if (xWay > 0){
                        for (let i = 1; xF+i <= xM-1; i++){
                            if (this.board[xF+xWay*i][yF+yWay*i]%2 == this.move)
                                return 0;
                            if (this.board[xF+xWay*i][yF+yWay*i]%2 == -this.move){
                                xDefeated = xF+xWay*i;
                                yDefeated = yF+yWay*i;
                                sum++;
                            }
                            if (sum > 1)
                                break;
                        }
                        if (sum == 1)
                            return this.fight(xM, yM, xF, yF, xDefeated, yDefeated);
                    } else {
                        for (let i = 1; xF-i >= xM+1; i++){
                            if (this.board[xF+xWay*i][yF+yWay*i]%2 == this.move)
                                return 0;
                            if (this.board[xF+xWay*i][yF+yWay*i]%2 == -this.move){
                                xDefeated = xF+xWay*i;
                                yDefeated = yF+yWay*i;
                                sum++;
                            }
                            if (sum > 1)
                                break;
                        }
                        if (sum == 1)
                            return this.fight(xM, yM, xF, yF, xDefeated, yDefeated);
                    }
                }
            }
            if (way = this.checkFightLong(xM, yM, xF, yF))
                return way;
            else
                return  0;
        } else
            return  0;

    }

    fight(xM, yM, xF, yF, xDefeated, yDefeated){

        if ((this.move == 1 && xM == 7) ||
        (this.move == -1 && xM == 0) )
            this.board[xM][yM] = 3*this.move;
        else
            this.board[xM][yM] = this.board[xF][yF];

        this.board[xF][yF] = 0;
        this.board[xDefeated][yDefeated] = 0;
        let stateFightAgain = this.checkFightChecker(xM, yM);
        if (!stateFightAgain){
            this.move = -this.move;
            this.stateMustFight[this.move] = 0;
            this.focusingChecker = '';
            this.stateFixedFocusingChecker = 0;
            return 1;
        } else {
            this.focusingChecker = String(xM) + String(yM);
            this.stateFixedFocusingChecker = 1;
            this.stateMustFight[this.move] = 1;
            return 2;
        }
    }

    checkFightGamer(){
        for(let x = 0; x < this.board.length; x++){
            let y;
            x % 2 == 1 ? y = 0 : y = 1;
            for(; y < this.board[x].length; y = y+2){
                if (this.board[x][y]%2 == this.move){
                    this.stateMustFight[this.move] = this.checkFightChecker(x, y);
                    if (this.stateMustFight[this.move])
                        return 1;
                }
            }
        }
        return 0;
    }

    checkFightChecker(x, y){
        x = +x;
        y = +y;

        if( (x > 1 && y > 1 && this.board[x-1][y -1]%2 == -this.move && !this.board[x-2][y-2]) ||
        (x < 6 && y > 1 && this.board[x +1][y-1]%2 == -this.move && !this.board[x+2][y-2]) ||
        (x > 1 && y < 6 && this.board[x-1][y+1]%2 == -this.move && !this.board[x-2][y+2]) ||
        (x < 6 && y < 6 && this.board[x+1][y+1]%2 == -this.move && !this.board[x+2][y+2]) )
            return 1;
        else if (this.board[x][y]/3 == this.move){

            let xTest = x;
            let yTest = y;
            while (xTest <= 4 && yTest <=4){
                xTest++;
                yTest++;
                if (this.board[xTest][yTest] == this.move)
                    break;
                if(!this.board[xTest][yTest] && this.board[xTest+1][yTest+1]%2 == -this.move && !this.board[xTest+2][yTest+2])
                    return 1;
            }
            xTest = x;
            yTest = y;
            while (xTest >= 3 && yTest >= 3){
                xTest--;
                yTest--;
                if (this.board[xTest][yTest] == this.move)
                    break;
                if(!this.board[xTest][yTest] && this.board[xTest-1][yTest-1]%2 == -this.move && !this.board[xTest-2][yTest-2])
                    return 1;
            }
            xTest = x;
            yTest = y;
            while (xTest >= 3 && yTest <= 4){
                xTest--;
                yTest++;
                if (this.board[xTest][yTest] == this.move)
                    break;
                if(!this.board[xTest][yTest] && this.board[xTest-1][yTest+1]%2 == -this.move && !this.board[xTest-2][yTest+2])
                    return 1;
            }
            xTest = x;
            yTest = y;
            while (yTest >= 3 && xTest <= 4){
                xTest++;
                yTest--;
                if (this.board[xTest][yTest] == this.move)
                    break;
                if (!this.board[xTest][yTest] && this.board[xTest+1][yTest-1]%2 == -this.move && !this.board[xTest+2][yTest-2])
                    return 1;
            }
        }
        else
            return 0;
    }

    getFightChecker(x, y, xN, yN, valueXY){
        x = +x;
        y = +y;
        let fight = {
            moving: [],
            defeated: [],
        };
        if(valueXY == this.move){
            if (x > 1 && y > 1 && this.board[x-1][y-1]%2 == -this.move && !this.board[x-2][y-2]) {
                if (!(x-1 == xN && y-1 == yN)){
                    fight.moving.push([x-2, y-2])
                    fight.defeated.push([x-1, y-1])
                }
            }
            if (x < 6 && y > 1 && this.board[x+1][y-1]%2 == -this.move && !this.board[x+2][y-2]) {
                if (!(x+1 == xN && y-1 == yN)){
                    fight.moving.push([x+2, y-2])
                    fight.defeated.push([x+1, y-1])
                }
            }
            if (x > 1 && y < 6 && this.board[x-1][y+1]%2 == -this.move && !this.board[x-2][y+2]) {
                if (!(x-1 == xN && y+1 == yN)){
                    fight.moving.push([x-2, y+2])
                    fight.defeated.push([x-1, y+1])
                }
            }
            if (x < 6 && y < 6 && this.board[x+1][y+1]%2 == -this.move && !this.board[x+2][y+2]) {
                if (!(x+1 == xN && y+1 == yN)){
                    fight.moving.push([x+2, y+2])
                    fight.defeated.push([x+1, y+1])
                }
            }
        } else if (valueXY/3 == this.move){
            let xTest = x;
            let yTest = y;
            let sum = 0;

            for (;xTest <= 5 && yTest<=5; xTest++, yTest++ ){
                if (this.board[xTest+1][yTest+1]%2 == this.move)
                    break;
                if (this.board[xTest+1][yTest+1]%2 == -this.move &&
                !this.board[xTest+2][yTest+2] &&
                !(xTest+1 == xN && yTest+1 == yN)){
                    sum++;
                    if (sum > 1)
                        break;
                    fight.defeated.push([xTest+1, yTest+1])
                }
                if (!this.board[xTest+2][yTest+2] && sum > 0){
                    fight.moving.push([xTest+2, yTest+2])
                    if (fight.moving.length != fight.defeated.length){
                        fight.defeated.push(fight.defeated[fight.defeated.length-1])
                    }
                }
            }

            xTest = x;
            yTest = y;
            sum = 0;
            for (;xTest >= 2 && yTest >= 2; xTest--, yTest-- ){
                if (this.board[xTest-1][yTest-1]%2 == this.move)
                    break;
                if (this.board[xTest-1][yTest-1]%2 == -this.move &&
                !this.board[xTest-2][yTest-2] &&
                !(xTest-1 == xN && yTest-1 == yN)){
                    sum++;
                    if (sum > 1)
                        break;
                    fight.defeated.push([xTest-1, yTest-1])
                }
                if (!this.board[xTest-2][yTest-2] && sum > 0){
                    fight.moving.push([xTest-2, yTest-2])
                    if (fight.moving.length != fight.defeated.length){
                        fight.defeated.push(fight.defeated[fight.defeated.length-1])
                    }
                }
            }


            xTest = x;
            yTest = y;
            sum = 0;
            for (;xTest >= 2 && yTest <= 5; xTest--, yTest++ ){
                if (this.board[xTest-1][yTest+1]%2 == this.move)
                    break;
                if (this.board[xTest-1][yTest+1]%2 == -this.move &&
                !this.board[xTest-2][yTest+2] &&
                !(xTest-1 == xN && yTest+1 == yN)){
                    sum++;
                    if (sum > 1)
                        break;
                    fight.defeated.push([xTest-1, yTest+1])
                }
                if (!this.board[xTest-2][yTest+2] && sum > 0){
                    fight.moving.push([xTest-2, yTest+2])
                    if (fight.moving.length != fight.defeated.length){
                        fight.defeated.push(fight.defeated[fight.defeated.length-1])
                    }
                }
            }

            xTest = x;
            yTest = y;
            sum = 0;
            for (;yTest >= 2 && xTest <= 5; xTest++, yTest--){
                if (this.board[xTest+1][yTest-1]%2 == this.move)
                    break;
                if (this.board[xTest+1][yTest-1]%2 == -this.move &&
                !this.board[xTest+2][yTest-2] &&
                !(xTest+1 == xN && yTest-1 == yN)){
                    sum++;
                    if (sum > 1)
                        break;
                    fight.defeated.push([xTest+1, yTest-1])
                }
                if (!this.board[xTest+2][yTest-2] && sum > 0){
                    fight.moving.push([xTest+2, yTest-2])
                    if (fight.moving.length != fight.defeated.length){
                        fight.defeated.push(fight.defeated[fight.defeated.length-1])
                    }
                }
            }

        }
        return fight;
    }

    focusedChecker(x, y){
        this.focusingChecker = x + y;
    }

    checkFightLong(xM, yM, x, y, arrFight = [], xDef = -1, yDef = -1, valueXY = this.board[x][y]){
        let result = [];
        let fight = this.getFightChecker(x, y, xDef, yDef, valueXY)

        if (!fight.moving.length || fight.moving.length>100 || arrFight.length>100){
            arrFight.pop()
            return arrFight;
        }

        for(let i = 0; i < fight.moving.length; i++){
            if (fight.moving[i][0] == xM && fight.moving[i][1] == yM){
                arrFight.push(fight.moving[i])
                return arrFight;
            }

        }
        for(let i = 0; i < fight.moving.length; i++){
            arrFight.push(fight.moving[i]);
            if ((fight.moving[i][0] == 0 && this.move == -1) || (fight.moving[i][0] == 7 && this.move == 1) && Math.abs(valueXY) == 1 )
                valueXY = 3*valueXY;
            result = this.checkFightLong(xM, yM, ...fight.moving[i], arrFight, ...fight.defeated[i], valueXY)
        }
        if (result){
            let state = 0;
            for (let i=0; i<result.length; i++){
                if (result[i][0] == xM && result[i][1] == yM){
                    result.length = i+1;
                    state++;
                }
            }
            if (state)
                return result;
            else
                return 0;
        }

    }

    fightLong(fightWay){
        let state;
        for (let fight of fightWay){
            state = this.moving(...fight);
        }
        return state;
    }


    checkWinner(){
        let white = 0;
        let black = 0;
        for(let x = 0; x < this.board.length; x++){
            let y;
            x % 2 == 1 ? y = 0 : y = 1;
            for(; y < this.board[x].length; y = y+2){
                if (this.board[x][y])
                    this.board[x][y]%2 == 1 ? white++ : black++
                if (white && black)
                    return 0;
            }
        }
        return !white ? -1 : 1;
    }

    showErrorMove(td){
        td.classList.add('error');
        setTimeout(()=> td.classList.remove('error'), 500);
    }

    showFocusedChecker(x, y){
        if (this.root.querySelector('td.active'))
            this.root.querySelector('td.active').classList.remove('active');
        this.root.querySelectorAll('table tr')[x].querySelectorAll('td')[y].classList.add('active');
    }

    showBoard(){
        for (let td of this.tds){
            td.textContent = '';
            td.className = '';
            if (this.board[td.dataset.x][td.dataset.y]){
                let image = document.createElement('img');
                if (this.board[td.dataset.x][td.dataset.y] == 3 ||
                (this.board[td.dataset.x][td.dataset.y]) == -3)
                    image.src = this.gamer[this.board[td.dataset.x][td.dataset.y]%2].imgD;
                else
                    image.src = this.gamer[this.board[td.dataset.x][td.dataset.y]].img;

                td.append(image);
            }
        }
        this.gamerMoveDiv.querySelector('div:first-child').textContent = this.gamer[this.move].name + " moves";
        this.gamerMoveDiv.querySelector('.move-checker img').src = this.gamer[this.move].img;
    }

    showWinner(winner){
        this.root.querySelector('.winner-box .winner').textContent = this.gamer[winner].name
        this.root.querySelector('.winner-box').hidden = false;
        this.root.querySelector('.winner-box button').addEventListener('click', ()=>{
            this.root.querySelector('.winner-box').hidden = true;
            this.root.querySelector('.winner-box .winner').textContent = '';
        } )
    }

}

