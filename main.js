// everything in window.onload
window.onload = () => {

  // bind some dom elements
  const sudokuTable = document.querySelector('.sudokuTable')
  const verifyButton = document.querySelector('#verify')
  const setButton = document.querySelector('#setNums')

  // store some game variables
  let sudokuBoard = []
  let humanSet = []
  let sudokuInputList = []
  let numsColored = false

  const humanSetColor = "lightblue"

  // generate sudoku cells, theres always a 9x9 square
  // let's use 2x2 matrix this time
  // we hardcode in 9 because otherwise it's not even sudoku
  // we want to generate the <tr> elements per row
  // then generate <td> elements per cell

  // event listeners
  verifyButton.addEventListener('click', () => {
    console.log(verifySudoku())
  })

  setButton.addEventListener('click', () => {
    numsColored = numsColored ? false : true
    setColorRun()
    // change numsColored

  })


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
              console.log(humanSet)
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
      srcElem.value = ''
      // erase it on the board and in humanSet
      for (id in humanSet) {
        if (humanSet[id].coord[0] === x && humanSet[id].coord[1] === y) {
          humanSet.splice(id, 1)
        }
      }
    } else {

      // try out this value and verify, and reject if false 
      sudokuBoard[x][y] = proposedNum
      if (verifyNoRepeat()) {
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
          humanSet.push({
            value: proposedNum,
            coord: [x, y]
          })
        }

      } else {
        sudokuBoard[x][y] = 0
        srcElem.value = ''
        for (id in humanSet) {
          if (humanSet[id].coord[0] === x && humanSet[id].coord[1] === y) {
            humanSet.splice(id, 1)
          }
        }
      }

    }
    console.log(sudokuBoard)
  }



  // function to verify sudokuBoard is a solution
  function verifySudoku() {

    for (let i = 0; i < 9; i++) {
      // every row and col needs to sum up to 45 (and small boxes)
      let rowSum = 0;
      let colSum = 0;

      for (let j = 0; j < 9; j++) {
        rowSum += sudokuBoard[i][j]
        colSum += sudokuBoard[j][i]

      }

      // console.log('row ' + i + ' : ' + rowSum)
      // console.log('col ' + i + ' : ' + colSum)

      // return false if sums not 45
      // return false if numbers besides 0 repeat
      if (rowSum !== 45) {
        return false
      }
      if (colSum !== 45) {
        return false
      }

    } // end of for loop for rows and col 

    // check every smaller box of 9 elements
    for (let bx = 0; bx <= 6; bx += 3) {
      for (let by = 0; by <= 6; by += 3) {

        let sum = 0
        for (let sx = 0; sx <= 2; sx++) {
          for (let sy = 0; sy <= 2; sy++) {
            sum += sudokuBoard[sx + bx][sy + by]
          }
        }

        if (sum !== 45) {
          return false
        }
      }
    } // end of for loops for smaller boxes

    // also no repeats
    if (!verifyNoRepeat) {
      return false
    }

    return true
  } // end of verifySudoku


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

      // console.log(rowNum)
      // console.log(colNum)

      // return false if sums not 45
      // return false if numbers besides 0 repeat

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



  // function for toggling the human set numbers
  function setColorRun() {
    // for all the inputs of class sudokuInput
    // if their data keys have the right x,y
    // set them to a new background color

    for (inputElem of sudokuInputList) {
      const dataKey = inputElem['data-key'].split('-')
      const x = parseInt(dataKey[0])
      const y = parseInt(dataKey[1])
      console.log(dataKey)

      for (setElem of humanSet) {
        console.log(setElem.coord)
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


  generateBoard()
  // console.log(sudokuInputList)
} // end of window.onload