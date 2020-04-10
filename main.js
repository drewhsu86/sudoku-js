// everything in window.onload
window.onload = () => {

  // bind some dom elements
  const sudokuTable = document.querySelector('.sudokuTable')
  const setButton = document.querySelector('#setNums')
  const tryButton = document.querySelector('#trySolve')
  const iterButton = document.querySelector('#iterSols')
  const resetButton = document.querySelector('#resetOrig')
  const loadButton = document.querySelector('#loadBoards')

  // store some game variables
  let sudokuBoard = []
  let humanSet = []
  let sudokuInputList = []
  let numsColored = true
  let iterCounter = 0

  // temporary boards
  let originalBoard = []
  let calculatedBoards = []

  const humanSetColor = "lightblue"

  // generate sudoku cells, theres always a 9x9 square
  // let's use 2x2 matrix this time
  // we hardcode in 9 because otherwise it's not even sudoku
  // we want to generate the <tr> elements per row
  // then generate <td> elements per cell

  // event listeners

  setButton.addEventListener('click', () => {
    numsColored = numsColored ? false : true
    setColorRun()
    // change numsColored

  })

  // try to solve event listener
  tryButton.addEventListener('click', () => {
    // empty out calculatedBoards
    // copy over to originalBoard

    originalBoard = copyBoard(sudokuBoard)


    // set number of results to zero here because
    // shouldn't do it in recursive function
    calculatedBoards = []

    trySolve()

    console.log('trySolve', calculatedBoards)

    // set up iteration button 
    iterButton.innerText = 'Iterate stored solutions: ' + 1 + '/' + calculatedBoards.length

    // iteration counter
    iterCounter = 0;

    // print to board
    if (calculatedBoards.length > 0) {
      printBoard(calculatedBoards[iterCounter])
    }

  })

  // iterate solutions event listener 
  iterButton.addEventListener('click', () => {

    if (calculatedBoards.length > 0) {
      printBoard(calculatedBoards[iterCounter])
      // if next one is greater than the last index
      // loop back to zero
      // or else iterate up
      if (iterCounter + 1 > calculatedBoards.length - 1) {
        iterCounter = 0
        iterButton.innerText = 'Iterate stored solutions: ' + 1 + '/' + calculatedBoards.length
      } else {
        iterButton.innerText = 'Iterate stored solutions: ' + (iterCounter + 1) + '/' + calculatedBoards.length
        iterCounter++
      }
    }

  })

  // reset board to only human inputs
  resetButton.addEventListener('click', () => {
    if (originalBoard) {
      printBoard(originalBoard)
    }
  })

  // load one of the randomly selected boards from loadBoards.js
  // from const loadableBoards

  loadButton.addEventListener('click', () => {
    // if loadableBoards has boards then choose one at random
    // else change the button to say no boards to load
    if (loadableBoards) {
      // empty out humanSet
      humanSet = []

      const randomIndex = Math.round(Math.random() * (loadableBoards.length - 1))
      printBoard(loadableBoards[randomIndex])

      // need to add each of the values to humanSet
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (sudokuBoard[i][j]) {
            // add to humanset
            humanSet.push({
              value: sudokuBoard[i][j],
              coord: [i, j]
            })
          }
        }
      } // end of for loop to add to humanSet

      console.log(humanSet)

      // add the colors for humanSet
      setColorRun()
    } else {
      loadButton.innerText = 'Sorry, no boards'
    }
  })



  // functions (  'o')

  function generateBoard() {

    // first make the game board of data
    for (let i = 0; i < 9; i++) {

      // handle new row
      sudokuBoard.push([])

      for (let j = 0; j < 9; j++) {

        // handle new element
        sudokuBoard[i].push(0)

      } // end of for loop j, creating sudoku cells


    } // end of for loop i, creating sudoku cells

    // we want 9 groups of 9 numbers, each 3x3
    // for example upper left:
    // 0,0 0,1 0,2 / 1,0 1,1, 1,2 / 2,0 2,1 2,2

    // first iterate across the 9 big boxes 
    for (bigx = 0; bigx <= 6; bigx += 3) {
      const newBigTr = document.createElement('tr')
      sudokuTable.append(newBigTr)

      for (bigy = 0; bigy <= 6; bigy += 3) {
        // for each big box create a small box of 9x9
        const newBigTd = document.createElement('td')
        newBigTr.append(newBigTd)
        newBigTd.className = 'sudokuBigBox'

        // for each of the 9 boxes
        // need to add inputs then
        // need data keys to manage the inputs or
        // i will be very confused

        // starting small table here
        const smallTable = document.createElement('table')
        newBigTd.append(smallTable)

        for (smx = 0; smx <= 2; smx++) {
          const smallTr = document.createElement('tr')
          smallTable.append(smallTr)

          for (smy = 0; smy <= 2; smy++) {
            const smallTd = document.createElement('td')
            smallTr.append(smallTd)
            const sudokuInput = document.createElement('input')
            smallTr.append(sudokuInput)
            sudokuInput.className = 'sudokuInput'
            sudokuInput.type = 'number'
            const x = bigx + smx
            const y = bigy + smy
            sudokuInput['data-key'] = x + '-' + y
            sudokuInput.addEventListener('change', (e) => {
              verifyInput(e)
              setColorRun()
              console.log('humanSet', humanSet)
            })
            sudokuInputList.push(sudokuInput)

          }

        }

      }

    }

  }



  // checks input when it's changed to see if its an 
  // integer between 1 and 9 inclusive
  function verifyInput(e) {
    console.log('Verifying Input')
    // can only be integers 1-9
    // console.log(e)
    const srcElem = e.srcElement

    // use the data-key to add it to the sudokuBoard array
    // console.log(srcElem['data-key'])
    const dataKey = srcElem['data-key'].split('-')
    const x = parseInt(dataKey[0])
    const y = parseInt(dataKey[1])


    console.log(srcElem.value)
    const proposedNum = parseInt(srcElem.value)

    if (proposedNum < 1 || proposedNum > 9 || !proposedNum) {
      console.log(' -- input verify not valid -- ')
      srcElem.value = null
      // erase it on the board and in humanSet
      for (id in humanSet) {
        if (humanSet[id].coord[0] === x && humanSet[id].coord[1] === y) {
          humanSet.splice(id, 1)
        }
      }
    } else {

      // try out this value and verify, and reject if false 
      sudokuBoard[x][y] = proposedNum
      console.log(' -- input verify repeat -- ')
      if (verifyNoRepeat()) {
        console.log(' -- true -- ')
        // if no repeat is true then we can have the value
        srcElem.value = proposedNum
        // add to human set as an object if true
        let matchFound = false
        for (id in humanSet) {
          if (humanSet[id].coord[0] === x && humanSet[id].coord[1] === y) {
            humanSet[id].value = proposedNum
            matchFound = true
          }
        }
        if (!matchFound) {
          console.log(' -- false -- ')
          humanSet.push({
            value: proposedNum,
            coord: [x, y]
          })
        }

      } else {
        sudokuBoard[x][y] = 0
        srcElem.value = null
        // remove from humanset
        for (id in humanSet) {
          if (humanSet[id].coord[0] === x && humanSet[id].coord[1] === y) {
            humanSet.splice(id, 1)
          }
        }
      }

    }
    console.log(sudokuBoard)
  }



  function verifyNoRepeat() {
    // only checks against repeats
    // returns true if no repeats in rows and col
    // and in small boxes

    for (let i = 0; i < 9; i++) {

      // cannot contain same element 
      let rowNum = {}
      let colNum = {}


      for (let j = 0; j < 9; j++) {


        // add it to our row and col hash tables 
        if (rowNum[sudokuBoard[i][j].toString()]) {
          rowNum[sudokuBoard[i][j].toString()]++
        } else {
          rowNum[sudokuBoard[i][j].toString()] = 1
        }

        if (colNum[sudokuBoard[j][i].toString()]) {
          colNum[sudokuBoard[j][i].toString()]++
        } else {
          colNum[sudokuBoard[j][i].toString()] = 1
        }
      }


      for (num in rowNum) {
        if (num !== '0' && rowNum[num] > 1) {
          return false
        }
      }

      for (num in colNum) {
        if (num !== '0' && colNum[num] > 1) {
          return false
        }
      }

    } // end of for loop for rows and col 


    // check every smaller box of 9 elements
    for (let bx = 0; bx <= 6; bx += 3) {
      for (let by = 0; by <= 6; by += 3) {

        let countNum = {}
        for (let sx = 0; sx <= 2; sx++) {
          for (let sy = 0; sy <= 2; sy++) {
            if (countNum[sudokuBoard[sx + bx][sy + by].toString()]) {
              countNum[sudokuBoard[sx + bx][sy + by].toString()]++
            } else {
              countNum[sudokuBoard[sx + bx][sy + by].toString()] = 1
            }
          }
        }

        for (num in countNum) {
          if (num !== '0' && countNum[num] > 1) {
            return false
          }
        }

      }
    } // end of for loops for smaller boxes

    return true

  } // end of verifyNoRepeat


  // function verifyNoRepeatSingle

  function verifyNoRepeatSingle(x, y, v) {
    // only checks against repeats
    // returns true if no repeats in rows and col
    // and in small boxes

    for (let i = 0; i < 9; i++) {

      // cannot have same element in a row 
      if (sudokuBoard[x][i] === v && i !== y) {
        return false
      }

      // cannot have same element in a col 
      if (sudokuBoard[i][y] === v && i !== x) {
        return false
      }

    } // end of for loop for rows and cols


    // check every smaller box of 9 elements
    // starting index: Math.floor( x / 3 )
    // ending index: Math.floor( x / 3 ) + 2
    // same for y
    const sqX = Math.floor(x / 3)
    const sqY = Math.floor(y / 3)

    // console.log('x third - ', sqX, ' y-third - ', sqY)

    for (let bx = 3 * sqX; bx <= 3 * sqX + 2; bx++) {
      for (let by = 3 * sqY; by <= 3 * sqY + 2; by++) {

        // cannot have same element in a row 
        if (sudokuBoard[bx][by] === v && !(bx === x && by === y)) {
          return false
        }

      }
    } // end of for loops for smaller box

    return true

  } // end of verifyNoRepeatSingle



  // function for toggling the human set numbers
  function setColorRun() {
    // for all the inputs of class sudokuInput
    // if their data keys have the right x,y
    // set them to a new background color

    for (inputElem of sudokuInputList) {
      const dataKey = inputElem['data-key'].split('-')
      const x = parseInt(dataKey[0])
      const y = parseInt(dataKey[1])
      // console.log(dataKey)
      // start out with no color
      inputElem.style.backgroundColor = null

      for (setElem of humanSet) {
        // console.log(setElem.coord)
        if (x === setElem.coord[0] && y === setElem.coord[1]) {
          // if coords match, make this box colored
          // or uncolor it if it's colored
          if (!numsColored) {
            inputElem.style.backgroundColor = null

          } else {
            inputElem.style.backgroundColor = humanSetColor

          }

        }
      } // end of for loop through humanSet

    } // end of for loop through sudokuInputList


  } // end of setColorsRun


  // function try to solve one square at a time 

  async function trySolve() {

    // console.log('--- try solve ---')

    // try every square, if its empty try every number 1-9 
    for (let i = 0; i < 9; i++) {

      for (let j = 0; j < 9; j++) {

        // if the board value is zero try some numbers
        if (sudokuBoard[i][j] === 0) {
          for (let n = 1; n <= 9; n++) {

            const checkVal = verifyNoRepeatSingle(i, j, n)

            if (checkVal) {
              console.log('x: ' + i + ' y: ' + j + ' v: ' + n)
              sudokuBoard[i][j] = n
              // console.log('try - ', copyBoard(sudokuBoard))
              trySolve()
              sudokuBoard[i][j] = 0
            } else {
              // console.log('- fail - ', n)
            }

            // recursive, if no more empty spaces, will reach the outside of the for loops to function scope
          }

          // exit the function here if no numbers work
          // console.log('return - ', copyBoard(sudokuBoard))
          return
        }


      }

    } // end of for loops going across every box 

    calculatedBoards.push(copyBoard(sudokuBoard))

    // return

  } // end of function trySolve



  // function to copy boards because 2d array needs to be sliced on all levels
  function copyBoard(board) {

    let result = []

    for (row of board) {

      result.push(row.slice())

    }

    return result;

  } // end of copyBoard

  // function to copy matrix to browser
  function printBoard(board) {
    // replaces old sudokuBoard
    sudokuBoard = copyBoard(board)

    for (inputBox of sudokuInputList) {
      // for each input
      // make the value the new number from the matrix
      const dataKey = inputBox['data-key'].split('-')
      const x = parseInt(dataKey[0])
      const y = parseInt(dataKey[1])

      if (sudokuBoard[x][y] !== 0) {
        inputBox.value = sudokuBoard[x][y]
      } else {
        inputBox.value = null
      }


      /// STOPPED HERE

    }
  }


  generateBoard()

  // console.log(copyBoard(sudokuBoard))
  // console.log(sudokuInputList)
} // end of window.onload