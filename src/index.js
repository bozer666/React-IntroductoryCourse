import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/**
 * 单个格子
 */
function Square(props) {
    return (
        <button className={`square ${props.isHighlight ? 'highlight' : ''}`} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

/**
 * 9个格子的棋盘
 */
class Board extends React.Component {

    renderSquare(index, line, column) {
        //胜利棋子高亮
        const isHighlight = this.props.winner && this.props.winner.includes(index)
        return (
            <Square
                value={this.props.squares[index]}
                onClick={() => this.props.onClick(index, line, column)}
                key={index}
                isHighlight={isHighlight}
            />
        );
    }

    render() {
        const squareArray = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
        ];
        return (
            squareArray.map((o1, i1) =>
                <div className="board-row" key={i1}>
                    {o1.map((o2, i2) => this.renderSquare(o2, i1 + 1, i2 + 1))}
                </div>
            )
        );
    }
}

/**
 * 判断出胜者,返回连成一线的下标
 * @param squares
 * @returns {null|[]}
 */
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [a, b, c];
        }
    }
    return null;
}

function generateRandomId(length) { //length是你的id的长度，可自定义
    return Math.random().toString(36).substr(3, length);
}

class Game extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            // 记录历史记录和坐标
            history: [{
                squares: Array(9).fill(null),
                line: '',
                column: '',
            }],
            xIsNext: true,
            stepNumber: 0,
            isSequence: true,
        }
    }

    /**
     * 点击格子事件
     * @param index
     * @param line
     * @param column
     */
    handleClick(index, line, column) {
        // const history = this.state.history;
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1].squares;
        //拷贝数组
        const squares = current.slice();
        //当有玩家胜出或者该位置已经点过,直接return
        if (calculateWinner(squares) || squares[index]) {
            return;
        }
        // 修改状态
        squares[index] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                line: line,
                column: column,
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        })
    }

    /**
     * 跳到历史记录步骤
     * @param step
     */
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0
        })
    }

    /**
     * 切换历史记录顺序
     */
    switchOrder() {
        this.setState({
            isSequence: !this.state.isSequence,
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber].squares;
        const winner = calculateWinner(current);
        // 初始化下标数组
        let array = Array(history.length).fill(0).map((o, i) => i);
        //倒序
        if (!this.state.isSequence) {
            array = array.reverse();
        }
        const moces = [];
        array.forEach(index => {
            const historyElement = history[index];
            const desc = index ?
                'Go to move #' + index :
                'Go to game start';
            moces.push(
                <li key={index}>
                    {/*显示坐标*/}
                    {index === 0 ? '' : `(${historyElement.column}, ${historyElement.line})`}
                    {/*显示步骤,加粗当前步骤*/}
                    <button onClick={() => this.jumpTo(index)}>
                        {index === this.state.stepNumber ? <strong>{desc}</strong> : desc}
                    </button>
                </li>
            );
        })
        let status;
        if (winner) {
            status = `Winner: ${current[winner[0]]}`
        } else if (this.state.stepNumber === 9) {
            status = '平局'
        } else {
            status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current}
                        onClick={(index, line, column) => this.handleClick(index, line, column)}
                        winner={winner}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        <button onClick={() => this.switchOrder()}>切换顺序</button>
                    </div>
                    <ol>{moces}</ol>
                </div>
            </div>
        );
    }
}


// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
