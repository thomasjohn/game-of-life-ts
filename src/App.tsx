import React, { FC, useState }  from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css'

// types
interface CellsType {
  x: number;
  y: number;
  live: boolean;
}

// Board Component
const Board:FC<{width:number, height:number, cells:CellsType[]}> = ({width, height, cells}) => {
  // check if cell at pos x, y is live
  const checkIfLive = (x:number, y:number):(boolean|null) => {
    for (const i in cells)
      if (cells[i].x===x && cells[i].y===y)
        return cells[i].live
    return null
  }

  // render grid
  const grid = []
  let row
  for (let y = 1; y <= height; y++) {
    row = []
    for (let x = 1; x <= width; x++)
      row.push(
        <div key={x+':'+y} style={{display:'inline-block', width: '50px'}}>
          {checkIfLive(x, y) ? '*' : '.'}
        </div>
      )
    grid.push(<div key={y}>{row}</div>)
  }

  //
  return (
    <div>
      {grid}
    </div>
  )
}

// main component
function App() {
  let generation = 0
  let gridWidth = 0
  let gridHeight = 0
  const cells:CellsType[] = []
  // state
  const [txtData, setTxtData] = useState('')

  // read initial data from file
  // Example:
  // const txtData = `
  //   Generation 3:
  //   4 8
  //   . . . . . . . .
  //   . . . . * . . .
  //   . . . * * . . .
  //   . . . . . . . .
  // `
  if (txtData === '')
    fetch('golInput.txt')
      .then(response => response.text())
      .then(txtData => {
        //console.log(txtData)
        if (txtData!=='')
          setTxtData(txtData)
        else
          throw new Error('empty input file')
      })
      .catch(err => {
        //console.log('error', err)
        throw new Error('input file not available')
      })

  // do not render if no data available
  if (txtData==='')
    return null

  // data are here - parse txtData

  // change txt to array of words (separated by space, tab or \n)
  const data = [] //txtData.split(' ')
  let word = ''
  for (let i=0; i<txtData.length; i++)
    if (' \n\t'.indexOf(txtData[i]) > -1) {
      if (word!=='') {
        data.push(word)
        word = ''
      }
    }
    else
      word += txtData[i]

  // search for 'Generation'
  let idxGeneration = data.indexOf('Generation')
  idxGeneration++

  // get number of generations - not used
  const generationWord = data[idxGeneration]
  // checking the format
  if (generationWord[generationWord.length-1]!==':')
    throw new Error('check <generation>: format')
  generation = Number(generationWord.substr(0, generationWord.length-1))
  if (isNaN(generation))
    throw new Error('wrong generation defined')
  idxGeneration++

  // get width
  gridHeight = Number(data[idxGeneration])
  // checking the format
  if (isNaN(gridWidth))
    throw new Error('wrong height defined')
  idxGeneration++

  // get height
  gridWidth = Number(data[idxGeneration])
  // checking the format
  if (isNaN(gridWidth))
    throw new Error('wrong width defined')
  idxGeneration++

  // get live state
  let sign
  let cellIdx = 0
  let live
  for (; idxGeneration < data.length; idxGeneration++) {
    sign = data[idxGeneration]
    live = sign==='*' ? true : false
    cells.push({
      x: 1 + cellIdx % gridWidth,
      y: 1 + Math.floor(cellIdx / gridWidth),
      live
    })
    cellIdx++
  }
  // checking the format
  if (cellIdx !== gridWidth * gridHeight)
    throw new Error('not all cells defined')

  // main GoL code

  const nextGeneration = () => {
    const checkNeighboursNumber = (cellIdx:number) => {
      const x = cells[cellIdx].x
      const y = cells[cellIdx].y
      let n = 0
      for (const i in cells) {
        if (Number(i)===cellIdx) continue
        if (cells[i].live &&
          cells[i].x >= x-1 && cells[i].x <= x+1 &&
          cells[i].y >= y-1 && cells[i].y <= y+1)
          n++
      }
      return n
    }
    for (const i in cells) {
      let cell = cells[i]
      const liveNeighbours = checkNeighboursNumber(Number(i))
      if (!cell.live) {
        if (liveNeighbours === 3)
        cell.live = true
        continue
      }
      if (liveNeighbours < 2 || liveNeighbours > 3) {
        cell.live = false
        continue
      }
      // for 2 or 3 do nothing
    }
  }

  nextGeneration()
  //console.log('End:', cells)

  // render

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12 text-center">
          <br/>
          <h1>Game of Life</h1>
          <br/>
          <Board
            width={gridWidth}
            height={gridHeight}
            cells={cells}
          />
        </div>
      </div>
    </div>
  )
}

export default App;
